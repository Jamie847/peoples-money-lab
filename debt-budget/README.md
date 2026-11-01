# Private debt-and-budget accounting prototype

Run from the repository root with Node 20 or later, no dependencies or paid services:

```sh
node debt-budget/check.mjs
```

Do not run the old challenge as part of these commands. This folder is a separate model on a separate local branch, based on frozen 8cdf3e2. Nothing has been pushed or merged.

Read SCOPE.md for the pre-implementation acceptance cases DB01–DB15. The visible tests map to those IDs in their names. `reproduce.mjs` generates nine synthetic scenarios, complete journals and balance sheets, a plain-language report, CSV summaries and a claim-level source manifest. Its immutable release identifier hashes implementation, tests, scope, assumptions and source-manifest bytes. Existing release files cannot be silently overwritten with changed content. Source hashes normalize text line endings to LF for cross-platform reproduction. No file or network input is fetched during reproduction.

## Reading results

The baseline has no monetary-rule issuance; it is a financing comparison within the same synthetic ledger, not a complete conventional banking model. Target values and settled demand are explicit assumptions. The engine receives an attested monetary-rule target; it does not establish a legal or economic justification for it. Partial quarters and transactions do not constitute full operating-policy conformance. This module does not run Treasury cash-limit control, facilities, default restructuring, annual path calculations, statutory reset logic or C05/C06. A full integrated policy run is future work.

Assets and liabilities are signed; each sector's net worth equals its assets less liabilities, and counterpart holdings reconcile after each accepted event. `report().cashBudgetDeficit` is primary spending plus paid coupons minus taxes. Principal borrowing/redemption, cancellation, issuance and conversion repayments are separate financing or monetary flows. This cash measure is not the official accrued-interest budget deficit. The engine never converts issuance allowance into revenue twice. Issuance held in the spending, debt or reserve buckets remains part of T; it is not another asset added to T.

Each security has explicit holder, maturity and coupon amounts/dates. No default market demand or rate response is inferred. Redemption before contractual maturity is unsupported, including special-issue early redemption that SSA describes; an implementation extension would need explicit contractual terms. Social Security and other excluded holdings cannot be cancelled. Their liabilities remain visible even in the illustrative consolidated presentation. Conversion amortization is a supplied settled schedule; the seven-year test does not prove banks can make those payments. Initial claims have no impairment; impairment/default and uncertain collections remain outside this model.

Cancellation is an explicit, attested full-principal event for an Authority-held instrument only. Any unpaid scheduled coupon blocks cancellation as POLICY_UNDEFINED until its treatment is explicitly specified; cancellation examples therefore use a security without outstanding coupons. This is not a determination of legal coupon rights, book-value loss, remittance policy or actual annual saving. No Authority remittance event is implemented. Proposed Bill interest uses explicit cash coupons; an endogenously changing Bill volume would need a new contractual schedule, not the sensitivity's unchanged illustrative coupon.

National scenario execution is deliberately unavailable. The partial reconciliation helper diagnoses missing and mismatched data but cannot authorize a national opening. The official H.4.1 observation is not substituted into the synthetic fixtures. Debt securities alone are not the entire national balance sheet; nonfinancial assets and promised future benefits are not valued here. No macroeconomic, distributional, tax-base or rate-response model is supplied.

## Review and future releases

Test errors, failed policy requests, and unresolved inputs must stay visible. The borrowing-ban case deliberately fails financing and leaves obligations unpaid; its lower debt cannot be advertised as a successful payoff. Source updates must preserve release dates, observation dates, units, populations and valuation bridges. A book can cite one fixed release; future website releases should retain that exact evidence and clearly distinguish corrections. The registered website domain conveys no verified hosting or correction functionality.

AI assistance was used for implementation, tests and this explanation. These visible tests are not the earlier unseen challenge or an external professional audit. MIT code licensing follows the repository license; private manuscript rights are excluded. No private manuscript, credentials or personal account data are needed by this model.

Historical actuals are recorded separately in official/historical-snapshot.json, with the consumer-transfer limitation, exact arithmetic checks and unreconciled differences. These records are never used as synthetic scenario inputs. The research package contains eight successful raw API datasets, not nine. Its 893-row maturity table has reopening and total rows; no maturity cash flows have been derived here from an unverified sum.
