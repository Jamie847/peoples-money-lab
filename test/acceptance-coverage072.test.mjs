import test from 'node:test';
import assert from 'node:assert/strict';
import {OperatingEngine} from '../src/engine072.mjs';
import {customOpening} from '../src/ledger.mjs';
import {q} from '../src/rational.mjs';
import {lastBusinessDay,quarterEnd} from '../src/calendar.mjs';
const ev=(e,type,fields={})=>e.execute({id:'c'+e.history.length,date:e.date,type,...fields});
const ok=r=>assert.equal(r.applied,true,JSON.stringify(r.issues));
const begin=(e,date=e.date,path=e.path.toString())=>ok(ev(e,'begin_quarter',{date,path,verifiedTarget:true}));
const close=e=>{ok(ev(e,'end_quarter',{date:lastBusinessDay(quarterEnd(e.date),e.holidays)}));ok(ev(e,'close_day'));};
const draw=(e,id,amount,maturity)=>ev(e,'draw',{loanId:id,amount,maturity,eligibleCollateralAttested:true,stressTriggerAttested:true,penaltyRateAttested:true});

test('A01 exact emergency-expiry residual remains frozen for eight quarters and escalates without reset',()=>{
  const e=new OperatingEngine({opening:customOpening({M:99,T:1})});begin(e);ok(ev(e,'emergency_start',{jointCertification:true}));ok(draw(e,'loan',5,'2027-03-31'));ok(ev(e,'recover',{loanId:'loan',receiptId:'r1',amount:1,settled:true}));ok(ev(e,'discharge',{loanId:'loan',amount:4,finalLegalResolution:true}));close(e);
  for(let k=1;k<=8;k++){const y=2027+Math.floor(k/4),m=1+k%4*3;begin(e,`${y}-${String(m).padStart(2,'0')}-01`);assert.equal(e.quarter.allowance.toString(),'0');assert.equal(e.snapshot().R,'104');assert.equal(e.snapshot().P,'0');assert.equal(e.snapshot().U,'4');assert.equal(e.cap().toString(),'52/25');const r=draw(e,'denied'+k,'.01',`${y}-${String(m).padStart(2,'0')}-20`);assert.equal(r.applied,false);close(e);}
  begin(e,'2029-04-01');assert.ok(e.report().publications.some(x=>x.kind==='overhang-escalation'&&x.quartersElapsed===8));assert.equal(e.epoch,0);
});
test('A02 proposed and failed votes or impairment cannot erase residual exposure',()=>{const e=new OperatingEngine({opening:customOpening({M:103,T:1,U:4,path:100})});begin(e);for(const result of ['proposed','failed']){const s=e.snapshot();ok(ev(e,'record_vote',{result}));assert.deepEqual(e.snapshot(),s);}const s=e.snapshot();const r=ev(e,'impairFacility',{loanId:'opening-residual',amount:4});assert.equal(r.applied,false);assert.deepEqual(e.snapshot(),s);});
test('A03 denominator growth restores actual headroom without reporting recovery',()=>{
  const e=new OperatingEngine({opening:customOpening({M:99,T:1,U:'2.005',path:100})});begin(e,'2027-01-01','100.9');
  for(const d of ['2027-01-01','2027-02-01','2027-03-01']){ok(ev(e,'issue',{date:d,amount:'.3'}));ok(ev(e,'spend',{amount:'.3'}));}close(e);begin(e,'2027-04-01');
  const report=e.report().publications.find(x=>x.kind==='overhang-resolved');assert.equal(report.resolution,'DENOMINATOR_ROOM_RESTORED');assert.equal(report.recoveredDuringOverhang,'0');assert.ok(q(e.snapshot().U).eq('2.005'));ok(draw(e,'room','.01','2027-05-01'));assert.equal(draw(e,'too-much','.01','2027-05-01').applied,false);
});
test('A40 active missing-data brake retains B target while failed replacement and actual maturity reduce B',()=>{
  const e=new OperatingEngine({opening:customOpening({M:94,T:1,B:5})});begin(e);const series=[{name:'CPI-U/PCE aggregate',vintage:'synthetic-first-release',available:true}];
  for(const date of ['2027-01-01','2027-01-02'])ok(ev(e,'target_observation',{date,target:100,gap:.04,verified:true,series}));const target=e.operating.data.brake.targetStock;
  ok(ev(e,'target_observation',{date:'2027-01-03',series:[{name:'PCE',vintage:'unavailable',available:false}]}));ok(ev(e,'maturity',{billId:'opening',amount:5}));
  ok(ev(e,'auction',{auctionId:'replace',amount:5,bids:[],convention:'par-principal-coupon',maturity:'2027-03-01'}));ok(ev(e,'close_auction',{auctionId:'replace'}));
  assert.equal(e.operating.data.brake.targetStock,target);assert.equal(e.snapshot().B,'0');const r=e.report().publications.find(x=>x.kind==='auction-settlement');assert.equal(r.actualWithdrawal,'0');assert.equal(r.shortfall,'5');
});
test('A42 loan relabeling or rollover cannot erase its emergency identity; one bad day invalidates quarter',()=>{
  const e=new OperatingEngine({opening:customOpening({M:99,T:1})});begin(e);ok(ev(e,'emergency_start',{jointCertification:true}));ok(draw(e,'tagged',1,'2027-03-01'));
  for(const type of ['relabel_loan','roll_loan']){
    const before=e.snapshot(),register=e.publicRegister(),operating=structuredClone(e.operating),clock=structuredClone(e.emergency),ids=[...e.ids];
    const result=ev(e,type,{date:'2027-02-01',loanId:'tagged',newLoanId:'fresh',maturity:'2027-06-01'});
    assert.equal(result.applied,false);assert.equal(result.status,'POLICY_UNDEFINED');assert.ok(result.issues.some(x=>x.code==='UNSUPPORTED_EVENT'));assert.deepEqual(result.entries,[]);
    assert.deepEqual(e.snapshot(),before);assert.deepEqual(e.publicRegister(),register);assert.deepEqual(e.operating,operating);assert.deepEqual(e.emergency,clock);assert.deepEqual([...e.ids],ids);assert.equal(e.loans.fresh,undefined);
  }
  assert.equal(e.operating.loans.tagged.episode,'2027-01-01');close(e);assert.equal(e.operating.cleanQuarters.length,0);
  begin(e,'2027-04-01');ok(ev(e,'emergency_start',{jointCertification:true}));assert.equal(e.emergency.origin,'2027-01-01');assert.equal(e.emergency.continued,true);
  // Continue the complete quarterly record without repaying or replacing the
  // tagged balance. A new name cannot supply the missing clean quarter.
  close(e);begin(e,'2027-07-01');close(e);begin(e,'2027-10-01');close(e);begin(e,'2028-01-01');
  const beforeStop=e.snapshot(),episodes=structuredClone(e.emergencyEpisodes),register=e.publicRegister();
  const exhausted=ev(e,'emergency_start',{jointCertification:true});assert.equal(exhausted.applied,false);assert.ok(exhausted.issues.some(x=>x.code==='EMERGENCY_HARD_STOP'));assert.deepEqual(e.snapshot(),beforeStop);assert.deepEqual(e.emergencyEpisodes,episodes);assert.deepEqual(e.publicRegister(),register);assert.equal(e.operating.cleanQuarters.length,0);assert.equal(e.operating.loans.tagged.episode,'2027-01-01');
  assert.ok(e.report().publications.filter(x=>x.kind==='weekly-register').some(x=>x.loans.some(l=>l.loanId==='tagged'&&l.episode==='2027-01-01'&&l.principal==='1')));
  const f=new OperatingEngine({opening:customOpening({M:99,T:1})});begin(f);ok(ev(f,'emergency_start',{jointCertification:true}));ok(draw(f,'temporary',3,'2027-03-01'));ok(ev(f,'recover',{loanId:'temporary',receiptId:'same-day',amount:3,settled:true}));close(f);assert.equal(f.operating.cleanQuarters.length,0);
});
test('A44 overdue partial principal repayment retains age and reports remaining legal balance',()=>{
  const e=new OperatingEngine({opening:customOpening({M:99,T:1})});begin(e);ok(draw(e,'loan',2,'2027-01-02'));ok(ev(e,'recover',{date:'2027-01-05',loanId:'loan',receiptId:'partial',amount:1,settled:true}));ok(ev(e,'observe',{date:'2027-01-09'}));const l=e.report().publications.filter(x=>x.kind==='weekly-register').at(-1).loans.find(x=>x.loanId==='loan');assert.equal(l.principal,'1');assert.equal(l.overduePrincipal,'1');assert.equal(l.overdueCalendarDays,6);
});
test('A45 discharged overdue residual and later recovery reconcile in weekly export without double count',()=>{
  const e=new OperatingEngine({opening:customOpening({M:99,T:1})});begin(e);ok(draw(e,'loan',2,'2027-01-02'));ok(ev(e,'discharge',{date:'2027-01-05',loanId:'loan',amount:2,finalLegalResolution:true}));ok(ev(e,'recover',{loanId:'loan',receiptId:'residual',amount:1,settled:true}));ok(ev(e,'observe',{date:'2027-01-09'}));const r=e.report().publications.filter(x=>x.kind==='weekly-register').at(-1),l=r.loans.find(x=>x.loanId==='loan');assert.equal(r.P,'0');assert.equal(r.U,'1');assert.equal(r.E,'1');assert.equal(l.overduePrincipal,'0');assert.equal(l.residual,'1');
});
test('A46 weekly register supplements daily usage and immediate action disclosures without arbitrary private fields',()=>{
  const e=new OperatingEngine({opening:customOpening({M:99,T:1})});begin(e);ok(draw(e,'public-loan-id',1,'2027-02-01'));ok(ev(e,'recover',{date:'2027-01-02',loanId:'public-loan-id',receiptId:'public-receipt',amount:'.5',settled:true,privateNote:'DO_NOT_PUBLISH'}));ok(ev(e,'observe',{date:'2027-01-16'}));const rows=e.report().publications;
  assert.equal(rows.filter(x=>x.kind==='daily-facility-usage').length,15);assert.equal(rows.filter(x=>x.kind==='weekly-register').length,3);assert.ok(rows.filter(x=>x.kind==='facility-action').every(x=>x.disclosedWithinHours<=24));assert.ok(rows.some(x=>x.kind==='facility-action'&&x.action==='recover'));assert.equal(JSON.stringify(rows).includes('DO_NOT_PUBLISH'),false);
});
test('A47 weekly overhang exports distinguish actual cash recovery from restored denominator room',()=>{
  const e=new OperatingEngine({opening:customOpening({M:103,T:1,U:4,path:100,bankMoney:4})});begin(e);ok(ev(e,'observe',{date:'2027-01-09'}));ok(ev(e,'recover',{loanId:'opening-residual',receiptId:'cash',amount:2,settled:true}));const resolution=e.report().publications.find(x=>x.kind==='overhang-resolved');assert.equal(resolution.resolution,'CASH_RECOVERY');assert.equal(resolution.recoveredDuringOverhang,'2');assert.equal(e.snapshot().U,'2');
  const weeks=e.report().publications.filter(x=>x.kind==='weekly-register');assert.equal(weeks.length,2);for(const r of weeks){assert.equal(r.P,'0');assert.equal(r.U,'4');assert.equal(r.E,'4');assert.equal(r.cap,'52/25');assert.equal(r.denominatorSnapshot,'104');assert.equal(r.lendingFreeze,true);}
});
