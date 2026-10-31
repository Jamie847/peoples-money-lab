# Methods and boundaries

## Accounting translation

The engine translates an accounting subset of candidate design version 0.7.1. A configuration version identifies the translation, not enactment or external validation. Each accepted financial transaction posts balanced entries in the Authority, Treasury, Bank and Public sectors. Money ownership and contractual counterpart claims are checked after each event. An impairment changes carrying values and net worth, not contractual principal or money. Contractual receivables and obligations remain matched; negative valuation allowances account for divergence between book values and gross legal claims.

Transactions use reduced BigInt rational amounts. Inputs may be decimals or fractions. Price logarithms and annual-to-quarterly roots use JavaScript binary64; the resulting decimal is then treated as an exact supplied coefficient. Generated multi-year paths round the requested target to twelve decimal places (half away from zero), preserving a nondecreasing path. Transaction amounts and journal balances are not rounded. This is not a claim of exact transcendental computation or a legally specified rounding rule. Legacy numerical comparisons allow 1e-9 synthetic units because the earlier implementation used binary64 throughout. New journal and counterpart identities use exact comparisons.

## Timing conventions

The engine uses ISO calendar dates and an explicit event order within a day. A quarter begins on its first calendar day and ends on its last configured business day. A positive allowance must be paid in three distinct calendar months and in full by the quarter end; equal thirds are a scenario convention, not an assertion that the source specifies equal tranche sizes. Remittances consume, rather than supplement, the allowance and are paid first.

Monday-Friday are business days unless a holiday is supplied in configuration. This is an explicit synthetic calendar, not a legal US holiday calendar. Closing observations count consecutive business-day Treasury cash breaches. A cure on the sixth business day before that day's close avoids a sixth breached close. That is a **daily-close interpretation**, not validation of a rule applied to every instant. Intraday timing remains untested.

Financial postings require an active quarter and are not admitted after its configured last business day. Weekend settlement between a quarter's last business day and the next first calendar day is consequently outside this prototype. The engine does not silently substitute a current mid-quarter money stock for the prior-quarter denominator. Duplicate quarterly computations and skipped quarters are rejected.

An overdue facility loan remains unpaid principal; contractual maturity does not repay it. Legal resolution requires an explicit attestation supplied by the scenario. A statutory rebase is permitted between closed quarters only, starts a new proof epoch, preserves R, resets U and sets the new path to R. Mid-quarter rebasing is reported undefined because the disposition of a previously computed allowance is unspecified here.

## Facility and auction inputs

Collateral eligibility, the payment-stress trigger, a penalty rate, joint emergency certification and legislative actions are attestations in synthetic inputs. They are not independently measured or authenticated by the program. The engine enforces a 90-calendar-day contractual facility term and the declared 90/365-day emergency timing. It does not supply a collateral haircut, legal waterfall or real liquidity market. Sustained-use review and real public reporting obligations are not automated or validated.

The auction is an **at-par principal/coupon-rate diagnostic**. Bids state principal quantity and a rate; the marginal accepted rate is paid uniformly. This makes parked proceeds equal principal in the journal. It is not a discount-bill pricing model. A discount-price/face-value convention is not specified and is returned as undefined. Insufficient aggregate bids do not silently produce a partial settlement or an invented buyer. Actual demand, the bill floor's continuous maintenance, and multi-institution allocations are not validated by an auction that accepts supplied synthetic bids.

The brake helper computes a requested stock from supplied prior stocks and two supplied price-gap readings. The caller is responsible for a proposed issuance/maturity schedule. The engine does not manufacture liquidity or bids so that a requested brake stock is reached.

## Reproduced examples

The frozen nine-case oracle uses synthetic currency 10, demand deposits 100, other liquid deposits 200, reserves 20, transferred securities 30, bank loans 300 and bank equity 50. Migration shares are 20%, 40% and 70%, not observed behavior. Conversion claims repay over 28 quarters. Initial government-asset cancellation is reflected in the opening balance sheet; the engine does not pretend the loss removes public money.

Normal and facility-loss examples use a 2% annual path. Brake examples use a flat path and a supplied 5% log gap. Legacy bill principal matures and is replaced quarterly at a supplied 2% annual rate. Facility-loss draws occur January 30 and half cash repayment plus half legal discharge occur April 1, preserving the original 61-day interest convention in the nonleap synthetic year 2027. The economic reasons for these flows are assumed, not modeled.

The opening journal derives from a previous diagnostic. The new daily engine's agreement with that frozen output tests implementation consistency; it is not fully independent evidence for the source assumptions. Corporate share ownership is not separately modeled as a public asset.

## Generated paths and counterexamples

Seeded paths vary annual path growth within 0-4%, fiscal transfer ordering, amounts, lending, repayment, impairment and discharge. Borrowing is permitted as the separate fiscal-policy variant; this does not implement the proposed post-transition borrowing ban. Loans and funding are aggregate sectors. Paths stop after the requested horizon. Their seeds have no estimated real-world probability.

The counterexample minimizer deletes events while preserving a chosen diagnostic code. It produces a 1-minimal trace: no single further deletion preserves that code. It does not claim a globally shortest trace or an economic counterexample. An invalid transaction correctly rejected by the engine is a successful admission test, not a vulnerability that changed balances.

## Missing validation

No live economic data are fetched. H.6, H.8 and H.4.1 have unresolved date/perimeter mismatches and cannot yet produce a reconciled national conversion claim. No native spreadsheet recalculation is asserted. No economic simulation, household-rate forecast, inflation test, legal review, intrusion test, real payment outage test, or outside professional audit has been performed by this package.
