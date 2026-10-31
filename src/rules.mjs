import {q} from './rational.mjs';
/** All data here are supplied observations, not fetched, forecasts, or economic predictions. */
export function issuanceRule({previousPath,previousR,trendRealGrowth,cpiRebased,pceRebased,targetPrice=100,inflationTarget=0,lambda=.5}){
  for(const v of [trendRealGrowth,cpiRebased,pceRebased,targetPrice,inflationTarget,lambda])if(!Number.isFinite(v))throw Error('Finite observed inputs required');
  if(cpiRebased<=0||pceRebased<=0||targetPrice<=0||lambda<0)throw Error('Invalid rule input');
  if(![0,.02].includes(inflationTarget))throw Error('Only documented 0% or 2% target variants');
  const gap=Math.log(((cpiRebased+pceRebased)/2)/targetPrice),growth=Math.max(0,Math.min(.04,trendRealGrowth+inflationTarget-lambda*gap));
  const target=q(previousPath).mul(String(Math.pow(1+growth,.25)));
  return {gap,annualGrowth:growth,path:target.toString(),allowance:target.sub(previousR).max(0).toString(),arithmetic:'binary64 transcendental calculation converted to exact decimal rational'};
}
export function brakeRule({priorR,priorM,currentLogGap,previousLogGap,wasActive=false}){
  if(!Number.isFinite(currentLogGap)||!Number.isFinite(previousLogGap))throw Error('Finite observed gaps required');
  const active=wasActive?currentLogGap>.01:currentLogGap>.03&&previousLogGap>.03;
  const floor=q(priorR).mul('.01'),brake=active?q(priorM).mul(String(Math.min(.5*currentLogGap,.03))):q(0);
  return {active,floor:floor.toString(),brake:brake.toString(),targetStock:floor.add(brake).toString(),roll:active&&currentLogGap>.01};
}
/** At-par principal convention with coupon-rate bids: not a discount-bill market model. */
export function clearAuction(quantity,bids){
  let left=q(quantity),rate=0; if(left.cmp(0)<0)throw Error('Negative auction quantity');
  const accepted=[];
  const normalized=bids.map((b,i)=>{const amount=q(b.amount);if(amount.cmp(0)<0||!Number.isFinite(b.rate)||b.rate<0)throw Error('Invalid bid');return{...b,amount,i};}).sort((a,b)=>a.rate-b.rate||a.i-b.i);
  for(const b of normalized){if(left.eq(0))break;const amount=left.min(b.amount);if(amount.cmp(0)>0){accepted.push({bid:b.i,amount:amount.toString()});left=left.sub(amount);rate=b.rate;}}
  return{requested:q(quantity).toString(),filled:q(quantity).sub(left).toString(),unfilled:left.toString(),uniformRate:rate,accepted,cleared:left.eq(0),convention:'par principal/coupon rate; discount-price conversion not modeled'};
}
