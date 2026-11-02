import {OperatingEngine} from '../src/engine072.mjs';
import {customOpening,get} from '../src/ledger.mjs';
import {q,sum} from '../src/rational.mjs';
import {BudgetModel} from './model.mjs';
import {controllerInputs,coupledScenario} from './controller-coupling.mjs';
const check=(ok,code)=>{if(!ok)throw Error(code);};

/** Atomic settlement adapter. Frozen controller code is imported, never patched. */
export class SettlementConnection {
  constructor(input,inputs=controllerInputs()){
    this.fiscal=new BudgetModel(input);this.history=[];
    const external=sum(input.debts.filter(d=>d.holder==='External').map(d=>q(d.principal)));
    check(q(input.money.SocialSecurity??0).eq(0)&&q(input.money.OtherIG??0).eq(0),'TRUST_CASH_MAPPING_UNSUPPORTED');
    this.controller=new OperatingEngine({opening:customOpening({M:q(input.money.External).add(input.money.Bank).toString(),T:input.cash,B:0,bankMoney:input.money.Bank,conversion:input.conversion,ordinaryDebt:external,path:inputs.startingTarget}),date:'2026-12-31'});
    for(const [i,r]of inputs.releases.entries())check(this.controller.execute({id:'data-'+i,date:'2026-12-31',type:'ingest_release',...r}).applied,'RELEASE_REJECTED');
    check(this.controller.execute({id:'computation',date:inputs.date,type:'compute_quarter',bases:inputs.bases,targetPrice:inputs.targetPrice,inflationTarget:inputs.inflationTarget}).applied,'COMPUTATION_BLOCKED');
    this.allowance=this.controller.quarter.allowance.toString();this.match();
  }
  match(){const f=this.fiscal.snapshot(),c=this.controller.snapshot();for(const k of ['R','M','B','T'])check(q(f[k]).eq(c[k]),'MAPPING_'+k);
    check(this.fiscal.get('Bank','money').eq(get(this.controller.accounts,'Bank','money')),'MAPPING_BANK_MONEY');
    check(this.fiscal.get('External','money').eq(get(this.controller.accounts,'Public','money')),'MAPPING_EXTERNAL_MONEY');
    check(q(f.debt.external).eq(get(this.controller.accounts,'Treasury','ordinary')),'MAPPING_EXTERNAL_DEBT');
    check(this.fiscal.get('Authority','conversion').eq(get(this.controller.accounts,'Authority','conversion')),'MAPPING_CONVERSION');
    this.fiscal.audit();this.controller.assertInvariants();
  }
  mapped(e){const base={id:'settlement-'+e.id,date:e.date,amount:e.amount};
    switch(e.type){
      case 'issue':check(q(e.target).eq(this.controller.path),'TARGET_MISMATCH');return [{...base,type:'issue',remittance:0}];
      case 'tax':return [{...base,type:'tax'}];
      case 'primary':return [{...base,type:'spend'}];
      case 'borrow':check(e.instrument.holder==='External','HOLDER_UNSUPPORTED');return [{...base,type:'borrow'}];
      case 'redeem':check(this.fiscal.debts[e.instrumentId]?.holder==='External','HOLDER_UNSUPPORTED');return [{...base,type:'redeemDebt'}];
      case 'coupon':check(this.fiscal.debts[e.instrumentId]?.holder==='External','HOLDER_UNSUPPORTED');return [{...base,type:'spend'}];
      case 'conversion_payment':return [{...base,type:'repayConversion'}];
      case 'bill_sale':check(e.couponRate!==undefined,'EXPLICIT_AUCTION_BID_RATE_REQUIRED');return [{...base,type:'auction',auctionId:e.instrument.id,convention:'par-principal-coupon',maturity:e.instrument.maturity,bids:[{amount:e.amount,rate:e.couponRate}]}, {...base,id:base.id+'-settle',type:'settle_auction',auctionId:e.instrument.id,bid:0}, {...base,id:base.id+'-close',type:'close_auction',auctionId:e.instrument.id}];
      case 'bill_maturity':return [{...base,type:'maturity',billId:'auction:'+e.instrumentId}];
      case 'bill_coupon':return [{...base,type:'bill_interest',billId:'auction:'+e.instrumentId}];
      default:throw Error('SETTLEMENT_ROUTE_UNSUPPORTED');
    }
  }
  execute(e){const f=JSON.stringify(this.fiscal),checkpoint=this.controller.checkpoint(),history=structuredClone(this.controller.history),before=this.fiscal.snapshot();
    try{const mapped=this.mapped(e),fiscal=this.fiscal.execute(e);check(fiscal.applied,'FISCAL_'+fiscal.code);const controller=[];
      for(const event of mapped){const r=this.controller.execute(event);check(r.applied,'CONTROLLER_'+r.issues.map(x=>x.code).join(','));controller.push(r);}
      this.match();const result={event:structuredClone(e),applied:true,status:controller.some(r=>r.status==='FAIL')?'FAIL':controller.some(r=>r.status==='POLICY_UNDEFINED')?'POLICY_UNDEFINED':'PASS',fiscal,controller};this.history.push(result);return result;
    }catch(error){Object.assign(this.fiscal,JSON.parse(f));this.controller.restore(checkpoint);this.controller.history=history;const result={event:structuredClone(e),applied:false,status:'FAIL',code:error.message,before,after:this.fiscal.snapshot()};this.history.push(result);return result;}
  }
  finish(date='2027-03-31'){const close=this.controller.execute({id:'quarter-close',date,type:'end_quarter'});check(close.applied,'QUARTER_CLOSE_REJECTED');this.controller.finalize({date});this.match();const fiscal=this.fiscal.report(date),controller=this.controller.report();return {classification:'Synthetic paired-settlement diagnostics, not economic validation',fiscal,controller,settlementMatches:true,applied:this.history.filter(r=>r.applied).length,rejections:this.history.filter(r=>!r.applied),status:controller.status==='FAIL'||fiscal.status==='FAIL'||this.history.some(r=>!r.applied)?'FAIL':controller.status==='POLICY_UNDEFINED'?'POLICY_UNDEFINED':'PASS'};}
}
export function settlementScenario(){const s=coupledScenario();for(const e of s.events)if(e.type==='bill_sale')e.couponRate='.05';s.assumptions.auctionBidRate='Synthetic 5% bid; cash coupon schedule remains independently supplied, not derived from yield.';return s;}
export function settlementExample(){const scenario=settlementScenario(),connection=new SettlementConnection(scenario.input);for(const e of scenario.events)connection.execute(e);return {scenario:scenario.name,assumptions:'Replay the existing v0.2 fiscal timing, without repairing policy violations; issue paid in one month, large cash retained before maturity.',report:connection.finish(),history:connection.history};}
