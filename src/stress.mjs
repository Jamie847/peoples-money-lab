import {Engine} from './engine.mjs';
import {q} from './rational.mjs';
import {lastBusinessDay,quarterEnd,addDays} from './calendar.mjs';
/** Seeded synthetic accounting paths; no behavioral or probability interpretation. */
export function stressPath(seed,{years=10}={}){
 let state=seed>>>0,serial=0;const random=n=>{state=(1664525*state+1013904223)>>>0;return state%n;};
 const e=new Engine({migration:['.2','.4','.7'][random(3)]});const conversion=q(e.metadata.claim).div(28);let lastBill='opening',drawCount=0,discharges=0;
 const events=[];
 const apply=(date,type,fields={})=>{const ev={id:`s-${seed}-${++serial}`,date,type,...fields};events.push(ev);const r=e.execute(ev);if(r.status!=='PASS')throw Object.assign(Error(`${r.status}: ${r.issues.map(x=>x.code).join(',')}`),{events,report:e.report()});};
 for(let year=2027;year<2027+years;year++)for(let quarter=0;quarter<4;quarter++){
   const month=1+quarter*3,date=`${year}-${String(month).padStart(2,'0')}-01`,end=lastBusinessDay(quarterEnd(date));
   const target=e.path.mul(String(Math.pow(1+random(401)/10000,.25))).round(12).max(e.path).toString();apply(date,'begin_quarter',{path:target});const tranche=e.quarter.allowance.div(3);
   for(let j=0;j<3;j++){
     const day=`${year}-${String(month+j).padStart(2,'0')}-01`;
     const remittance=tranche.min(e.quarter.remittanceBudget.sub(e.quarter.remitted));apply(day,'issue',{amount:tranche.toString(),remittance:remittance.toString()});apply(day,'spend',{amount:tranche.toString()});
     // Both orderings of fiscal payments and ordinary bond transactions conserve R.
     const pair=random(2)?['tax','spend']:['borrow','redeemDebt'],amount=String(random(501)/100);
     apply(addDays(day,3),pair[0],{amount});apply(addDays(day,3),pair[1],{amount});
     const headroom=e.cap().sub(e.exposure()).max(0),size=headroom.min(q(random(51)).div(100));
     if(size.cmp(0)>0){const id=`loan-${++drawCount}`;apply(addDays(day,6),'draw',{amount:size.toString(),loanId:id,maturity:addDays(day,60),eligibleCollateralAttested:true,stressTriggerAttested:true,penaltyRateAttested:true});
       const loss=random(4)===0?size.div(2):q(0),repaid=size.sub(loss);
       apply(addDays(day,9),'repayFacility',{amount:repaid.toString(),loanId:id});
       if(loss.cmp(0)>0){if(random(2))apply(addDays(day,9),'impairFacility',{amount:loss.toString()});apply(addDays(day,9),'discharge',{amount:loss.toString(),loanId:id,finalLegalResolution:true});discharges++;}
     }
   }
   const C=conversion.min(e.accounts.Authority.conversion.value);apply(end,'collectPrincipal',{amount:C.toString()});apply(end,'repayConversion',{amount:C.toString()});
   const B=e.accounts.Authority.B.value;apply(end,'maturity',{amount:B.toString(),billId:lastBill});const nextB=e.quarter.priorR.mul('.01');lastBill=`bill-${year}-${quarter}`;
   apply(end,'auction',{amount:nextB.toString(),billId:lastBill,maturity:lastBusinessDay(quarterEnd(`${quarter===3?year+1:year}-${String(quarter===3?1:month+3).padStart(2,'0')}-01`)),convention:'par-principal-coupon',bids:[{amount:nextB.toString(),rate:.02}]});
   apply(end,'end_quarter');apply(end,'close_day');
 }
 return{seed,years,eventCount:events.length,dayCount:e.daily.length,drawCount,discharges,status:e.report().status,closing:e.snapshot(),generation:'Seeded conditional accounting transactions; not sampled economic futures'};
}
