# ImageBuff

**Browser photo resize + compress for social apps.** Private, offline-capable static site. Price: **$2.99 lifetime unlock**.

Your photos never leave the device — all processing uses Canvas / browser APIs.

## Open locally

**Option A — double-click**

Open `index.html` in Chrome, Edge, Firefox, or Safari.

**Option B — local server (recommended if a browser blocks `file://`)**

```bash
cd /path/to/imagebuff
python3 -m http.server 8765
```

Then visit: http://localhost:8765/

No build step. No Node. No paid APIs.

## Features

- Drag/drop or file picker (JPG, PNG, WebP, GIF → export JPG/WebP/PNG)
- Presets: Instagram post/portrait/story, X/Twitter post & header, LinkedIn, TikTok/Reels, Facebook, YouTube thumbnail
- Custom width/height + keep aspect ratio
- Quality slider (JPEG/WebP)
- Live preview + single or batch download
- Free tier limits + $2.99 lifetime unlock via license key (localStorage)

## Free vs paid

| | Free | Unlocked ($2.99 lifetime) |
|---|---|---|
| Long-side max | 1280px | Full resolution |
| Quality | Capped at 0.75 | Up to 1.0 |
| Watermark | Small “ImageBuff” on export | None |
| Offline | Yes | Yes |

## Unlock / license keys (MVP)

Keys are checked **client-side** against `VALID_KEYS` in `app.js`. Unlock persists in `localStorage` (`imagebuff_unlocked_v1`) only when the stored value is a valid key. **No honor / “I paid” unlock.**

1. Sell on Gumroad / Lemon Squeezy at **$2.99** — see `PAYMENTS.md`.
2. Deliver a unique key from `KEYS.md` (do not link that file from the site).
3. Buyer pastes the key in the unlock modal. Free tier shows ads; unlock hides every `[data-ad]`.
4. Paste the store checkout URL into `config.js` → `checkoutUrl`, then redeploy.

Demo unlock is hidden unless you open the site with `?demo=1` (key: `IB-DEMO-UNLOCK-2026`).

When keys run low: add codes to `KEYS.md` and `VALID_KEYS` in `app.js`, upload to the store, push to `main`.

To reset unlock while testing: DevTools → Application → Local Storage → delete `imagebuff_unlocked_v1`.

## Files

| File | Purpose |
|---|---|
| `index.html` | App shell + ad regions |
| `config.js` | checkoutUrl + AdSense (Wes edits) |
| `app.js` | Resize, compress, license unlock, ads |
| `styles.css` | UI + loud free-tier ads |
| `favicon.svg` | Icon |
| `KEYS.md` | Private sale key pool (do not link from site) |
| `PAYMENTS.md` | Gumroad / LS / AdSense setup |
| `BRAND.md` | Brand & positioning |
| `STORE.md` | Store listing copy |
| `LAUNCH.md` | X / Reddit / IH drafts |
| `README.md` | This file |

## Product note

ImageBuff is a **mass-market digital product** (photo tool). It is **not** freelancer PDFs, DeskRun, AI operator services, or Green Desk.

## License

Proprietary product for Wes Green / $0 digital business. Ship as a paid download or hosted static site.
