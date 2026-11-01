# Debt-and-budget report v0.2 — issuance provenance

Release: debt-budget-0.2-495e3a711ac30db5. Private local review. Source review date: 2026-11-01.

This model follows money and obligations through explicit synthetic transactions. It does not estimate when the United States could repay its debt. National starting balances have not been reconciled. All numbers below are synthetic units, not dollars.

The opening synthetic gross Treasury debt is 185, including 30 held by the Authority and 50 in intragovernmental holdings. With no rule issuance it ends at 186.2; the illustrative 10-unit assumed-authorized-issuance case ends at 176.2. In those original nine cases the fixture chooses issuance and constructs target = 110 + issuance; the frozen controller does not generate that choice. These numbers result from the stated inputs, not estimated national behavior. The same fiscal requests are shown with and without rule issuance and with a separate borrowing ban. The ban case retains its rejected borrowing and unpaid obligations; 15 units of maturing principal remain unpaid, so a lower reported debt stock there is not successful debt retirement. An accounting PASS means the supplied transactions can settle and balance, not that their assumptions are economically plausible.

A separate allowance-interface scenario invokes the unchanged frozen controller using initial R=110, M=109, T=1, B=0 and independently specified starting target=110. Ten synthetic GDP third-estimate annual observations are each 2%; the latest three first-release CPI-U and PCE observations are each 100, with conversion bases and price target 100 and inflation target 0%. The controller computes target 110.54592247305241 and allowance 0.545922473052418. This separate case has opening Treasury cash 1 rather than the original cases' 10; its debt outcome is not an otherwise-identical comparison. Fiscal allocation is chosen afterwards: half (0.272961236526209) for spending and half for debt principal. Exact rational values and selected data vintages are retained in results.json.

This is a real code connection at the computed allowance interface, not a full shared settlement ledger: the controller credits zero and the fiscal module posts its allocated credit separately. Fiscal taxes, spending, debt and Bills are not replayed through controller cash/brake controls. No full-quarter policy-conformance claim or interpretation of C11 is made. Missing data without a checked figure blocks coupling; an excessive allocation is rejected. This is new fiscal integration testing, not a sealed-challenge rerun.

| Scenario | Accounting outcome | Closing T | Gross Treasury debt | Cash deficit | Rule issuance | New borrowing | Overdue items |
|---|---|---:|---:|---:|---:|---:|---:|
| baseline-no-rule | PASS | 0 | 186.2 | 11.2 | 0 | 21.2 | 0 |
| design-borrowing | PASS | 0 | 176.2 | 11.2 | 10 | 11.2 | 0 |
| design-ban | FAIL | 3.8 | 180 | 11.2 | 10 | 0 | 1 |
| lower-taxes | PASS | 0 | 178.2 | 13.2 | 10 | 13.2 | 0 |
| higher-primary | PASS | 0 | 178.2 | 13.2 | 10 | 13.2 | 0 |
| higher-coupon | PASS | 0 | 178.2 | 13.2 | 10 | 13.2 | 0 |
| lower-bill-demand | PASS | 0 | 176.2 | 11.2 | 10 | 11.2 | 0 |
| all-issuance-to-debt | PASS | 0 | 176.2 | 11.2 | 10 | 11.2 | 0 |
| authority-cancellation | PASS | 0 | 146.2 | 11.2 | 10 | 11.2 | 0 |
| controller-coupled | PASS | 0 | 194.6540775269476 | 11.2 | 0.545922473052418 | 29.654077526947585 | 0 |

Issuance is allocated once between spending and principal retirement. Changing that allocation does not create a second pool of money. Stabilization Bill purchases park funds and do not increase Treasury spending cash. Their principal and coupons remain obligations. Conversion-claim principal reduces public money and the Authority asset, not the cash budget deficit.

Cancelling the synthetic Authority-held security lowers gross Treasury debt by 30 and Authority net worth by 30, with no immediate cash saving. Social Security, other intragovernmental and excluded external holdings are retained. Consolidated results are a separate illustrative view; they do not erase beneficiaries or extinguish legal claims.

The official H.4.1 observation for September 30 is only a candidate input. Treasury/Fed valuation bridges, matching Treasury debt, maturity schedules, cash and conversion-base coverage remain unresolved. The final MTS uses a modified cash basis: public-issue interest is accrued while special-issue interest is on a cash basis. Its net-interest line is not a pure cash input. The national cash bridge remains blocked; accrued-interest payable is only one adjustment. No national payoff date, interest-rate forecast, inflation result or sustainable spending claim follows.

Future website use: quote this fixed release ID and preserve its files. A later release must receive a new content-derived identifier and keep earlier evidence. No site, hosting or corrections service has been built or verified. The code and visible tests were AI-assisted; this is not an external audit.

Historical values and exact arithmetic checks are separate in historical-checks.json. Debt to the Penny reconciles internally, but MSPD differs by USD 5,287.19 and the interest series differ by USD 443,612,949.17. The latter is tied by the researcher to December 31, 2025 OPM restoration after debt-limit measures; the precise MTS classification/exclusion rationale remains unresolved. It is not a saving or a discarded expense. Consumer raw-file verification remains incomplete after the local transfer problem. Sources and claim-level dates are in sources.json. Full scenario assumptions, inputs, rejected transactions and balanced entries are in results.json and journals.csv. The original operating challenge is separate and unchanged.
