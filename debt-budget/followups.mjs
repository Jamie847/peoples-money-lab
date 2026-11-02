import {q} from '../src/rational.mjs';
/** Post-disclosure C05 adapter: explicitly authorized formula resolved at effective boundary. */
export function effectiveBalanceReset(engine,statute){
  if(statute.formula!=='ACTUAL_SETTLED_R_AT_EFFECTIVE_BOUNDARY'||statute.statuteAttested!==true||!statute.authority)throw Error('EXPLICIT_FORMULA_AUTHORITY_REQUIRED');
  if(engine.quarter||engine.operating.stagedReset||statute.effectiveDate!==engine.date||!/^\d{4}-(01|04|07|10)-01$/.test(engine.date))throw Error('RESET_BOUNDARY_REQUIRED');
  const resolvedPath=engine.R().toString();
  const residual=q(statute.residual);if(residual.cmp(0)<0||residual.cmp(engine.U)>0)throw Error('INVALID_RESIDUAL');
  const result=engine.execute({id:statute.id,type:'statutory_rebase',date:engine.date,path:resolvedPath,residual:residual.toString(),residualReductions:statute.residualReductions,statuteAttested:true,authority:statute.authority,enactmentDate:statute.enactmentDate,effectiveDate:statute.effectiveDate});
  return {classification:'Post-disclosure approved-interpretation follow-up; not original challenge',formula:statute.formula,resolvedPath,result};
}
