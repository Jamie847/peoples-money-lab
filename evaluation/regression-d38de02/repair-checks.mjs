import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath,pathToFileURL} from 'node:url';
import {execFileSync} from 'node:child_process';
import crypto from 'node:crypto';
const DIR=path.dirname(fileURLToPath(import.meta.url));
const REPO=path.resolve(process.argv[2]??process.cwd());
if(!process.argv[3])throw Error('Usage: node run.mjs BASELINE_CHECKOUT NEW_OUTPUT_DIRECTORY');
const OUT=path.resolve(process.argv[3]);
if(fs.existsSync(OUT)&&fs.readdirSync(OUT).length)throw Error('Refusing to overwrite an existing result directory');
fs.mkdirSync(OUT,{recursive:true});
const {Engine}=await import(pathToFileURL(path.join(REPO,'src/engine.mjs')));
const {q}=await import(pathToFileURL(path.join(REPO,'src/rational.mjs')));
const COMMIT='d38de02536f6df020344c5651d65d9138207efb4';
const SPEC=path.join(DIR,'specification.md');
const SPEC_SHA='0eea163f953986126ad1f4244d05b4cc23ce66dbb76430aba38b531db111c2ee';
if(execFileSync('git',['-C',REPO,'rev-parse','HEAD'],{encoding:'utf8'}).trim()!==COMMIT)throw Error('Baseline commit changed');
if(execFileSync('git',['-C',REPO,'status','--porcelain'],{encoding:'utf8'}).trim())throw Error('Baseline working tree dirty');
if(crypto.createHash('sha256').update(fs.readFileSync(SPEC)).digest('hex')!=='af9d67d31f361536f0e29ecbad9678351945fdfcb06a3ac62324bd721bd76320')throw Error('Specification changed');
// Independent rational checker: no calls to engine audit(), post(), or numerical comparators.
const gcd=(a,b)=>{a=a<0n?-a:a;b=b<0n?-b:b;while(b)[a,b]=[b,a%b];return a||1n;};
function rat(v){if(Array.isArray(v))return v;const s=String(v);if(s.includes('/'))return s.split('/').map(BigInt);const [a,b='']=s.split('.');return [BigInt(a+b),10n**BigInt(b.length)];}
function add(a,b){a=rat(a);b=rat(b);let n=a[0]*b[1]+b[0]*a[1],d=a[1]*b[1],g=gcd(n,d);return[n/g,d/g];}
const neg=a=>{a=rat(a);return[-a[0],a[1]];};
const sub=(a,b)=>add(a,neg(b));
const cmp=(a,b)=>{a=rat(a);b=rat(b);const x=a[0]*b[1]-b[0]*a[1];return x<0n?-1:x>0n?1:0;};
const str=a=>{a=rat(a);const g=gcd(a[0],a[1]);return a[1]/g===1n?String(a[0]/g):`${a[0]/g}/${a[1]/g}`;};
const sum=a=>a.reduce(add,[0n,1n]);
let assertions=0;
const check=(c,m)=>{assertions++;if(!c)throw Error(m);};
const eq=(a,b,m)=>check(cmp(a,b)===0,`${m}: ${str(a)} != ${str(b)}`);
function fixture(o={}){
 const v={M:'98',B:'1',T:'1',P:'0',U:'0',C:'100',path:'100',...o};const R=sum([v.M,v.B,v.T]);
 const A=x=>({type:'A',value:str(x)}),L=x=>({type:'L',value:str(x)}),E=x=>({type:'E',value:str(x)});
 return {metadata:{synthetic:true,R:str(R)},path:v.path,U:v.U,accounts:{
 Authority:{conversion:A(v.C),conversionAllowance:A(0),facility:A(v.P),facilityAllowance:A(0),M:L(v.M),B:L(v.B),T:L(v.T),equity:E(sub(add(v.C,v.P),R))},
 Bank:{loans:A(100),loanAllowance:A(0),money:A(10),investment:L(0),conversion:L(v.C),facility:L(v.P),equity:E(sub(sub(110,v.C),v.P))},
 Treasury:{cash:A(v.T),parked:A(v.B),ordinary:L(0),bills:L(v.B),equity:E(v.T)},
 Public:{money:A(sub(v.M,10)),investment:A(0),ordinary:A(0),bills:A(v.B),loans:L(100),equity:E(sub(add(v.M,v.B),110))}
 }};
}
function independentAudit(s){
 const a=s.accounts;const val=(p,k)=>a[p][k].value;
 for(const [p,as]of Object.entries(a)){
  eq(sum(Object.values(as).map(x=>x.type==='A'?rat(x.value):neg(x.value))),0,p+' balance');
  for(const[k,x]of Object.entries(as))if(x.type!=='E'&&!k.endsWith('Allowance'))check(cmp(x.value,0)>=0,p+'.'+k+' nonnegative');
 }
 for(const[p,k,t,l]of [['Authority','conversion','Bank','conversion'],['Authority','facility','Bank','facility'],['Authority','T','Treasury','cash'],['Authority','B','Treasury','parked'],['Treasury','bills','Public','bills'],['Treasury','ordinary','Public','ordinary'],['Bank','loans','Public','loans'],['Bank','investment','Public','investment']])eq(val(p,k),val(t,l),p+'.'+k+' counterpart');
 eq(s.M,add(val('Bank','money'),val('Public','money')),'M ownership');eq(s.R,sum([s.M,s.B,s.T]),'R components');eq(s.P,val('Authority','facility'),'gross legal principal');eq(s.exposure,add(s.P,s.U),'exposure');
 check(cmp(sub(s.R,s.path),s.exposure)<=0,'D <= E');
 eq(sum(Object.values(a).map(x=>x.equity.value)),sum([val('Authority','conversionAllowance'),val('Authority','facilityAllowance'),val('Bank','loanAllowance')]),'aggregate net worth/allowances');
}
const results=[];let active,seq=0;
function engine(o={},date='2027-01-01'){const e=new Engine({date,opening:fixture(o)});active.engines.push(e);independentAudit(e.snapshot());return e;}
function event(e,type,date,fields={}){
 const x=e.execute({id:`${active.id}-${++seq}`,type,date,...fields});active.trace.push(x);independentAudit(x.before);independentAudit(x.after);
 if(x.applied){const delta=['issue','draw'].includes(type)?(fields.amount||0):['repayFacility','repayConversion','payInterest'].includes(type)?neg(fields.amount||0):0;eq(sub(x.after.R,x.before.R),delta,'independent event R flow');}
 else check(JSON.stringify(x.before.accounts)===JSON.stringify(x.after.accounts),'rejected event leaves accounts unchanged');
 return x;
}
const begin=(e,d='2027-01-01',p='100')=>event(e,'begin_quarter',d,{path:p});
const end=(e,d)=>event(e,'end_quarter',d);
const issue=(e,d,amount)=>event(e,'issue',d,{amount});
const close=(e,d)=>event(e,'close_day',d);
const observe=(e,d)=>event(e,'observe',d);
const has=(e,code)=>e.issues.some(x=>x.code===code);
const draw=(e,d,amount,id='loan',maturity='2027-04-01')=>event(e,'draw',d,{amount,loanId:id,maturity,eligibleCollateralAttested:true,stressTriggerAttested:true,penaltyRateAttested:true});
function run(id,name,fn){active={id,name,classification:'PASS',scope:'defined mechanics',notes:[],trace:[],engines:[]};const start=assertions;try{fn(active);}catch(e){active.classification='FAIL';active.error=e.stack;}active.assertions=assertions-start;active.engineReports=active.engines.map(e=>e.report());delete active.engines;results.push(active);fs.writeFileSync(path.join(OUT,id+'.json'),JSON.stringify(active,null,2));}

run('R01','Sixth-day endpoint is checked by finalization',()=>{const e=engine({M:'96',T:'3'});begin(e);event(e,'tax','2027-01-04',{amount:'.1'});observe(e,'2027-01-11');check(e.cashStreak===5,'only first five days closed');check(!has(e,'TREASURY_CURE_EXCEEDED'),'sixth day not yet classified');check(e.report().issues.some(x=>x.code==='UNCLOSED_ENDPOINT_DAY'),'incomplete endpoint disclosed');const b=e.snapshot();const r=e.finalize();independentAudit(e.snapshot());check(has(e,'TREASURY_CURE_EXCEEDED'),'sixth-day violation found');check(e.cashStreak===6,'six business closes');check(r.status==='FAIL','policy failure visible');check(JSON.stringify(b.accounts)===JSON.stringify(e.snapshot().accounts),'no monetary effect');});
run('R02','Completed versus unmodeled horizon remains distinct',()=>{const e=engine();begin(e);end(e,'2027-03-31');check(e.report().status==='POLICY_UNDEFINED','unclosed endpoint not pass');const r=e.finalize();check(r.status==='PASS'&&r.completeness==='COMPLETE_THROUGH_ENDPOINT','completed zero-allowance quarter passes');e.finalize({date:'2027-04-01'});check(e.report().status==='POLICY_UNDEFINED','next quarter cannot be certified');check(e.report().issues.some(x=>x.code==='QUARTER_COVERAGE_GAP'),'missing next quarter disclosed');independentAudit(e.snapshot());});
run('R03','Expiry cannot be followed by silent episode reset',()=>{const e=engine();begin(e);event(e,'emergency_start','2027-01-01',{jointCertification:true});event(e,'emergency_extend','2027-01-01',{recordedCongressionalVote:true,expiry:'2028-01-01'});observe(e,'2028-01-01');check(e.emergency===null&&e.emergencyEpisodes.length===1,'expiry persisted');const x=event(e,'emergency_start','2028-01-01',{jointCertification:true});check(!x.applied&&x.status==='POLICY_UNDEFINED','restart undefined');check(e.emergencyEpisodes[0].origin==='2027-01-01','original epoch retained');check(e.emergency===null,'restart not admitted');});
const counts=Object.fromEntries(['PASS','FAIL','POLICY_UNDEFINED','UNIMPLEMENTED'].map(s=>[s,results.filter(r=>r.classification===s).length]));
const summary={baselineCommit:COMMIT,specificationSha256:SPEC_SHA,publicSpecificationSha256:'af9d67d31f361536f0e29ecbad9678351945fdfcb06a3ac62324bd721bd76320',evaluatedAt:new Date().toISOString(),cases:results.length,assertions,counts,independentAudit:'Every event before/after snapshot checked by separate BigInt rational balance-sheet, counterpart, ownership, exposure and flow checker',scope:'Frozen 18-case specification, not economic validation; rejected invalid events can be successful tests. Policy gaps and unimplemented paths are not complete passes.',results:results.map(({id,name,classification,scope,assertions,notes,error})=>({id,name,classification,scope,assertions,notes,error}))};
fs.writeFileSync(path.join(OUT,'summary.json'),JSON.stringify(summary,null,2));
console.log(JSON.stringify(summary,null,2));
process.exitCode=counts.FAIL?1:0;
