# Independent post-repair regression

Evaluated commit: `d38de02536f6df020344c5651d65d9138207efb4` (clean checkout).
Original first-pass commit: `97e43c9a82b09b42426b1760d0b558d91b6f32f2`.
Original frozen specification SHA-256: `0eea163f953986126ad1f4244d05b4cc23ce66dbb76430aba38b531db111c2ee`.

This is **post-disclosure regression**, not another held-out evaluation. Original first-pass artifacts were not modified. No source engine changes were made by this evaluator.

## Results

| Run | Cases | Assertions | Outcomes |
|---|---:|---:|---|
| Original harness, only commit pin changed | 18 | 9,229 | 9 PASS, 6 POLICY_UNDEFINED, 3 UNIMPLEMENTED, 0 FAIL |
| Explicit endpoint finalization adaptation | 18 | 11,073 | 9 PASS, 6 POLICY_UNDEFINED, 3 UNIMPLEMENTED, 0 FAIL |
| Additional independent repair checks | 3 | 950 | 3 PASS |
| Builder-authored audit regression tests, independently executed | 9 | Not combined with assertion count | 9 PASS |

These are assertion counts, not numbers of independent scenarios. Repeated snapshot checks are intentionally counted repeatedly. No accounting mismatch was demonstrated in these runs. The three outstanding implementation limits and six policy-undefined cases are unchanged; this is not an all-scenarios pass or economic validation.

## Harness changes and completeness

`run-unadapted.mjs` changes only the baseline commit pin. All 18 scenario assertions pass unchanged, so there are **no compatibility mismatches to excuse as finalization differences**.

`run.mjs` additionally records the pre-finalization report, invokes `finalize()` at each engine's existing endpoint (no date extension), independently audits the resulting balance sheets, checks that monetary balances did not change, checks removal of `UNCLOSED_ENDPOINT_DAY`, and checks that an open quarter remains `INCOMPLETE`. These additional checks raise the total from 9,229 to 11,073. They do not add issuance, repayments, quarter closes, or invented cure transactions.

Most scenarios intentionally test isolated, incomplete-quarter sequences or rejection of invalid operations. Their engine report may therefore be FAIL or POLICY_UNDEFINED even when the **test** passes. Only the two H04 variants finish a modeled quarter: they report COMPLETE_THROUGH_ENDPOINT after finalization, but the cure variant retains the earlier policy-undefined breach classification and the no-cure variant correctly reports FAIL. Completeness is not policy compliance.

## Additional repair checks and exact observations

- **R01 endpoint:** opening R100/T3; tax .1 on January 4; observe January 11. Before finalization, five breached business-day closes, no sixth-day violation, and UNCLOSED_ENDPOINT_DAY. Finalization produces six closes and TREASURY_CURE_EXCEEDED/FAIL. Balances unchanged.
- **R02 horizon:** R100/T1, fixed path100, zero allowance, begin January 1 and end March 31. Report before endpoint finalization is undefined; finalization yields PASS and COMPLETE_THROUGH_ENDPOINT. Extending observation to April 1 without modeling Q2 yields POLICY_UNDEFINED/QUARTER_COVERAGE_GAP, not a claim of a completed next-quarter schedule.
- **R03 emergency:** begin episode January 1, 2027, extend with supplied legislative attestation to January 1, 2028. Observation at expiry preserves original episode history and sets active emergency to null. Immediate recertification is rejected POLICY_UNDEFINED; original origin remains January 1, 2027. The deliberately unclosed quarter is not represented as a complete schedule.

Builder-authored regressions also cover repeated denominator overhang, policy configuration propagation, and unsupported policy settings. Their execution is corroboration, not an independent new specification.

## Remaining limitations

H10 collateral sale and impaired cash recovery remain unimplemented; H11 public overdue reporting remains unimplemented; H17 input-vintage/revision storage remains unimplemented. H04 interim cure status, H09 emergency expiry overhang, H12 residual recovery, H14 auction non-clearance response, H15 discounted-bill convention, and H18 mid-quarter rebase treatment remain policy-undefined. These must remain visible in public descriptions.

## Reproduction

From this package directory, use a clean checkout of the evaluated commit and new/empty output directories:

```sh
node run-unadapted.mjs CHECKOUT NEW_UNADAPTED_RESULTS
node run.mjs CHECKOUT NEW_FINALIZED_RESULTS
node repair-checks.mjs CHECKOUT NEW_REPAIR_RESULTS
node --test CHECKOUT/test/audit-regressions.test.mjs
```

The harness pins both the evaluated commit and sanitized specification hash, and refuses to overwrite existing results. Each case JSON includes event inputs, before/after snapshots, journals, diagnostics, and final reports. Original first-pass evidence must remain separately archived.
