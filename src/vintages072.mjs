import {issuanceRule} from './rules.mjs';
import {dayNumber} from './calendar.mjs';
import {q,sum} from './rational.mjs';

/** Supplied release records only. No remote retrieval or estimate of unavailable data. */
export function ingestRelease(book,input,receivedDate) {
  const next=structuredClone(book??[]),r={id:input.releaseId,series:input.series,period:input.period,published:input.published,value:input.value,revision:input.revision===true,estimate:input.estimate??null};
  if(typeof r.id!=='string'||!r.id||next.some(x=>x.id===r.id))throw Error('Unique release ID required');
  if(!['GDP','CPI-U','PCE'].includes(r.series))throw Error('Unsupported series');
  dayNumber(r.published);if(r.published>receivedDate)throw Error('Cannot ingest a release before publication');
  if(!Number.isFinite(r.value)||(r.series!=='GDP'&&r.value<=0))throw Error('Finite valid release value required');
  if(r.series==='GDP'){if(!/^\d{4}$/.test(r.period)||r.estimate!==3)throw Error('GDP requires annual period and third-estimate provenance');}
  else if(!/^\d{4}-(0[1-9]|1[0-2])$/.test(r.period))throw Error('Price series requires monthly period');
  if(r.period>r.published.slice(0,r.period.length))throw Error('Release period is in the future');
  const same=next.filter(x=>x.series===r.series&&x.period===r.period);
  if(!r.revision&&same.some(x=>!x.revision))throw Error('First release already recorded; later values must be marked revision');
  if(r.revision&&!same.some(x=>!x.revision))throw Error('Record the first release before its revisions');
  if(same.some(x=>x.published>r.published))throw Error('Release vintages must be ingested chronologically within a series period');
  next.push(r);return next;
}

export function computeFromVintages(book,previous,input) {
  const {date,previousPath,previousR,bases={'CPI-U':100,PCE:100},inflationTarget=0,targetPrice=100,missingSeries=[],policy}=input;
  dayNumber(date);if(missingSeries.some(x=>!['GDP','CPI-U','PCE'].includes(x)))throw Error('Unknown unavailable series');
  const available=book.filter(x=>x.published<date),year=Number(date.slice(0,4)),slotYear=date.slice(5)>='04-01'?year:year-1;
  const cutoff=`${slotYear}-04-01`,state=structuredClone(previous??{annual:null});
  let pendingAnnual=false;
  if(!state.annual||state.annual.slotYear<slotYear){
    const selected=[];
    for(let y=slotYear-10;y<slotYear;y++){
      const rows=available.filter(x=>x.series==='GDP'&&x.period===String(y));
      const first=rows.find(x=>!x.revision);
      if(!first)continue;
      // Revisions wait for the next scheduled annual slot. A delayed first third
      // estimate can complete that slot at a later quarterly computation.
      const revisions=rows.filter(x=>x.revision&&x.published<cutoff).sort((a,b)=>a.published.localeCompare(b.published)||a.id.localeCompare(b.id));
      selected.push(revisions.at(-1)??first);
    }
    if(selected.length===10&&!missingSeries.includes('GDP'))state.annual={slotYear,appliedOn:date,trend:sum(selected.map(x=>q(x.value))).div(10).number(),releases:selected.map(x=>({id:x.id,period:x.period,published:x.published,revision:x.revision,value:x.value}))};
    else pendingAnnual=true;
  }
  const prices={},provenance=[];
  for(const name of ['CPI-U','PCE']){
    const rows=available.filter(x=>x.series===name&&!x.revision).sort((a,b)=>a.period.localeCompare(b.period)).slice(-3);
    const base=bases[name];if(!Number.isFinite(base)||base<=0)throw Error('Positive conversion-date price bases required');
    const usable=rows.length===3&&!missingSeries.includes(name);
    prices[name]=usable?sum(rows.map(x=>q(x.value).div(base).mul(100))).div(3).number():null;
    provenance.push({name,available:usable,vintage:rows.map(x=>x.id).join(','),observations:rows.map(x=>({period:x.period,id:x.id,published:x.published,value:x.value})),conversionBase:base});
  }
  provenance.push({name:'GDP-trend',available:!!state.annual,vintage:state.annual?`annual-slot-${state.annual.slotYear}`:'unavailable',annual:state.annual,pendingAnnual,carried:pendingAnnual});
  const usable=state.annual&&prices['CPI-U']!==null&&prices.PCE!==null;
  const result=usable?issuanceRule({previousPath,previousR,trendRealGrowth:state.annual.trend,cpiRebased:prices['CPI-U'],pceRebased:prices.PCE,targetPrice,inflationTarget,...(policy?{policy}:{})}):null;
  return {state,available:!!result,result,series:provenance,pendingAnnual,source:'supplied release records; calendar-date publication strictly before computation',remainingPolicy:'binary64 price and root calculation, exact rational posted money',target:result?q(result.path).toString():null};
}
