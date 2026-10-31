# People's Money Lab

A small, inspectable accounting laboratory for a proposed public-money design. It asks whether specified transactions balance and obey specified constraints. It does **not** show that the design would stabilize prices, improve growth, make credit cheaper, survive a real transition, or be legally enforceable.

**Current status: research prototype. Some operating policies remain undefined.** A green test run means the software reproduced expected accounting results and detected specified invalid or undefined operations. It is not a green light for the monetary proposal.

## Run it

Requires Node.js 20 or newer. There are no third-party runtime dependencies and no API keys, services, package downloads, workbook programs, or network calls.

```sh
npm test
npm run reproduce
# Or both:
npm run check
# Inspect an individual editable synthetic event file:
node scripts/run.mjs fixtures/simple-loss.json # partial example: exits 3 (POLICY_UNDEFINED)
```

The individual-file CLI uses exit 0 for PASS, 1 for FAIL, and 3 for POLICY_UNDEFINED. A partial trace is not a complete quarterly schedule: the simple-loss fixture demonstrates the accounting, but intentionally leaves its quarter open. Supply `"finalize": true` (or `{"date":"YYYY-MM-DD"}`) in a scenario to close its endpoint day; this does not silently finish unpaid monthly tranches or missing quarters.

The reproduction command writes machine-readable examples, daily observations, transaction journals, generated-path summaries, and a minimized rejected transaction sequence into `reports/`. That directory is generated, not committed. No real person's transactions or live national datasets are included.

Versioned numeric policy parameters are centralized in `config/policy-0.7.1.json`. Supported edits drive both helpers and engine checks. Unknown fields, invented operational responses, and unsupported calendar/target variants are rejected; changing a parameter is a modeling variant, not a finding about the published proposal.

## What the numbers mean

- **M**: circulating public money, including a bank's own money.
- **B**: money parked against stabilization bills.
- **T**: Treasury money.
- **R = M + B + T**: the public-money stock governed by the path.
- **P**: unpaid legal facility-loan principal.
- **U**: unrecovered principal after final legal resolution. It still consumes facility capacity.
- **E = P + U**: combined exposure.

Ordinary issuance fills a measured quarterly shortfall to a nondecreasing path. It does not anticipate repayments. A loan impairment does not withdraw money. A legal discharge moves principal from P to U; it does not make the exposure disappear. The tested conditional bound is `max(0, R − path) ≤ P + U`. A separate exposure cap can have an overhang even when that bound holds.

## Explore

- [`src/engine.mjs`](src/engine.mjs): dated events, admission checks, policy diagnostics and journals.
- [`src/ledger.mjs`](src/ledger.mjs): four-sector accounts and explicit counterpart entries.
- [`src/rational.mjs`](src/rational.mjs): exact rational transaction amounts.
- [`src/rules.mjs`](src/rules.mjs): supplied-input path/brake calculations and a synthetic auction convention.
- [`src/counterexample.mjs`](src/counterexample.mjs): replay and deterministic deletion minimization.
- [`config/policy-0.7.1.json`](config/policy-0.7.1.json): translated parameters and unresolved items.
- [`docs/methods.md`](docs/methods.md): assumptions, timing and scope.
- [`docs/claims-to-tests.md`](docs/claims-to-tests.md): what supports each narrow claim.
- [`docs/policy-gaps.md`](docs/policy-gaps.md): what the software refuses to decide for policymakers.

The nine annual examples match a frozen earlier synthetic diagnostic under low, central and high migration assumptions. Generated 10-year and 25-year paths vary the order and size of accounting operations; they are **not sampled economic futures**. Rejected operations do not alter the ledger. Some applied operations can nonetheless reveal policy violations, such as an excessively expensive bill auction.

## Three outcomes

- `PASS`: the particular implemented check passed.
- `FAIL`: a specified accounting constraint or modeled policy condition was violated, or an attempted transaction was rejected.
- `POLICY_UNDEFINED`: the source policy or this implementation lacks an operational answer. No convenient answer is silently supplied.

For example, reverting from a 5% emergency cap to a 2% ordinary cap with unrecovered residual exposure can leave the system above the ordinary cap. The accounting bound can still hold. This repository reports that policy gap explicitly.

## What remains outside this version

This is not a banking platform, central-bank ledger, monetary-policy recommendation, legal opinion, or payment-system security implementation. It does not model a real national conversion balance sheet, economic behavior, price formation, credit demand, market-clearing demand for bills, real collateral eligibility, individual institutions, foreign flows, operational access or privacy guarantees. The four sectors aggregate many different actors. Custody memorandum entries are deliberately not second money liabilities.

A one-day time step is not intraday settlement. Several features are conservative implementation boundaries rather than resolved policy: see the methods and gaps. The private book manuscript is not included or licensed by this repository. Source-policy provisions are summarized only as needed to explain the new code.

## Recorded independent first pass

The frozen baseline evaluation found **9 fully passed cases, 6 policy-undefined cases, and 3 unimplemented cases**. No accounting failure was demonstrated; this is not “18 passed.” Full first-pass evidence and separate post-audit repairs are described in [evaluation](docs/evaluation.md).

The subsequent **post-disclosure regression** retained those outcomes: the unchanged scenario harness checked 9,229 assertions; the endpoint-finalized adaptation checked 11,073; three separate repair checks checked 950. These overlapping checks must not be added together as distinct scenarios or called new held-out evidence. See the [regression report](evaluation/regression-d38de02/REPORT.md).

## Reproducibility and review

This code and its tests were developed with AI assistance. Earlier checks were also AI-assisted. They are not an independent professional audit. Human review in monetary economics, banking operations and law remains necessary. The original independently authored assessment was run against a frozen commit and is preserved before repairs; see [`docs/evaluation.md`](docs/evaluation.md).

The project is intended to accompany a book and future educational website. Publication of a repository does not establish the validity of the proposal. Contributions that identify counterexamples, missing assumptions or mistaken accounting are particularly useful.

## License

The code and newly authored technical documentation in this repository are MIT licensed. This does not grant rights to any book manuscript, audiobook, private draft, third-party publication, or trademark. See [LICENSE](LICENSE).
