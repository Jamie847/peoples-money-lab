# Technical evidence

No manuscript or source-paper copy is included. All test data is synthetic.

The original sealed independent challenge is in private_challenge/challenges.json; historical directory names are retained so adapters can run without modification. The full test outcomes are final-adapter-run.json and lineage-supplement.json. Preserve all earlier outputs and read REPORT.md for non-pass cases and oracle limitations.

For reproduction, put a clean checkout of frozen commit 8cdf3e28f932963b854d0b3b92cc4c623e72a34a in private_frozen/repo beside these directories. Node 20+ is required; evaluation used v24.22.1. Run `node private_evaluation/run-final-adapter.mjs` and `node private_evaluation/run-lineage-supplement.mjs` only in a copy, because scripts overwrite their named output files. Other adapter versions and original first-run outputs are preserved for audit, not merged into the final pass count.

The .sha256 files record original pre-distribution evidence hashes. REDACTION-MANIFEST.json additionally records distributed file hashes and the sole workspace-stack-trace redaction. The original sealed challenge and adapter scripts are unchanged. No implementer fixes were made between these runs.
