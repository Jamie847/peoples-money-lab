# A01-A48 visible acceptance coverage

Frozen for an independent challenge; these visible cases are not held-out evaluation. PASS is limited to the listed visible assertions, not economic validation. Unresolved or unsupported paths remain explicit.

| Case | Status | Evidence / limitation |
| --- | --- | --- |
| A01 | PASS | Exact emergency expiry and eight-quarter no-reset trace. Tests: `A01 exact` |
| A02 | PASS | Votes and impairment cannot cancel residual. Tests: `A02 proposed` |
| A03 | PASS | Headroom restored by denominator growth; U unchanged. Tests: `A03 denominator` |
| A04 | PASS | Positive draw at zero headroom rejected. Tests: `A04,A26` |
| A05 | PASS | 8+2 awards and uniform coupon. Tests: `A05-A07` |
| A06 | PASS | Equal marginal ties pro rata. Tests: `A05-A07` |
| A07 | PASS | Above-ceiling bid excluded. Tests: `A05-A07` |
| A08 | PASS | Awards and actual settlement separated; rejection atomic. Tests: `A08:` |
| A09 | PASS | Consecutive short sequence and full-auction reset. Tests: `A09:` |
| A10 | PASS | Author-approved latest-window limit, binding reservations, original settlement terms, known/absent clearing rates and atomic excess rejection. Tests: `A10 amended` |
| A11 | PASS | No phantom demand; principal maturity settles. Tests: `A11-A12:` |
| A12 | PASS | Discount instrument rejected before posting. Tests: `A11-A12:` |
| A13 | PASS | Par issue, contractual-input interest and maturity separate. Tests: `A13:` |
| A14 | PASS | Sixth business close opens remedy. Tests: `A14,A16-A18:` |
| A15 | PASS | Eleventh rolling breach triggers without consecutive violation. Tests: `A15,A24:` |
| A16 | PASS | Dividend moves T to M with zero issuance and no debt. Tests: `A14,A16-A18:` |
| A17 | PASS | Day five on time; day six late; holiday and weekend crossed. Tests: `A14,A16-A18:` |
| A18 | PASS | Open remedy retains deadline across later breaches. Tests: `A14,A16-A18:` |
| A19 | PASS | Live R99 makes total cure 1.03. Tests: `A19-A20:` |
| A20 | PASS | Queue does not settle; partial credits reconcile. Tests: `A19-A20:` |
| A21 | PASS | Quarter obligation keeps following-quarter deadline. Tests: `A21-A22:` |
| A22 | PASS | Qualifying spending credited once against obligation. Tests: `A21-A22:` |
| A23 | PASS | Quarter-end recreating deferral rejected at proposal and settlement; within-month schedule tested. Tests: `A23 preventive` |
| A24 | PASS | New remedy opens under retained rolling history. Tests: `A15,A24:` |
| A25 | PASS | Only closing cash breaches count. Tests: `A25:` |
| A26 | PASS | Cap enforced at attempted draw. Tests: `A04,A26` |
| A27 | PASS | Unimpaired principal repayment produces F-1, no recovery income. Tests: `A27:` |
| A28 | PASS | Impaired legal-principal recovery restores prior loss once. Tests: `A28:` |
| A29 | PASS | R104/P0/U4 becomes R103/P0/U3; net worth -103. Tests: `A29:` |
| A30 | PASS | Discharge changes P/U, not R/F. Tests: `A30-A31:` |
| A31 | PASS | Recorded contractual interest and penalties enter H once; principal/residual only enter F; excess and duplicate receipts rejected atomically. Tests: `A31 amended`, `A30-A31:` |
| A32 | PASS | Noncash possession does not recover; net settlement reconciles gross and costs. Tests: `A32:` |
| A33 | PASS | Recovery income cannot exceed issuance allowance. Tests: `A33:` |
| A34 | PASS | Invalid reset rejected atomically. Tests: `A34-A36:` |
| A35 | PASS | Authorized boundary reset records dates and new proof epoch. Tests: `A34-A36:` |
| A36 | PASS | Mid-quarter enactment stages future reset; old state retained. Tests: `A34-A36:`, `Staged boundary reset` |
| A37 | PASS | Missing reading does not break sequence of available gaps. Tests: `A37-A40:` |
| A38 | PASS | No first verified target means no allowance. Tests: `A38:` |
| A39 | PASS | GDP annual revision gate, delayed releases, independent price availability and public vintage records. Tests: `A39 GDP`, `A39 independent`, `A39 integrated` |
| A40 | PASS | Active brake target persists; failed replacements and maturities affect actual B. Tests: `A40 active` |
| A41 | PASS | Complete clean calendar quarter enables new episode. Tests: `A41-A43:` |
| A42 | PASS | Adversarial rollover/relabel requests are rejected atomically; financial state and persistent lineage stay unchanged, quarter remains disqualified, recertification retains the original clock and its hard stop. No actual contractual renewal is admitted. Tests: `A42 loan` |
| A43 | PASS | No clean quarter retains original clock; exhausted authority rejected. Tests: `A41-A43:` |
| A44 | PASS | Partial overdue repayment reduces balance without resetting age. Tests: `A44 overdue` |
| A45 | PASS | Discharged residual and recovery reconcile without overdue-principal double count. Tests: `A45 discharged` |
| A46 | PASS | Weekly register supplements daily and immediate action records. Tests: `A46 weekly` |
| A47 | PASS | Cash recovery reported separately from denominator room restoration. Tests: `A47 weekly`, `A03 denominator`, `A44-A47:` |
| A48 | PASS | Fixed scheduled payments continue after missing data; no additional allowance. Tests: `A48 scheduled` |

Counts: PASS 48.

Regenerate with `npm run acceptance:072`. Machine-readable results are generated in `reports-072/acceptance-results.json`. The frozen SPECIFICATION.md and its hash are unchanged.
