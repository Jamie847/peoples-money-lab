import {q,sum} from './rational.mjs';
const account=(type,value=0)=>({type,value:q(value)});
export function syntheticOpening(migration='0.4') {
  const designated=q(100).add(q(200).mul(migration)),claim=designated.sub(50),R=designated.add(11),B=R.mul('.01'),M=R.sub(B).sub(1),investment=q(300).sub(designated);
  const A=v=>account('A',v),L=v=>account('L',v),E=v=>account('E',v);
  return {metadata:{migration:String(migration),claim:claim.toString(),R:R.toString(),synthetic:true},accounts:{
    Authority:{conversion:A(claim),conversionAllowance:A(0),facility:A(0),facilityAllowance:A(0),M:L(M),B:L(B),T:L(1),equity:E(-61)},
    Bank:{loans:A(300),loanAllowance:A(0),money:A(0),investment:L(investment),conversion:L(claim),facility:L(0),equity:E(50)},
    Treasury:{cash:A(1),parked:A(B),ordinary:L(100),bills:L(B),equity:E(-99)},
    Public:{money:A(M),investment:A(investment),ordinary:A(100),bills:A(B),loans:L(300),equity:E(110)}
  }};
}
export const get=(accounts,sector,name)=>accounts[sector][name].value;
export function encodeAccounts(accounts){return Object.fromEntries(Object.entries(accounts).map(([s,as])=>[s,Object.fromEntries(Object.entries(as).map(([a,x])=>[a,{type:x.type,value:x.value.toString()}]))]));}
export function decodeAccounts(accounts){return Object.fromEntries(Object.entries(accounts).map(([s,as])=>[s,Object.fromEntries(Object.entries(as).map(([a,x])=>[a,{type:x.type,value:q(x.value)}]))]));}
export function audit(accounts){
  const require=(b,m)=>{if(!b)throw Error(m);};
  for(const [sector,as] of Object.entries(accounts)){
    require(sum(Object.values(as).map(x=>x.type==='A'?x.value:x.value.neg())).eq(0),`Unbalanced sector ${sector}`);
    for(const [name,a]of Object.entries(as))if(a.type!=='E'&&!name.endsWith('Allowance'))require(a.value.cmp(0)>=0,`Negative ${sector}.${name}`);
  }
  for(const [s,a,t,b]of [['Authority','conversion','Bank','conversion'],['Authority','facility','Bank','facility'],['Authority','T','Treasury','cash'],['Authority','B','Treasury','parked'],['Treasury','ordinary','Public','ordinary'],['Treasury','bills','Public','bills'],['Bank','investment','Public','investment'],['Bank','loans','Public','loans']])require(get(accounts,s,a).eq(get(accounts,t,b)),`Counterpart mismatch ${s}.${a}`);
  require(get(accounts,'Authority','M').eq(get(accounts,'Bank','money').add(get(accounts,'Public','money'))),'M ownership mismatch');
  // Gross contractual claims remain counterpart-matched; impairment makes aggregate net worth negative.
  const allowances=sum([get(accounts,'Authority','facilityAllowance'),get(accounts,'Authority','conversionAllowance'),get(accounts,'Bank','loanAllowance')]);
  require(sum(Object.values(accounts).map(as=>as.equity.value)).eq(allowances),'Aggregate net worth/valuation mismatch');
}
export function post(accounts,entries){
  const sectorChanges={};
  for(const [sector,name,delta]of entries){const a=accounts[sector]?.[name];if(!a)throw Error('Unknown ledger account');const d=q(delta);sectorChanges[sector]=(sectorChanges[sector]||q(0)).add(a.type==='A'?d:d.neg());a.value=a.value.add(d);}
  for(const [s,d]of Object.entries(sectorChanges))if(!d.eq(0))throw Error(`Journal unbalanced for ${s}`);
  audit(accounts);
}
const move=(a,b,x)=>[['Authority',a,q(x).neg()],['Authority',b,q(x)]];
export const journals={
  issue:x=>[['Authority','T',x],['Authority','equity',q(x).neg()],['Treasury','cash',x],['Treasury','equity',x]],
  spend:x=>[...move('T','M',x),['Treasury','cash',q(x).neg()],['Treasury','equity',q(x).neg()],['Public','money',x],['Public','equity',x]],
  tax:x=>[...move('M','T',x),['Treasury','cash',x],['Treasury','equity',x],['Public','money',q(x).neg()],['Public','equity',q(x).neg()]],
  borrow:x=>[...move('M','T',x),['Treasury','cash',x],['Treasury','ordinary',x],['Public','money',q(x).neg()],['Public','ordinary',x]],
  redeemDebt:x=>[...move('T','M',x),['Treasury','cash',q(x).neg()],['Treasury','ordinary',q(x).neg()],['Public','money',x],['Public','ordinary',q(x).neg()]],
  draw:x=>[['Authority','facility',x],['Authority','M',x],['Bank','money',x],['Bank','facility',x]],
  redeemInvestment:x=>[['Bank','money',q(x).neg()],['Bank','investment',q(x).neg()],['Public','investment',q(x).neg()],['Public','money',x]],
  collectPrincipal:x=>[['Bank','loans',q(x).neg()],['Bank','money',x],['Public','money',q(x).neg()],['Public','loans',q(x).neg()]],
  collectInterest:x=>[['Bank','money',x],['Bank','equity',x],['Public','money',q(x).neg()],['Public','equity',q(x).neg()]],
  repayConversion:x=>[['Authority','conversion',q(x).neg()],['Authority','M',q(x).neg()],['Bank','money',q(x).neg()],['Bank','conversion',q(x).neg()]],
  repayFacility:x=>[['Authority','facility',q(x).neg()],['Authority','M',q(x).neg()],['Bank','money',q(x).neg()],['Bank','facility',q(x).neg()]],
  payInterest:x=>[['Authority','M',q(x).neg()],['Authority','equity',x],['Bank','money',q(x).neg()],['Bank','equity',q(x).neg()]],
  maturity:x=>[...move('B','M',x),['Treasury','parked',q(x).neg()],['Treasury','bills',q(x).neg()],['Public','bills',q(x).neg()],['Public','money',x]],
  sale:x=>[...move('M','B',x),['Treasury','parked',x],['Treasury','bills',x],['Public','bills',x],['Public','money',q(x).neg()]],
  impairFacility:x=>[['Authority','facilityAllowance',q(x).neg()],['Authority','equity',q(x).neg()]],
  impairConversion:x=>[['Authority','conversionAllowance',q(x).neg()],['Authority','equity',q(x).neg()]],
  impairBankLoan:x=>[['Bank','loanAllowance',q(x).neg()],['Bank','equity',q(x).neg()]],
  discharge:(x,allowanceRelease)=>[['Authority','facility',q(x).neg()],['Authority','facilityAllowance',allowanceRelease],['Authority','equity',q(x).neg().add(allowanceRelease)],['Bank','facility',q(x).neg()],['Bank','equity',x]]
};

/** Fully balanced synthetic starting state for isolated diagnostics; not a conversion estimate. */
export function customOpening({M='99',T='1',B='0',bankMoney='0',P='0',U='0',conversion='0',bankLoans='300',investment='200',ordinaryDebt='100',path}={}){
 const a=syntheticOpening('0.4').accounts;const set=(s,n,v)=>{a[s][n].value=q(v);};
 for(const [n,v]of Object.entries({M,T,B,conversion,facility:P,equity:q(conversion).add(P).sub(q(M).add(T).add(B))}))set('Authority',n,v);
 for(const [n,v]of Object.entries({loans:bankLoans,money:bankMoney,investment,conversion,facility:P,equity:q(bankLoans).add(bankMoney).sub(investment).sub(conversion).sub(P)}))set('Bank',n,v);
 for(const [n,v]of Object.entries({cash:T,parked:B,ordinary:ordinaryDebt,bills:B,equity:q(T).sub(ordinaryDebt)}))set('Treasury',n,v);
 for(const [n,v]of Object.entries({money:q(M).sub(bankMoney),investment,ordinary:ordinaryDebt,bills:B,loans:bankLoans,equity:q(M).sub(bankMoney).add(investment).add(ordinaryDebt).add(B).sub(bankLoans)}))set('Public',n,v);
 audit(a);const R=q(M).add(T).add(B);return{accounts:a,metadata:{synthetic:true,claim:String(conversion),R:R.toString(),kind:'custom isolated diagnostic'},path:path??R.toString(),U:String(U)};
}
