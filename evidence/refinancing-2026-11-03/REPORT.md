# Refinancing-permitted payment timing — 3 November 2026

**FAIL for the specified synthetic obligations and financing bounds.** Refinancing permission resolves the principal rollover in the full-buyer same-day case, but does not finance the primary deficit. This is a new post-disclosure sensitivity, not a rerun of the sealed challenge or economic validation. Units are arbitrary synthetic accounting units, not dollars or national magnitudes.

Inputs and controller are imported unchanged from commit `5225fccd86678e67286ae28efdfc7b988a9b6a56`; its operating controller remains the frozen 8cdf3e2 code. Opening R=110, Treasury cash=1, external ordinary debt=105. The independently computed quarterly allowance is 0.545922473052418. Three equal monthly installments settle January 4, February 1 and March 1, 2027. The example's quarterly 50/50 spending/debt earmark is retained (not claimed to be a general design requirement). Spending allocations are A/6, 0, A/3; debt allocations are A/6, A/3, 0. Reconciliation checks each total equals A/2 and every use is counted once.

Fixed obligations: tax10 January2; primary spending18 January5; Bill sale8 January10; ordinary interest3 January20; bank conversion payment0.5 January25; ordinary maturity20 February1; Bill maturity8 and Treasury-funded Bill interest0.2 March1. Original split payment entries, amounts and due dates are unchanged. Bill principal is released from parked money, not ordinary borrowing proceeds. No taxes, spending cuts, emergency funds, reserve funds or unlimited buyers are invented.

| Convention and total buyer capacity | Borrowed | Principal paid | Principal still owed | Net ordinary borrowing | Result |
|---|---:|---:|---:|---:|---|
| Same-day conditional refinancing, 0 | 0 | 0.272961237 | 19.727038763 | -0.272961237 | FAIL |
| Same-day conditional refinancing, 10 | 0 | 0.272961237 | 19.727038763 | -0.272961237 | FAIL |
| Same-day conditional refinancing, 20 | 11.909012921 | 20 | 0 | -8.090987079 | FAIL |
| Advance funding, quarter-net sensitivity, 20 | 20 | 0.272961237 | 19.727038763 | +19.727038763 | FAIL, net rule also fails |

Same-day refinancing is conditional on sufficient funds to settle its matched redemption entry. Insufficient buyer capacity cannot create unmatched new debt. The 10-unit case therefore rejects the attempted funding before posting rather than borrowing10 and failing the redemption. This atomic guard is new follow-up adapter behavior; the historical matrix and frozen implementation are unchanged. At daily resolution, funding precedes redemption on the same date; this is not an intraday settlement-system proof.

During development, the initial follow-up adapter failed its no-net-borrowing assertion for insufficient buyers because it posted borrowing before discovering the redemption could not settle. The guard was then added and the full follow-up reproduced against a clean base checkout. This is disclosed adapter development after challenge disclosure, not an unchanged first-pass test.

In the 20-unit same-day case, the January5 general-funded spending entry lacks **6.909012921** units. All20 principal is nevertheless paid February1, and ordinary debt closes at96.909012921. Bill interest0.2 is unpaid March1. The unpaid spending entry is17.727038763; a cash shortfall is not the same as the size of the unpaid contractual entry. The 0/10-buyer cases also leave19.727038763 principal outstanding; it is never written off when payment fails.

The advance-funding sensitivity allows draws up to20 before maturity, explicitly testing a more permissive netting convention. It pays January spending but lacks9.636051685 for the February redemption entry. Since that entry does not settle, the outstanding new borrowing is not compliant net-zero refinancing. It is reported as failure, not an authorized borrowing-ban outcome.

All cases also flag Treasury cash-limit and five-business-day remedy failures: rejected payments leave cash retained, and no unrequested remedial dividend is silently added. These are diagnostic continuation traces after the first failure, not executable compliant payment programs. A dividend would consume cash and cannot cure the financing insufficiency. Even ignoring earmarks and cash ceilings, total fiscal payments41.2 exceed opening cash1 + tax10 + allowance0.545922473 + maximum refinancing20 by **9.654077527**. Conversion repayments do not fund Treasury and Bill parked principal is not spare budget money. Thus finite refinancing alone cannot pay every obligation in this quarter. Allocation restrictions can tighten that necessary aggregate bound.

## Reproduce and limits

Use Node20+ and a separate checkout of commit5225fccd86678e67286ae28efdfc7b988a9b6a56. Set `LAB_CHECKOUT` to that checkout's absolute path, then run:

```sh
node evidence/refinancing-2026-11-03/run.mjs
```

The run writes `results.json` containing all events, daily controller observations, journals, cash violations, payment failures and exact rational amounts. It checks82 assertions across four scenarios: fixed dates/amounts, finite financing, three installments, earmark conservation, debt reconciliation and retention of unpaid principal. Successful assertions verify the diagnostic results; **zero of four payment scenarios pass**. Reproduce in a copy to preserve the distributed output.

The adapter uses the frozen monetary ledger and tracks unpaid contractual entries separately; it does not advance the separate BudgetModel instrument ledger on each event. Ordinary debt reconciliation is against the controller's aggregate Treasury liability. Maturity matching is limited to the one supplied maturity date; new instrument prices, coupons, buyer behavior and later maturities are not forecast. Par buyers and no additional within-quarter refinancing coupon are explicit synthetic assumptions. National opening stocks, valuation and cash-interest reconciliation remain incomplete.

The exact legal netting interval and advance-refinancing permission remain decisions. The attributed November1 record and today's authorization are documented separately in the design status note. No authentic0.7.3 text was available. Original0.3, prior local matrices, PR#1 and challenge outputs remain unchanged.
