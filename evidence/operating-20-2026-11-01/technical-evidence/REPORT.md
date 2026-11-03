# Independent operating-rule challenge

**Frozen commit:** `8cdf3e28f932963b854d0b3b92cc4c623e72a34a`  
**Evaluation date:** 1 November 2026

## Result

**15 of 20 cases passed. No implementation failure was demonstrated.** The remaining cases are **2 partial, 1 unsupported, and 2 invalid or ambiguous tests**—not passes.

The final adapter passed **279 assertions**. A separate lineage-rejection supplement passed **22 assertions**. These overlapping checks must not be counted as additional independent scenarios.

The challenge was sealed before the evaluator inspected the implementation. Its original inputs and expected outcomes remained unchanged. First-run results, adapter corrections, later runs and limitations are preserved. This is AI-assisted review, not a professional audit.

## What passed

- Settled principal/residual recoveries, accounting separation and replay rejection.
- Emergency-cap expiry, lending freeze, overhang reporting and rejected-reset atomicity.
- Auction allocation, settlement-dependent withdrawals, short-auction sequences and bounded direct sales.
- Missing-reading brake behavior and exact activation/release thresholds.
- Treasury rolling/consecutive breach counts, quarter-boundary continuity, business-day deadlines, actual settlement and live payout amounts.
- Quarter-end cash fallback, overdue reporting and separate bill principal/interest flows.

## Five cases that did not receive a full pass

| Case | Disposition | Meaning |
|---|---|---|
| C05 | Invalid/ambiguous test | The sealed scenario did not distinguish a fixed statutory reset target from one defined using the balance at its effective date. Midquarter safeguards passed; the ambiguous expected target was not scored. |
| C06 | Invalid test | The scenario required a quarterly issuance jump incompatible with the annual path-growth ceiling. Initial lending-cap checks passed; the impossible later steps were not scored. |
| C11 | Partial | First-target refusal, unchanged fixed allowances, disclosed missing prices and prospective GDP use passed. The sealed expectation used an annual net rate while the unavailable-computation interface exposes a carried stock target. That unit distinction remains unresolved. |
| C17 | Unsupported renewal feature; safe rejection passed | Actual contractual rollover/relabeling is outside the implemented feature set. Attempts are rejected atomically, retain emergency identity and do not reset the episode clock or manufacture a clean quarter. This is **not evidence of missing anti-evasion protection**; it is a limit on accepted renewal functionality. |
| C18 | Partial; underspecified integration scenario | Three clean-quarter restart conditions passed in separately initialized quarterly histories. The sealed scenario omitted the accounting path creating its one-day exposure excess. No connected end-to-end trajectory or implementation failure is claimed. |

The calendar test supplied explicit federal holidays for its year; it does not establish an unrestricted, automatically maintained federal calendar. Scenario attestations are not authenticated live data or production payment controls.

## Recommendation

**Suitable for consideration as a research release candidate with the stated limitations—not an unconditional implementation-conformance or merge pass.** Preserve the five non-pass dispositions prominently. Resolve the target-unit interpretation and specify an executable integrated restart scenario before claiming complete coverage; actual renewals require separate implementation and tests if they enter scope.

Any fixes or new tests after disclosure are follow-up evidence, not a repeat of an unseen challenge. Publishing or merging remains the owner's decision, with exact-commit CI checked separately.

## Evidence boundaries

- Commit identity and bundle integrity were verified before code inspection; the tested checkout remained unchanged.
- The original challenge SHA-256 is `7460abe7abb0a376b140a0690346b3d1950b7238d8895dbb1939b56a4f46fbe0`, sealed 31 October 2026 at 17:18:37 UTC.
- The original adapter run had nine passes, ten partial/blocked cases and one evaluator calendar error. Corrections and added adapter coverage are separately preserved; no first-run failures were overwritten or expectations retuned.
- The implementation author's 48 visible acceptance cases and 104 local tests are separate evidence, not held-out results. This evaluator did not establish remote CI status.
- Nothing here establishes inflation performance, credit availability, transition feasibility, constitutional enforceability or payment-system security.

The accompanying technical evidence contains synthetic test specifications, adapters and machine-readable observations, with no source manuscript. Evaluator-workspace identifiers in a stack trace are redacted in the distribution copy; the redaction manifest records original and distributed hashes. Original evidence is retained separately.
