import fs from 'node:fs';import crypto from 'node:crypto';import {q,sum} from '../src/rational.mjs';
const root=new URL('./official/verified-2026-11-02/',import.meta.url);
const read=n=>JSON.parse(fs.readFileSync(new URL(n,root),'utf8').replace(/^\uFEFF/,''));
export function officialReconciliation(){
  const sources={},data={};
  for(const name of ['debt_to_penny','mts9','mts6','mts5','interest_expense','mspd1']){
    const bytes=fs.readFileSync(new URL(name+'.json',root)),p=read(name+'.provenance.json'),d=JSON.parse(bytes);
    if(crypto.createHash('sha256').update(bytes).digest('hex')!==p.sha256)throw Error('SOURCE_HASH: '+name);
    if(d.data.length!==p.rows||Number(d.meta['total-count'])!==p.rows||d.data.some(r=>r.record_date!=='2026-09-30'))throw Error('SOURCE_COVERAGE: '+name);
    sources[name]=p;data[name]=d.data;
  }
  const one=(name,predicate)=>{const rows=data[name].filter(predicate);if(rows.length!==1)throw Error('AMBIGUOUS_ROW: '+name);return rows[0];};
  const line=(name,id,field)=>q(one(name,r=>r.line_code_nbr===id)[field]);
  const dtp=data.debt_to_penny[0],gross=q(dtp.tot_pub_debt_out_amt),pub=q(dtp.debt_held_public_amt),ig=q(dtp.intragov_hold_amt);
  const receipts=line('mts9','120','current_fytd_rcpt_outly_amt'),outlays=line('mts9','340','current_fytd_rcpt_outly_amt'),netInterest=line('mts9','320','current_fytd_rcpt_outly_amt'),deficit=outlays.sub(receipts);
  const liability=line('mts6','9361','fytd_net_txn_amt'),asset=line('mts6','9562','fytd_net_txn_amt'),adjustment=line('mts6','9624','fytd_net_txn_amt');
  const publicInterest=line('mts5','4170','current_fytd_gross_outly_amt'),specialInterest=line('mts5','4175','current_fytd_gross_outly_amt'),grossInterest=line('mts5','4176','current_fytd_gross_outly_amt');
  const expenseSum=cat=>sum(data.interest_expense.filter(r=>!cat||r.expense_catg_desc===cat).map(r=>q(r.fytd_expense_amt)));
  const restoration=q(one('interest_expense',r=>r.expense_type_desc==='Restoration of Interest').fytd_expense_amt);
  const mspd=one('mspd1',r=>r.security_type_desc==='Total Public Debt Outstanding');
  const residuals={gross:q(mspd.total_mil_amt).mul(1000000).sub(gross).toString(),public:q(mspd.debt_held_public_mil_amt).mul(1000000).sub(pub).toString(),intragovernmental:q(mspd.intragov_hold_mil_amt).mul(1000000).sub(ig).toString()};
  return {classification:'Official historical observations; not synthetic or a forecast',observationDate:'2026-09-30',retrievedOn:'2026-11-02',units:'USD; MSPD million-USD fields multiplied by 1000000',sources,
    claims:{grossDebt:gross.toString(),publicDebt:pub.toString(),intragovernmentalDebt:ig.toString(),receipts:receipts.toString(),netOutlays:outlays.toString(),netInterest:netInterest.toString(),primaryNetOutlays:outlays.sub(netInterest).toString(),deficit:deficit.toString(),publicIssueInterest:publicInterest.toString(),specialIssueInterest:specialInterest.toString(),grossInterest:grossInterest.toString(),restoration:restoration.toString(),accruedInterestPayableChange:line('mts6','9320','fytd_net_txn_amt').toString()},
    identities:{debtSplit:pub.add(ig).eq(gross),financing:liability.sub(asset).add(adjustment).eq(deficit),grossInterest:publicInterest.add(specialInterest).eq(grossInterest),publicIssueSeries:expenseSum('INTEREST EXPENSE ON PUBLIC ISSUES').eq(publicInterest),governmentSeriesLessRestoration:expenseSum('INTEREST EXPENSE ON GOVT ACCOUNT SERIES').sub(restoration).eq(specialInterest)},
    residuals:{mspdMinusDtp:residuals,expenseApiMinusMtsGross:expenseSum().sub(grossInterest).toString()},
    selectors:{mts9:'line_code_nbr 120 receipts, 340 net outlays, 320 net interest',mts6:'9361 liabilities minus 9562 assets plus 9624 adjustment; 9320 accrued interest payable',mts5:'4170 public accrual, 4175 special cash, 4176 gross; exclude duplicate total 4177',mspd1:'security_type_desc = Total Public Debt Outstanding; do not sum subtotal rows',interest_expense:'sum unique published component rows by expense_catg_desc; separately identify Restoration of Interest'},
    basis:'MTS Table 5 explicitly labels public issues Accrual Basis and special issues Cash Basis. Net budget interest is not a pure cash coupon flow.',
    nationalCashBridge:{status:'BLOCKED',reasons:['Gross-to-net interest offsets and full accrual-to-cash bridge are not reconciled. The accrued-interest-payable change alone is insufficient.','MSPD/DTP exact residual remains unexplained; matching rounded millions is not proof of its cause. DTP controls historical debt stocks.','Restoration event is supported by Treasury FY2025 AFR Note 16, printed page 111; precise MTS classification/exclusion rationale remains unresolved. It is not a saving.','Authority security valuation, opening cash, conversion base and contractual maturity schedules are not reconciled. No national execution is authorized by these identities.']},
    supplementarySource:{url:'https://home.treasury.gov/system/files/266/Treasury-FY-2025-AFR.pdf',locator:'Note 16, printed page 111',reviewedOn:'2026-11-02',method:'Official PDF web text reviewed; raw PDF not packaged',claim:'Approximately $444 million of foregone interest restored to OPM funds December 31, 2025 after extraordinary measures.'}};
}
