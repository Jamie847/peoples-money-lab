# Author-approved amendment: A10 and A31

Approved by the design's author on 1 November 2026. This amendment supplements the frozen October 31 acceptance specification; it does not replace that file, its hash, or its original commit. The author identified these rules with the adopted auction and recovery provisions. The authorization was supplied directly; no newer complete private-paper export is represented as independently inspected here.

## A10: direct-sale authorization and commitments

Direct sales are limited to the latest qualifying auction's remaining authorized quantity. Earlier shortfalls do not accumulate into that authorization. Opening a new auction closes the old direct-sale window to new orders. Binding awarded quantities must remain reserved so auction and direct buyers cannot purchase the same authorization twice. Existing commitments retain their original settlement terms.

Acceptance extensions: test known-clearing-rate and no-clearing-rate windows after two consecutive short auctions; reserve unsettled binding auction awards and direct orders; reject excess new orders atomically; close the old window on a new auction; permit existing commitments to settle under their unchanged terms without reopening that window. An award or order is not parked money until settled.

## A31: non-principal receipts and overpayments

F includes principal/residual net cash only. H includes settled contractual interest and penalties as non-principal receipts, each counted once. No penalty amount is invented. A modeled payment exceeding all recorded contractual amounts is rejected before mutation; the engine does not invent surplus or refund accounting.

Acceptance extensions: identified settled cash pays remaining principal/residual first, then recorded contractual interest and penalties. Verify F, H, R, exposure and income separately. Reject duplicate receipts, unsupported penalties and overpayments without changing balances, contract records or receipt history. Financial recovery of a previously recognized principal loss remains a single recognition, not another money withdrawal.

## Evaluation gate

These are visible author-approved acceptance rules, not unseen challenge material. After implementation, tests, reproduction and CI pass, identify one immutable implementation commit for a separately authored challenge. The draft PR remains unmerged until that gate is completed and a specific merge is authorized. Passing accounting tests is not economic or operational validation.
