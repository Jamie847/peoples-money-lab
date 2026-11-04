# Accounting Acceptance Cases for Design Paper 0.7.2

31 October 2026 — frozen public acceptance specification, 48 visible cases

**Status: frozen specification for a draft implementation pull request.** These cases are author-approved operating rules under test. They are not implementation results, independent held-out challenges, economic validation or approval to merge. The specification is committed separately before implementation; its public-file SHA-256 is recorded alongside it. The draft implementation must be frozen before a separately authored unseen challenge is run. No challenge cases are included here.

## Source provenance and implementation inputs

The October 31 Design Paper 0.7.2 was directly inspected, including its ten adopted operating rules. The author subsequently confirmed a correction to the flow identity and alignment of these acceptance cases. A corrected full-paper export has not yet been independently inspected. The implementation must distinguish that inspected source from the author-confirmed correction; reconcile a later corrected export and raise any material discrepancy before merge. The private paper and private provenance identifiers are not distributed here.

The confirmed correction is:

`F = new facility lending − settled principal repayments against P − settled recoveries against U`

Outside an authorized statutory reset, `F = Δ(P + U)`. A transfer from P to U is not a money flow. Retain `ΔR = actual rule issuance + F − H − C`, where H is the specified facility-interest withdrawal and C is conversion-claim repayment. Distinguish issuance actually credited from an unspent allowance whenever timing is tested. Financial recovery of a previously recognized loss increases net worth once, without a second monetary drain.

Replacement bill sales are demand-dependent: the adopted operating rules supersede earlier rollover guarantees. Late data affects future computations only; no issuance precedes the first verified target. Residual reductions require cash recovery or an explicitly authorized statutory reset. A growing path or denominator does not itself recover a loss.

Case identifiers A01–A46 are preserved. The author-confirmed additions are weekly overhang disclosure in A47 and continued payment of an already-fixed allowance during missing data in A48. A10 begins only after two consecutive short auctions. The specification is visible to the implementer and must never be described as held-out evidence.

## Common fixtures and assertions

- Use exact money arithmetic and an explicit rounding convention. The small examples below use exact units and do not resolve production distribution rounding.
- Freeze the scenario inputs, event order, source-document version and configuration alongside each case. Money-stock and cap denominator snapshots are separate named fields.
- Use the published federal business-day calendar for cash deadlines. In the specifications below, day 0, day 1 and day 5 refer to that calendar, not elapsed calendar days. At least one fixture must cross a weekend and one a published holiday.
- After every settled event assert R = M + B + T, counterpart entries balance, and stocks that cannot be negative remain nonnegative.
- Track allowance, credited issuance and remaining allowance separately; remittances cannot exceed or add to the allowance.
- Check the conditional deviation bound within its proof epoch. Do not silently carry a bound across a statutory reset without validating the new epoch's initial condition.
- Failed validation must leave balances, allowances and proof-epoch state unchanged. A separately recorded rejection diagnostic is allowed.
- Public reporting assertions inspect an exported report, not private engine state alone.
- Unless specified otherwise, suppress unrelated flows and use a flat path. Cases are accounting examples, not economic forecasts.

## G1 Emergency cap expiry

| Case | Setup and events | Expected result |
| --- | --- | --- |
| A01 Residual overhang and zero allowance | Path100; emergency lending5; cash repayment1; final legal discharge4. Expire emergency authority, then run eight quarters with no other flows. | R104, P0, U4. Ordinary headroom uses 2% of the specified prior-quarter R. No new draw admitted; issuance0; no automatic reset. Escalation reported at eight quarters. |
| A02 Failed vote or accounting impairment | Apply a proposed vote, failed vote or accounting write-down to A01. | R, U, exposure and headroom unchanged. The vote/impairment is reported without being mistaken for cash recovery. |
| A03 Growing denominator | Continue an otherwise valid scenario until a prior-quarter R makes the ordinary cap cover E. | Lending resumes only within actual headroom. Report room restored, not principal recovered; U does not fall merely because the denominator grows. |
| A04 New draw at the boundary | E equals the applicable cap exactly. Attempt a positive draw. | Reject: the absence of an overhang is not positive headroom. |

## G2 Auctions and direct sales

| Case | Setup and events | Expected result |
| --- | --- | --- |
| A05 Oversubscription and coupon | Offer10 at par; qualifying bids8 at4% and6 at5%; maximum6%. | Award8 and2, total10. Uniform coupon5%; buyers pay principal at par. Settlement moves10 from M to B and conserves R. |
| A06 Marginal ties | Offer10;8 qualify below the margin; two equal-size bids tie for the remaining2. | Each tied bidder receives1. Total award never exceeds10. |
| A07 Ceiling | Submit a bid above6%. | Bid is excluded without affecting B. The6% figure is a provisional policy input, not an economic finding. |
| A08 Award versus settlement | Award10 but only6 settles. | B increases6, M decreases6, R unchanged. The remaining4 is not parked money. Report intended withdrawal, actual withdrawal, maturities, shortfall and its duration. |
| A09 Consecutive short auctions | Run short/short/short and separately short/full/short. | Direct window opens after the second consecutive short auction; review after the third. An intervening full auction breaks the consecutive sequence. |
| A10 Retail limit and rate | Establish two consecutive short auctions to open the direct-sale window. In one variant the second has a known clearing coupon; in another it accepts no bid. | Window uses that clearing coupon, or6% when nothing cleared. Settled retail sales cannot exceed the remaining authorized quantity; no auction/retail double counting. |
| A11 No buyers and maturity | No qualifying settled purchase occurs while existing bills mature. | Matured principal returns B to M. Report actual B below target; no phantom buyer, no suppressed maturity and no Authority self-purchase. |

## G3 Par instrument lifecycle

| Case | Setup and events | Expected result |
| --- | --- | --- |
| A12 Reject discount form | Submit a transaction whose paid principal differs from its face amount under a discount convention. | Reject before any financial-state mutation. |
| A13 Par lifecycle | Settle a valid par issue, pay its stated interest from T, then redeem principal from B. | Three separate counterpart-balanced events. All conserve R; interest and principal are not counted twice. |

## G4 Cash breaches and dividends

| Case | Setup and events | Expected result |
| --- | --- | --- |
| A14 Consecutive trigger | Six consecutive business-day closes with T above3% of R. | Sixth close is a violation and remedy day0. Earlier closes remain in history. |
| A15 Rolling trigger | Repeat four breached closes then one compliant close until the eleventh breached close within60 business days. | Eleventh breach triggers the rolling violation even though the consecutive maximum was not crossed. A compliant day or quarter boundary does not erase history. |
| A16 No debt and no issuance | R100, T4, redeemable debt0 and issuance allowance0; a remedy opens. | A settled dividend1 gives T3, M+1, R100. No new issuance is booked or authorized. |
| A17 Remedy deadline | Open a remedy at day0 and settle it at close of business-day5; separately settle at day6. | Day5 is on time. Day6 misses the deadline; later cure does not erase the failure. Include weekend and holiday fixtures. |
| A18 No restarting the clock | Additional breaches occur while A17's remedy remains open. | Original deadline remains. No second overlapping instruction causes duplicate payment. Every breach close remains recorded. |
| A19 Live amount | Start from A16; R falls to99 while T remains4 before settlement. | Recalculate remaining excess as1.03; T2.97 after settlement. Paying only the stale1 does not count as a complete cure. |
| A20 Partial and queued payments | Queue1 without crediting it; separately settle a partial amount before a later settlement. | Queue alone changes neither T nor cure status. Each actual credit changes T and M; subsequent amount reflects remaining live excess. Cure requires the prescribed compliant daily close. |
| A21 Quarter-end obligation | R100 and T2 at quarter-end; no qualifying disbursement during the next quarter. | Dividend1 is credited by the existing following-quarter deadline. There is no added five-business-day grace and no substitution of the3% threshold. |
| A22 Qualifying disbursement | Track the quarter-end excess obligation and qualifying spending or debt redemption before its deadline. | Count each qualifying disbursement once against that obligation. Only the remaining undisbursed part requires the supplement. Segregation alone is not disbursement. |
| A23 Preventive deferral | A proposed within-quarter deferral would recreate excess when paid at quarter-end. | Do not treat that deferral as an allowable cure. The monthly/quarterly record must not conceal a missed or recreated breach. |
| A24 Remedy completion and later violation | Complete the current remedy at a compliant daily close, then incur a later violation under retained rolling history. | A new remedy may open for the later violation. Completing the earlier remedy does not reset the60-business-day history. |

The intraperiod dividend amount is computed from current settled T and R. The quarter-end case separately tracks the obligation created by the quarter-end measurement, using the adopted deadline and crediting convention. Do not silently replace one rule with the other.

## G5 Measurement boundary

| Case | Setup and events | Expected result |
| --- | --- | --- |
| A25 Intraday versus close | T is above3% intraday but below it after final settlement; separately leave it above at close. | Only the latter is a breached daily close. This test establishes no guarantee about continuous intraday compliance. |
| A26 Facility draw | Attempt an over-cap draw that would be repaid before the same daily close. | Reject at draw time; end-of-day repayment cannot legalize the draw. |

## G6 Recoveries and the corrected flow identity

| Case | Setup and events | Expected result |
| --- | --- | --- |
| A27 Ordinary principal repayment | Repay1 of an unimpaired facility asset with carrying value sufficient to cover it. | P and R each fall1; F−1; loan asset falls1. No loss-recovery income is manufactured. |
| A28 Impaired but not discharged | Fully written-off asset, P4/U0; recover1 in actual money. | P3/U0, R−1, F−1; recognize financial loss recovery once. No need to transfer the loan to U before recognizing recovery. |
| A29 Recovery after discharge | R104, P0, U4, loan carrying value0; settle principal recovery1. | R103, P0, U3, F−1. With unrelated assets omitted, net worth−104→−103. No second monetary withdrawal is booked as income. The identity and exposure bound reconcile. |
| A30 Legal discharge alone | Move unrecovered legal principal from P to U without cash. | P falls and U rises equally; E, R and F unchanged. Any financial write-off is separate. |
| A31 Excess and duplicate recovery | Recover more than a loan's remaining principal/residual; separately replay the same receipt identifier. | Allocate principal only up to the remaining balance, then the specified interest/penalty waterfall. Never make P/U negative. Reject a duplicate receipt without repeating its monetary or financial effect. Verify any nonprincipal withdrawal against its explicit ledger category. |
| A32 Collateral | Take collateral into possession without receiving public money; later sell it and settle proceeds. | Possession alone reduces neither R nor exposure. Report gross proceeds, costs and net cash separately; only actual eligible settled recovery changes P/U and R. Financial asset reclassification is not forbidden by this test. |
| A33 Recovery remittance | Recognize loss-recovery income when ordinary issuance allowance is0. | Income recognition does not authorize a remittance above the allowance or create an extra issuance flow. |

A29 uses the explicit user-confirmed corrected definition of F recorded above. The older directly inspected export did not state that definition consistently; no claim is made that its text already did.

## G7 Statutory reset and proof epochs

| Case | Setup and events | Expected result |
| --- | --- | --- |
| A34 Invalid reset | R104, path100, P0/U4; request U0 with path100. | Reject the entire staged reset. Path, U, E, proof epoch and allowance all remain unchanged. |
| A35 Valid authorized reset | Same state, authorized boundary reset to path104/U0. | New initial deviation0 satisfies the bound. Record authority, old and new epochs, enactment date and effective date. No current-quarter allowance is retrospectively changed. |
| A36 Mid-quarter enactment | Enact a valid reset mid-quarter for the next boundary. | Old rules/allowance continue until the boundary. Stage and validate the new state atomically; no spending of both old and new allowances. |

## G8 Data availability and brake operation

| Case | Setup and events | Expected result |
| --- | --- | --- |
| A37 Successive available readings | Available above-threshold reading, missing quarter, available above-threshold reading. | Trigger after the second available high reading, with the missing interval disclosed. Do not describe these as consecutive calendar-quarter readings. |
| A38 First target unavailable | No previously verified target exists. | No issuance before a verified target. Record unavailable input explicitly rather than fabricating an estimate. |
| A39 Late release and revisions | GDP release arrives after a quarterly allowance was fixed; also supply upward/downward later revisions and independently missing CPI/PCE observations. | Apply each series' adopted vintage and future-computation rules. Do not rewrite past issuance or alter the fixed current allowance. Published records identify the actual series and vintage used. |
| A40 Active brake and failed rollover | Active brake encounters a missing reading while replacement bids fail and bills mature. | Keep previous target B*, not an invented actual stock. Existing bills mature; eligible replacement sales are attempted; actual B and shortfall reflect settlement. |

## G9 Emergency restart

| Case | Setup and events | Expected result |
| --- | --- | --- |
| A41 Complete calendar quarter | Use an explicit quarter, such as1January–31March2027, with no emergency-tagged loan outstanding and E includingU within the daily ordinary cap throughout. | A new episode may begin only after the entire qualifying quarter, subject to all other adopted authority requirements. |
| A42 Relabeling and interruption | Roll or relabel an emergency loan; separately exceed ordinary exposure during the candidate quarter. | Persistent episode identity blocks a false clean quarter. A disqualifying day means that quarter does not qualify. |
| A43 Exhausted authority | Recertify without a completed clean quarter after the old365-day limit. | Continue the old episode's clock; reject lending that requires expired authority. A new legislative change, if present, must be explicit and preserve prior history. |

## Overdue reporting

| Case | Setup and events | Expected result |
| --- | --- | --- |
| A44 Maturity and partial repayment | Loan passes due date unpaid, then partly repays. | Weekly public report shows remaining overdue principal and age. Maturity does not reduce P. |
| A45 Discharge and later recovery | Discharge an overdue legal balance intoU, then settle a recovery. | Report the residual separately and reconcile totals to P/U without counting a discharged balance as live legal principal. |
| A46 Reporting cadence | Generate weekly register alongside required daily usage and24-hour action disclosures. | Weekly reporting supplements rather than replaces the faster records; no unnecessary private data appears. |

## Additional cases preserving existing identifiers

| Case | Setup and events | Expected result |
| --- | --- | --- |
| A47 Weekly G1 overhang report | Begin with an emergency-cap expiry overhang: R104, P0, U4, with the ordinary cap using the required prior-quarter R. Generate dated weekly public reports while the overhang persists; separately reduce exposure by actual cash recovery and restore headroom by growth of the denominator. | Every weekly report exposes P, U, E, the applicable cap and denominator snapshot, the positive overhang amount and the active lending freeze. Reports continue while overhang remains. The report distinguishes cash recovery from room restored without recovery; neither condition silently resets U. Verify through exported reports, not private engine state alone. |
| A48 Fixed monthly tranches during missing data | Compute a valid quarterly allowance of3 from verified inputs, with three monthly tranches of1. After the first tranche, mark the relevant new price data unavailable while that already-fixed allowance remains in effect. Use otherwise compliant Treasury cash and suppress unrelated flows or independent deferral triggers. | The remaining two scheduled tranches still credit1 each; cumulative quarterly issuance is3, never above the fixed allowance. Missing data neither cancels nor recomputes that existing allowance. The unavailability is disclosed and governs future computations under the stale-data rule; it does not create an extra allowance. This differs from A38, where no verified target existed in the first place. |

## Freeze and implementation gate

1. Preserve the source provenance above and record the exact acceptance-case version, calendar fixture and configuration. The provisional 6% and 10-in-60 remain policy inputs, not empirical findings.
2. This specification is frozen in an acceptance-only commit before implementation. The work proceeds in a draft pull request, not a direct merge. Freezing the specification does not imply implementation or a passing result.
3. Retain the original baseline and first-pass evidence. Freeze the implementation commit before a separately authored challenge set unseen by the implementer is revealed or run. Repairs and reruns must not overwrite the first result.
4. **Do not merge until that unseen challenge has run against the frozen implementation.** Record its outcome and any remaining failures or conditions; completion of visible acceptance tests does not substitute for it.
5. Compare the corrected full-paper export when supplied and flag material discrepancies before merge. Update book claims only for demonstrated results. Accounting acceptance is not an economic simulation, legal opinion, payment-security assessment or professional audit.
