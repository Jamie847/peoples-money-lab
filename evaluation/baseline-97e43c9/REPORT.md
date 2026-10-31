# Independent frozen specification evaluation

## Result

Evaluated baseline commit `97e43c9a82b09b42426b1760d0b558d91b6f32f2` against the independently prepared 18-case specification, SHA-256 `0eea163f953986126ad1f4244d05b4cc23ce66dbb76430aba38b531db111c2ee`.

- **9 cases fully passed their defined expectations.**
- **6 cases remain policy undefined**, with the engine conservatively exposing rather than inventing the missing rule.
- **3 cases contain unimplemented requirements.** Their implemented accounting portions behaved as expected, but the complete cases did not pass.
- **No accounting failure was demonstrated by this evaluation.**
- **9,229 assertions** checked expected outcomes and every before/after ledger snapshot. This is not 9,229 independent scenarios, and it does not establish economic validity.

The evaluation exercised 110 requested events across 24 variants, with 91 applied events and 601 daily-close observations. The engine repository was not modified. The harness imports the baseline engine but uses its own BigInt rational arithmetic to check balance sheets, counterpart claims, cash ownership, aggregate net worth/valuation allowances, the exposure bound, and per-event R flows. It does not call the engine's audit or journal-posting functions for those checks. Invalid requested events must leave account balances unchanged.

The harness verifies the baseline commit, clean working tree and frozen specification hash before running. This is an independently authored software evaluation, not an external professional audit.

## Fully passed cases

H01: exact 3% cash threshold and fifth/sixth business-day distinction.

H02: cash breach streak continues across the quarter boundary.

H03: a conversion repayment starts a cash-ratio breach by reducing R, without increasing Treasury cash.

H05: recurring four-day breaches with a one-day reset remain allowed by the literal rule, and their daily history is retained. This demonstrates a policy limitation, not a software defect.

H06: conversion drains do not enlarge the already measured quarterly allowance.

H07: a zero allowance blocks remittance even when prior income is positive.

H08: denominator overhang freezes new lending; current-day issuance does not raise the frozen cap; exact headroom after repayment is enforced.

H13: separate bill lots, interest and auction settlement conserve R; an already redeemed lot cannot be redeemed again.

H16: future same-day tax receipts cannot fund an earlier payment with insufficient Treasury cash.

Some traces deliberately request prohibited actions. The engine labels those rejected requests FAIL, while the evaluation passes because rejection without mutation is the expected result. Do not confuse an intentionally rejected request with a vulnerability that changed balances.

## Policy gaps correctly exposed

H04: quarter-end 1% excess has a cure deadline, but its interim legal status is not defined. The engine exposes that ambiguity and enforces the later disbursement deadline under its disclosed frozen-excess/FIFO convention.

H09: after emergency expiry, R=104 and residual U=4 persist while the ordinary cap is 2.08. The bound holds. Disposition of the excess caused by the cap-rate change remains undefined; no invented repayment or rebase occurs.

H12: later cash recovery after legal extinguishment has no specified residual-recovery posting. The engine safely rejects a generic unsupported event; a dedicated explanatory diagnostic would be clearer.

H14: underfilled or empty auctions create no fictitious proceeds. The engine rejects the whole settlement instead of assuming a partial-award policy. The bill floor is not achieved by assumption.

H15: discount proceeds of 0.98 versus face value of 1 cannot be folded into the par-principal model silently. Discount mechanics are explicitly undefined.

H18: an authorized between-quarter rebase preserves all balances, resets U and records a new proof epoch. An unauthorized reset is rejected. A mid-quarter rebase remains undefined because treatment of the existing allowance is missing. A downward reset is not represented as continuation of the old nondecreasing-path proof.

## Implementation limits

**H10, collateral sale and recovery after impairment:** the engine cannot execute the frozen recovery-then-discharge sequence. It lacks a collateral-sale event and refuses cash recovery where aggregate impairment allowances require allocation. The separate impairment and full-discharge branch does preserve gross principal and prevents double loss recognition, but that is not a substitute for implementing the missing sequence. The engine documents this as a representation limit; ordinary impairment accounting itself is not an unresolved economic theory.

**H11, overdue reporting:** an unpaid loan remains in P after maturity, and R remains unchanged, which is correct. However, the public `report()` output has no explicit overdue classification or loan register. An evaluator must inspect internal loan state to identify the overdue balance. Add a reported loan register and derived overdue status without treating maturity as repayment.

**H17, input vintages:** declining targets are rejected. Frozen-release selection, revision storage and correction history are not implemented, so safe rejection of an unsupported revision event does not validate a production vintage system.

## Exact traces and reproduction

`summary.json` gives case classifications and scope. `H01.json` through `H18.json` contain input events, expected-check results, engine responses, entries, snapshots and reports. `run.mjs` is the executable harness.

From a checkout containing this public evaluation package, run:

```sh
node evaluation/first-pass/run.mjs PATH_TO_BASELINE_CHECKOUT NEW_OUTPUT_DIRECTORY
```

The first argument is a clean checkout of the baseline commit named above, not the current development branch. The second is a new or empty result directory. The harness refuses to overwrite an existing nonempty directory and checks the baseline commit and public specification digest. The original frozen specification digest remains in the results as provenance; the sanitized public specification has a separate digest. Results include a timestamp, so output bytes differ across runs even when substantive findings are identical. The archived `first-pass-results` directory preserves the original observation and must not be replaced after fixes.

## What to say and what not to say

Supported: “An independently authored 18-case accounting evaluation found no balance-sheet or money-flow failure in the implemented paths. Nine cases passed fully; six exposed unresolved policy choices and three required additional implementation.”

Unsupported: “All 18 passed,” “the monetary proposal is validated,” “the engine predicts stable prices,” or “an independent professional audit cleared the system.”

After this suite is disclosed for development, its repaired cases become regression tests. A subsequent held-out evaluation must use newly frozen cases, not present retesting these same examples as fresh independent evidence.
