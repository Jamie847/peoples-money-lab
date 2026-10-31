import test from 'node:test';
import assert from 'node:assert/strict';
import {Engine,POLICY} from '../src/engine.mjs';
import {customOpening} from '../src/ledger.mjs';
import {issuanceRule,brakeRule} from '../src/rules.mjs';
import {validatePolicy} from '../src/policy.mjs';
const run=(e,date,type,fields={})=>e.execute({id:`a-${e.history.length}`,date,type,...fields});
const has=(r,c)=>r.issues.some(x=>x.code===c);
test('Finalization closes the sixth breached endpoint day rather than hiding it',()=>{
 const e=new Engine();run(e,'2027-01-01','begin_quarter',{path:e.path.toString()});run(e,'2027-01-04','tax',{amount:10});run(e,'2027-01-11','observe');
 assert.ok(has(e.report(),'UNCLOSED_ENDPOINT_DAY'));assert.equal(e.report().status,'POLICY_UNDEFINED');
 const r=e.finalize();assert.equal(r.status,'FAIL');assert.ok(has(r,'TREASURY_CURE_EXCEEDED'));assert.equal(e.cashStreak,6);
});
test('A year-late observation is not evidence of a completed quarterly schedule',()=>{const e=new Engine();run(e,'2027-01-01','begin_quarter',{path:e.path.toString()});const r=run(e,'2028-01-01','observe');assert.ok(has(r,'QUARTER_COVERAGE_GAP'));assert.equal(e.finalize().status,'POLICY_UNDEFINED');assert.equal(e.report().completeness,'INCOMPLETE');});
test('A closed quarter followed by an unmodeled quarter is incomplete',()=>{const e=new Engine();run(e,'2027-01-01','begin_quarter',{path:e.path.toString()});run(e,'2027-03-31','end_quarter');run(e,'2027-07-01','observe');assert.ok(has(e.finalize(),'QUARTER_COVERAGE_GAP'));});
test('Emergency recertification cannot silently restart a completed 365-day episode',()=>{const e=new Engine();run(e,'2027-01-01','emergency_start',{jointCertification:true});run(e,'2027-01-01','emergency_extend',{recordedCongressionalVote:true,expiry:'2028-01-01'});const r=run(e,'2028-01-01','emergency_start',{jointCertification:true});assert.equal(r.status,'POLICY_UNDEFINED');assert.equal(r.applied,false);assert.ok(has(r,'EMERGENCY_EPISODE_RESTART'));run(e,'2028-01-01','observe');assert.equal(e.emergencyEpisodes.length,1);assert.equal(e.emergency,null);assert.equal(e.emergencyEpisodes[0].origin,'2027-01-01');});
test('Even a later asserted new crisis is undefined rather than an invented cool-off',()=>{const e=new Engine();run(e,'2027-01-01','emergency_start',{jointCertification:true});run(e,'2028-01-01','observe');assert.ok(has(run(e,'2029-01-01','emergency_start',{jointCertification:true,newEpisode:true}),'EMERGENCY_EPISODE_RESTART'));});
test('Denominator overhang retains origin over repeated shrinking quarters',()=>{
 const e=new Engine({opening:customOpening({M:99,T:1,bankMoney:20,P:2,conversion:20,path:100})});
 run(e,'2027-01-01','begin_quarter',{path:100});run(e,'2027-01-01','spend',{amount:'.1'});run(e,'2027-01-01','repayConversion',{amount:3});run(e,'2027-03-31','end_quarter');
 assert.ok(has(run(e,'2027-04-01','begin_quarter',{path:100}),'DENOMINATOR_OVERHANG'));
 for(const date of ['2027-04-01','2027-05-01','2027-06-01']){run(e,date,'issue',{amount:1});run(e,date,'spend',{amount:1});}
 run(e,'2027-06-30','repayConversion',{amount:4});run(e,'2027-06-30','end_quarter');
 const r=run(e,'2027-07-01','begin_quarter',{path:100});assert.equal(r.status,'PASS');assert.ok(has(r,'DENOMINATOR_OVERHANG'));assert.equal(e.overhang.origin,'2027-04-01');assert.equal(e.overhang.quarters,2);assert.equal(e.snapshot().P,'2');assert.ok(has(run(e,'2027-07-01','draw',{amount:'.01',loanId:'blocked'}),'FACILITY_HEADROOM'));
});
test('Supported policy edits consistently drive both helper and engine growth limits',()=>{
 const policy={...POLICY,annualPathGrowthMaximum:0,priceFeedbackLambda:'0'};
 const result=issuanceRule({previousPath:100,previousR:100,trendRealGrowth:.03,cpiRebased:120,pceRebased:120,policy});assert.equal(result.annualGrowth,0);
 const e=new Engine({policy,opening:customOpening({M:99,T:1})});assert.ok(has(run(e,'2027-01-01','begin_quarter',{path:100.1}),'PATH_GROWTH_LIMIT'));
 const feedback=issuanceRule({previousPath:100,previousR:100,trendRealGrowth:.03,cpiRebased:120,pceRebased:120,policy:{...policy,annualPathGrowthMaximum:.04}});assert.equal(feedback.annualGrowth,.03);
});
test('Brake thresholds, floor, feedback and maximum all come from policy',()=>{
 const policy={...POLICY,brakeTriggerLogGap:'.04',brakeReleaseLogGap:'.02',safeAssetFloorRatio:'.02',brakeLambda:'.2',brakeMaximumRatio:'.005'};
 assert.equal(brakeRule({priorR:100,priorM:90,currentLogGap:.035,previousLogGap:.035,policy}).active,false);
 const r=brakeRule({priorR:100,priorM:90,currentLogGap:.05,previousLogGap:.05,policy});assert.equal(r.floor,'2');assert.equal(r.brake,'9/20');assert.equal(brakeRule({priorR:100,priorM:90,currentLogGap:.015,previousLogGap:.05,wasActive:true,policy}).active,false);
});
test('Unknown operational settings and invented policy-gap resolutions are rejected',()=>{assert.throws(()=>validatePolicy({...POLICY,magicSettlement:true}),/Unsupported/);assert.throws(()=>new Engine({policy:{...POLICY,auctionNonClearanceResponse:'AUTO_BUY'}}),/No implemented/);assert.throws(()=>validatePolicy({...POLICY,quartersPerYear:12}),/calendar quarters/);assert.ok(Object.isFrozen(POLICY));});
