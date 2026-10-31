import {Engine} from './engine.mjs';
import {q} from './rational.mjs';
import {quarterEnd,lastBusinessDay} from './calendar.mjs';
export function annualScenario(migration,scenario,{year=2027}={}){
  const e=new Engine({migration:String(migration),date:`${year}-01-01`}),R0=q(e.metadata.R),C=q(e.metadata.claim).div(28),drawSize=R0.mul('.02');
  const events=[];let serial=0,previousPath=R0;
  const apply=(date,type,fields={})=>{const event={id:`qevent-${++serial}`,date,type,...fields};events.push(event);const r=e.execute(event);if(r.status==='FAIL')throw Error(`${type}: ${JSON.stringify(r.issues)}`);return r;};
  const quarters=[];let issuance=q(0),interest=q(0),legalDischarge=q(0),taxes=q(0),billInterestTotal=q(0);
  for(let k=0;k<4;k++){
    const month=1+3*k,date=`${year}-${String(month).padStart(2,'0')}-01`,close=lastBusinessDay(quarterEnd(date));
    const opening=e.snapshot(),priorR=q(opening.R),priorB=q(opening.B),priorM=q(opening.M);
    // Root calculation has the same binary64 convention as the earlier diagnostic, then exact ledger arithmetic.
    const target=q(String(previousPath.number()*Math.pow(scenario==='brake'?1:1.02,.25)));
    apply(date,'begin_quarter',{path:target.toString()});previousPath=target;
    const I=q(e.quarter.allowance);issuance=issuance.add(I);
    const split=I.div(3),rep=scenario==='facility_loss'&&k===1?drawSize.div(2):q(0),loss=rep,H=scenario==='facility_loss'&&k===1?drawSize.mul('.05').mul(61).div(365):q(0);
    for(let m=0;m<3;m++){
      const d=`${year}-${String(month+m).padStart(2,'0')}-01`;
      apply(d,'issue',{amount:split.toString(),remittance:'0'});apply(d,'spend',{amount:split.toString()});
      if(m===0&&scenario==='facility_loss'&&k===0){apply(`${year}-01-30`,'draw',{amount:drawSize.toString(),loanId:'facility-1',maturity:`${year}-04-01`,eligibleCollateralAttested:true,stressTriggerAttested:true,penaltyRateAttested:true});apply(`${year}-01-30`,'redeemInvestment',{amount:drawSize.toString()});}
      if(m===0&&rep.cmp(0)>0){apply(d,'collectPrincipal',{amount:rep.toString()});apply(d,'collectInterest',{amount:H.toString()});apply(d,'repayFacility',{amount:rep.toString(),loanId:'facility-1'});apply(d,'payInterest',{amount:H.toString()});apply(d,'discharge',{amount:loss.toString(),loanId:'facility-1',finalLegalResolution:true});}
    }
    apply(close,'collectPrincipal',{amount:C.toString()});apply(close,'repayConversion',{amount:C.toString()});
    interest=interest.add(H);legalDischarge=legalDischarge.add(loss);
    const tax=R0.mul('.1'),billInterest=priorB.mul('.02').div(4);taxes=taxes.add(tax);billInterestTotal=billInterestTotal.add(billInterest);
    apply(close,'tax',{amount:tax.toString()});apply(close,'spend',{amount:tax.sub(billInterest).toString()});apply(close,'spend',{amount:billInterest.toString()});
    apply(close,'maturity',{amount:priorB.toString(),billId:k===0?'opening':`bill-${k}`});
    const floor=priorR.mul('.01'),brake=scenario==='brake'?priorM.mul('.025'):q(0),B=floor.add(brake);
    apply(close,'auction',{amount:B.toString(),billId:`bill-${k+1}`,maturity:lastBusinessDay(quarterEnd(`${k===3?year+1:year}-${String(k===3?1:month+3).padStart(2,'0')}-01`)),convention:'par-principal-coupon',bids:[{amount:B.toString(),rate:.02}]});
    apply(close,'end_quarter');apply(close,'close_day');quarters.push({q:k+1,opening,closing:e.snapshot(),issuance:I.toString(),conversionRepayment:C.toString()});
  }
  return{migration,scenario,events,quarters,report:e.report(),annual:{issuance:issuance.toString(),interest:interest.toString(),legalDischarge:legalDischarge.toString(),taxes:taxes.toString(),billInterest:billInterestTotal.toString()}};
}
