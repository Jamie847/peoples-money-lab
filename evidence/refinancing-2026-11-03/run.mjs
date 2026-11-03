import fs from 'node:fs';
import assert from 'node:assert/strict';
import {run,q,settlementScenario} from './scenario.mjs';
const configs=[0,10,20].map(ceiling=>({name:'same-day-refinancing-buyers-'+ceiling,period:'post-ban',principalOnly:true,ceiling}));
configs.push({name:'advance-refinancing-quarter-net-buyers-20',period:'transition',ceiling:20});
const results=configs.map(config=>{
 const r=run(config);
 const net=q(r.borrowed).sub(r.principalPaid);
 return {...r,policyStatus:'POST_DISCLOSURE_SENSITIVITY_NOT_ADOPTED_SETTLEMENT_CONVENTION',ordinaryNetBorrowing:net.toString(),netBorrowingRuleSatisfied:net.cmp(0)<=0};
});
let assertions=0;const check=x=>{assert.ok(x);assertions++;};
for(const r of results){
 check(r.accountingStatus==='FAIL');check(q(r.borrowed).cmp(r.assumedBuyerCapacity)<=0);
 check(q(r.principalPaid).add(r.principalStillDue).eq(20));
 check(q(r.closing.accounts.Treasury.ordinary.value).eq(q(105).add(r.borrowed).sub(r.principalPaid)));
 for(const e of settlementScenario().events.filter(x=>!['issue','borrow'].includes(x.type))){const a=r.audit.find(x=>x.sourceId===e.id);check(a.date===e.date&&q(a.amount).eq(e.amount));}
 for(const k of ['spending','debt']){check(q(r.allocation[k]).eq(q(r.allowance).div(2)));check(q(r.used[k]).add(r.remaining[k]).eq(r.allocation[k]));}
 check(r.report.tranches.length===3&&r.report.tranches.every(t=>t.paid&&q(t.amount).eq(q(r.allowance).div(3))));
 if(r.config.principalOnly){check(r.netBorrowingRuleSatisfied);check(r.events.filter(x=>x.event.type==='borrow').every(x=>x.event.date==='2027-02-01'));}
}
const artifact={date:'2026-11-03',classification:'Post-disclosure synthetic refinancing sensitivity; no national forecast',baseCommit:'5225fccd86678e67286ae28efdfc7b988a9b6a56',assertions,results};
fs.writeFileSync(new URL('results.json',import.meta.url),JSON.stringify(artifact,null,2)+'\n');
console.log(JSON.stringify({assertions,results:results.map(r=>({name:r.config.name,status:r.accountingStatus,borrowed:r.borrowed,principalPaid:r.principalPaid,principalStillDue:r.principalStillDue,net:r.ordinaryNetBorrowing,unpaid:r.unpaid,issues:r.report.issues.filter(x=>x.status!=='PASS')}))},null,2));
