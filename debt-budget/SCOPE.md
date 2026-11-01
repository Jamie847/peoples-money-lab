# Debt and budget accounting prototype — scope v0.1

Private local research, written before implementation on 1 November 2026. This is a separate extension of frozen operating implementation 8cdf3e2. It does not modify that implementation or rerun its challenge, C05 or C06.

## Perimeter and conventions

Track Treasury securities by instrument, holder, principal, maturity and explicit cash coupon schedule. External holders, the Authority, Social Security and other intragovernmental funds are separate. Debt held by the public includes external and Authority-held Treasury securities; gross Treasury debt also includes intragovernmental holdings. Excluded external obligations remain identifiable and cannot be cancelled. Stabilization Bills are a separate proposed instrument, shown separately and in an expanded obligation total, never silently added to historical Treasury debt statistics. Conversion claims are Authority assets against banks, not Treasury debt.

Show a separate illustrative Treasury–Authority–trust-fund consolidation: internal securities and T/parked balances eliminate; externally held securities, Stabilization Bills and circulating public money remain distinct liabilities. This is a model consolidation, not the official US financial-report perimeter. Do not add parked money B to Bills a second time. Authority security cancellation reduces its net worth and Treasury debt, leaves cash unchanged, and produces no annual cash saving. Future coupons depend on the surviving contractual schedule; remittances are not automatic.

Use exact rational synthetic units and dated, ordered settled events. Record balanced sector journals and matched counterpart stocks. Taxes and spending transfer M/T. Ordinary borrowing adds cash and securities only when a purchaser settles. Principal redemption is financing, not primary expenditure. Coupons are cash debt service, not principal redemption. Bill sales park money in B, provide no spendable Treasury cash and cannot finance the budget. Bill maturities release that parked money; coupon payments use T. Conversion principal drains bank money and R; it is not tax revenue or an independent spending entitlement.

Rule issuance is bounded by an explicitly attested quarterly target minus observed opening R from below. The target is supplied by the monetary-rule layer; this module does not recompute growth, C06, statutory resets, macroeconomic outcomes or conversion eligibility. Each credited unit is allocated once to spending, debt retirement or retained reserve. Restricted balances cannot also fund general spending. Cancellation and conversion collections cannot create another issuance allowance. No automatic deficit monetization.

Variants use the identical fiscal request with borrowing allowed or a separate borrowing ban. A ban's scope must be explicit: ordinary Treasury borrowing, while proposed Stabilization Bills are either explicitly permitted or blocked as undefined. Failure to finance an authorized payment is reported, not silently cured by borrowing, skipped expenditure or invented issuance. Baseline means no rule issuance in the same synthetic cash ledger, not a complete simulation of today's monetary system.

## Visible acceptance cases (new suite, not unseen evaluation)

| ID | Required assertion |
|---|---|
| DB01 | Opening sectors balance; debt categories and counterpart holders reconcile. |
| DB02 | Taxes, primary spending and external coupons move cash; deficit excludes principal financing. |
| DB03 | Borrowing and maturity are distinct settled flows; refinancing cannot erase gross turnover. |
| DB04 | Borrowing ban rejects new ordinary borrowing atomically; cash shortfall stays visible. |
| DB05 | One issuance cannot pay spending and retire debt twice; over-allocation rejected. |
| DB06 | Issuance is a measured quarterly shortfall, not a budget forecast or repeated allowance. |
| DB07 | Bill sales do not fund T; principal release and coupons are separate; demand shortfall is visible. |
| DB08 | Cancellation affects only expressly authorized Authority holdings; no cash saving; protected holdings survive. |
| DB09 | Authority coupons/redemptions and external coupons/redemptions have distinct monetary effects. |
| DB10 | Seven-year conversion principal schedule drains money, not a Treasury revenue line; overpayment rejected. |
| DB11 | Missed maturity/coupon is reported; duplicate events and reversed dates reject atomically. |
| DB12 | Consolidation eliminates only internal positions and never double-counts B/Bills. |
| DB13 | Missing/unaligned national inputs block national use; no synthetic national payoff date. |
| DB14 | Baseline, issuance allocation, tax, spending, interest and demand sensitivities reproduce deterministically. |
| DB15 | Every output includes source dates, assumptions and content-derived immutable release identity. |

## National-data gate

A usable opening national balance sheet requires common-date debt by holder and instrument, par/book valuation bridges, Treasury cash, Authority assets/liabilities, other monetary owners, trust-fund holdings, and a reconciled conversion base. Monthly cash budget totals need an explicit financing/accrual bridge and maturity/coupon schedules. H.6/H.8/H.4.1 cannot be subtracted across mismatched dates or populations. No national payoff trajectory will be emitted until this gate is satisfied. Missing policies and data remain explicit inputs or blocked cases.

Nonfinancial federal assets, pension/benefit promises, private credit, bank solvency, interest-rate responses, tax-base changes, inflation, demand, political feasibility and legal enforceability are not inferred from accounting identities. A future site may display immutable releases; no website or hosting work is included here.

## Version 0.2 addendum: issuance provenance and allowance coupling

The nine original scenarios account for an assumed authorized issuance. Their constructed target does not independently establish permission to issue. Preserve release 0.1; label this limitation explicitly in new outputs.

A distinct scenario uses the unchanged frozen OperatingEngine, independently specifying R110, starting target110, GDP third-estimate annual observations of 2%, price observations and bases of100 and inflation target0. Compute the allowance before choosing its fiscal allocation. This couples only the allowance interface: no fiscal settlement replay, controller credit, remittance policy, C11 interpretation or full operating-policy compliance claim is added. No C05/C06 or sealed challenge rerun occurs.

| ID | New integration assertion |
|---|---|
| DB16 | Frozen controller computes allowance from independent inputs; changing synthetic GDP growth to zero produces zero allowance, without choosing a desired issuance. |
| DB17 | Allocations above allowance reject; unavailable first price data blocks coupling. |
| DB18 | Fiscal ledger consumes exactly the computed allocation once; records allowance and allocation separately. |
| DB19 | Inherited scenarios are labeled assumed-authorized issuance; the ban case's rejected 15 principal stays outstanding and overdue. |
