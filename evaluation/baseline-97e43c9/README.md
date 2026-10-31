# Frozen first pass evaluation

This package preserves the first independently authored 18-case evaluation of baseline `97e43c9a82b09b42426b1760d0b558d91b6f32f2`. It is not a claim that every case passed. Read REPORT.md and the archived results.

The sanitized specification preserves scenarios and expectations from the original frozen specification. The executable harness has only portability and output-protection adaptations: a baseline-checkout argument, an output-directory argument, dynamic module locations, and a digest for the public specification. The archived observations were produced by the original harness.

Run `node run.mjs BASELINE_CHECKOUT NEW_OUTPUT_DIRECTORY`. Use a clean checkout of the exact baseline commit. The output directory must not already contain files. No packages beyond Node are required.

Do not overwrite first-pass-results after repairs. A later run against repaired code is a regression test, no longer a fresh held-out evaluation. Record the new commit and results separately. This test source may be shared under the repository code license; it contains no private manuscript text or operational user data.
