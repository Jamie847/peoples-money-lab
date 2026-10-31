# Independent accounting engine evaluation specification

Prepared 31 October 2026 against Design Paper 0.7.1. This is an evaluation specification, not an implementation, a policy amendment, or an economic forecast. Keep it separate from the implementation team until the first baseline commit and its ordinary regression suite are frozen. Once revealed and used to repair software, these cases become regression tests rather than fresh held-out evidence.

## Scope and source anchors

This is a public, independently authored specification of the candidate design 0.7.1 accounting rules used for evaluation. The original frozen specification has SHA-256 `0eea163f953986126ad1f4244d05b4cc23ce66dbb76430aba38b531db111c2ee`. This sanitized presentation changes provenance labels, not scenarios or expected results. It does not distribute the private manuscript or source paper.

Relevant provisions: §4 data vintages and three monthly issuance tranches; §4a definitions, Treasury cash rules, measured quarterly allowance, stock-flow identity, exposure and denominator overhang; §5 bill auctions, interest, maturity and floor; §6 facility maturity and collateral; §9 conversion claims; §11 emergency expiry. Section references identify the candidate design provisions, not a claim that the private source document is included in this repository.

These tests extend the earlier quarterly examples. In particular, they do not assume that all bills mature together, that auctions always clear, or that Treasury receipts and spending occur simultaneously.

## Evaluation conventions

- All amounts are synthetic units. Decimal amounts below are exact rationals; use exact arithmetic or disclose a numerical tolerance small enough not to erase a 0.001-unit violation.
- `R = M + B + T`; `L` is the rule target, avoiding confusion with legal principal `P`; `E = P + U`; positive deviation is `D = max(0, R − L)`.
- Ordinary cap is `0.02 × prior-quarter R`, fixed throughout that quarter. Emergency cap is `0.05 × prior-quarter R` while the emergency is valid. Current-day R must not silently replace the frozen denominator.
- Let `A` be the computed quarterly issuance allowance and `J` cumulative actual Treasury credits. `0 ≤ J ≤ A`; period identity uses **actual credits**, not an unspent allowance. If the implementation also requires full quarterly payout, it must separately test that requirement and expose a conflict with cash or settlement restrictions.
- For calendar cases, `d1…d6` are consecutive business days. The supplied synthetic business-day calendar is a test assumption, not a proposed statutory holiday calendar. Count daily closes unless an intraday variant explicitly says otherwise. Whether the source requires a different observation convention is a policy question, not something a test should conceal.
- An invalid requested event must be rejected before mutation, with an intelligible reason and unchanged ledger. A harness can PASS by correctly rejecting it. Distinguish this from a ledger path that actually violated an invariant (FAIL).
- POLICY_UNDEFINED is a substantive outcome. Arithmetic may balance while legal permission, timing, or a required response remains undefined. Do not turn it into an unconditional PASS.
- After every settled event, check each sector's balance sheet, matching claims, nonnegative cash/asset quantities, and the applicable money identity. Negative equity alone is allowed. Rejected events cannot leak postings.

### Reusable balanced opening fixture

Unless a case overrides them, use `M=98, B=1, T=1, R=100, L=100, P=0, U=0`, conversion claim `C=100`, and bank circulating cash `m_bank=10`.

A general fixture for any specified M/B/T/P/U uses: Authority assets conversion claim C and facility carrying value P, liabilities M/B/T, equity `C+P−R`; bank assets cash 10 and customer loans 100, liabilities conversion C and facility P, equity `110−C−P`; Treasury assets cash T and parked balance B, liability bills B, equity T; public assets circulating cash `M−10` and bills B, liability customer loans 100, equity `M+B−110`. These four balance sheets reconcile and their financial net worth sums to zero. U is an exposure memorandum, not a second asset or money liability. For an impairment, introduce a separate carrying-value allowance without changing unpaid legal P.

All supplied opening states are test fixtures, not empirical national accounts. The evaluator must state any extra eligibility or collateral assumptions necessary to permit a facility draw.

## Treasury cash cases

### H01 Exact threshold and fifth versus sixth business day

Start `R=100, M=96, B=1, T=3`; other fixture fields unchanged. On d1 collect tax 0.1: `M=95.9, T=3.1`, R unchanged. Hold through d5. Variant A disburses 0.1 on d6 before its close: `T=3, M=96`. Variant B holds 3.1 through the d6 close.

Expected under the declared daily-close convention: five above-threshold closes are permitted; A ends the streak and does not violate the five-day limit; B violates it on d6. A close at exactly 3% is not above 3%. Crossing 3% is still a reportable breach even when cured in time; compliance with the cure window is not proof that no breach occurred. Candidate design §4a.

### H02 A quarter boundary cannot erase a consecutive-day streak

Use H01's state above 3%. d1 is the penultimate business day of Q1 and d2 its last; d3–d6 are the first four business days of Q2. No flows. The 3% streak must reach six on d6, not reset to four at the quarter boundary. Record the separate quarter-end 1% excess and its later cure deadline. The two obligations coexist.

### H03 A falling denominator triggers a breach without Treasury receiving money

Start `M=96, B=1, T=3, R=100, L=100`. On d1 the bank pays a conversion claim installment of 1 from its cash: `M=95, B=1, T=3, R=99`, bank cash 9, conversion claim 99. Treasury ratio is now `3/99 > 3%`, so the breach clock starts. It must not look only for credits to Treasury. A tax or spending cycle cannot change R; this conversion repayment does.

### H04 Quarter-end 1% rule and promised cure

At Q1 end use `M=97.8, B=1, T=1.2, R=100`. The source says both `T ≤ 1% of R` at quarter-end and that an excess must be disbursed by the end of the following quarter. Report the measured excess 0.2 and cure deadline rather than silently treating the quarter as unconditionally compliant. At Q2 end, variant A spends 0.2 (`T=1`) and variant B does nothing (`T=1.2`). B misses the explicit cure; A cures the original excess.

POLICY_UNDEFINED: whether the initial excess is an allowed temporary exception, a violation with a remedy, or a different formal compliance status; whether the amount to cure is frozen or recalculated as R changes. Do not resolve that legal drafting ambiguity by renaming it PASS.

### H05 Repeated resets expose a limitation of the written rule

Repeat three cycles: T=3.1 for four business-day closes, then T=3.0 for one close, R fixed at 100 throughout by taxes/spending. Each individual streak obeys the literal five-consecutive-day limit. Expected: no invented cumulative prohibition, but report 12 of 15 closes above the threshold and all three breaches. This is a design limitation demonstrated by an allowed trace, not an arithmetic failure.

## Issuance and exposure cases

### H06 Drains do not enlarge the already fixed quarterly allowance

Prior-quarter R=94, current target L=100; start `M=92, B=1, T=1`, so A=6. Credit monthly tranches of 2, 2, and 2. After each credit Treasury spends the same amount, keeping T=1. Between the second and third tranches, the bank repays 2 of its conversion claim.

Expected terminal `R=98, M=96, B=1, T=1`, C=98 and J=6. The extra 2 shortfall is eligible for the next quarter's measurement, not an extra current-quarter tranche. An attempted fourth credit of 2 must be rejected. This catches a superficially well-balanced engine that silently refills drains within the same quarter.

### H07 Zero allowance prohibits remittance even with income available

Start `M=99, B=1, T=1, R=101, L=100, P=1, U=0`; prior R=101 and reported prior net income=7, therefore A=0. Attempt a 0.5 remittance to T. Expected rejection with no mutation. Retaining income does not erase exposure or money. Reject any bookkeeping label that lets remittance bypass J≤A.

### H08 Denominator overhang and repayment headroom

Prior R=99, target L=100; opening `M=97, B=1, T=1, R=99, P=2, U=0`. The new ordinary cap is 1.98 and the source's denominator exception applies. Credit the allowance 1 and spend it, ending R=100, T=1. A draw request 0.001 remains prohibited: the cap is still 1.98, not 2.0.

Then cash-repay 0.5: R=99.5, P=1.5, E=1.5, cap still 1.98, headroom 0.48. A draw of 0.48 is permitted, giving R=99.98 and P=1.98. A further 0.001 must be rejected. Report the initial breach rather than rewriting history after cure. This tests both no-current-R denominator and exact headroom.

### H09 Emergency expiry preserves money and loss history

Start ordinary fixture at R=L=100 with emergency authorization and cap 5. Draw 5; cash-repay 1; legally discharge the remaining 4 with no further recovery. Final `R=104, M=102, B=1, T=1, P=0, U=4, E=4, D=4`. The next quarter's ordinary cap is 2.08 after expiry.

Expected arithmetic: D≤E remains true, no balance is destroyed, no automatic residual reset, and no new ordinary draw is permitted. POLICY_UNDEFINED: treatment of the 1.92 exposure excess caused by the change of cap rate, not by a fall in R. Do not silently apply the denominator-only exception or deem expiry a repayment. Distinguish 90-day expiry without extension from the 365-day hard stop after extensions.

### H10 Noncash settlement and double impairment

Start `R=102, M=100, B=1, T=1, L=100, P=2, U=0` with facility carrying value 2. Impair the asset by 1: equity falls by 1, carrying value becomes 1, but R/P/U are unchanged. A second posting of the same impairment ID must not charge another loss. An offered land transfer of value 1 must not count as public-money repayment.

For the cash-recovery variant, specify the collateral as 1 of the bank's existing customer-loan assets, sold at carrying value to another public-sector holder for 1. Bank loan assets fall by 1, bank cash rises by 1, public cash falls by 1, and the public sector gains a loan-receivable asset of 1; the underlying borrower's liability remains. The sale alone does not change R. Remit the actual proceeds to the Authority: bank cash and R decline by 1 and legal P declines by 1, to R=101/P=1. Final legal discharge of the remaining 1 moves P→U: R=101/P=0/U=1. The prior impairment absorbs the write-off; do not charge the same asset loss again. Required separate records: unpaid legal principal, carrying value, cumulative impairment and realized cash recovery. The fixture's at-par collateral buyer is a test assumption, not a guarantee of market recovery.

### H11 Contractual maturity is not cash repayment

Start with an authorized loan P=1, R=101, L=100, U=0 and legal maturity on day 90. No cash arrives. On day 91 P remains 1 and D remains 1; it must not be deleted because a timer expired. Record overdue status. POLICY_UNDEFINED if the implementation requires a specific enforcement/extension action not supplied by the paper. A new loan requires available headroom and its own eligibility; it is not automatic.

### H12 Later recovery of a legally extinguished residual

Start R=104, P=0, U=4, L=100. An unexpected cash recovery of 1 arrives after final resolution. The paper says U never falls on its own and authorizes only statutory reset, but does not specify this later recovery's legal classification or monetary posting. Expected: POLICY_UNDEFINED; do not silently lower U, call it ordinary principal repayment, or issue replacement money. Provide any candidate policy only as an explicitly separate experimental branch.

## Bill and settlement cases

### H13 Overlapping maturity lots and actual auction cash

Start `M=95, B=4, T=1, R=100`, bills split into lots a=1 maturing d1 and b=3 maturing d2. Treasury pays interest 0.1 on d1 from T to holders: M=95.1/T=0.9, R unchanged. Lot a matures: M=96.1/B=3. Auction on d1 settles actual cash proceeds 2: M=94.1/B=5. Lot b matures d2: M=97.1/B=2. T stays 0.9, R stays 100 throughout. No maturity changes the issuance allowance, and neither lot may mature twice.

Test convention: use cash principal with zero discount for these lots to isolate settlement mechanics. Real discounted bills need explicit face-value versus proceeds treatment; see H15.

### H14 Partial clearing or no bidders cannot create parked proceeds

Start `M=95, B=4, T=1, R=100`, and all old bills mature, giving M=99/B=0. Desired new stock B*=4. If actual accepted/settled subscriptions total 1, the cash ledger can show only M=98/B=1; with no accepted bids it remains M=99/B=0. R=100 in both cases.

A target is not a settlement. Never fabricate B=4, forcibly debit unwilling holders, credit Treasury, or issue money to make the auction clear. POLICY_UNDEFINED: whether partial awards are permitted, what happens after a failed fixed-quantity auction, and how an always-outstanding floor is maintained when no buyer subscribes. Balanced ledger does not mean the brake or floor target was achieved.

### H15 Discounted bills require a specified unit for B

Start R=100, M=98/B=1/T=1. A purchaser pays 0.98 for a bill promising 1 at maturity. Cash parking can increase B by only 0.98, while the debt face amount is 1. At maturity the extra 0.02 must have a stated funding/cost treatment; it cannot silently become new money or a negative parked account.

POLICY_UNDEFINED in this design version: whether bills are issued at par with separately funded coupon interest, or at discount with separately recorded face amount and discount expense; whether the B* target refers to cash proceeds or debt face. Under the explicit par-and-coupon test convention, principal paid from B and interest paid from T conserve R. Do not silently treat that simplifying convention as a source-prescribed auction rule.

### H16 Correct terminal totals cannot excuse impossible settlement order

Start T=0.05 with R=100, B=1 and M=98.95. Treasury owes bill interest 0.10; a 0.10 tax receipt arrives later the same day. Order A, tax then interest: T=0.05 at end, valid if public payer has cash. Order B, interest before tax: insufficient T at that event; reject/queue or report an explicitly defined settlement failure. Do not permit temporary T=−0.05 or use emergency lending to Treasury. The paper does not supply an intraday overdraft permission. The choice of queue mechanics is implementation policy, not monetary issuance authority.

## Rule changes and epochs

### H17 Ordinary rule updates cannot reduce the target path

Start R=L=100, E=0. An ordinary input/update requests L=99 or annual g<0. Expected rejection under the nondecreasing-path condition; otherwise D=1 with E=0 immediately falsifies the bound. A revision of already frozen first-release input must not silently change a past allowance or replay settled issuance. Correcting a computational error requires an explicit correction record, not overwriting history.

### H18 Statutory rebase is a new declared epoch, not cash repayment

Start R=104/L=100/P=0/U=4. An unapproved reset request is rejected. An explicit statutory rebase event sets L=104/U=0 while R, M, B and T remain unchanged; it creates no income, repayment, asset recovery, or money destruction. Preserve the prior epoch's history and cumulative loss disclosure.

Variant: R=99/L=100/P=0/U=2. The literal instruction to set L=R would reduce the path, inconsistent with applying the old nondecreasing-path proof across that boundary. Expected POLICY_UNDEFINED unless the legal specification explicitly authorizes and identifies a new proof epoch. A test engine must not present one uninterrupted proof over an undisclosed downward reset. Flag the same issue if a rebase is scheduled mid-quarter after some allowance was already credited: treatment of the remaining tranches must be specified rather than guessed.

## Interpretation and evaluation record

For each case retain: source version, implementation commit, fixture, event order, calendar convention, expected classification, actual postings, first failing invariant or undefined policy, and minimal trace. Invalid-event tests pass only when they reject without partial mutation. Defined scenarios must reconcile after every event, not merely at quarter-end.

The following are not evidence of macroeconomic success: meeting R identities, keeping D≤E, a balanced budget journal, or a successful auction under assumed bids. Auction demand, inflation, credit supply, collateral prices, legal enforceability, and payment access require separate evidence.

This suite is independently authored from the frozen paper and prior diagnostics. It is not a professional external audit. The initial source-level cases H09 and parts of H10/H18 revisit known boundaries with daily or sequence-sensitive expectations; they should not be advertised as wholly novel discoveries. The daily Treasury, partial-auction, discounted-bill and post-resolution-recovery cases extend areas the previous quarterly suite did not model.
