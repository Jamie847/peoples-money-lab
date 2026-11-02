# Debt-and-budget accounting research draft

Run with Node20 or later, no dependencies or network access:

```sh
node debt-budget/check.mjs
```

Read REPORT-0.3.md for findings and SCOPE.md for acceptance criteria. This module imports the unchanged frozen operating controller at8cdf3e2. The separate draft depends on the operating-rules branch; it does not merge or alter that implementation or its challenge evidence. Releases0.1 and0.2 remain immutable. Their reports describe the boundaries at the time they were generated.

The nine original scenarios model an assumed authorized issuance: the fixture chooses10 and constructs target120 around R110. A tenth allowance-interface scenario independently specifies R110/starting path110 and synthetic GDP/price vintages before computing allowance. Version0.3 adds paired settlement replay through the controller. All settlement balances match, but the inherited timing produces monthly-tranche and Treasury-cash policy failures. Tests deliberately preserve these failures. A separate zero-allowance full quarter with same-day tax/spend passes.

## Accounting perimeter and limitations

Each sector balances, counterpart holdings reconcile, and failed postings roll back atomically. Principal financing is separate from budget outlays. Issuance allocation cannot exceed its controller-computed allowance or finance spending and debt retirement twice. Unpaid debt remains outstanding. Authority-held debt, external debt and intragovernmental debt are distinct; Social Security and excluded holdings cannot be cancelled. Cancellation affects Authority net worth and is not an immediate annual cash saving.

The paired controller mirrors external debt only. Internal-holder settlements and Authority remittances are unsupported. No C11 interpretation is added. The Bill auction fixture explicitly supplies a5% bid and a separate contractual cash-coupon schedule; this diagnostic does not derive one from the other or establish yield consistency. Maturity/coupon schedules and conversion collections are assumed, not forecasts. Insolvency, behavioral responses, national economic benefits and market demand are outside scope.

C05/C06 follow-ups are post-disclosure tests of approved interpretations with stated starting paths. C05 uses a new formula-validation adapter around the frozen numeric reset interface. These are not unseen evidence, and the original challenge records remain unchanged.

## Sources and releases

The six `official/verified-2026-11-02` datasets are official historical observations for September30,2026, independently retrieved from Treasury, with URLs and exact-byte hashes. `official-reconciliation.mjs` validates coverage, selectors, identities and residuals. Old `historical-snapshot.json` retains researcher-supplied provenance and its earlier transfer limitation. New verification supersedes that limitation only for the six explicitly archived datasets, not all national inputs.

MTS interest mixes public-issue accrual and special-issue cash accounting; net interest cannot be inserted as cash coupons. National execution remains BLOCKED pending the complete cash/valuation/maturity/conversion reconciliation. No national debt payoff path is generated.

`reproduce.mjs` emits content-addressed JSON, CSV and Markdown under releases/. Source hashes normalize text to LF; archived official source hashes additionally verify exact raw bytes. Existing releases cannot be overwritten. Full assumptions and journals are in results.json; settlement-example.json retains controller policy failures. The manifest hashes all output files. Reproduction performs no network request and does not run the old sealed challenge.

## Contributing

Add explicit scope and cases before extending policy; keep uncertainty visible instead of inventing rules. Run the command above, preserve old releases, document data dates/perimeters and inspect all public files for private material. Use a new release for changed evidence. The book may cite a fixed release; no website hosting or deployment is included. AI assisted the code, tests and prose; this is not an external audit. Code is MIT licensed under the repository license; private manuscript rights are excluded.
