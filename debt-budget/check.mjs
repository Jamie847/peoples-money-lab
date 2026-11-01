import {spawnSync} from 'node:child_process';import {fileURLToPath} from 'node:url';
const root=fileURLToPath(new URL('../',import.meta.url));
for(const args of [['--test','debt-budget/model.test.mjs','debt-budget/release.test.mjs','debt-budget/coupling.test.mjs'],['debt-budget/reproduce.mjs']]){const r=spawnSync(process.execPath,args,{cwd:root,stdio:'inherit'});if(r.status!==0)process.exit(r.status??1);}
