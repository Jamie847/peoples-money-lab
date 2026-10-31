import {q} from './rational.mjs';
import {brakeRule} from './rules.mjs';

/** Stateful observation helper. Inputs are explicit verified aggregates, not a data feed. */
export function observeTarget(previous,input,{priorR,priorM,policy}={}) {
  const state=structuredClone(previous??{lastTarget:null,lastGap:null,brake:null,observations:[]});
  if(typeof input.date!=='string'||!Array.isArray(input.series)||input.series.length===0)throw Error('Dated named-series provenance required');
  for(const s of input.series)if(typeof s.name!=='string'||typeof s.vintage!=='string'||typeof s.available!=='boolean')throw Error('Named series, vintage and availability required');
  const available=input.series.every(s=>s.available)&&input.target!==undefined&&input.gap!==undefined;
  if(available){
    if(input.verified!==true||!Number.isFinite(input.gap))throw Error('Verified target and finite observed gap required');
    const target=q(input.target);if(target.cmp(0)<0)throw Error('Negative target');
    state.lastTarget=target.toString();
    state.brake=brakeRule({priorR,priorM,currentLogGap:input.gap,previousLogGap:state.lastGap??input.gap,wasActive:state.brake?.active??false,...(policy?{policy}:{})});
    // One reading alone cannot meet the two-successive-available-reading trigger.
    if(state.lastGap===null&&state.brake.active)state.brake=brakeRule({priorR,priorM,currentLogGap:input.gap,previousLogGap:0,...(policy?{policy}:{})});
    state.lastGap=input.gap;
  }
  state.observations.push({date:input.date,series:structuredClone(input.series),available,stale:!available,target:state.lastTarget,brake:structuredClone(state.brake),gap:available?input.gap:null});
  return state;
}
