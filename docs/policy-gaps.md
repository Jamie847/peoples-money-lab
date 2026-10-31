# Unresolved policy and implementation boundaries

These are not repaired by tuning a test until it passes.

1. **Emergency cap expiry.** Exposure can remain above 2% when the 5% authority expires. The denominator-only grandfather rule is not silently extended to a change in the cap rate. New lending still cannot exceed current headroom. Disposition of existing exposure is undefined.
2. **Auction non-clearance.** A required quantity and an always-outstanding safe-asset floor do not guarantee buyers. Partial settlement, failed-auction response and continuity of the floor need policy. The engine rejects settlement with `POLICY_UNDEFINED` rather than inventing proceeds.
3. **Discount price versus face value.** Parked cash and outstanding principal need not equal each other for discount bills. Only an explicitly declared synthetic par-principal coupon convention is implemented.
4. **Quarter-end cash excess during cure.** The source states a 1% quarter-end limit and allows the excess to be disbursed by the following quarter end. The engine records the excess and deadline, but classifies compliance during that grace interval as undefined. Failure to disburse by the deadline is a modeled failure. Subsequent spending redeems the oldest outstanding cure obligation first, a disclosed tracking convention.
5. **Daily versus intraday.** Daily-close Treasury checks are not instantaneous exposure checks. Custody access, settlement queues, weekends at accounting boundaries and operational failures require another layer.
6. **Recovery after impairment.** The prototype stores aggregate valuation allowances. Allocating cash recovery among impaired individual loans/claims is not specified in this aggregate representation. Such repayment is stopped as undefined, rather than silently crediting income twice. This is an implementation limitation, not a claim that standard impairment accounting is unknown.
7. **Rebase timing.** A between-quarter statutory reset is a new proof epoch. A mid-quarter reset's interaction with an existing issuance allowance remains undefined here.
8. **Data and policy input production.** Vintage selection, missing releases, holiday calendars, stress indices, collateral and legal attestations are supplied inputs rather than independently authenticated systems. No source of real policy authority is implemented.

The core exposure bound and enforcement of a cap are distinct. A cap-overhang diagnostic does not refute the algebraic bound. Conversely, a valid bound does not prove operational solvency, access, price stability, or a viable transition.

9. **Emergency episode restart:** source rules do not operationally distinguish a new crisis from continuation of an expired episode. Recertification after any prior episode is conservatively POLICY_UNDEFINED; no cool-off period is invented.

Partial/unclosed schedules are also reported POLICY_UNDEFINED with an INCOMPLETE marker. That is missing validation coverage, not a newly discovered contradiction in the monetary design.
