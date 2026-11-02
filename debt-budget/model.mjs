import {q,sum} from '../src/rational.mjs';
const require=(ok,code,status='FAIL')=>{if(!ok)throw Object.assign(Error(code),{code,status});};
const date=d=>{require(typeof d==='string'&&/^\d{4}-\d{2}-\d{2}$/.test(d)&&new Date(d+'T00:00:00Z').toISOString().slice(0,10)===d,'DATE');return d;};
const positive=x=>{const v=q(x);require(v.cmp(0)>=0,'NEGATIVE_AMOUNT');return v;};
const holders=['External','Authority','SocialSecurity','OtherIG'];
const total=xs=>sum(xs.map(q));
const quarter=d=>d.slice(0,4)+'-Q'+Math.ceil(Number(d.slice(5,7))/3);

/** Signed ledger: assets positive, liabilities negative; netWorth is displayed separately. */
export class BudgetModel {
  constructor(input){
    require(input.synthetic===true,'NATIONAL_OPENING_NOT_RECONCILED','POLICY_UNDEFINED');
    this.input=structuredClone(input);this.date=date(input.date);this.policy=structuredClone(input.policy);
    require(typeof this.policy.borrowingBan==='boolean'&&typeof this.policy.ruleIssuance==='boolean','POLICY_INPUT','POLICY_UNDEFINED');
    this.a={Authority:{M:'0',T:'0',B:'0',conversion:'0'},Treasury:{cash:'0',parked:'0',bills:'0'},External:{money:'0',bills:'0'},Bank:{money:'0',conversion:'0'},SocialSecurity:{money:'0'},OtherIG:{money:'0'}};
    this.debts={};this.bills={};this.ids=[];this.history=[];this.quarters={};this.buckets={spending:'0',debt:'0',reserve:'0'};this.flows={taxes:'0',primary:'0',interest:'0',borrowed:'0',redeemed:'0',issued:'0',cancelled:'0',conversion:'0',billSales:'0',billMaturities:'0'};
    const add=(s,k,v)=>this.a[s][k]=q(this.a[s][k]??0).add(v).toString();
    for(const s of ['External','Bank','SocialSecurity','OtherIG']){const v=positive(input.money[s]??0);add(s,'money',v);add('Authority','M',v.neg());}
    add('Treasury','cash',positive(input.cash));add('Authority','T',q(input.cash).neg());
    add('Authority','conversion',positive(input.conversion??0));add('Bank','conversion',q(input.conversion??0).neg());
    for(const d of input.debts){this.validateDebt(d);require(!this.debts[d.id],'DEBT_ID');this.debts[d.id]=this.newDebt(d);add('Treasury','debt:'+d.id,q(d.principal).neg());add(d.holder,'security:'+d.id,q(d.principal));}
    for(const accounts of Object.values(this.a))accounts.netWorth=total(Object.values(accounts)).toString();
    this.audit();this.opening=this.snapshot();
  }
  newDebt(d){return {...structuredClone(d),principal:positive(d.principal).toString(),coupons:(d.coupons??[]).map(c=>({date:date(c.date),amount:positive(c.amount).toString(),paid:'0'}))};}
  validateDebt(d){require(typeof d.id==='string'&&/^[a-zA-Z0-9_-]+$/.test(d.id)&&!['constructor','__proto__','prototype'].includes(d.id),'DEBT_ID');require(holders.includes(d.holder),'HOLDER');date(d.maturity);positive(d.principal);require(d.maturity>=this.date,'PAST_MATURITY');for(const c of d.coupons??[])require(date(c.date)>=this.date&&c.date<=d.maturity,'COUPON_DATE');}
  get(s,k){return q(this.a[s][k]??0);}
  R(){return this.get('Authority','M').add(this.get('Authority','T')).add(this.get('Authority','B')).neg();}
  audit(){
    for(const [s,as]of Object.entries(this.a))require(total(Object.entries(as).filter(([k])=>k!=='netWorth').map(([,v])=>v)).eq(as.netWorth),'SECTOR_BALANCE_'+s);
    for(const [s,as]of Object.entries(this.a))for(const [k,v]of Object.entries(as)){if(k==='netWorth')continue;const liability=(s==='Authority'&&['M','T','B'].includes(k))||(s==='Treasury'&&(k==='bills'||k.startsWith('debt:')))||(s==='Bank'&&k==='conversion');require(liability?q(v).cmp(0)<=0:q(v).cmp(0)>=0,'NEGATIVE_STOCK');}
    require(this.get('Authority','M').add(sum(['External','Bank','SocialSecurity','OtherIG'].map(s=>this.get(s,'money')))).eq(0),'M_COUNTERPART');
    for(const [s,k,t,l]of [['Authority','T','Treasury','cash'],['Authority','B','Treasury','parked'],['Treasury','bills','External','bills'],['Bank','conversion','Authority','conversion']])require(this.get(s,k).add(this.get(t,l)).eq(0),'COUNTERPART');
    for(const [id,d]of Object.entries(this.debts))require(this.get(d.holder,'security:'+id).eq(d.principal)&&this.get('Treasury','debt:'+id).eq(q(d.principal).neg()),'DEBT_REGISTER');
    require(sum(Object.values(this.bills).map(b=>q(b.principal))).eq(this.get('External','bills')),'BILL_REGISTER');
    require(total(Object.values(this.buckets)).cmp(this.get('Treasury','cash'))<=0,'RESTRICTED_CASH');
    require(sum(Object.values(this.a).map(a=>q(a.netWorth))).eq(0),'AGGREGATE_NET_WORTH');
  }
  snapshot(){
    const by=h=>sum(Object.values(this.debts).filter(d=>d.holder===h).map(d=>q(d.principal)));
    const external=by('External'),authority=by('Authority'),ss=by('SocialSecurity'),ig=by('OtherIG'),b=this.get('External','bills'),m=this.get('Authority','M').neg();
    return {date:this.date,accounts:structuredClone(this.a),R:this.R().toString(),M:m.toString(),B:b.toString(),T:this.get('Treasury','cash').toString(),debt:{external:external.toString(),authority:authority.toString(),debtHeldByPublic:external.add(authority).toString(),socialSecurity:ss.toString(),otherIntragovernmental:ig.toString(),intragovernmental:ss.add(ig).toString(),grossTreasury:external.add(authority).add(ss).add(ig).toString(),stabilizationBills:b.toString(),expandedTreasuryObligations:external.add(authority).add(ss).add(ig).add(b).toString(),excludedExternal:sum(Object.values(this.debts).filter(d=>d.holder==='External'&&d.excluded).map(d=>q(d.principal))).toString()},consolidated:{perimeter:'Illustrative Treasury + Authority + SocialSecurity + OtherIG; not official federal reporting',externalSecurities:external.toString(),stabilizationBills:b.toString(),publicMoney:m.sub(this.get('SocialSecurity','money')).sub(this.get('OtherIG','money')).toString(),conversionAssets:this.get('Authority','conversion').toString(),netWorth:sum(['Treasury','Authority','SocialSecurity','OtherIG'].map(s=>this.get(s,'netWorth'))).toString()},allocation:structuredClone(this.buckets),flows:structuredClone(this.flows)};
  }
  execute(event){
    const backup=JSON.stringify({a:this.a,debts:this.debts,bills:this.bills,ids:this.ids,date:this.date,quarters:this.quarters,buckets:this.buckets,flows:this.flows});const before=this.snapshot();const entries=[];
    const post=(s,k,v)=>{this.a[s][k]=this.get(s,k).add(v).toString();entries.push([s,k,q(v).toString()]);};
    const flow=(k,v)=>this.flows[k]=q(this.flows[k]).add(v).toString();
    const transfer=(holder,amount,income=true)=>{post('Treasury','cash',amount.neg());if(holder==='Authority'){post('Authority','T',amount);if(income)post('Authority','netWorth',amount);}else{post('Authority','T',amount);post('Authority','M',amount.neg());post(holder,'money',amount);if(income)post(holder,'netWorth',amount);}if(income)post('Treasury','netWorth',amount.neg());};
    const fund=(category,amount)=>{if(event.funding==='issuance'){require(category==='spending'||category==='debt','ISSUANCE_CATEGORY');require(q(this.buckets[category]).cmp(amount)>=0,'ISSUANCE_ALREADY_USED');this.buckets[category]=q(this.buckets[category]).sub(amount).toString();}else{require(event.funding===undefined||event.funding==='general','FUNDING_SOURCE');require(this.get('Treasury','cash').sub(total(Object.values(this.buckets))).cmp(amount)>=0,'CASH_SHORTFALL');}};
    try{
      require(typeof event.id==='string'&&event.id&&!this.ids.includes(event.id),'EVENT_ID');require(date(event.date)>=this.date,'TIME_REVERSED');this.date=event.date;const x=positive(event.amount??0);let deltaR=q(0);
      switch(event.type){
        case 'tax':post('External','money',x.neg());post('External','netWorth',x.neg());post('Authority','M',x);post('Authority','T',x.neg());post('Treasury','cash',x);post('Treasury','netWorth',x);flow('taxes',x);break;
        case 'primary':fund('spending',x);transfer('External',x);flow('primary',x);break;
        case 'issue':{
          require(this.policy.ruleIssuance,'RULE_ISSUANCE_DISABLED');require(event.targetVerified===true,'TARGET_UNVERIFIED','POLICY_UNDEFINED');
          const key=quarter(this.date);require(!this.quarters[key],'QUARTER_ALREADY_COMPUTED');require(['01-01','04-01','07-01','10-01'].includes(this.date.slice(5)),'QUARTER_BOUNDARY');
          const target=positive(event.target),allowance=target.sub(this.R()).max(0);require(x.cmp(allowance)<=0,'ISSUANCE_ALLOWANCE');
          require(event.allocation&&Object.keys(event.allocation).sort().join(',')==='debt,reserve,spending','ISSUANCE_ALLOCATION');const allocation=Object.fromEntries(Object.entries(event.allocation).map(([k,v])=>[k,positive(v)]));require(sum(Object.values(allocation)).eq(x),'ISSUANCE_DOUBLE_USE');
          for(const [k,v]of Object.entries(allocation))this.buckets[k]=q(this.buckets[k]).add(v).toString();
          this.quarters[key]={target:target.toString(),observedR:this.R().toString(),allowance:allowance.toString(),credited:x.toString()};post('Authority','T',x.neg());post('Authority','netWorth',x.neg());post('Treasury','cash',x);post('Treasury','netWorth',x);flow('issued',x);deltaR=x;break;
        }
        case 'borrow':{
          require(!this.policy.borrowingBan,'BORROWING_BAN');const d=event.instrument;this.validateDebt(d);require(d.holder==='External','BORROWING_HOLDER_UNSUPPORTED','POLICY_UNDEFINED');require(!this.debts[d.id]&&q(d.principal).eq(x),'DEBT_ID_OR_AMOUNT');
          this.debts[d.id]=this.newDebt(d);post('External','money',x.neg());post('External','security:'+d.id,x);post('Authority','M',x);post('Authority','T',x.neg());post('Treasury','cash',x);post('Treasury','debt:'+d.id,x.neg());flow('borrowed',x);break;
        }
        case 'redeem':{
          const d=this.debts[event.instrumentId];require(d&&this.date>=d.maturity&&x.cmp(d.principal)<=0,'REDEMPTION_TERMS');fund('debt',x);transfer(d.holder,x,false);post('Treasury','debt:'+d.id,x);post(d.holder,'security:'+d.id,x.neg());d.principal=q(d.principal).sub(x).toString();flow('redeemed',x);if(d.holder==='Authority')deltaR=x.neg();break;
        }
        case 'coupon':case 'bill_coupon':{
          const d=event.type==='coupon'?this.debts[event.instrumentId]:this.bills[event.instrumentId],c=d?.coupons[event.couponIndex];require(c&&this.date>=c.date&&x.cmp(q(c.amount).sub(c.paid))<=0,'COUPON_TERMS');fund('spending',x);const h=d.holder??'External';transfer(h,x);c.paid=q(c.paid).add(x).toString();flow('interest',x);if(h==='Authority')deltaR=x.neg();break;
        }
        case 'cancel_authority':{
          const d=this.debts[event.instrumentId];require(event.statuteAttested===true,'CANCELLATION_AUTHORITY','POLICY_UNDEFINED');require(d&&d.holder==='Authority'&&!d.excluded&&x.eq(d.principal),'CANCELLATION_SCOPE');
          post('Authority','security:'+d.id,x.neg());post('Authority','netWorth',x.neg());post('Treasury','debt:'+d.id,x);post('Treasury','netWorth',x);d.principal='0';d.cancelled=this.date;
          require(!d.coupons.some(c=>!q(c.amount).eq(c.paid)),'CANCELLATION_COUPON_TREATMENT_REQUIRED','POLICY_UNDEFINED');flow('cancelled',x);break;
        }
        case 'conversion_payment':require(x.cmp(this.get('Authority','conversion'))<=0,'CONVERSION_OVERPAYMENT');post('Bank','money',x.neg());post('Bank','conversion',x);post('Authority','conversion',x.neg());post('Authority','M',x);flow('conversion',x);deltaR=x.neg();break;
        case 'bill_sale':{
          require(!this.policy.borrowingBan||this.policy.billsUnderBan==='allowed','BILL_BAN_SCOPE_UNDEFINED','POLICY_UNDEFINED');const d=event.instrument;this.validateDebt({...d,holder:'External'});require(!this.bills[d.id]&&q(d.principal).eq(x),'BILL_ID_OR_AMOUNT');require(event.settledDemandAttested===true,'BILL_DEMAND','POLICY_UNDEFINED');this.bills[d.id]=this.newDebt({...d,holder:'External'});
          post('External','money',x.neg());post('External','bills',x);post('Authority','M',x);post('Authority','B',x.neg());post('Treasury','parked',x);post('Treasury','bills',x.neg());flow('billSales',x);break;
        }
        case 'bill_maturity':{
          const d=this.bills[event.instrumentId];require(d&&this.date>=d.maturity&&x.cmp(d.principal)<=0,'BILL_MATURITY');post('External','bills',x.neg());post('External','money',x);post('Authority','B',x);post('Authority','M',x.neg());post('Treasury','parked',x.neg());post('Treasury','bills',x);d.principal=q(d.principal).sub(x).toString();flow('billMaturities',x);break;
        }
        default:require(false,'UNSUPPORTED_EVENT','POLICY_UNDEFINED');
      }
      this.audit();require(this.R().sub(before.R).eq(deltaR),'R_FLOW');this.ids.push(event.id);const result={event:structuredClone(event),applied:true,status:'PASS',entries,before,after:this.snapshot()};this.history.push(result);return result;
    }catch(error){Object.assign(this,JSON.parse(backup));const result={event:structuredClone(event),applied:false,status:error.status??'FAIL',code:error.code??'INVALID_INPUT',entries:[],before,after:this.snapshot()};this.history.push(result);return result;}
  }
  report(through=this.date){
    require(date(through)>=this.date,'REPORT_DATE');const overdue=[];
    for(const [kind,register]of [['debt',this.debts],['bill',this.bills]])for(const d of Object.values(register)){if(d.maturity<=through&&q(d.principal).cmp(0)>0)overdue.push({kind,id:d.id,type:'principal',due:d.maturity,amount:d.principal});for(const c of d.coupons)if(c.date<=through&&q(c.amount).cmp(c.paid)>0)overdue.push({kind,id:d.id,type:'coupon',due:c.date,amount:q(c.amount).sub(c.paid).toString()});}
    const rejected=this.history.filter(r=>!r.applied);return {schemaVersion:1,modelVersion:'debt-budget-0.2',synthetic:true,nationalStatus:'BLOCKED_UNRECONCILED',through,status:overdue.length||rejected.some(r=>r.status==='FAIL')?'FAIL':rejected.length?'POLICY_UNDEFINED':'PASS',snapshot:this.snapshot(),overdue,rejections:rejected.map(r=>({id:r.event.id,code:r.code,status:r.status})),cashBudgetDeficit:q(this.flows.primary).add(this.flows.interest).sub(this.flows.taxes).toString(),scope:'Cash accounting only; principal financing and cancellation excluded from deficit; not a national payoff path or economic forecast'};
  }
}

export function reconcileNational(records){
  const required=['grossTreasury','debtHeldByPublic','intragovernmental','authorityTreasuries','socialSecurity','treasuryCash','conversionBase'];
  const gaps=[];for(const key of required)if(!records[key])gaps.push('MISSING_'+key);
  const rows=Object.values(records);if(new Set(rows.map(r=>r.asOf)).size!==1)gaps.push('DATE_MISMATCH');
  for(const [key,r]of Object.entries(records))if(!r.sourceUrl||!r.released||!r.unit||!r.valuation||r.value===null)gaps.push('METADATA_'+key);
  if(!gaps.length){const v=k=>q(records[k].value);if(!v('grossTreasury').eq(v('debtHeldByPublic').add(v('intragovernmental'))))gaps.push('DEBT_IDENTITY');if(v('authorityTreasuries').cmp(v('debtHeldByPublic'))>0||v('socialSecurity').cmp(v('intragovernmental'))>0)gaps.push('HOLDER_SUBSET');}
  // These coarse series cannot establish a complete national opening or a conversion base.
  gaps.push('INSTRUMENT_AND_COUNTERPART_BRIDGE_REQUIRED');return {status:'BLOCKED',gaps,nationalScenarioPermitted:false};
}
