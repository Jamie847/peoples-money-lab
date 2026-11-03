import path from 'node:path';
import {pathToFileURL} from 'node:url';
if (!process.env.LAB_CHECKOUT) throw Error('Set LAB_CHECKOUT to a clean checkout of 5225fccd86678e67286ae28efdfc7b988a9b6a56');
const root=process.env.LAB_CHECKOUT;
const {q,sum}=await import(pathToFileURL(path.join(root,'src/rational.mjs')));
const {SettlementConnection,settlementScenario}=await import(pathToFileURL(path.join(root,'debt-budget/settlement.mjs')));
export {q,settlementScenario};
export function run(config){
 const s=settlementScenario(),fill=q(config.fill??0),fundCap=q(config.fundCap??0);s.input.cash=q(s.input.cash).add(fill).toString();s.input.money.External=q(s.input.money.External).sub(fill).toString();
 const c=new SettlementConnection(s.input),e=c.controller,A=q(c.allowance),third=A.div(3),sixth=A.div(6),ceiling=q(config.ceiling??(config.period==='transition'?s.assumptions.borrowingRequested:0)),buyerCap=ceiling.mul(config.buyerFraction??1);
 let id=0,borrowed=q(0),fund=fill,drawn=q(0),refilled=q(0),redeemed=q(0);const b={spending:q(0),debt:q(0)},allocated={spending:q(0),debt:q(0)},used={spending:q(0),debt:q(0)},audit=[],events=[],violations=[];
 if(fill.cmp(fundCap)>0)violations.push('HYPOTHETICAL_FUND_CAP_EXCEEDED');
 const inheritedCashExcess=q(s.input.cash).sub(q(110).mul('.01')).max(0);if(inheritedCashExcess.cmp(0)>0)e.cashObligations.push({remaining:inheritedCashExcess,deadline:'2027-03-31',failed:false});
 const execute=x=>{const r=e.execute({...x,id:'matrix-'+id++});events.push(r);return r;};const T=()=>q(e.snapshot().T),free=()=>T().sub(b.spending).sub(b.debt).sub(fund);
 const dates=['2027-01-04','2027-02-01','2027-03-01'];execute({date:'2027-01-01',type:'schedule_tranches',tranches:dates.map((date,i)=>({id:'tranche-'+i,date,amount:third.toString()}))});
 const timeline=s.events.filter(x=>!['issue','borrow'].includes(x.type)).map(x=>({...x}));dates.forEach((date,index)=>timeline.push({date,type:'tranche',index}));
 if(config.tax)for(const [i,date]of ['2027-01-05','2027-01-20','2027-02-01','2027-03-01'].entries())timeline.push({date,type:'adjustment-tax',amount:q(config.tax).mul([7,3,20,'.2'][i]).div('30.2').toString()});
 if(config.fundCap!==undefined)timeline.push({date:'2027-03-15',type:'refill',amount:String(config.refill??0)});
 const rank=x=>x.type==='tranche'?0:x.type==='adjustment-tax'?1:2;timeline.sort((a,b)=>a.date.localeCompare(b.date)||rank(a)-rank(b));
 for(const x of timeline){
  if(x.type==='tranche'){const r=execute({date:x.date,type:'settle_tranche',trancheId:'tranche-'+x.index});if(!r.applied)throw Error('TRANCHE_FAILED');const sp=[sixth,q(0),third][x.index],de=third.sub(sp);for(const [k,v]of Object.entries({spending:sp,debt:de})){b[k]=b[k].add(v);allocated[k]=allocated[k].add(v);}audit.push({date:x.date,type:'issuance',amount:third.toString(),spending:sp.toString(),debt:de.toString()});continue;}
  if(x.type==='adjustment-tax'||x.type==='refill'){const amount=q(x.amount);if(amount.cmp(0)>0){const r=execute({date:x.date,type:'tax',amount:amount.toString()});if(!r.applied)throw Error('ASSUMED_TAX_NOT_SETTLED');}let retained=q(0);if(x.type==='refill'&&!audit.some(a=>a.paid===false)){const cashRoom=q(e.snapshot().R).mul('.01').sub(T()).max(0);retained=amount.mul('.5').min(fundCap.sub(fund).max(0)).min(cashRoom);if(cashRoom.eq(0)&&T().cmp(q(e.snapshot().R).mul('.01'))>0)retained=q(0);fund=fund.add(retained);refilled=refilled.add(retained);}audit.push({date:x.date,type:x.type,settledTax:amount.toString(),retained:retained.toString(),fund:fund.toString(),cashLimitExemption:false});continue;}
  const outgoing=['primary','coupon','redeem','bill_coupon'].includes(x.type),category=x.type==='redeem'?'debt':x.type==='primary'||(x.type==='bill_coupon'&&config.payer==='spending')?'spending':null,amount=q(x.amount),earmarked=category?b[category].min(amount):q(0);
  if(outgoing){
   const downturn=q(10).cmp(config.fundBenchmark??12)<0;const draw=downturn?amount.sub(earmarked).sub(free()).max(0).min(fund):q(0);if(draw.cmp(0)>0){fund=fund.sub(draw);drawn=drawn.add(draw);audit.push({date:x.date,type:'fund-draw',amount:draw.toString(),fund:fund.toString(),deltaT:'0',deltaR:'0'});}
   const eligible=config.period==='transition'||(config.principalOnly&&x.type==='redeem')||(config.emergency&&config.certified&&x.type==='primary'&&x.date==='2027-01-05'&&x.date<=config.expiry);
   let funding=eligible?amount.sub(earmarked).sub(free()).max(0).min(buyerCap.sub(borrowed).max(0)):q(0);
   if(config.principalOnly && free().add(earmarked).add(funding).cmp(amount)<0) funding=q(0); // Conditional refinancing must not create debt when matched redemption cannot settle.
   if(funding.cmp(0)>0){const r=execute({date:x.date,type:'borrow',amount:funding.toString()});if(!r.applied)throw Error('BORROW_FAILED');borrowed=borrowed.add(funding);}
   if(free().add(earmarked).cmp(amount)<0){const shortfall=amount.sub(free()).sub(earmarked);if(draw.cmp(0)>0){fund=fund.add(draw);drawn=drawn.sub(draw);audit.push({date:x.date,type:'fund-draw-rollback',amount:draw.toString(),fund:fund.toString(),reason:'Atomic payment not settled'});}audit.push({sourceId:x.id,date:x.date,type:x.type,amount:amount.toString(),paid:false,code:'AVAILABLE_FINANCING_SHORTFALL',shortfall:shortfall.toString()});continue;}
  }
  const rs=c.mapped(x).map(execute);if(!rs.every(r=>r.applied))throw Error('POSTING_FAILED');if(category){b[category]=b[category].sub(earmarked);used[category]=used[category].add(earmarked);}if(x.type==='redeem')redeemed=redeemed.add(amount);
  if(free().cmp(0)<0)throw Error('DOUBLE_USE_RESTRICTED_MONEY');
  audit.push({sourceId:x.id,date:x.date,type:x.type,amount:amount.toString(),paid:true,category,fromEarmark:earmarked.toString(),fromGeneral:outgoing?amount.sub(earmarked).toString():null,remainingFund:fund.toString(),freeCash:free().toString()});
 }
 execute({date:'2027-03-31',type:'end_quarter'});e.finalize({date:'2027-03-31'});const report=e.report(),unpaid=audit.filter(x=>x.paid===false),str=o=>Object.fromEntries(Object.entries(o).map(([k,v])=>[k,v.toString()]));
 return {config,accountingStatus:unpaid.length||violations.length||report.status==='FAIL'?'FAIL':report.status,policyStatus:config.period==='transition'&&!config.payer?'CONDITIONAL_TRANSITION_SCENARIO':'HYPOTHETICAL_OR_UNRESOLVED_POLICY',units:'synthetic units',allowance:A.toString(),borrowingCeiling:ceiling.toString(),assumedBuyerCapacity:buyerCap.toString(),borrowed:borrowed.toString(),allocation:str(allocated),used:str(used),remaining:str(b),fund:{trigger:'Actual January tax10 below explicitly assumed benchmark12; no draw if benchmark is10',inheritedQuarterCashExcess:inheritedCashExcess.toString(),inheritedCureDeadline:'2027-03-31',cap:fundCap.toString(),prefill:fill.toString(),drawn:drawn.toString(),refilled:refilled.toString(),closing:fund.toString(),openingFundingJournal:fill.eq(0)?[]:[['Public','money',fill.neg().toString()],['Public','equity',fill.neg().toString()],['Authority','M liability',fill.neg().toString()],['Authority','T liability',fill.toString()],['Treasury','cash',fill.toString()],['Treasury','equity',fill.toString()]],provenance:'Hypothetical prior-year settled tax surplus; not observed; no assertion prior-year cash limits passed'},violations,unpaid,principalPaid:redeemed.toString(),principalStillDue:q(20).sub(redeemed).toString(),closing:e.snapshot(),audit,events,report};
}
