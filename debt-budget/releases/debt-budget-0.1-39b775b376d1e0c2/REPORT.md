# Initial debt-and-budget report

Release: debt-budget-0.1-39b775b376d1e0c2. Private local review. Source review date: 2026-11-01.

This model follows money and obligations through explicit synthetic transactions. It does not estimate when the United States could repay its debt. National starting balances have not been reconciled. All numbers below are synthetic units, not dollars.

The opening synthetic gross Treasury debt is 185, including 30 held by the Authority and 50 in intragovernmental holdings. With no rule issuance it ends at 186.2; the illustrative 10-unit issuance case ends at 176.2. These numbers result from the stated inputs, not estimated national behavior. The same fiscal requests are shown with and without rule issuance and with a separate borrowing ban. The ban case retains its rejected borrowing and unpaid obligations; 15 units of maturing principal remain unpaid, so a lower reported debt stock there is not successful debt retirement. An accounting PASS means the supplied transactions can settle and balance, not that their assumptions are economically plausible.

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

Issuance is allocated once between spending and principal retirement. Changing that allocation does not create a second pool of money. Stabilization Bill purchases park funds and do not increase Treasury spending cash. Their principal and coupons remain obligations. Conversion-claim principal reduces public money and the Authority asset, not the cash budget deficit.

Cancelling the synthetic Authority-held security lowers gross Treasury debt by 30 and Authority net worth by 30, with no immediate cash saving. Social Security, other intragovernmental and excluded external holdings are retained. Consolidated results are a separate illustrative view; they do not erase beneficiaries or extinguish legal claims.

The official H.4.1 observation for September 30 is only a candidate input. Treasury/Fed valuation bridges, matching Treasury debt, maturity schedules, cash and conversion-base coverage remain unresolved. Official budget interest accrual also requires a bridge to this cash model. No national payoff date, interest-rate forecast, inflation result or sustainable spending claim follows.

Future website use: quote this fixed release ID and preserve its files. A later release must receive a new content-derived identifier and keep earlier evidence. No site, hosting or corrections service has been built or verified. The code and visible tests were AI-assisted; this is not an external audit.

Historical values and exact arithmetic checks are separate in historical-checks.json. Debt to the Penny reconciles internally, but MSPD differs by USD 5,287.19 and the interest series differ by USD 443,612,949.17. The latter numerically matches restoration of interest, without an established accounting explanation. Consumer raw-file verification remains incomplete after the local transfer problem. Sources and claim-level dates are in sources.json. Full scenario assumptions, inputs, rejected transactions and balanced entries are in results.json and journals.csv. The original operating challenge is separate and unchanged.
