import fs from 'node:fs';
import {Engine} from '../src/engine.mjs';
import {customOpening} from '../src/ledger.mjs';
const file=process.argv[2];if(!file){console.error('Usage: node scripts/run.mjs scenario.json');process.exit(2);}
const input=JSON.parse(fs.readFileSync(file,'utf8'));
if(!Array.isArray(input.events))throw Error('Scenario requires events array');
const engine=new Engine({...input.options,...(input.opening?{opening:customOpening(input.opening)}:{})});
for(const event of input.events)engine.execute(event);
const report=input.finalize?engine.finalize(input.finalize===true?{}:input.finalize):engine.report();
console.log(JSON.stringify({report,history:engine.history},null,2));
// Undefined is a distinct CLI outcome, never an implicit pass.
process.exitCode=report.status==='FAIL'?1:report.status==='POLICY_UNDEFINED'?3:0;
