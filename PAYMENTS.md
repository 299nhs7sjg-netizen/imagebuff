# ImageBuff payments & monetization

Hosting stays **GitHub Pages** (static, $0). No backend required for MVP.

Unlock is **license-key only**. There is no “I paid — unlock” honor button.

---

## 1. Sell $2.99 lifetime unlock (required)

Create a free account on **Lemon Squeezy** or **Gumroad**.

1. Create a product: **ImageBuff Lifetime Unlock** — price **$2.99** (one-time).
2. Deliver **license keys** after purchase:
   - Upload codes from `KEYS.md` (200 sale keys in the repo; do not link that file from the site).
   - Gumroad: use license keys / unique codes feature, or email a key from the list.
   - Lemon Squeezy: use license keys / custom files / email delivery of a code.
3. Copy the product **checkout URL**.
4. Paste it into `config.js`:

```js
checkoutUrl: "https://your-store-link-here",
```

5. Commit and push to `main` so GitHub Pages redeploys.

Buyers pay → receive a key → paste it in ImageBuff → `VALID_KEYS` validates → unlock (ads + caps + watermark off).

### When keys run low

1. Generate more `IB-XXXX-XXXX-XXXX` codes (append to `KEYS.md`).
2. Add the new codes to `VALID_KEYS` in `app.js`.
3. Upload the new codes to Gumroad / Lemon Squeezy.
4. Redeploy (push to `main`).

The first **20** sale keys from `KEYS.md` are already seeded in `app.js` so early sales work once the store is live.

---

## 2. Google AdSense (free-tier revenue)

1. Create / apply for [Google AdSense](https://www.google.com/adsense/).
2. When approved, paste your publisher id into `config.js`:

```js
adsenseClient: "ca-pub-XXXXXXXXXXXXXXXX",
adSlots: { top: "SLOT", mid: "SLOT", download: "SLOT", footer: "SLOT" },
```

3. Redeploy. Until AdSense is approved, the site shows **loud placeholder ads** so free users feel the free tier immediately.
4. Unlocked users: all `[data-ad]` regions are hidden.

---

## 3. Why PayPal.me alone cannot verify payment

PayPal.me is a simple payment link. It does **not**:

- Call back to your static site
- Prove who paid
- Issue a unique license automatically

Anyone could click “I paid” without paying. That honor path is **removed**.

Optional: keep PayPal.me (`https://www.paypal.me/wesgreen77/2.99`) as a manual fallback note for yourself until Gumroad/LS is live — but the **Buy** button uses `config.checkoutUrl` only, and unlock still requires a key from `VALID_KEYS`.

See also the short note in `PAYPAL.md`.

---

## 4. Redeploy checklist

After any `config.js` or `app.js` key change:

```bash
git add -A && git commit -m "Update ImageBuff config / keys" && git push origin main
```

Live site (GitHub Pages): `https://299nhs7sjg-netizen.github.io/imagebuff/`

---

## Security note (MVP)

`VALID_KEYS` lives in `app.js` (client-side). Do **not** put a public “master key” in HTML. Do not display `KEYS.md` on the site. For higher security later: signed tokens or a tiny paid key API — not required for MVP.
