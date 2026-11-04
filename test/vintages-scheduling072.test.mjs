import test from 'node:test';
import assert from 'node:assert/strict';
import {OperatingEngine} from '../src/engine072.mjs';
import {customOpening} from '../src/ledger.mjs';
import {ingestRelease,computeFromVintages} from '../src/vintages072.mjs';
import {q} from '../src/rational.mjs';
const ev=(e,type,fields={})=>e.execute({id:`e${e.history.length}`,date:e.date,type,...fields});
const ok=r=>assert.equal(r.applied,true,JSON.stringify(r.issues));
const rejected=(r,code)=>{assert.equal(r.applied,false);assert.ok(r.issues.some(x=>x.code===code),JSON.stringify(r));};
function book(){let b=[];for(let y=2016;y<=2025;y++)b=ingestRelease(b,{releaseId:`g${y}`,series:'GDP',period:String(y),published:`${y+1}-03-20`,value:.02,estimate:3},'2027-01-01');for(const s of ['CPI-U','PCE'])for(const month of ['09','10','11'])b=ingestRelease(b,{releaseId:s+month,series:s,period:'2026-'+month,published:'2026-12-20',value:100},'2027-01-01');return b;}
const compute=(b,previous,date,extra={})=>computeFromVintages(b,previous,{date,previousPath:400,previousR:400,...extra});
test('A39 GDP third estimates, annual revision gate and delayed original affect future computations only',()=>{
  let b=book();const first=compute(b,null,'2027-01-01');assert.equal(first.available,true);assert.equal(first.state.annual.trend,.02);
  // A revision published after the current annual slot cannot alter that slot.
  b=ingestRelease(b,{releaseId:'g2025-revised',series:'GDP',period:'2025',published:'2027-02-01',value:.03,estimate:3,revision:true},'2027-02-01');
  const delayed=compute(b,first.state,'2027-04-01');assert.equal(delayed.pendingAnnual,true);assert.deepEqual(delayed.state.annual,first.state.annual);
  b=ingestRelease(b,{releaseId:'g2026',series:'GDP',period:'2026',published:'2027-05-01',value:.04,estimate:3},'2027-05-01');
  const july=compute(b,delayed.state,'2027-07-01');assert.equal(july.state.annual.slotYear,2027);assert.equal(july.state.annual.appliedOn,'2027-07-01');assert.ok(Math.abs(july.state.annual.trend-.023)<1e-12);
  b=ingestRelease(b,{releaseId:'g2026-down',series:'GDP',period:'2026',published:'2027-08-01',value:-.01,estimate:3,revision:true},'2027-08-01');
  assert.deepEqual(compute(b,july.state,'2027-10-01').state.annual,july.state.annual);
  b=ingestRelease(b,{releaseId:'g2027',series:'GDP',period:'2027',published:'2028-03-20',value:.02,estimate:3},'2028-03-20');
  const april=compute(b,july.state,'2028-04-01');assert.equal(april.state.annual.releases.find(x=>x.period==='2026').id,'g2026-down');assert.equal(first.state.annual.slotYear,2026);
});
test('A39 independent CPI/PCE missing observations and first-release-only pricing',()=>{
  let b=book();const original=compute(b,null,'2027-01-01');
  b=ingestRelease(b,{releaseId:'cpi-revised',series:'CPI-U',period:'2026-11',published:'2026-12-25',value:200,revision:true},'2027-01-01');
  b=ingestRelease(b,{releaseId:'pce-revised',series:'PCE',period:'2026-11',published:'2026-12-25',value:50,revision:true},'2027-01-01');
  assert.equal(compute(b,null,'2027-01-01').target,original.target);
  for(const series of ['CPI-U','PCE']){const x=compute(b,original.state,'2027-04-01',{missingSeries:[series]});assert.equal(x.available,false);assert.equal(x.series.find(s=>s.name===series).available,false);assert.equal(x.series.find(s=>s.name===(series==='PCE'?'CPI-U':'PCE')).available,true);}
  assert.throws(()=>ingestRelease(b,{releaseId:'future',series:'CPI-U',period:'2027-01',published:'2027-02-01',value:100},'2027-01-01'));
});
test('A39 integrated late release receipt cannot change existing fixed allowance or credited issuance',()=>{
  const e=new OperatingEngine({opening:customOpening({M:399,T:1}),date:'2026-12-31'});
  for(const r of book())ok(ev(e,'ingest_release',{releaseId:r.id,series:r.series,period:r.period,published:r.published,value:r.value,estimate:r.estimate,revision:r.revision}));
  ok(ev(e,'compute_quarter',{date:'2027-01-01'}));const allowance=e.quarter.allowance.toString();ok(ev(e,'issue',{amount:e.quarter.allowance.div(3).toString()}));const issued=e.quarter.issued.toString();
  ok(ev(e,'ingest_release',{date:'2027-02-01',releaseId:'upward',series:'GDP',period:'2025',published:'2027-02-01',estimate:3,revision:true,value:.09}));
  assert.equal(e.quarter.allowance.toString(),allowance);assert.equal(e.quarter.issued.toString(),issued);assert.equal(e.report().dataComputations[0].series.find(s=>s.name==='GDP-trend').annual.releases.at(-1).id,'g2025');
  const saved=e.snapshot();rejected(ev(e,'compute_quarter',{date:'2027-01-01'}),'DUPLICATE_COMPUTATION');assert.deepEqual(e.snapshot(),saved);
});
const scheduled=()=>{const e=new OperatingEngine({opening:customOpening({M:399,T:1})});ok(ev(e,'begin_quarter',{path:403,verifiedTarget:true}));ok(ev(e,'schedule_tranches',{tranches:[{id:'jan',date:'2027-01-05',amount:1},{id:'feb',date:'2027-02-05',amount:1},{id:'mar',date:'2027-03-05',amount:1}]}));return e;};
test('A48 scheduled monthly credits continue through missing data and remain within fixed allowance',()=>{
  const e=scheduled();ok(ev(e,'settle_tranche',{date:'2027-01-05',trancheId:'jan'}));ok(ev(e,'spend',{amount:1}));ok(ev(e,'target_observation',{date:'2027-01-06',series:[{name:'PCE',vintage:'unavailable',available:false}]}));
  for(const [id,date] of [['feb','2027-02-05'],['mar','2027-03-05']]){ok(ev(e,'settle_tranche',{date,trancheId:id}));ok(ev(e,'spend',{amount:1}));}
  assert.equal(e.quarter.issued.toString(),'3');assert.ok(e.report().tranches.every(t=>t.paid&&!t.missed));rejected(ev(e,'settle_tranche',{trancheId:'mar'}),'TRANCHE_ID');assert.equal(e.report().dataComputations.length,0);
});
test('A23 preventive deferral cannot recreate quarter-end excess; compliant within-month deferral preserves schedule',()=>{
  const e=scheduled();ok(ev(e,'defer_tranche',{trancheId:'jan',paymentDate:'2027-01-06'}));ok(ev(e,'settle_tranche',{date:'2027-01-06',trancheId:'jan'}));ok(ev(e,'spend',{amount:1}));ok(ev(e,'settle_tranche',{date:'2027-02-05',trancheId:'feb'}));ok(ev(e,'spend',{amount:1}));
  ok(ev(e,'tax',{amount:4}));const state=structuredClone(e.operating.tranches);rejected(ev(e,'defer_tranche',{trancheId:'mar',paymentDate:'2027-03-31'}),'DEFERRAL_RECREATES_EXCESS');assert.deepEqual(e.operating.tranches,state);
  // A previously permissible deferral is checked again against live settlement balances.
  ok(ev(e,'spend',{amount:4}));ok(ev(e,'defer_tranche',{trancheId:'mar',paymentDate:'2027-03-31'}));ok(ev(e,'tax',{amount:4,date:'2027-03-31'}));rejected(ev(e,'settle_tranche',{trancheId:'mar'}),'DEFERRAL_RECREATES_EXCESS');
});
test('Missed scheduled settlement is retained; manual issuance cannot bypass the schedule',()=>{const e=scheduled();rejected(ev(e,'issue',{amount:1}),'SCHEDULED_ISSUANCE_ROUTE');ok(ev(e,'observe',{date:'2027-01-07'}));assert.ok(e.report().issues.some(x=>x.code==='SCHEDULED_TRANCHE_MISSED'));ok(ev(e,'settle_tranche',{trancheId:'jan'}));assert.equal(e.report().tranches[0].missed,true);});
test('Explicit statutory per-loan residual reductions support a partial reset without inferred allocation',()=>{
  const e=new OperatingEngine({opening:customOpening({M:103,T:1,U:4,path:100})});ok(ev(e,'begin_quarter',{path:100,verifiedTarget:true}));
  ok(ev(e,'enact_rebase',{date:'2027-02-01',statuteAttested:true,authority:'synthetic-statute',effectiveDate:'2027-04-01',path:102,residual:2,residualReductions:{'opening-residual':2}}));ok(ev(e,'end_quarter',{date:'2027-03-31'}));ok(ev(e,'statutory_rebase',{date:'2027-04-01'}));assert.equal(e.snapshot().U,'2');assert.equal(e.snapshot().positiveDeviation,'2');assert.equal(e.report().epochChanges[0].residualReductions['opening-residual'],'2');
});
test('Partial reset rejects unspecified, excessive, unknown or nonreconciling allocation atomically',()=>{
  for(const [allocation,code] of [[undefined,'RESET_ALLOCATION_REQUIRED'],[{'opening-residual':5},'RESET_ALLOCATION'],[{unknown:2},'LOAN_ID'],[{'opening-residual':1},'RESET_ALLOCATION_TOTAL']]){
    const e=new OperatingEngine({opening:customOpening({M:103,T:1,U:4,path:100})});ok(ev(e,'begin_quarter',{path:100,verifiedTarget:true}));const before=e.snapshot();
    rejected(ev(e,'enact_rebase',{statuteAttested:true,authority:'synthetic-statute',effectiveDate:'2027-04-01',path:102,residual:2,residualReductions:allocation}),code);assert.deepEqual(e.snapshot(),before);assert.equal(e.operating.stagedReset,null);
  }
});
