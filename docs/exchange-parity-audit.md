# Exchange parity audit: this platform vs Binance and Bybit

This is an implementation checklist, not a claim that this application is an exchange equivalent to either provider. Use familiar exchange UX patterns without copying proprietary assets or presenting this platform as affiliated with Binance or Bybit. A feature is complete only when its backend behavior, authorization, errors, mobile layout, and tests are verified.

## Reference patterns checked
- Binance account center: profile, identity status, security, settings, shortcuts, notifications, balances, markets, trade, futures, and assets.
- Binance account model: distinct funding/spot/earn/margin/futures product balances and auditable transfers.
- Bybit security: 2FA, passkeys, trusted devices, withdrawal address lock, transaction approvals, and account deactivation.
- Bybit assets overview: total equity, today's P&L, available/in-use funds, per-account allocations, and asset-level values.

Official reference pages:
- https://www.binance.com/en-AE/support/faq/detail/d46e24e2bd204adda8a0537118ec80b8
- https://www.binance.com/en-IN/support/faq/detail/edd09512772a48cdbca87b7b7f8e81a3
- https://www.bybit.com/en/help-center/article/How-to-Enhance-Your-Account-Security
- https://www.bybit.com/en/help-center/article/How-to-Understand-Your-Assets-Overview-and-Average-Cost

## Feature parity checklist

| Area | Current baseline found in repo | Work required before calling it complete |
|---|---|---|
| Public landing / discovery | Landing page, market ticker, marketing sections | Check every CTA destination, accessibility, mobile layout, and avoid claiming unsupported products |
| Signed-in home | Account summary, market lists, news, economic calendar | Persist favorites; verify equity and daily P&L formulas; show source/freshness; verify notification links |
| Markets | Crypto, forex, commodities, stocks, CFD tabs, search/sort/category controls | Verify every filter's semantics, real source attribution and timestamps, stale-feed behavior, supported instruments |
| Spot trade / chart | TradingView chart, pair selector, order-book components, trade API | End-to-end test order lifecycle; clearly distinguish internal ledger orders from broker-executed orders; add fees, precision, limits, and rejection states |
| Derivatives / positions | Order page includes position tab; chart supports indicators | Do not enable leverage/liquidation until a derivatives broker adapter, margin ledger, funding, mark/index prices, liquidation engine, and risk controls are implemented and tested |
| Orders / history | Orders, trades, positions, filters, cancellation, CSV | Verify API authorization and statuses; validate cancellation race handling and pagination; distinguish filled trades from submitted orders |
| Assets / wallet | Balance view and deposit/withdraw/transfer tabs | Separate balances by account/product; accurate available vs reserved amounts; transaction history and reconciliations; only show deposit routes configured by an operator |
| Convert | Conversion UI/API with input validation | Confirm atomic debit/credit, authoritative rate source, fees, idempotency, and ledger reconciliation |
| Buy crypto / P2P | P2P and buy routes may be unavailable or deliberately guarded | Real payment providers/merchant escrow/dispute workflows are prerequisites; do not invent offers or imply card/bank support |
| Earn / bots / copy trading | Pages exist but fake APRs/performance/demo keys were removed | Build only after real yield custody/provider integration, strategy execution, risk controls, and audited performance records exist |
| Profile / settings | Nickname save, UID display/copy, account navigation | Profile statuses must reflect real auth/provider data; preferences need persistence and a clear unsupported state when unavailable |
| Security | Password update and recovery flows | Add verified MFA/passkey/trusted-device/withdrawal-lock flows only with supported provider/backend; never show fake security scores |
| Notifications | Preference persistence | Actual email/push/SMS delivery, inbox/read state, and delivery audit are separate tasks; do not imply delivery is enabled when only preferences are saved |
| API management | Page exists | Real credential issuance, hashed secrets, scopes, IP restrictions, last-used data, revocation, and audit logs; no demo keys |
| Identity verification | KYC destination exists | Real identity vendor, consent, secure document handling, review states, and jurisdiction rules |
| Support / announcements / news | Support widget and news feed exist | Verify working ticket submission and status; cite original news sources and freshness; handle provider failures |
| Referral / rewards / VIP / fee schedule | Navigation references exist | Only show real program terms, eligible account data, referral attribution, and server-computed fee tiers |
| Admin / master admin | Existing admin routes and controls | PROTECTED SCOPE: do not alter super_admin/master-admin powers, admin permissions, role hierarchy, admin APIs, or admin UI in this feature-parity work without separate explicit authorization. |

## Non-negotiable implementation rules
1. Preserve the existing super_admin master role and subordinate admin role exactly. Do not change admin capabilities or permissions in this pass.
2. Keep authorization enforced server-side; UI visibility is not authorization.
3. Do not create fake balances, verified badges, security scores, APRs, fills, performance records, payment options, or successful transactions.
4. Label quotes with their actual provider and last-updated time. Frankfurter daily reference FX rates are not streaming trading quotes.
5. Real external execution requires a configured and tested broker/exchange adapter for the relevant asset class. A chart widget or internal database order alone is not external execution.
6. Do not mutate the production Supabase schema/data or merge this branch into main without explicit authorization.
7. Test mobile and desktop layouts, keyboard access, loading/error/empty states, authorization failures, and real backend success paths for every interactive control.

## Work started in this pass
- Account profile no longer claims an unverified High security level or hard-codes the site as Bybit Global.
- Email verification status now reflects the authenticated Supabase user instead of a permanent Verified badge.
- Removed nonfunctional theme/language buttons from the account header rather than leaving dead controls.
