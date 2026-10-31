import fs from 'node:fs';
import {Engine,worst} from './engine.mjs';
import {q,sum} from './rational.mjs';
import {get,post,journals} from './ledger.mjs';
import {addDays,dayNumber,isBusinessDay,quarterEnd} from './calendar.mjs';
import {awardAuction} from './auction072.mjs';
import {observeTarget} from './data072.mjs';
import {ingestRelease,computeFromVintages} from './vintages072.mjs';

export const OPERATING_POLICY=Object.freeze(JSON.parse(fs.readFileSync(new URL('../config/policy-0.7.2.json',import.meta.url),'utf8')));
const federal2027=JSON.parse(fs.readFileSync(new URL('../fixtures/federal-calendar-2027.json',import.meta.url),'utf8'));
const check=(ok,code,message,status='FAIL')=>{if(!ok)throw Object.assign(Error(message),{code,status});};
const custom=new Set(['recover','repayFacility','impairFacility','discharge','auction','settle_auction','close_auction','direct_sale','bill_interest','queue_dividend','dividend','statutory_rebase','enact_rebase','collateral_possession','collateral_sale','record_vote','defer_tranche','schedule_tranches','ingest_release','target_observation','emergency_start']);
const qkey=date=>date.slice(0,4)+'-Q'+Math.ceil(+date.slice(5,7)/3);
const boundary=date=>date.endsWith('-01')&&['01','04','07','10'].includes(date.slice(5,7));

/** Opt-in operating-rule engine. The historical Engine and its evidence are unchanged. */
export class OperatingEngine extends Engine {
  constructor(options={}) {
    super({holidays:federal2027.holidays,...options});
    this.operating={loans:{},receipts:[],auctions:{},shortStreak:0,window:null,breachWindow:[],remedy:null,remedies:[],publications:[],nextWeekly:this.date,overhang:null,lastPriorR:null,stagedReset:null,data:null,cleanQuarter:null,cleanQuarters:[],releases:[],vintages:null,computations:[],tranches:[]};
    for(const id of Object.keys(this.loans))this.operating.loans[id]={residual:'0',impairment:'0',episode:null};
    if(this.U.cmp(0)>0){this.loans['opening-residual']={principal:q(0),maturity:null,origin:null};this.operating.loans['opening-residual']={residual:this.U.toString(),impairment:'0',episode:null};}
    this.assertInvariants();
  }
  checkpoint(){return {...super.checkpoint(),operating:this.operating?structuredClone(this.operating):null,operatingIds:[...this.ids]};}
  restore(c){super.restore(c);this.operating=c.operating;this.ids=new Set(c.operatingIds);}
  assertInvariants(){
    super.assertInvariants();if(!this.operating)return;
    const ls=Object.values(this.operating.loans);
    check(sum(ls.map(x=>q(x.residual))).eq(this.U),'RESIDUAL_REGISTER','Residual register must equal U');
    check(sum(ls.map(x=>q(x.impairment))).eq(get(this.accounts,'Authority','facilityAllowance').neg()),'IMPAIRMENT_REGISTER','Loan impairment register must match the allowance');
    for(const [id,l] of Object.entries(this.operating.loans))check(q(l.residual).cmp(0)>=0&&q(l.impairment).cmp(0)>=0&&q(l.impairment).cmp(this.loans[id].principal)<=0,'LOAN_REGISTER','Invalid loan-level carrying amount or residual');
  }
  note(status,code,message,extra={}) {
    // These old diagnostic gaps are explicitly resolved by the adopted operating rules.
    if(this.operating&&['EMERGENCY_EXPIRY_OVERHANG','UNCLASSIFIED_CAP_OVERHANG','QUARTER_CASH_BREACH_WITH_CURE'].includes(code))return super.note('PASS',code+'_ADOPTED','Adopted reporting/freeze or cash-obligation rule applies',extra);
    return super.note(status,code,message,extra);
  }
  ordinaryCap(){return q(this.quarter?.priorR??this.operating.lastPriorR??this.R()).mul(this.policy.ordinaryFacilityCap);}
  publish(kind,data){this.operating.publications.push({date:this.date,kind,...structuredClone(data)});}
  addBusinessDays(date,count){let d=date;for(let n=0;n<count;){d=addDays(d,1);if(isBusinessDay(d,this.holidays))n++;}return d;}
  advance(date){
    check(dayNumber(date)>=dayNumber(this.date),'TIME_REVERSED','Events must be in date order');
    const expire=()=>{if(this.emergency&&this.date>=this.emergency.expiry){this.emergencyEpisodes.push({...this.emergency,ended:this.emergency.expiry});this.emergency=null;this.publish('emergency-expired',{ordinaryCap:this.ordinaryCap().toString(),E:this.exposure().toString()});}};
    expire();while(this.date<date){this.closeDay();this.date=addDays(this.date,1);expire();}
  }
  closeDay(){
    if(!this.operating)return super.closeDay();if(this.lastClosed===this.date)return;
    if(isBusinessDay(this.date,this.holidays)){
      const breached=get(this.accounts,'Authority','T').cmp(this.R().mul(this.policy.treasuryDailyRatio))>0;
      this.cashStreak=breached?this.cashStreak+1:0;
      this.operating.breachWindow.push({date:this.date,breached});
      if(this.operating.breachWindow.length>OPERATING_POLICY.cashRollingBusinessDays)this.operating.breachWindow.shift();
      const rolling=this.operating.breachWindow.filter(x=>x.breached).length;
      const violation=breached&&(this.cashStreak>this.policy.treasuryMaximumBreachBusinessDays||rolling>OPERATING_POLICY.cashMaximumRollingBreaches);
      if(violation){
        this.note('FAIL','TREASURY_CASH_VIOLATION','Daily close violates consecutive or rolling limit',{consecutive:this.cashStreak,rolling});
        if(!this.operating.remedy){this.operating.remedy={opened:this.date,deadline:this.addBusinessDays(this.date,OPERATING_POLICY.cashRemedyBusinessDays),missed:false};this.publish('cash-remedy-opened',this.operating.remedy);}
      }
      const remedy=this.operating.remedy;
      if(remedy){
        if(this.date>=remedy.deadline&&breached&&!remedy.missed){remedy.missed=true;this.note('FAIL','DIVIDEND_DEADLINE','Remedy not complete at deadline',{deadline:remedy.deadline});}
        if(!breached){const closed={...remedy,closed:this.date,onTime:this.date<=remedy.deadline&&!remedy.missed};this.operating.remedies.push(closed);this.publish('cash-remedy-closed',closed);this.operating.remedy=null;}
      }
      this.daily.push({date:this.date,T:get(this.accounts,'Authority','T').toString(),R:this.R().toString(),cashBreach:breached,consecutiveBusinessDays:this.cashStreak,rollingBreaches:rolling,facilityExposure:this.exposure().toString()});
    }
    for(const o of this.cashObligations)if(this.date>=o.deadline&&o.remaining.cmp(0)>0&&!o.failed){o.failed=true;this.note('FAIL','TREASURY_QUARTER_CURE_MISSED','Undisbursed quarter-end obligation missed its original deadline',{remaining:o.remaining.toString(),deadline:o.deadline});}
    for(const t of this.operating.tranches)if(!t.paid&&!t.missed&&this.date>=t.paymentDate){t.missed=true;this.note('FAIL','SCHEDULED_TRANCHE_MISSED','Scheduled tranche not credited by declared settlement close',{trancheId:t.id,paymentDate:t.paymentDate});}
    this.refreshOverhang();this.trackCleanQuarter();
    const clean=this.operating.cleanQuarter;
    if(this.date===quarterEnd(this.date)&&clean?.completeFromStart&&clean.eligible){this.operating.cleanQuarters.push({quarter:clean.key,start:clean.start,end:this.date});this.publish('clean-calendar-quarter',this.operating.cleanQuarters.at(-1));}
    this.publish('daily-facility-usage',{P:this.P().toString(),U:this.U.toString(),E:this.exposure().toString(),ordinaryCap:this.ordinaryCap().toString()});
    if(this.date>=this.operating.nextWeekly){this.publish('weekly-register',this.publicRegister());this.operating.nextWeekly=addDays(this.date,OPERATING_POLICY.publicRegisterIntervalDays);}
    this.lastClosed=this.date;
  }
  trackCleanQuarter(){
    const key=qkey(this.date);if(this.operating.cleanQuarter?.key!==key)this.operating.cleanQuarter={key,start:this.date,completeFromStart:boundary(this.date),eligible:true};
    if(!this.quarter&&this.lastQuarterKey!==key)this.operating.cleanQuarter.eligible=false;
    if(this.exposure().cmp(this.ordinaryCap())>0||Object.entries(this.loans).some(([id,l])=>l.principal.cmp(0)>0&&this.operating.loans[id]?.episode!==null))this.operating.cleanQuarter.eligible=false;
  }
  refreshOverhang(){
    const cap=this.cap()??this.ordinaryCap(),excess=this.exposure().sub(cap).max(0);
    if(excess.cmp(0)>0){
      if(!this.operating.overhang)this.operating.overhang={origin:this.date,quarters:[],escalated:false,startRecovered:this.operating.recovered??'0',startDenominator:q(this.quarter?.priorR??this.operating.lastPriorR??this.R()).toString(),epoch:this.epoch};
      const h=this.operating.overhang,key=qkey(this.date);if(!h.quarters.includes(key))h.quarters.push(key);
      const ordinal=date=>Number(date.slice(0,4))*4+Math.floor((Number(date.slice(5,7))-1)/3);
      h.quartersElapsed=ordinal(this.date)-ordinal(h.origin);
      if(h.quartersElapsed>=OPERATING_POLICY.overhangEscalationQuarters&&!h.escalated){h.escalated=true;this.publish('overhang-escalation',{origin:h.origin,quartersElapsed:h.quartersElapsed,required:'Authority report and recorded congressional vote; no automatic reset'});}
    } else if(this.operating.overhang){const h=this.operating.overhang,recovered=q(this.operating.recovered??0).sub(h.startRecovered),changed=!q(this.quarter?.priorR??this.operating.lastPriorR??this.R()).eq(h.startDenominator);this.publish('overhang-resolved',{origin:h.origin,U:this.U.toString(),recoveredDuringOverhang:recovered.toString(),denominatorChanged:changed,resolution:this.epoch!==h.epoch?'STATUTORY_RESET':recovered.cmp(0)>0?(changed?'CASH_RECOVERY_AND_DENOMINATOR_CHANGE':'CASH_RECOVERY'):'DENOMINATOR_ROOM_RESTORED',description:'Restored headroom does not itself reduce U'});this.operating.overhang=null;}
  }
  publicRegister(){
    const cap=this.cap()??this.ordinaryCap(),denominator=q(this.quarter?.priorR??this.operating.lastPriorR??this.R());
    return {P:this.P().toString(),U:this.U.toString(),E:this.exposure().toString(),cap:cap.toString(),denominatorSnapshot:denominator.toString(),overhang:this.exposure().sub(cap).max(0).toString(),lendingFreeze:this.exposure().cmp(cap)>0,
      loans:Object.entries(this.loans).map(([id,l])=>({loanId:id,principal:l.principal.toString(),residual:this.operating.loans[id]?.residual??'0',maturity:l.maturity,overduePrincipal:l.maturity&&this.date>l.maturity?l.principal.toString():'0',overdueCalendarDays:l.maturity&&l.principal.cmp(0)>0?Math.max(0,dayNumber(this.date)-dayNumber(l.maturity)):0,episode:this.operating.loans[id]?.episode??null}))};
  }
  loan(id){check(this.loans[id]&&this.operating.loans[id],'LOAN_ID','Known persistent loan ID required');return {base:this.loans[id],detail:this.operating.loans[id]};}
  execute(event){
    const checkpoint=this.checkpoint(),before=this.snapshot(),historyLength=this.history.length,start=this.issues.length;
    try {
      const originalEvent=structuredClone(event);let computation=null,tranche=null;
      if(event.type==='compute_quarter'){
        check(boundary(event.date),'COMPUTATION_BOUNDARY','Quarterly computation requires a calendar-quarter boundary');
        check(!this.operating.computations.some(x=>x.date===event.date),'DUPLICATE_COMPUTATION','Quarter already computed');
        computation=computeFromVintages(this.operating.releases,this.operating.vintages,{date:event.date,previousPath:this.path,previousR:this.R(),bases:event.bases,inflationTarget:event.inflationTarget,targetPrice:event.targetPrice,missingSeries:event.missingSeries,policy:this.policy});
        // An unavailable new observation cannot revise an already fixed allowance.
        const target=computation.target??this.operating.data?.lastTarget;
        check(target!==null&&target!==undefined,'NO_VERIFIED_TARGET','No verified target is available; no allowance may be fabricated','POLICY_UNDEFINED');
        this.operating.vintages=computation.state;
        event={...event,type:'begin_quarter',path:target,verifiedTarget:true};
      }
      if(event.type==='settle_tranche'){
        tranche=this.operating.tranches.find(x=>x.id===event.trancheId);
        check(tranche&&!tranche.paid,'TRANCHE_ID','Known unpaid tranche required');check(event.date>=tranche.paymentDate,'TRANCHE_EARLY','Cannot settle before scheduled date');
        check(this.quarter&&event.date<=this.quarter.end,'TRANCHE_QUARTER','Must credit the fixed allowance within its quarter');
        const projectedT=get(this.accounts,'Authority','T').add(tranche.amount),projectedR=this.R().add(tranche.amount);
        check(event.date!==this.quarter.end||projectedT.cmp(projectedR.mul(this.policy.treasuryQuarterEndRatio))<=0,'DEFERRAL_RECREATES_EXCESS','Deferred settlement cannot recreate quarter-end excess');
        event={...event,type:'issue',amount:tranche.amount,remittance:q(tranche.amount).min(this.quarter.remittanceBudget.sub(this.quarter.remitted)).toString()};
      }
      if(event.type==='issue'&&!tranche&&this.operating.tranches.some(x=>!x.paid&&x.quarter===this.quarter?.id))check(false,'SCHEDULED_ISSUANCE_ROUTE','Use settle_tranche for the active fixed schedule');
      if(event.type==='payInterest')check(false,'RECOVERY_INTEREST_WATERFALL_UNIMPLEMENTED','Use identified settled recoveries; separate loan-level interest waterfall remains unimplemented','POLICY_UNDEFINED');
      if(event.type==='begin_quarter'){
        check(!this.operating.stagedReset||event.date<this.operating.stagedReset.effectiveDate,'RESET_DUE','Apply the staged boundary reset before computing an allowance');
        if(event.path===undefined){check(this.operating.data?.lastTarget!==null&&this.operating.data?.lastTarget!==undefined,'NO_VERIFIED_TARGET','No issuance computation before the first verified target','POLICY_UNDEFINED');event={...event,path:this.operating.data.lastTarget};}
        else check(event.verifiedTarget===true,'TARGET_ATTESTATION','Explicit verified-target attestation required; upstream data acquisition is not implemented','POLICY_UNDEFINED');
      }
      // Register additions must exist before the inherited invariant check.
      if(event.type==='draw'&&!this.loans[event.loanId])this.operating.loans[event.loanId]={residual:'0',impairment:'0',episode:this.emergency?.origin??null};
      if(!custom.has(event.type)){
        const r=super.execute(event);
        if(!r.applied){this.restore(checkpoint);this.issues.push(...r.issues);return r;}
        if(event.type==='begin_quarter'){
          this.operating.lastPriorR=this.quarter.priorR.toString();
          if(!computation){this.operating.data??={lastTarget:null,lastGap:null,brake:null,observations:[]};this.operating.data.lastTarget=this.path.toString();}
        }
        if(computation){
          this.operating.data=observeTarget(this.operating.data,{date:this.date,series:computation.series,verified:computation.available,...(computation.available?{target:computation.target,gap:computation.result.gap}:{})},{priorR:this.quarter.priorR,priorM:get(this.accounts,'Authority','M'),policy:this.policy});
          const record={date:this.date,series:computation.series,available:computation.available,stale:!computation.available,target:this.path.toString(),allowance:this.quarter.allowance.toString(),annualGrowth:computation.result?.annualGrowth??null};this.operating.computations.push(record);this.publish('quarterly-data-computation',record);
        }
        if(tranche){tranche.paid=true;tranche.settledOn=this.date;this.publish('scheduled-tranche-credited',{trancheId:tranche.id,date:this.date,amount:tranche.amount});}
        r.event=originalEvent;
        if(event.type==='draw')this.publish('facility-action',{action:'draw',loanId:event.loanId,amount:q(event.amount).toString(),disclosedWithinHours:0});
        if(event.type==='begin_quarter'||event.type==='draw')this.refreshOverhang();
        this.trackCleanQuarter();
        this.assertInvariants();return r;
      }
      check(typeof event.id==='string'&&event.id.length>0&&!this.ids.has(event.id),'EVENT_ID','Unique event ID required');
      this.advance(event.date);check(this.lastClosed!==this.date,'DAY_CLOSED','Cannot settle after daily close');
      const amount=q(event.amount??0);check(amount.cmp(0)>=0,'NEGATIVE_AMOUNT','Nonnegative amount required');let entries=[],detail={},F=q(0),H=q(0);
      const journal=(name,value=amount)=>{const rows=journals[name](value);post(this.accounts,rows);entries.push(...rows);};
      const financial=()=>check(this.quarter&&this.date<=this.quarter.end,'NO_ACTIVE_QUARTER','Settlement requires an active quarter');
      switch(event.type){
        case 'ingest_release':this.operating.releases=ingestRelease(this.operating.releases,event,this.date);this.publish('release-received',{releaseId:event.releaseId,series:event.series,period:event.period,published:event.published,revision:event.revision===true,affectsExistingAllowance:false});break;
        case 'schedule_tranches':{
          financial();check(this.quarter.issued.eq(0)&&!this.operating.tranches.some(x=>x.quarter===this.quarter.id),'TRANCHE_SCHEDULE_EXISTS','Schedule before any quarterly credits; no replacement schedule');
          check(Array.isArray(event.tranches)&&event.tranches.length===3,'MONTHLY_SCHEDULE','Three monthly tranches required');
          const dates=event.tranches.map(x=>x.date),months=dates.map(x=>x.slice(0,7));
          check(new Set(months).size===3&&dates.every(d=>{dayNumber(d);return d>=this.date&&d<=this.quarter.end&&qkey(d)===qkey(this.date);}), 'MONTHLY_SCHEDULE','One scheduled credit in each month of this quarter');
          check(event.tranches.every(t=>typeof t.id==='string'&&t.id&&q(t.amount).cmp(0)>=0)&&new Set(event.tranches.map(x=>x.id)).size===3&&!event.tranches.some(t=>this.operating.tranches.some(x=>x.id===t.id)),'TRANCHE_IDS','Unique tranche IDs and nonnegative amounts required');
          check(sum(event.tranches.map(t=>q(t.amount))).eq(this.quarter.allowance),'SCHEDULE_ALLOWANCE','Schedule must exhaust exactly the fixed allowance');
          this.operating.tranches.push(...event.tranches.map(t=>({id:t.id,quarter:this.quarter.id,amount:q(t.amount).toString(),originalDate:t.date,paymentDate:t.date,paid:false,missed:false})));this.publish('tranche-schedule',{quarter:this.quarter.id,tranches:event.tranches});break;
        }
        case 'target_observation':{
          this.operating.data=observeTarget(this.operating.data,event,{priorR:this.quarter?.priorR??this.R(),priorM:get(this.accounts,'Authority','M'),policy:this.policy});
          detail=this.operating.data.observations.at(-1);this.publish('data-observation',detail);break;
        }
        case 'emergency_start':{
          check(event.jointCertification===true,'EMERGENCY_CERTIFICATION','Joint certification required');check(!this.emergency,'EMERGENCY_ACTIVE','Emergency already active');
          const prior=this.emergencyEpisodes.at(-1),clean=prior&&this.operating.cleanQuarters.some(x=>x.start>=prior.origin&&x.end<this.date);
          const origin=!prior||clean?this.date:prior.origin;
          check(dayNumber(this.date)-dayNumber(origin)<this.policy.emergencyMaximumDays,'EMERGENCY_HARD_STOP','No clean calendar quarter: original episode clock has reached its hard stop');
          const hard=addDays(origin,this.policy.emergencyMaximumDays),initial=addDays(this.date,this.policy.emergencyInitialDays);
          this.emergency={origin,expiry:initial<hard?initial:hard,recertified:this.date,continued:!!prior&&!clean};
          this.publish('emergency-certification',{...this.emergency});break;
        }
        case 'repayFacility':case 'recover':case 'collateral_sale':{
          financial();const {base:l,detail:d}=this.loan(event.loanId);
          check(typeof event.receiptId==='string'&&event.receiptId&&!this.operating.receipts.includes(event.receiptId),'RECOVERY_RECEIPT','Unique settled receipt ID required');
          check(event.settled===true,'RECOVERY_NOT_SETTLED','Only settled money is recovery');
          let cash=amount;
          if(event.type==='collateral_sale'){const gross=q(event.gross),costs=q(event.costs);check(gross.cmp(0)>=0&&costs.cmp(0)>=0&&costs.cmp(gross)<=0,'COLLATERAL_PROCEEDS','Gross and expenses must reconcile');cash=gross.sub(costs);check(cash.eq(amount),'COLLATERAL_NET','Amount must equal net settled cash');detail={gross:gross.toString(),expenses:costs.toString(),net:cash.toString()};}
          const principal=cash.min(l.principal),residual=cash.sub(principal).min(d.residual),excess=cash.sub(principal).sub(residual);
          check(excess.eq(0),'RECOVERY_EXCESS_UNRESOLVED','Interest/penalty/excess disposition awaits explicit policy; entire receipt rejected','POLICY_UNDEFINED');
          const carrying=l.principal.sub(d.impairment),release=principal.sub(carrying).max(0);
          if(principal.cmp(0)>0){journal('repayFacility',principal);l.principal=l.principal.sub(principal);}
          if(release.cmp(0)>0){const rows=[['Authority','facilityAllowance',release],['Authority','equity',release]];post(this.accounts,rows);entries.push(...rows);d.impairment=q(d.impairment).sub(release).toString();}
          if(residual.cmp(0)>0){journal('payInterest',residual);d.residual=q(d.residual).sub(residual).toString();this.U=this.U.sub(residual);}
          this.quarter.netIncome=this.quarter.netIncome.add(release).add(residual);
          this.operating.recovered=q(this.operating.recovered??0).add(cash).toString();
          this.operating.receipts.push(event.receiptId);F=cash.neg();detail={...detail,principal:principal.toString(),residual:residual.toString(),lossRecoveryIncome:release.add(residual).toString(),interestIncome:'0',F:F.toString()};
          this.publish('cash-recovery',{loanId:event.loanId,...detail});break;
        }
        case 'impairFacility':{
          financial();const {base:l,detail:d}=this.loan(event.loanId);check(amount.cmp(l.principal.sub(d.impairment))<=0,'IMPAIRMENT_AMOUNT','Impairment exceeds this loan carrying value');journal('impairFacility');d.impairment=q(d.impairment).add(amount).toString();this.quarter.netIncome=this.quarter.netIncome.sub(amount);break;
        }
        case 'discharge':{
          financial();const {base:l,detail:d}=this.loan(event.loanId);check(event.finalLegalResolution===true,'LEGAL_RESOLUTION','Final legal resolution required');check(amount.cmp(l.principal)<=0,'FACILITY_PRINCIPAL','Discharge exceeds principal');
          const release=amount.min(d.impairment);entries=journals.discharge(amount,release);post(this.accounts,entries);l.principal=l.principal.sub(amount);d.impairment=q(d.impairment).sub(release).toString();d.residual=q(d.residual).add(amount).toString();this.U=this.U.add(amount);this.quarter.netIncome=this.quarter.netIncome.sub(amount.sub(release));detail={F:'0'};break;
        }
        case 'collateral_possession':this.loan(event.loanId);this.publish('collateral-possession',{loanId:event.loanId,recovery:'0',description:'No public money settled; valuation/reclassification outside this event'});break;
        case 'auction':{
          financial();check(event.convention==='par-principal-coupon'&&(event.face===undefined||q(event.face).eq(amount)),'BILL_FORM','Only principal at face value is permitted');
          check(typeof event.auctionId==='string'&&event.auctionId&&!this.operating.auctions[event.auctionId],'AUCTION_ID','Unique auction ID required');
          check(dayNumber(event.maturity)>dayNumber(this.date)&&dayNumber(event.maturity)-dayNumber(this.date)<=366,'BILL_TERM','Valid bill maturity required');
          detail=awardAuction(amount,event.bids??[],OPERATING_POLICY.auctionMaximumRate);
          this.operating.auctions[event.auctionId]={...detail,maturity:event.maturity,settled:'0',settlements:{},opened:this.date,closed:false,retailSettled:'0'};this.publish('auction-awards',{auctionId:event.auctionId,...detail});break;
        }
        case 'settle_auction':{
          financial();const a=this.operating.auctions[event.auctionId];check(a&&!a.closed,'AUCTION_STATE','Open auction required');
          const award=a.awards.find(x=>x.bid===event.bid);check(award&&q(a.settlements[event.bid]??0).add(amount).cmp(award.amount)<=0,'AUCTION_AWARD','Cannot settle more than this bid award');
          check(this.date<a.maturity,'BILL_MATURED','Cannot settle an already matured bill');journal('sale');a.settled=q(a.settled).add(amount).toString();a.settlements[event.bid]=q(a.settlements[event.bid]??0).add(amount).toString();
          const id='auction:'+event.auctionId;this.bills[id]??={principal:q(0),maturity:a.maturity,rate:a.clearingRate};this.bills[id].principal=this.bills[id].principal.add(amount);break;
        }
        case 'close_auction':{
          const a=this.operating.auctions[event.auctionId];check(a&&!a.closed,'AUCTION_STATE','Open auction required');a.closed=true;const short=q(a.settled).cmp(a.offered)<0;this.operating.shortStreak=short?this.operating.shortStreak+1:0;
          this.publish('auction-settlement',{auctionId:event.auctionId,intendedWithdrawal:a.offered,actualWithdrawal:a.settled,shortfall:q(a.offered).sub(a.settled).toString(),durationCalendarDays:dayNumber(this.date)-dayNumber(a.opened),upcomingMaturities:Object.entries(this.bills).filter(([,b])=>b.maturity&&b.principal.cmp(0)>0).map(([id,b])=>({billId:id,date:b.maturity,principal:b.principal.toString()})),directWindowEligible:this.operating.shortStreak>=2,reviewRequired:this.operating.shortStreak>=3});
          if(this.operating.shortStreak>=2)this.operating.window={auctionId:event.auctionId,rate:a.clearingRate??OPERATING_POLICY.auctionMaximumRate,status:'POLICY_UNDEFINED_AUTHORIZATION_SCOPE'};break;
        }
        case 'direct_sale':check(false,'DIRECT_SALE_AUTHORIZATION_UNRESOLVED','Remaining authorization and overlapping windows await policy clarification; no settlement','POLICY_UNDEFINED');break;
        case 'bill_interest':financial();check(this.bills[event.billId],'BILL_ID','Known bill required');journal('spend');this.dischargeObligations(amount);detail={category:'bill-interest',amount:amount.toString(),amountBasis:'explicit synthetic contractual payment input'};break;
        case 'queue_dividend':this.publish('dividend-queued',{amount:amount.toString(),credited:'0'});break;
        case 'dividend':{
          financial();let due;
          if(event.obligation==='quarter'){due=sum(this.cashObligations.map(o=>o.remaining));}
          else {check(this.operating.remedy,'NO_REMEDY','Open daily remedy required');due=get(this.accounts,'Authority','T').sub(this.R().mul(this.policy.treasuryDailyRatio)).max(0);}
          const paid=event.amount===undefined?due:amount;check(paid.cmp(due)<=0,'DIVIDEND_EXCESS','Remedy payment cannot exceed current eligible amount');journal('spend',paid);this.dischargeObligations(paid);this.publish('dividend-credited',{amount:paid.toString(),obligation:event.obligation??'daily',dueAtSettlement:due.toString()});break;
        }
        case 'defer_tranche':{
          financial();const t=this.operating.tranches.find(x=>x.id===event.trancheId);check(t&&!t.paid&&t.quarter===this.quarter.id,'TRANCHE_ID','Known unpaid current-quarter tranche required');dayNumber(event.paymentDate);
          check(this.date<=t.paymentDate&&event.paymentDate>t.paymentDate&&event.paymentDate<=this.quarter.end,'DEFERRAL_DATE','Deferral must be prospective and stay inside the quarter');
          check(event.paymentDate.slice(0,7)===t.originalDate.slice(0,7),'DEFERRAL_MONTH_UNIMPLEMENTED','Cross-month allocation of a monthly tranche is not implemented','POLICY_UNDEFINED');
          check(event.paymentDate!==this.quarter.end||get(this.accounts,'Authority','T').add(t.amount).cmp(this.R().add(t.amount).mul(this.policy.treasuryQuarterEndRatio))<=0,'DEFERRAL_RECREATES_EXCESS','Deferral would recreate quarter-end cash excess at current settled balances');
          t.paymentDate=event.paymentDate;this.publish('tranche-deferred',{trancheId:t.id,originalDate:t.originalDate,paymentDate:t.paymentDate,amount:t.amount});break;
        }
        case 'record_vote':this.publish('legislative-vote',{result:['proposed','failed','passed'].includes(event.result)?event.result:'unspecified',effect:'No ledger effect; a valid explicit statutory reset is a separate operation'});break;
        case 'enact_rebase':{
          check(event.statuteAttested===true&&typeof event.authority==='string'&&event.authority,'REBASE_AUTHORITY','Identified statutory authority required');check(boundary(event.effectiveDate)&&event.effectiveDate>this.date,'REBASE_EFFECTIVE_DATE','Future quarter boundary required');check(!this.operating.stagedReset,'RESET_ALREADY_STAGED','Only one pending reset supported');
          this.validateResidualReset(event.residual,event.residualReductions);
          this.operating.stagedReset={path:q(event.path).toString(),residual:q(event.residual).toString(),residualReductions:structuredClone(event.residualReductions??null),authority:event.authority,enactmentDate:this.date,effectiveDate:event.effectiveDate};detail=structuredClone(this.operating.stagedReset);break;
        }
        case 'statutory_rebase':{
          check(!this.quarter&&boundary(this.date),'REBASE_BOUNDARY','Close old quarter; apply reset at next calendar-quarter boundary');
          const staged=this.operating.stagedReset,s=staged??event;
          check((staged||s.statuteAttested===true)&&s.authority,'REBASE_AUTHORITY','Identified statutory authority required');check(s.effectiveDate===this.date&&s.enactmentDate<=this.date,'REBASE_DATES','Record valid enactment and effective dates');
          const path=q(s.path),residual=q(s.residual);check(path.cmp(0)>=0&&residual.cmp(0)>=0&&residual.cmp(this.U)<=0,'REBASE_STOCKS','Invalid reset stocks');const reductions=this.validateResidualReset(residual,s.residualReductions);
          check(this.R().sub(path).max(0).cmp(this.P().add(residual))<=0,'RESET_INITIAL_BOUND','Staged reset violates its new initial bound');
          const old=this.epoch;this.path=path;this.U=residual;for(const [id,amount]of Object.entries(reductions))this.operating.loans[id].residual=q(this.operating.loans[id].residual).sub(amount).toString();this.epoch++;
          this.epochChanges.push({date:this.date,oldEpoch:old,newEpoch:this.epoch,oldPath:before.path,newPath:path.toString(),authority:s.authority,enactmentDate:s.enactmentDate,effectiveDate:s.effectiveDate,residualReductions:reductions});this.operating.stagedReset=null;break;
        }
      }
      this.assertInvariants();
      check(this.R().sub(before.R).eq(F.sub(H)),'R_FLOW_IDENTITY','Custom settled event must reconcile R with F and H');
      if(!['statutory_rebase'].includes(event.type))check(this.exposure().sub(q(before.exposure)).eq(F),'F_EXPOSURE_IDENTITY','Outside reset, F must equal change in P+U');
      this.ids.add(event.id);this.refreshOverhang();this.trackCleanQuarter();
      if(['recover','repayFacility','collateral_sale','discharge','impairFacility','emergency_start'].includes(event.type))this.publish('facility-action',{action:event.type,loanId:event.loanId??null,amount:amount.toString(),disclosedWithinHours:0});
      const r={event:structuredClone(event),status:worst(this.issues.slice(start)),applied:true,issues:this.issues.slice(start),entries:entries.map(([s,a,d])=>[s,a,q(d).toString()]),before,after:this.snapshot(),detail};this.history.push(r);return r;
    } catch(error){
      this.restore(checkpoint);this.history.length=historyLength;this.note(error.status??'FAIL',error.code??'OPERATING_PRECONDITION',error.message,{eventId:event.id});
      const r={event:structuredClone(event),status:error.status??'FAIL',applied:false,issues:this.issues.slice(start),entries:[],before,after:this.snapshot(),detail:{}};this.history.push(r);return r;
    }
  }
  validateResidualReset(residual,requested){
    const target=q(residual);check(target.cmp(0)>=0&&target.cmp(this.U)<=0,'REBASE_STOCKS','Invalid target residual');
    let reductions=requested;
    if(reductions===null||reductions===undefined){check(target.eq(0)||target.eq(this.U),'RESET_ALLOCATION_REQUIRED','Partial reset requires statutory per-loan reductions; no allocation inferred','POLICY_UNDEFINED');reductions=target.eq(0)?Object.fromEntries(Object.entries(this.operating.loans).map(([id,l])=>[id,l.residual])):{};}
    check(typeof reductions==='object'&&!Array.isArray(reductions),'RESET_ALLOCATION','Per-loan reduction object required');const validated={};
    for(const [id,value]of Object.entries(reductions)){const {detail:l}=this.loan(id),amount=q(value);check(amount.cmp(0)>=0&&amount.cmp(l.residual)<=0,'RESET_ALLOCATION','Reduction exceeds identified residual');validated[id]=amount.toString();}
    check(sum(Object.values(validated).map(q)).eq(this.U.sub(target)),'RESET_ALLOCATION_TOTAL','Named reductions must reconcile to statutory residual target');return validated;
  }
  report(){return {...super.report(),policyVersion:OPERATING_POLICY.version,implementationStatus:OPERATING_POLICY.status,publications:structuredClone(this.operating.publications),loanRegister:this.publicRegister(),cashRemedy:structuredClone(this.operating.remedy),cashRemedies:structuredClone(this.operating.remedies),pendingReset:structuredClone(this.operating.stagedReset),tranches:structuredClone(this.operating.tranches),dataComputations:structuredClone(this.operating.computations),auctionShortfalls:Object.entries(this.operating.auctions).map(([id,a])=>({auctionId:id,asOfDate:this.date,intended:a.offered,settled:a.settled,unfilled:q(a.offered).sub(a.settled).sub(a.retailSettled).toString(),durationCalendarDays:dayNumber(this.date)-dayNumber(a.opened),brakeTarget:this.operating.data?.brake?.targetStock??null,actualB:get(this.accounts,'Authority','B').toString()})),unresolved:['recovery penalties/excess','overlapping direct-sale authorization'],acceptanceStatus:'PARTIAL_IMPLEMENTATION_NOT_FROZEN'};}
}
