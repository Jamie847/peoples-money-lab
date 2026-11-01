import {OperatingEngine} from '../src/engine072.mjs';
import {customOpening} from '../src/ledger.mjs';
import {q} from '../src/rational.mjs';
import {opening} from './scenarios.mjs';

// Independent synthetic policy/data fixture. No desired issuance parameter.
export function controllerInputs(){
  const releases=[];
  for(let y=2016;y<=2025;y++)releases.push({releaseId:`synthetic-gdp-${y}`,series:'GDP',period:String(y),published:`${y+1}-03-20`,value:.02,estimate:3});
  for(const series of ['CPI-U','PCE'])for(const month of ['09','10','11'])releases.push({releaseId:`synthetic-${series}-${month}`,series,period:`2026-${month}`,published:'2026-12-20',value:100});
  return {initialR:'110',initialM:'109',initialT:'1',initialB:'0',startingTarget:'110',date:'2027-01-01',bases:{'CPI-U':100,PCE:100},inflationTarget:0,targetPrice:100,releases};
}
export function computeControllerAllowance(inputs=controllerInputs()){
  const engine=new OperatingEngine({opening:customOpening({M:inputs.initialM,T:inputs.initialT,B:inputs.initialB,path:inputs.startingTarget}),date:'2026-12-31'});
  if(!engine.R().eq(inputs.initialR))throw Error('CONTROLLER_OPENING_MISMATCH');
  for(const [i,r]of inputs.releases.entries()){
    const result=engine.execute({id:`release-${i}`,type:'ingest_release',date:'2026-12-31',...r});
    if(!result.applied)return {status:'BLOCKED',inputs,issues:result.issues};
  }
  const result=engine.execute({id:'compute',type:'compute_quarter',date:inputs.date,bases:inputs.bases,inflationTarget:inputs.inflationTarget,targetPrice:inputs.targetPrice});
  if(!result.applied)return {status:'BLOCKED',inputs,issues:result.issues};
  return {status:'COMPUTED',kind:'Frozen-controller allowance interface; fiscal settlements are not replayed through its operating-policy ledger',frozenControllerCommit:'8cdf3e28f932963b854d0b3b92cc4c623e72a34a',inputs,target:engine.path.toString(),allowance:engine.quarter.allowance.toString(),creditedByController:engine.quarter.issued.toString(),computation:engine.report().dataComputations[0],controllerIssues:engine.issues,limits:['No full-quarter operating-policy conformance claim','No Authority income or remittance allocation; C11 semantics not resolved or exercised','Synthetic observations, not authenticated national data']};
}
export function allocateControllerAllowance(controller,allocation){
  if(controller.status!=='COMPUTED')throw Error('CONTROLLER_BLOCKED');
  if(Object.keys(allocation).sort().join(',')!=='debt,reserve,spending')throw Error('ALLOCATION_KEYS');
  const values=Object.fromEntries(Object.entries(allocation).map(([k,v])=>[k,q(v)]));
  if(Object.values(values).some(v=>v.cmp(0)<0))throw Error('NEGATIVE_ALLOCATION');
  const total=values.spending.add(values.debt).add(values.reserve);
  if(total.cmp(controller.allowance)>0)throw Error('ALLOCATION_EXCEEDS_CONTROLLER_ALLOWANCE');
  return {allocation:Object.fromEntries(Object.entries(values).map(([k,v])=>[k,v.toString()])),credited:total.toString(),uncreditedAllowance:q(controller.allowance).sub(total).toString()};
}
export function coupledScenario(){
  const controller=computeControllerAllowance();if(controller.status!=='COMPUTED')return {name:'controller-coupled',status:'BLOCKED',controller};
  const half=q(controller.allowance).div(2),allocationResult=allocateControllerAllowance(controller,{spending:half,debt:half,reserve:0});
  const input=opening();input.cash='1';input.money.External='89';if(!q(input.cash).add(input.money.External).add(input.money.Bank).eq(controller.inputs.initialR))throw Error('FISCAL_CONTROLLER_OPENING_MISMATCH');
  const allowance=q(controller.allowance),borrowing=q('30.2').sub(allowance),events=[];
  const add=(type,date,fields)=>events.push({id:'coupled-'+events.length,type,date,...fields});
  add('issue','2027-01-01',{amount:allocationResult.credited,target:controller.target,targetVerified:true,allocation:allocationResult.allocation});
  add('tax','2027-01-02',{amount:10});
  add('borrow','2027-01-03',{amount:borrowing.toString(),instrument:{id:'new',holder:'External',principal:borrowing.toString(),maturity:'2030-01-01',coupons:[]}});
  add('primary','2027-01-05',{amount:half.toString(),funding:'issuance'});add('primary','2027-01-05',{amount:q(18).sub(half).toString()});
  add('bill_sale','2027-01-10',{amount:8,settledDemandAttested:true,instrument:{id:'stabilizer',principal:8,maturity:'2027-03-01',coupons:[{date:'2027-03-01',amount:'.2'}]}});
  add('coupon','2027-01-20',{amount:3,instrumentId:'long',couponIndex:0});add('conversion_payment','2027-01-25',{amount:'.5'});
  add('redeem','2027-02-01',{amount:half.toString(),instrumentId:'maturing',funding:'issuance'});add('redeem','2027-02-01',{amount:q(20).sub(half).toString(),instrumentId:'maturing'});
  add('bill_maturity','2027-03-01',{amount:8,instrumentId:'stabilizer'});add('bill_coupon','2027-03-01',{amount:'.2',instrumentId:'stabilizer',couponIndex:0});
  return {name:'controller-coupled',input,events,through:'2027-03-31',controller,allocationResult,assumptions:{synthetic:true,issuanceBasis:'Computed by frozen controller from independently stated R, starting target and synthetic data; not a chosen issuance target',fiscalAllocationPolicy:'Half of computed allowance to spending, half to debt principal; scenario choice, not statutory policy',billShortfall:0,borrowingRequested:borrowing.toString(),ban:false}};
}
