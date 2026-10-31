# Evaluation protocol

1. Run all visible tests and reproduction; commit a baseline with a recorded hash.
2. Keep independently authored holdout cases outside the implementation tree until that hash is frozen.
3. Reveal the cases and run them without modifying the baseline. Record the full result, including failures, undefined policies and implementation gaps.
4. Classify each issue: implementation bug, source-policy gap, numerical convention, or unsupported economic/legal claim.
5. If fixing code or revising policy, commit that change separately. Preserve original holdout outcomes and label subsequent reruns as post-repair, not unseen validation.
6. Add new independent cases before another claim of held-out evaluation. Do not repeatedly tune to the same suite and continue to call it held out.

## Recorded first pass

Baseline `97e43c9a82b09b42426b1760d0b558d91b6f32f2` was frozen before the independently authored specification was revealed. The original frozen specification digest was `0eea163f953986126ad1f4244d05b4cc23ce66dbb76430aba38b531db111c2ee`.

The first pass produced **9 PASS, 6 POLICY_UNDEFINED, 3 UNIMPLEMENTED, and 0 demonstrated accounting failures** across 18 cases. There were 9,229 assertions, not 9,229 independent scenarios. This is independently authored software checking, not an external professional audit, economic validation, or a claim that all 18 cases passed.

The [full report](../evaluation/baseline-97e43c9/REPORT.md), public-safe specification, portable harness and immutable first-pass JSON results are preserved together. Their package hashes are in `evaluation/baseline-97e43c9/SHA256.json`.

To reproduce the original pass without modifying current code:

```sh
git worktree add --detach ../money-lab-baseline 97e43c9a82b09b42426b1760d0b558d91b6f32f2
node evaluation/baseline-97e43c9/run.mjs ../money-lab-baseline ../money-lab-new-results
```

Use a new, empty output directory. The harness refuses a different commit, dirty baseline, or an existing populated result directory. It must not overwrite the archived first pass. The public-safe specification has its own portability-package digest checked by the harness; the original pre-reveal digest above identifies the original private freeze.

## Follow-on repairs

A separate audit identified incomplete endpoint reporting, emergency timer restart ambiguity, persistent denominator-overhang provenance, and duplicated policy parameters. Those issues received a subsequent repair commit and explicit regression tests. Baseline history and first-pass outcomes are retained. A rerun after these fixes is post-repair regression evidence, not unseen validation. The nine generated paths totaling 105 synthetic years are accounting fixtures, not 105 economic stress tests.
