# Challenge provenance and original first-pass record

**Prepared:** 1 November 2026  
**Citation status:** **“Unseen challenge: not yet reported” remains the book/website wording until the author receives and reviews this record.** This document is not permission to publish or cite a stronger conclusion.

## The essential distinction

The original first execution was **9 passed cases, 10 partial/blocked cases, and 1 evaluator-adapter error**, not 15 or 20 passes. It completed at **2026-11-01 05:49:54.646 UTC** against commit **`8cdf3e28f932963b854d0b3b92cc4c623e72a34a`**.

A later corrected and expanded adapter reported **15 passed, 2 partial, 1 unsupported, and 2 invalid/ambiguous cases**, with **no demonstrated implementation failure**. That is a later result against the same frozen code. It must not replace or be described as the original first pass.

The **20-case semantic specification and expected outcomes were sealed before implementation inspection and never edited**. However, **the executable adapter was written after the implementation was available, and its fixtures, dates and coverage were corrected or expanded after the first execution**. It would be inaccurate to claim that all executable test inputs or the complete harness were frozen before implementation, or that no post-run evaluator changes occurred.

## Who wrote what

The AI evaluator role `design_unseen_operating_challenges`, delegated by the coordinating assistant, authored the 20 challenge cases on 31 October 2026. The evaluator used the supplied adopted operating rules and the coordinator's explicit accounting correction. The case file was complete and hashed at **17:18:37 UTC** that day. The evaluator also authored the adapters and assessed their outputs.

This was a separate evaluator role from the implementation worker, not an external human or professional audit. The record does not establish organizational independence, different model families, independently administered credentials, or protection against correlated AI mistakes. Git's author field identifies the repository account; it is not proof that the account holder personally wrote the implementation.

The work tested synthetic accounting and operating-rule behavior, not economic outcomes, live data authenticity, legal enforceability or production payments.

## How the cases were kept from the implementer

The coordinator assigned implementation to a separate worker and instructed this evaluator not to disclose challenge inputs, expected outcomes or detailed scenarios before the implementation was frozen. Before freeze, the evaluator sent the coordinator only coverage categories, status, the seal hash and a private artifact reference. It did not send the challenge to the implementation worker, write it into the repository, or publish it.

The cases and source extraction were stored separately from any implementation checkout, initially in local private files and then in a persistent private Library archive. No implementation source was inspected or run by this evaluator before receipt and verification of the frozen commit/bundle. The evaluator waited while two operating-policy clarifications were decided; the original challenge remained unchanged afterward.

**This is documented workflow separation, not cryptographic blindness or an independently audited access-control boundary.** The coordinator possessed the private artifact reference, and agents/tools were not proven to have mutually inaccessible storage. There are no independent access logs demonstrating that nobody else could have read it. A SHA-256 seal shows byte identity when compared; it does not prove secrecy, authorship, an independently trusted timestamp, or absence of prior knowledge. The chronology below comes from saved machine outputs, recorded tool/conversation times and commit metadata, not an external timestamping service.

## Chronology (UTC)

| Time | Recorded event and evidence limit |
|---|---|
| 2026-10-31, approximately 17:16–17:18 | Evaluator read the full supplied rules and authored the separate semantic challenge. No implementation inspection is recorded. Exact per-case writing times were not recorded. |
| **2026-10-31 17:18:37** | Local seal file records completion time; challenge SHA-256 recorded. This is a local clock observation, not a notarized timestamp. |
| 2026-10-31, approximately 17:19:36 | Tool record confirms creation of the persistent private sealed archive. Exact server-side creation time was not independently queried for this report. |
| 2026-11-01 05:38:54 | Coordinator conveyed author approval of the remaining direct-sale and receipt rules. Evaluator retained the original challenge and was instructed to disclose any dependent ambiguity rather than retune it. |
| 2026-11-01 **05:44:13** | Frozen commit's author/committer metadata timestamp, converted from its recorded UTC−06:00 offset. Git timestamps are author-controlled and are not independent proof of freeze. |
| 2026-11-01 **05:45:59** | Coordinator later reported this as its own freeze-observation time. This evaluator did not independently observe that earlier worker-side exchange; it is coordinator-provided provenance. |
| 2026-11-01 **05:46:26** | Coordinator's recorded message identified the local frozen SHA and said the bundle was being prepared. Actual moment the implementation worker stopped editing is not independently observed. |
| 2026-11-01 **05:47:57** | Coordinator supplied the private bundle reference, 167281-byte size, expected hash and exact SHA, and authorized evaluation. |
| 2026-11-01, by **05:48:10** | Tool output verified bundle byte count/hash, complete Git bundle, detached checkout SHA and unchanged challenge hash. Source inspection followed verification. The implementation code was visible while the evaluator wrote its adapter. |
| **2026-11-01 05:49:54.646** | Original adapter's JSON completion timestamp. 9 PASS, 10 PARTIAL_OR_BLOCKED, 1 ADAPTER_ERROR; 196 recorded assertions, zero assertion mismatches. An adapter error and unexercised assertions are not passes. Exact execution start time was not separately recorded. |
| **2026-11-01 05:51:50.783** | Corrected adapter completion. 15 PASS, 5 PARTIAL_OR_BLOCKED; 248 recorded assertions, zero mismatches. Original run retained unchanged. |
| **2026-11-01 05:52:48.603** | Expanded data-vintage adapter completion. Same 15/5 raw case tally; 279 recorded assertions, zero mismatches. Five non-passes subsequently described as 2 partial, 1 unsupported, 2 invalid/ambiguous. |
| 2026-11-01, approximately 05:54:27–05:54:30 | At the coordinator's request, evaluator inspected the frozen public A42 tests and documented rejection interfaces. This occurred after the original and expanded runs. |
| **2026-11-01 05:54:48.338** | C17 lineage-rejection supplement completion: 22 recorded assertions, zero mismatches, case still partial/unsupported for actual accepted renewals. This supplement had visibility into A42's implementation tests; it is not a new unseen scenario. |
| 2026-11-01, approximately 05:56:48 | Readable report and sanitized technical evidence successfully saved to Library. They did not overwrite the original private evidence. |
| 2026-11-01, after 05:57 | Coordinator reports that case/report contents were disclosed to the implementation worker only after its 05:57 message, after freeze and the recorded executions. This is the coordinator's account, not an independently obtained access log or worker transcript. |

The exact immutable commit was therefore identified and verified **before the first challenge execution**. This establishes what code was executed and the recorded ordering. It does not independently certify the implementation worker's internal freeze procedure or remote CI. No implementation edits occurred between evaluator runs; the checkout remained clean at the same SHA.

## Original first-pass results, without replacement by later outcomes

| Case | Original recorded status |
|---|---|
| C01 | PASS |
| C02 | PASS |
| C03 | PARTIAL_OR_BLOCKED |
| C04 | PASS |
| C05 | PARTIAL_OR_BLOCKED |
| C06 | PARTIAL_OR_BLOCKED |
| C07 | PASS |
| C08 | PASS |
| C09 | PASS |
| C10 | PASS |
| C11 | PARTIAL_OR_BLOCKED |
| C12 | PARTIAL_OR_BLOCKED |
| C13 | PASS |
| C14 | PARTIAL_OR_BLOCKED |
| C15 | ADAPTER_ERROR |
| C16 | PARTIAL_OR_BLOCKED |
| C17 | PARTIAL_OR_BLOCKED |
| C18 | PARTIAL_OR_BLOCKED |
| C19 | PARTIAL_OR_BLOCKED |
| C20 | PASS |

**C15 harness failure:** `TypeError: Cannot read properties of undefined (reading 'cashBreach')`. The original adapter closed 1 January 2027, a configured holiday, then assumed a business-day observation existed. This was an evaluator error, not an implementation failure. Its raw error and partial preceding assertions are retained.

The initial C14 adapter used a principal-bearing fixture, so its attempted interest-related sequence did not faithfully exercise the intended principal-first situation. It explicitly recorded a limitation rather than a pass. C03 initially advanced across quarters without complete schedules; C12 did not exercise the specified quarter-boundary placement. These were genuine initial coverage limitations, not successful unseen tests subsequently relabeled.

## What changed after that first execution

No implementation source or sealed semantic case/expected-outcome file was changed. The following **adapter and assessment changes did occur**, transparently:

- **C03:** supplied the stated historical cap/expiry checkpoint, tested a headroom rejection inside an active quarter, and added intervening quarter closures/computations for the eight-quarter reporting check.
- **C12:** constructed a business-day sequence with the quarter boundary exactly between the sealed indices, instead of the original non-boundary sequence.
- **C14:** replaced the auxiliary principal-bearing account with an identified zero-principal contractual-interest account, and executed the complete partial-payment, withdrawal, queued-payment and deadline-settlement sequence. These are changed executable fixture details, although the sealed R/T, payments and expected final amounts were unchanged.
- **C15:** moved the unspecified test-day placement to actual business days. The sealed amounts, ratio boundary and expected breach results did not change.
- **C16:** retained the actual redemption/queue/fallback checks; clarified that an external segregation label is not a monetary posting. No fictional API call was invented.
- **C18:** added three separate complete-quarter histories for the partial-quarter, one-day-excess and clean-quarter conditions. This did not supply a connected accounting trajectory, so the case remains partial.
- **C19:** narrowed the claim to the requested absence-of-new-act rejection and synthetic disclosure contents; did not claim a production privacy guarantee or implement a new-act override.
- **C11, later expansion:** supplied dated GDP/price releases and a tranche schedule, checking first verified target, unchanged allowance after late GDP, missing-price disclosure, and subsequent vintage use. The annual-rate-versus-stock-target ambiguity remained explicitly unpassed.
- **C17 supplement:** exercised the documented unsupported relabel/roll requests and verified safe atomic refusal, persistent identity and old-episode continuation. This followed inspection of the public A42 tests. Accepted contractual renewals remain outside the implemented feature set.

These corrections improved or clarified coverage against the **same code**, not the policy's parameters. They are not proof of a fully frozen preimplementation executable test suite. They should be described as **post-first-run adapter corrections and supplementary checks**, never as an unchanged first-pass harness or newly independent unseen cases.

The two invalid/ambiguous sealed scenarios were not rewritten: C05 failed to distinguish a fixed reset target from a balance-at-effective-date target; C06 required issuance incompatible with the annual growth ceiling. They remain non-passes. C18's missing integrated accounting path likewise remains a limitation rather than an implementation failure.

## Hashes and recoverable evidence

### Source identity

- **Original 20-case semantic challenge:** SHA-256 `7460abe7abb0a376b140a0690346b3d1950b7238d8895dbb1939b56a4f46fbe0`.
- **Private source text extraction:** SHA-256 `084ea421d9dfc25653f6e61a50050fb5996e2d621489baacc9ad9826d6b79739`. This identifies the saved text extraction, not a claimed byte-for-byte original-document download. The source manuscript is not distributed with the technical evidence.
- **Frozen Git bundle:** SHA-256 `d8664d087326032538f780f94aef69964ad544e9ed6e05b456ac4e28b5061137`; size 167281 bytes; exact commit shown above.

### Original adapter and execution records

| File | SHA-256 of retained original |
|---|---|
| `run.mjs` | `d6d73c1524e020aeb14f8a3361ddff7573b5e88497da862292a45d7d3ba44781` |
| `first-run.json` | `b0db4fb86b8c91688b2c47c9c3f64353448910d5fad931bc6bef715647421b2f` |
| `first-run.stdout` | `0133f913d5e478a46103212b78c211a577b456d103c41c09232af0587803f774` |
| `run-corrected.mjs` | `c65f28fdb4ad03c988fea29911dcf60adc83f0d623b5acf47bfed8e5cf9715c5` |
| `corrected-run.json` | `bdb73632737280f32c74a15a60a47c53a75b93b7df25b2b2d2881a5bffe0d940` |
| `run-final-adapter.mjs` | `ef952abdf20d86e014763c41ac26596087d65e8eed4e0d1c160c5745220cac53` |
| `final-adapter-run.json` | `a3707203e3b9cb6f6a1d99d67608f1c2c7d2da67f056c7615fe80e5477c4851c` |
| `run-lineage-supplement.mjs` | `0b770433d48f6babbb78bdce7596b36fd2dc21a3651a3243e4c4591b0eb8a5a7` |
| `lineage-supplement.json` | `baf37ce09fcaf6b19219b4499d2db805d9db2be071400152d56cd21aff49e70f` |

The already-delivered **Technical-evidence-8cdf3e2.tar.gz** contains the sanitized original first pass at:

- `technical-evidence/private_evaluation/first-run.json`
- `technical-evidence/private_evaluation/first-run.stdout`
- `technical-evidence/private_evaluation/run.mjs`
- `technical-evidence/REDACTION-MANIFEST.json`

Only the internal workspace path in the original error stack trace was redacted in the distributed JSON. Its distributed SHA-256 is **`036cb21b3fe58acdafe41fc04a7a72e163d83ccac71fb24199689a106bd260e0`**; the original hash above remains separately retained. No result, scenario quantity, assertion or error message was removed. The artifact also contains all later versions and outputs, not a replacement-only success record. The archive SHA-256 is `4c072b797818db2c5adaade92fab8cd1ea45e5e4ff0162145f80af6b3abd2996`.

## What may and may not be concluded

The defensible provenance claim is that **a separately authored, pre-sealed semantic challenge was withheld from the implementation worker by workflow, then evaluated against an identified frozen commit; the original mixed/incomplete first pass and later evaluator corrections are preserved**.

Do not claim:

- 15 or 20 passes on the original first execution;
- cryptographically proven blindness or independently audited separation;
- an externally authored professional audit;
- a completely pre-frozen executable harness or no changes to operational test fixtures;
- that partial, invalid or unsupported cases passed;
- that 196, 248, 279 and 22 assertions are additive distinct scenarios;
- that these results establish economics, legal validity, remote CI or production readiness.

The later result supports consideration as a limited research release candidate, not unconditional conformance or merge approval. Author review of this chronology and its limitations is still required before any book/website citation is revised.

---

## Dated erratum — 1 November 2026, 06:19 UTC: C06 classification

The earlier statement that sealed C06 required issuance incompatible with the 4% annual path-growth ceiling relied on an **unstated evaluator assumption that the starting path equaled500**. The sealed case gives R=500 and prior-quarter R=500, but **does not give the starting path**. C06 is therefore **underspecified/ambiguous, not proven invalid** under the adopted growth rule.

The paper caps annualized **path growth**, not issuance or money-stock growth. With a prior path500, maximum next-quarter path is approximately504.926703; with the .5 facility draw, R would reach approximately505.426703. But an already-established path549.5 with zero growth permits allowance49.5; adding the .5 draw yields R550. The latter is an illustration of the missing assumption, **not an adopted replacement scenario or a rerun**.

The two-case “invalid/ambiguous” non-pass category remains unchanged, but C06 belongs on its **underspecified/ambiguous** side. No implementation failure is established. The original sealed specification, original execution inputs/results, adapter history and machine evidence remain unchanged. This appendix corrects the evaluator's interpretation without overwriting the historical record. Author decisions on reset authorization and explicit growth/path interpretation remain pending; no testing or implementation changes have resumed.
