# Evidence index — published 3 November 2026

These are synthetic accounting checks, not economic validation or an external professional audit. Historical outputs are preserved, including non-passes and evaluator errors.

## Operating-rule challenge: 20 cases

Tested [frozen implementation 8cdf3e2](https://github.com/Jamie847/peoples-money-lab/commit/8cdf3e28f932963b854d0b3b92cc4c623e72a34a). PR #1 remains unmerged. Read the [chronology and later C06 erratum](operating-20-2026-11-01/CHRONOLOGY.md) before the [historical report](operating-20-2026-11-01/technical-evidence/REPORT.md).

The semantic cases were sealed before implementation inspection. The executable adapters were written after implementation visibility and corrected after the first execution. Separation was by AI workflow, not independently audited access control. Hashes establish byte identity, not secrecy or trusted timestamps.

| Evidence | Link | Recorded result |
|---|---|---|
| Sealed semantic cases | [Cases](operating-20-2026-11-01/technical-evidence/private_challenge/challenges.json) | SHA-256 `7460abe7abb0a376b140a0690346b3d1950b7238d8895dbb1939b56a4f46fbe0` |
| Original adapter | [Code](operating-20-2026-11-01/technical-evidence/private_evaluation/run.mjs), [results](operating-20-2026-11-01/technical-evidence/private_evaluation/first-run.json) | 1 Nov 05:49:54.646 UTC: 9 PASS, 10 partial/blocked, 1 adapter error; 196 assertions |
| Corrected adapter | [Code](operating-20-2026-11-01/technical-evidence/private_evaluation/run-corrected.mjs), [results](operating-20-2026-11-01/technical-evidence/private_evaluation/corrected-run.json) | 05:51:50.783 UTC: 15 PASS, 5 partial/blocked; 248 assertions |
| Expanded adapter | [Code](operating-20-2026-11-01/technical-evidence/private_evaluation/run-final-adapter.mjs), [results](operating-20-2026-11-01/technical-evidence/private_evaluation/final-adapter-run.json) | 05:52:48.603 UTC: same raw 15/5; 279 assertions |
| Lineage follow-up | [Code](operating-20-2026-11-01/technical-evidence/private_evaluation/run-lineage-supplement.mjs), [results](operating-20-2026-11-01/technical-evidence/private_evaluation/lineage-supplement.json) | 05:54:48.338 UTC: 22 assertions after inspection of A42; not a new unseen case |

The later five non-passes are C05 ambiguous, C06 underspecified, C11 partial, C17 unsupported accepted renewal (safe refusal verified), and C18 partial. **C06 was not proven invalid:** the historical report assumed an unstated starting path. The chronology's dated erratum corrects that interpretation. No demonstrated implementation failure is not the same as full conformance.

All 22 distributed manifest digests were verified locally before publication. [Redaction manifest](operating-20-2026-11-01/technical-evidence/REDACTION-MANIFEST.json) retains original and distributed hashes. The sole disclosed redaction is the workspace path in the first-run JSON stack trace; the error and results remain. Original `.sha256` files refer to retained originals where a redaction changes bytes. The source archive was 224,787 bytes, SHA-256 `4c072b797818db2c5adaade92fab8cd1ea45e5e4ff0162145f80af6b3abd2996`. Historical directory names beginning `private_` are preserved for reproduction; the distributed technical contents are now public. No manuscript is included.

[Reproduction instructions](operating-20-2026-11-01/technical-evidence/README.md): use a disposable copy because adapters overwrite their output filenames. No historical challenge was rerun for this publication. Do not add overlapping assertion counts as distinct scenarios.

## Separately labelled follow-ups

- [Refinancing-permitted synthetic payment timing, 3 November](refinancing-2026-11-03/REPORT.md): four failing sensitivity runs, 82 successful diagnostic assertions. This is post-disclosure evidence, not the 20-case challenge.
- [Earlier fiscal settlement and C05/C06 follow-ups](https://github.com/Jamie847/peoples-money-lab/tree/5225fccd86678e67286ae28efdfc7b988a9b6a56/debt-budget): separate draft PR #2; preserved failing 0.3 example.
- [Original 18-case baseline evidence](../docs/evaluation.md) is a different assessment.

## Design-paper status

[Source and decision record](DESIGN-STATUS-2026-11-03.md): no authentic standalone 0.7.3 was located. This index does not create or backdate one. Tested 0.7.2 implementation, later interpretations and new fiscal tests remain distinct.
