import fs from 'node:fs';import path from 'node:path';import crypto from 'node:crypto';import {fileURLToPath} from 'node:url';
import {settlementExample} from './settlement.mjs';
import {officialReconciliation} from './official-reconciliation.mjs';
import {coupledScenario} from './controller-coupling.mjs';
import {q} from '../src/rational.mjs';
import {historicalChecks} from './historical.mjs';
import {BudgetModel,reconcileNational} from './model.mjs';import {scenarios} from './scenarios.mjs';
const here=path.dirname(fileURLToPath(import.meta.url));
const hash=x=>crypto.createHash('sha256').update(x).digest('hex');
const json=x=>JSON.stringify(x,null,2)+'\n';
const csv=rows=>rows.map(row=>row.map(x=>'"'+String(x??'').replaceAll('"','""')+'"').join(',')).join('\n')+'\n';
export function buildRelease(){
  const source=JSON.parse(fs.readFileSync(path.join(here,'sources.json')));
  const names=['REPORT-0.3.md','settlement.mjs','settlement.test.mjs','followups.mjs','followups.test.mjs','official-reconciliation.mjs','official-reconciliation.test.mjs',...fs.readdirSync(path.join(here,'official/verified-2026-11-02')).sort().map(n=>'official/verified-2026-11-02/'+n),'SCOPE.md','README.md','model.mjs','model.test.mjs','scenarios.mjs','sources.json','reproduce.mjs','release.test.mjs','../src/rational.mjs','historical.mjs','official/historical-snapshot.json','check.mjs','controller-coupling.mjs','coupling.test.mjs',...fs.readdirSync(path.join(here,'../src')).filter(n=>n.endsWith('.mjs')&&n!=='rational.mjs').sort().map(n=>'../src/'+n),'../config/policy-0.7.1.json','../config/policy-0.7.2.json','../fixtures/federal-calendar-2027.json'];
  const inputs=Object.fromEntries(names.map(n=>[n,hash(fs.readFileSync(path.join(here,n),'utf8').replaceAll('\r\n','\n'))]));
  const releaseDigest=hash(json(inputs));const releaseId='debt-budget-0.3-'+releaseDigest.slice(0,16);
  const cases=[...scenarios(),coupledScenario()].map(s=>{const model=new BudgetModel(s.input);for(const e of s.events)model.execute(e);return {...s,report:model.report(s.through),journals:model.history};});
  const metadata={schemaVersion:1,releaseId,releaseDigest,releaseDate:'2026-11-02',implementationBase:'8cdf3e28f932963b854d0b3b92cc4c623e72a34a',visibility:'PUBLIC_DRAFT_RESEARCH',inputs,sourceDates:source.sources.map(s=>({id:s.id,released:s.releaseDate,asOf:s.observationDate,retrieved:source.retrievedOn})),nationalReconciliation:reconcileNational({}),classification:'Synthetic accounting diagnostics, not unseen challenge or economic validation'};
  const rows=cases.map(s=>[releaseId,s.name,s.report.status,s.report.snapshot.T,s.report.snapshot.debt.grossTreasury,s.report.snapshot.debt.stabilizationBills,s.report.cashBudgetDeficit,s.report.snapshot.flows.issued,s.report.snapshot.flows.borrowed,s.report.snapshot.flows.redeemed,s.assumptions.billShortfall,s.report.overdue.length]);
  const coupled=cases.find(s=>s.name==='controller-coupled');
  const display=v=>String(q(v).number());
  const report=[fs.readFileSync(path.join(here,'REPORT-0.3.md'),'utf8').replaceAll('\r\n','\n'),`Release: ${releaseId}.`, ''];
  const files={'official-reconciliation.json':json(officialReconciliation()),'settlement-example.json':json(settlementExample()),'historical-checks.json':json(historicalChecks()),'results.json':json({metadata,cases}),'sources.json':json(source),'summary.csv':csv([['releaseId','scenario','status','cash','grossTreasuryDebt','stabilizationBills','cashDeficit','issuance','borrowing','redemption','billDemandShortfall','overdueItems'],...rows]),'journals.csv':csv([['releaseId','scenario','eventId','date','type','status','applied','sector','account','delta'],...cases.flatMap(s=>s.journals.flatMap(r=>(r.entries.length?r.entries:[['','','']]).map(([sector,account,delta])=>[releaseId,s.name,r.event.id,r.event.date,r.event.type,r.status,r.applied,sector,account,delta])))]),'REPORT.md':report.join('\n')};
  files['manifest.json']=json({...metadata,files:Object.fromEntries(Object.entries(files).map(([n,v])=>[n,hash(v)]))});return {releaseId,files};
}
export function saveRelease(root=path.join(here,'releases')){const {releaseId,files}=buildRelease(),dir=path.join(root,releaseId);fs.mkdirSync(dir,{recursive:true});for(const [n,bytes]of Object.entries(files)){const p=path.join(dir,n);if(fs.existsSync(p)){if(fs.readFileSync(p,'utf8')!==bytes)throw Error('IMMUTABLE_RELEASE_CONFLICT: '+n);}else fs.writeFileSync(p,bytes);}return {releaseId,directory:dir,files:Object.keys(files)};}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url))console.log(json(saveRelease()));
