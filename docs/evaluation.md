# Evaluation protocol

1. Run all visible tests and reproduction; commit a baseline with a recorded hash.
2. Keep independently authored holdout cases outside the implementation tree until that hash is frozen.
3. Reveal the cases and run them without modifying the baseline. Record the full result, including failures, undefined policies and implementation gaps.
4. Classify each issue: implementation bug, source-policy gap, numerical convention, or unsupported economic/legal claim.
5. If fixing code or revising policy, commit that change separately. Preserve original holdout outcomes and label subsequent reruns as post-repair, not unseen validation.
6. Add new independent cases before another claim of held-out evaluation. Do not repeatedly tune to the same suite and continue to call it held out.

At initial baseline preparation, independent holdout results are **not yet available**. Passing visible tests is only in-sample software verification. Do not reclassify the existing synthetic oracle as an unseen test. A public reviewer should identify the exact commit evaluated.
