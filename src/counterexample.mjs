import {Engine} from './engine.mjs';
/** Deterministic deletion minimization: 1-minimal, not guaranteed globally shortest. */
export function minimizeTrace(events,predicate){
  if(!predicate(events))throw Error('Input does not reproduce the requested failure');
  let current=structuredClone(events),width=2;
  while(current.length>=2){const size=Math.ceil(current.length/width);let reduced=false;
    for(let i=0;i<current.length;i+=size){const candidate=current.slice(0,i).concat(current.slice(i+size));if(predicate(candidate)){current=candidate;width=Math.max(2,width-1);reduced=true;break;}}
    if(!reduced){if(width>=current.length)break;width=Math.min(current.length,width*2);}
  }
  // A final single-deletion sweep establishes 1-minimality for a deterministic predicate.
  let changed=true;while(changed){changed=false;for(let i=0;i<current.length;i++){const c=current.filter((_,j)=>j!==i);if(predicate(c)){current=c;changed=true;break;}}}
  return current;
}
export function replay(events,options={}){const engine=new Engine(options);for(const event of events)engine.execute(event);return{report:engine.report(),history:engine.history};}
export const hasIssue=(events,code,options={})=>replay(events,options).report.issues.some(x=>x.code===code);
