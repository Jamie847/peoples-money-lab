# 0.7.2 implementation progress — not frozen

The frozen [visible specification](../acceptance/0.7.2/SPECIFICATION.md) precedes implementation. This document is an implementation status report, not an amendment to that specification. No claim that all 48 cases are implemented or passed is made. These implementation-authored tests are not held-out evidence.

Use `OperatingEngine` from `src/engine072.mjs` to opt into the work in progress. The existing `Engine`, historical fixtures and archived evaluation remain unchanged. Run `npm test` for both engines, and `npm run reproduce:072` for new diagnostic exports. `npm run reproduce` continues to reproduce the older baseline translation.

## Implemented components

The new engine separates auction awards from bidder settlement, applies a provisional 6% ceiling, distributes marginal ties with exact rational pro rata allocation, and exports settlement shortfalls and consecutive-auction flags. No retail settlement is admitted pending authorization-scope clarification. Each auction is explicitly finalized with `close_auction`; this prototype does not infer a settlement deadline or late-settlement policy.

Identified loan recoveries reconcile legal principal, residual, impairment, money destruction and financial loss-recovery income. A receipt must identify the loan, assert settlement, and have a unique receipt ID. Principal-only and residual-only recovery, including the R104/P0/U4 to R103/P0/U3 example, is implemented. Noncash possession does not reduce exposure. Collateral-sale net proceeds are supplied, reconciled and reported; this is not a collateral liquidation marketplace or expense-payment ledger. Within a partially impaired loan, recovery uses carrying value before releasing impairment; that accounting convention needs review before freeze.

The cash controller retains a rolling 60-business-day history, opens a single remedy at a violation, preserves its deadline, recomputes dividends from live settled R/T, and records late cure without erasing failure. Queued instructions do not post money. Quarter-end obligations retain their original deadline. Dividends require explicit settlement events; no simulator can guarantee an external payment occurred. Existing spending and redeemable-debt settlement count against the obligation exactly once.

Boundary resets validate before changing path, residual and epoch. A staged reset blocks a new allowance until applied. Full or zero residual resets are supported; partial statutory allocation among individual residuals is explicitly unimplemented. Emergency recertification retains its original clock unless a complete qualifying calendar quarter was observed; persistent emergency loan tags remain in the register.

The observation helper retains the last verified target and previous available price-gap reading. It keeps an active brake target through a missing reading. Fixed allowances remain fixed. Target verification is an explicit scenario attestation, not data-feed authentication. It does not yet ingest monthly CPI/PCE releases or annual GDP vintages; A39 is not fully implemented. Supplying `verifiedTarget: true` with `begin_quarter` is the explicit manual input route. Omitting a path uses the last target observation and rejects if none exists.

Daily usage, weekly loan/overhang registers and immediate action records are exported with dates. Loan IDs must be synthetic/public-safe identifiers; this research prototype has no private identity store or privacy enforcement layer. Reports record overdue legal balances separately from residuals.

## Calendar and arithmetic

The bundled [2027 calendar fixture](../fixtures/federal-calendar-2027.json) uses the published OPM Monday-Friday observed federal dates, including December 31, the observed New Year holiday for 2028. Source: [OPM holiday schedule](https://www.opm.gov/policy-data-oversight/pay-leave/federal-holidays/). An explicitly supplied `holidays` array replaces this fixture. Other years, emergency closures and institutional applicability require an explicit reviewed calendar; the default is not a perpetual federal calendar.

Money and pro rata awards use rational amounts. Production indivisible payment-unit rounding is not resolved here. Bill-interest amounts are explicit contractual fixture inputs, not an implemented day-count accrual system.

## Outstanding decisions and work

- Recovery cash beyond principal/residual is rejected as POLICY_UNDEFINED. The interest/penalty/excess waterfall and its monetary categories are pending. A direct `payInterest` event is blocked in this engine to prevent bypassing the identified recovery path.
- Direct sales are rejected as POLICY_UNDEFINED until remaining authorization and overlapping windows are specified.
- A39 series-vintage ingestion, A23 preventive scheduling, partial statutory residual allocation, complete per-case acceptance reporting, and broader multi-year 0.7.2 regression remain unfinished.
- Reproduction examples intentionally include partial schedules. Their overall report can be POLICY_UNDEFINED even when an individual component assertion passes. Do not convert an incomplete trace into a policy-compliance PASS.
- The implementation is not frozen. No unseen challenge has been supplied to or accessed by the implementer. Merge remains prohibited pending the separately run challenge against a later frozen commit.
