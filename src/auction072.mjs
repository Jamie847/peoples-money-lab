import {q,sum} from './rational.mjs';

/** Exact at-par awards. These are awards only; no money is moved here. */
export function awardAuction(quantity,bids,maximumRate='0.06') {
  const offered=q(quantity),ceiling=q(maximumRate);
  if(offered.cmp(0)<=0||ceiling.cmp(0)<0)throw Error('Positive offer and nonnegative ceiling required');
  const rows=bids.map((bid,index)=>{
    const amount=q(bid.amount),rate=q(bid.rate);
    if(amount.cmp(0)<0||rate.cmp(0)<0)throw Error('Negative bid');
    return {index,amount,rate};
  });
  const excluded=rows.filter(x=>x.rate.cmp(ceiling)>0).map(x=>x.index);
  const eligible=rows.filter(x=>x.rate.cmp(ceiling)<=0&&x.amount.cmp(0)>0).sort((a,b)=>a.rate.cmp(b.rate)||a.index-b.index);
  let left=offered,clearingRate=null;const awards=[];
  for(let i=0;i<eligible.length&&left.cmp(0)>0;) {
    let j=i+1;while(j<eligible.length&&eligible[j].rate.eq(eligible[i].rate))j++;
    const group=eligible.slice(i,j),total=sum(group.map(x=>x.amount)),take=left.min(total);
    for(const row of group)awards.push({bid:row.index,amount:take.mul(row.amount).div(total).toString()});
    clearingRate=eligible[i].rate.toString();left=left.sub(take);i=j;
  }
  return {offered:offered.toString(),awarded:offered.sub(left).toString(),unawarded:left.toString(),clearingRate,awards,excluded,arithmetic:'exact rational pro rata; production payout rounding not specified'};
}
