import test from 'node:test';
import assert from 'node:assert/strict';
import {OperatingEngine} from '../src/engine072.mjs';
import {awardAuction} from '../src/auction072.mjs';
import {customOpening} from '../src/ledger.mjs';
import {q} from '../src/rational.mjs';
import fs from 'node:fs';
import {addDays,isBusinessDay,quarterEnd,lastBusinessDay} from '../src/calendar.mjs';
const federal=JSON.parse(fs.readFileSync(new URL('../fixtures/federal-calendar-2027.json',import.meta.url))).holidays;
const make=(opening={},options={})=>new OperatingEngine({opening:customOpening({M:99,T:1,...opening}),...options});
const ev=(e,type,fields={})=>e.execute({id:'e'+e.history.length,date:e.date,type,...fields});
const ok=r=>assert.equal(r.applied,true,JSON.stringify(r.issues));
const begin=e=>ok(ev(e,'begin_quarter',{path:e.path.toString(),verifiedTarget:true}));
const reject=(e,type,fields,code)=>{const before=e.snapshot();const r=ev(e,type,fields);assert.equal(r.applied,false);assert.ok(r.issues.some(x=>x.code===code),JSON.stringify(r));assert.deepEqual(e.snapshot(),before);return r;};
const receipt=(e,amount,fields={})=>ev(e,'recover',{amount,loanId:'opening',receiptId:'receipt'+e.history.length,settled:true,...fields});

test('A05-A07: exact uniform awards, marginal pro rata ties and provisional ceiling',()=>{
  const a=awardAuction(10,[{amount:8,rate:'.04'},{amount:6,rate:'.05'},{amount:100,rate:'.07'}]);
  assert.equal(a.awarded,'10');assert.equal(a.clearingRate,'1/20');assert.deepEqual(a.awards,[{bid:0,amount:'8'},{bid:1,amount:'2'}]);assert.deepEqual(a.excluded,[2]);
  const tied=awardAuction(10,[{amount:8,rate:'.04'},{amount:5,rate:'.05'},{amount:5,rate:'.05'}]);assert.deepEqual(tied.awards.map(x=>x.amount),['8','1','1']);
});
const offer=(e,id,quantity=10,bids=[{amount:10,rate:'.05'}])=>ev(e,'auction',{auctionId:id,amount:quantity,bids,maturity:'2027-03-01',convention:'par-principal-coupon'});
test('A08: awards are not settlement and rejected over-settlement is atomic',()=>{
  const e=make();begin(e);ok(offer(e,'a'));assert.equal(e.snapshot().B,'0');
  ok(ev(e,'settle_auction',{auctionId:'a',bid:0,amount:6}));assert.equal(e.snapshot().B,'6');assert.equal(e.snapshot().R,'100');
  reject(e,'settle_auction',{auctionId:'a',bid:0,amount:5},'AUCTION_AWARD');ok(ev(e,'close_auction',{auctionId:'a'}));
  const r=e.report().publications.find(x=>x.kind==='auction-settlement');assert.equal(r.shortfall,'4');assert.equal(r.actualWithdrawal,'6');assert.ok(Array.isArray(r.upcomingMaturities));
});
test('A09: second short enables eligibility, third requires review, full breaks sequence',()=>{
  const run=seq=>{const e=make();begin(e);for(let i=0;i<seq.length;i++){ok(offer(e,'a'+i));if(seq[i])ok(ev(e,'settle_auction',{auctionId:'a'+i,bid:0,amount:10}));ok(ev(e,'close_auction',{auctionId:'a'+i}));}return e.report().publications.filter(x=>x.kind==='auction-settlement');};
  const s=run([false,false,false]);assert.equal(s[0].directWindowEligible,false);assert.equal(s[1].directWindowEligible,true);assert.equal(s[2].reviewRequired,true);
  assert.equal(run([false,true,false]).at(-1).directWindowEligible,false);
});
test('A10 unresolved authorization is explicit and cannot settle retail money',()=>{const e=make();begin(e);for(const id of ['a','b']){ok(offer(e,id));ok(ev(e,'close_auction',{auctionId:id}));}const r=reject(e,'direct_sale',{amount:1},'DIRECT_SALE_AUTHORIZATION_UNRESOLVED');assert.equal(r.status,'POLICY_UNDEFINED');});
test('A11-A12: no buyers manufacture no B; discount form rejected; maturity still settles',()=>{
  const e=make({M:94,B:5});begin(e);ok(offer(e,'none',10,[{amount:10,rate:'.07'}]));ok(ev(e,'close_auction',{auctionId:'none'}));assert.equal(e.snapshot().B,'5');
  reject(e,'auction',{auctionId:'bad',amount:2,face:3,convention:'discount',maturity:'2027-03-01'},'BILL_FORM');
  ok(ev(e,'maturity',{billId:'opening',amount:5}));assert.equal(e.snapshot().B,'0');assert.equal(e.snapshot().R,'100');
});
test('A13: par issue, separate Treasury interest and principal conserve R',()=>{
  const e=make();begin(e);ok(offer(e,'a',2,[{amount:2,rate:'.05'}]));ok(ev(e,'settle_auction',{auctionId:'a',bid:0,amount:2}));ok(ev(e,'close_auction',{auctionId:'a'}));ok(ev(e,'bill_interest',{billId:'auction:a',amount:'.1'}));ok(ev(e,'maturity',{billId:'auction:a',date:'2027-03-01',amount:2}));assert.equal(e.snapshot().R,'100');assert.equal(e.snapshot().B,'0');assert.ok(q(e.snapshot().T).eq('.9'));
});
test('A27: ordinary recovery reduces P and R, not income',()=>{const e=make({P:4,bankMoney:4});begin(e);const nw=e.snapshot().accounts.Authority.equity.value;ok(receipt(e,1));assert.equal(e.snapshot().P,'3');assert.equal(e.snapshot().R,'99');assert.equal(e.snapshot().accounts.Authority.equity.value,nw);assert.equal(e.history.at(-1).detail.F,'-1');});
test('A28: impaired legal principal recovery recognizes prior loss exactly once',()=>{const e=make({P:4,bankMoney:4});begin(e);ok(ev(e,'impairFacility',{amount:4,loanId:'opening'}));const nw=q(e.snapshot().accounts.Authority.equity.value);ok(receipt(e,1));assert.equal(e.snapshot().P,'3');assert.equal(e.snapshot().U,'0');assert.ok(q(e.snapshot().accounts.Authority.equity.value).eq(nw.add(1)));assert.equal(e.snapshot().R,'99');assert.equal(e.history.at(-1).detail.lossRecoveryIncome,'1');});
test('A29: residual recovery R104/P0/U4 becomes R103/P0/U3 with one income entry',()=>{const e=make({M:103,T:1,U:4,bankMoney:4,path:100});begin(e);assert.equal(e.snapshot().accounts.Authority.equity.value,'-104');ok(receipt(e,1,{loanId:'opening-residual'}));assert.equal(e.snapshot().R,'103');assert.equal(e.snapshot().U,'3');assert.equal(e.snapshot().accounts.Authority.equity.value,'-103');assert.equal(e.history.at(-1).detail.F,'-1');});
test('A30-A31: legal discharge has F0; duplicate receipts and excess are rejected',()=>{const e=make({P:4,bankMoney:4});begin(e);ok(ev(e,'discharge',{loanId:'opening',amount:4,finalLegalResolution:true}));assert.equal(e.history.at(-1).detail.F,'0');assert.equal(e.snapshot().R,'100');ok(receipt(e,1,{receiptId:'unique'}));reject(e,'recover',{loanId:'opening',receiptId:'unique',settled:true,amount:1},'RECOVERY_RECEIPT');const r=reject(e,'recover',{loanId:'opening',receiptId:'over',settled:true,amount:4},'RECOVERY_EXCESS_UNRESOLVED');assert.equal(r.status,'POLICY_UNDEFINED');});
test('Loan-level impairment cannot be released against another loan',()=>{const e=make({P:1,bankMoney:1});begin(e);ok(ev(e,'draw',{loanId:'new',amount:1,maturity:'2027-02-01',eligibleCollateralAttested:true,stressTriggerAttested:true,penaltyRateAttested:true}));ok(ev(e,'impairFacility',{loanId:'opening',amount:1}));ok(receipt(e,1,{loanId:'new'}));assert.equal(e.history.at(-1).detail.lossRecoveryIncome,'0');assert.equal(e.report().loanRegister.P,'1');});
test('A32: collateral possession is not recovery; net settled proceeds are reported',()=>{const e=make({P:4,bankMoney:4});begin(e);const R=e.snapshot().R;ok(ev(e,'collateral_possession',{loanId:'opening'}));assert.equal(e.snapshot().R,R);ok(ev(e,'collateral_sale',{loanId:'opening',gross:2,costs:'.5',amount:'1.5',settled:true,receiptId:'sale'}));assert.equal(e.snapshot().R,'197/2');const r=e.report().publications.find(x=>x.kind==='cash-recovery');assert.equal(r.gross,'2');assert.equal(r.expenses,'1/2');assert.equal(r.net,'3/2');});
test('A33: recovery income cannot bypass zero issuance allowance',()=>{const e=make({U:4,bankMoney:4});begin(e);ok(receipt(e,1,{loanId:'opening-residual'}));reject(e,'issue',{amount:1,remittance:1},'ISSUANCE_ALLOWANCE');});
const breach=()=>{const e=make({M:96,T:4,ordinaryDebt:0},{holidays:['2027-01-01','2027-01-18']});begin(e);ok(ev(e,'observe',{date:'2027-01-12'}));return e;};
test('A14,A16-A18: sixth close opens remedy; fifth business-day deadline crosses holiday; dividend is existing money',()=>{
  const e=breach();assert.equal(e.report().cashRemedy.opened,'2027-01-11');assert.equal(e.report().cashRemedy.deadline,'2027-01-19');
  ok(ev(e,'dividend',{date:'2027-01-19'}));ok(ev(e,'close_day'));assert.equal(e.snapshot().R,'100');assert.equal(e.snapshot().T,'3');assert.equal(e.report().cashRemedy,null);assert.equal(e.report().cashRemedies[0].onTime,true);assert.ok(e.report().issues.some(x=>x.code==='TREASURY_CASH_VIOLATION'));
  const late=breach();ok(ev(late,'dividend',{date:'2027-01-20'}));ok(ev(late,'close_day'));assert.equal(late.report().cashRemedies[0].onTime,false);assert.ok(late.report().issues.some(x=>x.code==='DIVIDEND_DEADLINE'));
});
test('A19-A20: queued instruction does not cure; partial dividend and live R determine remaining payout',()=>{
  const e=make({M:96,T:4,P:1,bankMoney:1},{holidays:['2027-01-01','2027-01-18']});begin(e);ok(ev(e,'observe',{date:'2027-01-12'}));ok(ev(e,'queue_dividend',{amount:1}));assert.equal(e.snapshot().T,'4');ok(receipt(e,1));ok(ev(e,'dividend',{amount:'.5'}));ok(ev(e,'dividend'));assert.ok(q(e.snapshot().T).eq('2.97'));assert.equal(e.snapshot().R,'99');assert.equal(e.report().cashRemedy.opened,'2027-01-11');ok(ev(e,'close_day'));assert.equal(e.report().cashRemedy,null);
});
test('A25: intraday cash excess cured before close is not a breached close',()=>{const e=make();begin(e);ok(ev(e,'tax',{amount:4,date:'2027-01-04'}));ok(ev(e,'spend',{amount:4}));ok(ev(e,'close_day'));assert.equal(e.report().daily.at(-1).cashBreach,false);});
test('A21-A22: fixed quarter obligation has original deadline and disbursement credited once',()=>{const e=make({M:98,T:2});begin(e);ok(ev(e,'end_quarter',{date:'2027-03-31'}));assert.equal(e.cashObligations[0].deadline,'2027-06-30');ok(ev(e,'begin_quarter',{date:'2027-04-01',path:100,verifiedTarget:true}));ok(ev(e,'spend',{amount:'.4'}));ok(ev(e,'dividend',{date:'2027-06-30',obligation:'quarter'}));assert.equal(e.snapshot().T,'1');assert.ok(e.cashObligations[0].remaining.eq(0));});
test('A34-A36: reset is atomic, explicit and effective only at boundary',()=>{
  const e=make({M:103,T:1,U:4,path:100});begin(e);ok(ev(e,'enact_rebase',{date:'2027-02-01',path:104,residual:0,authority:'synthetic-statute',statuteAttested:true,effectiveDate:'2027-04-01'}));assert.equal(e.epoch,0);assert.equal(e.snapshot().U,'4');ok(ev(e,'end_quarter',{date:'2027-03-31'}));ok(ev(e,'statutory_rebase',{date:'2027-04-01'}));assert.equal(e.epoch,1);assert.equal(e.snapshot().U,'0');assert.equal(e.snapshot().path,'104');assert.equal(e.report().epochChanges[0].enactmentDate,'2027-02-01');
  const bad=make({M:103,T:1,U:4,path:100});begin(bad);ok(ev(bad,'end_quarter',{date:'2027-03-31'}));reject(bad,'statutory_rebase',{date:'2027-04-01',statuteAttested:true,authority:'synthetic',enactmentDate:'2027-02-01',effectiveDate:'2027-04-01',path:100,residual:0},'RESET_INITIAL_BOUND');
});
test('A44-A47: exported reports distinguish legal overdue principal, residual and headroom',()=>{
  const e=make();begin(e);ok(ev(e,'draw',{loanId:'loan',amount:2,maturity:'2027-01-02',eligibleCollateralAttested:true,stressTriggerAttested:true,penaltyRateAttested:true}));ok(ev(e,'observe',{date:'2027-01-09'}));let weekly=e.report().publications.filter(x=>x.kind==='weekly-register').at(-1);assert.equal(weekly.loans.find(x=>x.loanId==='loan').overduePrincipal,'2');
  ok(ev(e,'discharge',{amount:2,loanId:'loan',finalLegalResolution:true}));ok(ev(e,'observe',{date:'2027-01-16'}));weekly=e.report().publications.filter(x=>x.kind==='weekly-register').at(-1);const l=weekly.loans.find(x=>x.loanId==='loan');assert.equal(l.overduePrincipal,'0');assert.equal(l.residual,'2');assert.ok(e.report().publications.some(x=>x.kind==='daily-facility-usage'));assert.ok(e.report().publications.some(x=>x.kind==='facility-action'));
  const h=make({M:103,T:1,U:4,path:100});begin(h);ok(ev(h,'observe',{date:'2027-01-16'}));const reports=h.report().publications.filter(x=>x.kind==='weekly-register');assert.ok(reports.length>=3);for(const r of reports){assert.equal(r.P,'0');assert.equal(r.U,'4');assert.equal(r.E,'4');assert.equal(r.denominatorSnapshot,'104');assert.equal(r.overhang,'48/25');assert.equal(r.lendingFreeze,true);}
});

test('A15,A24: rolling eleven breached closes survive compliant days and trigger later remedies',()=>{
  const e=make({M:96,T:4});begin(e);let day='2027-01-04',n=0;
  while(n<16){if(isBusinessDay(day,federal)){const breach=n%5!==4;const desired=breach?4:3;const current=q(e.snapshot().T).number();if(desired>current)ok(ev(e,'tax',{date:day,amount:desired-current}));else if(desired<current)ok(ev(e,'spend',{date:day,amount:current-desired}));else ok(ev(e,'observe',{date:day}));ok(ev(e,'close_day'));n++;}day=addDays(day,1);}
  const violations=e.report().issues.filter(x=>x.code==='TREASURY_CASH_VIOLATION');assert.ok(violations.length>0);assert.ok(violations.every(x=>x.consecutive<=4));assert.equal(violations[0].rolling,11);assert.ok(e.report().cashRemedies.length>0);assert.ok(e.report().cashRemedy);assert.ok(e.report().daily.at(-1).rollingBreaches>10);
});
const series=available=>[{name:'CPI-U',vintage:'first-release-2027-01',available},{name:'PCE',vintage:'first-release-2027-01',available},{name:'GDP-trend',vintage:'annual-update-2027',available}];
test('A37-A40: successive available gaps activate brake; missing observation retains target and B target',()=>{
  const e=make();begin(e);ok(ev(e,'target_observation',{verified:true,target:100,gap:.04,series:series(true)}));assert.equal(e.operating.data.brake.active,false);
  ok(ev(e,'target_observation',{series:series(false)}));assert.equal(e.operating.data.lastGap,.04);
  ok(ev(e,'target_observation',{verified:true,target:100,gap:.04,series:series(true)}));assert.equal(e.operating.data.brake.active,true);const B=e.operating.data.brake.targetStock;
  ok(ev(e,'target_observation',{series:series(false)}));assert.equal(e.operating.data.brake.targetStock,B);assert.equal(e.snapshot().B,'0');assert.equal(e.report().publications.filter(x=>x.kind==='data-observation').at(-1).gap,null);
});
test('A38: no target means no computed allowance or issuance',()=>{const e=make();ok(ev(e,'target_observation',{series:series(false)}));const r=reject(e,'begin_quarter',{},'NO_VERIFIED_TARGET');assert.equal(r.status,'POLICY_UNDEFINED');reject(e,'issue',{amount:1},'NO_QUARTER');});
test('A48: missing new observations do not cancel or recalculate a fixed three-tranche allowance',()=>{
  const e=make({M:399,T:1});ok(ev(e,'begin_quarter',{path:403,verifiedTarget:true}));ok(ev(e,'issue',{amount:1}));ok(ev(e,'spend',{amount:1}));
  ok(ev(e,'target_observation',{date:'2027-01-15',series:series(false)}));assert.equal(e.quarter.allowance.toString(),'3');
  for(const date of ['2027-02-01','2027-03-01']){ok(ev(e,'issue',{date,amount:1}));ok(ev(e,'spend',{amount:1}));}
  assert.equal(e.quarter.issued.toString(),'3');reject(e,'issue',{amount:'.01'},'ISSUANCE_ALLOWANCE');
});
test('A41-A43: clean full calendar quarter allows new episode; no clean quarter preserves old clock',()=>{
  const e=make({date:undefined});begin(e);ok(ev(e,'emergency_start',{jointCertification:true}));
  ok(ev(e,'end_quarter',{date:'2027-03-31'}));ok(ev(e,'close_day'));assert.equal(e.operating.cleanQuarters.length,1);
  ok(ev(e,'begin_quarter',{date:'2027-04-01',path:100,verifiedTarget:true}));ok(ev(e,'emergency_start',{jointCertification:true}));assert.equal(e.emergency.origin,'2027-04-01');assert.equal(e.emergency.continued,false);
  const f=make();begin(f);ok(ev(f,'emergency_start',{jointCertification:true}));ok(ev(f,'draw',{amount:1,loanId:'emergency-loan',maturity:'2027-03-01',eligibleCollateralAttested:true,stressTriggerAttested:true,penaltyRateAttested:true}));
  ok(ev(f,'end_quarter',{date:'2027-03-31'}));ok(ev(f,'close_day'));assert.equal(f.operating.cleanQuarters.length,0);ok(ev(f,'begin_quarter',{date:'2027-04-01',path:100,verifiedTarget:true}));ok(ev(f,'emergency_start',{jointCertification:true}));assert.equal(f.emergency.origin,'2027-01-01');assert.equal(f.emergency.continued,true);
  ok(ev(f,'observe',{date:'2028-01-02'}));reject(f,'emergency_start',{jointCertification:true},'EMERGENCY_HARD_STOP');
});
test('Staged boundary reset cannot be skipped or applied after computing new allowance',()=>{const e=make();begin(e);ok(ev(e,'enact_rebase',{statuteAttested:true,authority:'test-statute',path:100,residual:0,effectiveDate:'2027-04-01'}));ok(ev(e,'end_quarter',{date:'2027-03-31'}));reject(e,'begin_quarter',{date:'2027-04-01',path:100,verifiedTarget:true},'RESET_DUE');});

test('A01-A02: eight elapsed quarters escalate without vote-driven or automatic residual reset',()=>{
  const e=make({M:103,T:1,U:4,path:100},{holidays:[]});
  for(let k=0;k<8;k++){const year=2027+Math.floor(k/4),month=1+(k%4)*3,date=`${year}-${String(month).padStart(2,'0')}-01`;ok(ev(e,'begin_quarter',{date,path:100,verifiedTarget:true}));assert.equal(e.quarter.allowance.toString(),'0');ok(ev(e,'end_quarter',{date:lastBusinessDay(quarterEnd(date),[])}));}
  assert.equal(e.report().publications.filter(x=>x.kind==='overhang-escalation').length,0);
  ok(ev(e,'begin_quarter',{date:'2029-01-01',path:100,verifiedTarget:true}));assert.equal(e.report().publications.filter(x=>x.kind==='overhang-escalation').length,1);
  const before=e.snapshot();ok(ev(e,'record_vote',{result:'failed'}));assert.deepEqual(e.snapshot(),before);assert.equal(e.snapshot().U,'4');
});
test('A04,A26: boundary draw rejected even when a same-day repayment is proposed',()=>{const e=make({P:2,bankMoney:2});begin(e);reject(e,'draw',{amount:'.01',loanId:'over',maturity:'2027-02-01',eligibleCollateralAttested:true,stressTriggerAttested:true,penaltyRateAttested:true},'FACILITY_HEADROOM');assert.equal(e.operating.loans.over,undefined);});
test('Rejected custom settlement restores registers, receipt IDs, reports and staged state',()=>{const e=make({P:2,bankMoney:0});begin(e);const state=structuredClone(e.operating);reject(e,'recover',{amount:1,loanId:'opening',receiptId:'retry',settled:true},'OPERATING_PRECONDITION');assert.deepEqual(e.operating,state);assert.equal(e.ids.has('e1'),false);});

