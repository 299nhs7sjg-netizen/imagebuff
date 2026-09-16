/**
 * ImageBuff — client-side resize & compress for social apps
 * Unlock keys validated locally (MVP). See README for key scheme.
 */
(function () {
  "use strict";

  const STORAGE_KEY = "imagebuff_unlocked_v1";
  const DEMO_KEY = "IB-DEMO-UNLOCK-2026";
  const VALID_KEYS = new Set([
    DEMO_KEY,
    "IB-LIFE-WGREEN-299",
    "IB-LIFE-LAUNCH-001",
    "IB-LIFE-LAUNCH-002",
    "IB-LIFE-LAUNCH-003",
    "IB-LIFE-LAUNCH-004",
    "IB-LIFE-LAUNCH-005",
  ]);

  const FREE = { maxLongSide: 1280, maxQuality: 0.75, watermark: true };

  const PRESETS = {
    original: null,
    "ig-post": { w: 1080, h: 1080 },
    "ig-portrait": { w: 1080, h: 1350 },
    "ig-story": { w: 1080, h: 1920 },
    "x-post": { w: 1600, h: 900 },
    "x-header": { w: 1500, h: 500 },
    linkedin: { w: 1200, h: 627 },
    tiktok: { w: 1080, h: 1920 },
    facebook: { w: 1200, h: 630 },
    "yt-thumb": { w: 1280, h: 720 },
    custom: "custom",
  };

  let items = [];
  let activeIndex = -1;
  let unlocked = false;
  const $ = (id) => document.getElementById(id);

  const els = {
    dropZone: $("dropZone"), dropEmpty: $("dropEmpty"), fileInput: $("fileInput"),
    pickBtn: $("pickBtn"), thumbs: $("thumbs"), preset: $("preset"),
    customSize: $("customSize"), width: $("width"), height: $("height"),
    keepAspect: $("keepAspect"), format: $("format"), quality: $("quality"),
    qualityLabel: $("qualityLabel"), qualityField: $("qualityField"),
    freeNote: $("freeNote"), freeDimLabel: $("freeDimLabel"), freeQLabel: $("freeQLabel"),
    downloadBtn: $("downloadBtn"), downloadAllBtn: $("downloadAllBtn"), clearBtn: $("clearBtn"),
    preview: $("preview"), previewMeta: $("previewMeta"), unlockBtn: $("unlockBtn"),
    unlockLink: $("unlockLink"), footerUnlock: $("footerUnlock"), unlockBadge: $("unlockBadge"),
    unlockModal: $("unlockModal"), modalClose: $("modalClose"), licenseKey: $("licenseKey"),
    applyKeyBtn: $("applyKeyBtn"), demoUnlockBtn: $("demoUnlockBtn"), unlockError: $("unlockError"),
  };

  function isUnlocked() {
    try {
      const v = localStorage.getItem(STORAGE_KEY);
      return v === "1" || (v && VALID_KEYS.has(v));
    } catch (e) { return false; }
  }

  function setUnlocked(key) {
    unlocked = true;
    try { localStorage.setItem(STORAGE_KEY, key || "1"); } catch (e) {}
    refreshUnlockUI();
    scheduleRender();
  }

  function refreshUnlockUI() {
    unlocked = isUnlocked();
    if (unlocked) {
      els.unlockBadge.textContent = "Unlocked";
      els.unlockBadge.className = "badge pro";
      els.unlockBtn.textContent = "Unlocked ✓";
      els.unlockBtn.disabled = true;
      els.freeNote.hidden = true;
      els.quality.max = "1";
    } else {
      els.unlockBadge.textContent = "Free";
      els.unlockBadge.className = "badge free";
      els.unlockBtn.textContent = "Unlock $2.99";
      els.unlockBtn.disabled = false;
      els.freeNote.hidden = false;
      els.freeDimLabel.textContent = String(FREE.maxLongSide);
      els.freeQLabel.textContent = String(FREE.maxQuality);
      if (parseFloat(els.quality.value) > FREE.maxQuality) els.quality.value = String(FREE.maxQuality);
    }
    els.qualityLabel.textContent = Number(els.quality.value).toFixed(2);
    updateQualityVisibility();
  }

  function updateQualityVisibility() {
    const fmt = els.format.value;
    els.qualityField.style.opacity = fmt === "image/png" ? "0.45" : "1";
    els.quality.disabled = fmt === "image/png";
  }

  function openModal() { els.unlockError.hidden = true; els.unlockModal.hidden = false; els.licenseKey.focus(); }
  function closeModal() { els.unlockModal.hidden = true; }
  function normalizeKey(raw) { return String(raw || "").trim().toUpperCase().replace(/\s+/g, ""); }

  function tryUnlock(key) {
    const k = normalizeKey(key);
    if (VALID_KEYS.has(k)) { setUnlocked(k); closeModal(); return true; }
    els.unlockError.textContent = "Invalid key. Try Demo Unlock, or paste a key from your purchase email.";
    els.unlockError.hidden = false;
    return false;
  }

  function loadImage(file) {
    return new Promise(function (resolve, reject) {
      const url = URL.createObjectURL(file);
      const img = new Image();
      img.onload = function () { URL.revokeObjectURL(url); resolve(img); };
      img.onerror = function () { URL.revokeObjectURL(url); reject(new Error("fail")); };
      img.src = url;
    });
  }

  async function addFiles(fileList) {
    const files = Array.from(fileList || []).filter(function (f) {
      return /^image\/(jpeg|png|webp|gif)$/i.test(f.type);
    });
    if (!files.length) return;
    for (const file of files) {
      try { items.push({ file: file, img: await loadImage(file), name: file.name }); } catch (e) {}
    }
    if (!items.length) return;
    activeIndex = items.length - 1;
    renderThumbs();
    els.dropEmpty.hidden = true;
    els.thumbs.hidden = false;
    els.downloadBtn.disabled = false;
    els.downloadAllBtn.disabled = items.length < 2;
    els.clearBtn.disabled = false;
    scheduleRender();
  }

  function renderThumbs() {
    els.thumbs.innerHTML = "";
    items.forEach(function (item, i) {
      const div = document.createElement("button");
      div.type = "button";
      div.className = "thumb" + (i === activeIndex ? " active" : "");
      div.title = item.name;
      const img = document.createElement("img");
      img.src = item.img.src; img.alt = item.name;
      const name = document.createElement("span");
      name.className = "name"; name.textContent = item.name;
      div.appendChild(img); div.appendChild(name);
      div.addEventListener("click", function () { activeIndex = i; renderThumbs(); scheduleRender(); });
      els.thumbs.appendChild(div);
    });
  }

  function getTargetSize(srcW, srcH) {
    const key = els.preset.value;
    var boxW, boxH;
    if (key === "original") { boxW = srcW; boxH = srcH; }
    else if (key === "custom") {
      boxW = Math.max(1, parseInt(els.width.value, 10) || srcW);
      boxH = Math.max(1, parseInt(els.height.value, 10) || srcH);
    } else { boxW = PRESETS[key].w; boxH = PRESETS[key].h; }
    if (els.keepAspect.checked) {
      const fit = Math.min(boxW / srcW, boxH / srcH);
      return { w: Math.max(1, Math.round(srcW * fit)), h: Math.max(1, Math.round(srcH * fit)), boxW: boxW, boxH: boxH };
    }
    return { w: boxW, h: boxH, boxW: boxW, boxH: boxH };
  }

  function applyFreeCaps(w, h, quality) {
    if (unlocked) return { w: w, h: h, quality: quality, capped: false };
    var cw = w, ch = h;
    const long = Math.max(cw, ch);
    if (long > FREE.maxLongSide) {
      const s = FREE.maxLongSide / long;
      cw = Math.max(1, Math.round(cw * s));
      ch = Math.max(1, Math.round(ch * s));
    }
    return { w: cw, h: ch, quality: Math.min(quality, FREE.maxQuality), capped: true };
  }

  function drawWatermark(ctx, w, h) {
    if (unlocked || !FREE.watermark) return;
    const text = "ImageBuff";
    const fontSize = Math.max(14, Math.round(Math.min(w, h) * 0.045));
    ctx.save();
    ctx.font = "700 " + fontSize + "px system-ui, sans-serif";
    ctx.fillStyle = "rgba(255,255,255,0.55)";
    ctx.strokeStyle = "rgba(0,0,0,0.35)";
    ctx.lineWidth = Math.max(1, fontSize / 12);
    const pad = fontSize * 0.6;
    const metrics = ctx.measureText(text);
    const x = w - metrics.width - pad, y = h - pad;
    ctx.strokeText(text, x, y); ctx.fillText(text, x, y);
    ctx.restore();
  }

  function processToCanvas(img) {
    const size = getTargetSize(img.naturalWidth, img.naturalHeight);
    const capped = applyFreeCaps(size.w, size.h, parseFloat(els.quality.value) || 0.85);
    const canvas = document.createElement("canvas");
    canvas.width = capped.w; canvas.height = capped.h;
    const ctx = canvas.getContext("2d");
    ctx.imageSmoothingEnabled = true; ctx.imageSmoothingQuality = "high";
    if (els.format.value === "image/jpeg") { ctx.fillStyle = "#ffffff"; ctx.fillRect(0, 0, capped.w, capped.h); }
    ctx.drawImage(img, 0, 0, capped.w, capped.h);
    drawWatermark(ctx, capped.w, capped.h);
    return { canvas: canvas, quality: capped.quality, w: capped.w, h: capped.h };
  }

  function canvasToBlob(canvas, mime, quality) {
    return new Promise(function (resolve) {
      if (mime === "image/png") canvas.toBlob(function (b) { resolve(b); }, mime);
      else canvas.toBlob(function (b) { resolve(b); }, mime, quality);
    });
  }

  function extFor(mime) { return mime === "image/webp" ? "webp" : mime === "image/png" ? "png" : "jpg"; }
  function baseName(name) { return name.replace(/\.[^.]+$/, "") || "image"; }

  var renderTimer = null;
  function scheduleRender() { clearTimeout(renderTimer); renderTimer = setTimeout(renderPreview, 40); }

  async function renderPreview() {
    if (activeIndex < 0 || !items[activeIndex]) {
      els.preview.width = 400; els.preview.height = 300;
      els.preview.getContext("2d").clearRect(0, 0, 400, 300);
      els.previewMeta.textContent = "No image selected";
      return;
    }
    const item = items[activeIndex];
    const result = processToCanvas(item.img);
    const maxDisp = 480;
    const scale = Math.min(1, maxDisp / Math.max(result.w, result.h));
    els.preview.width = Math.round(result.w * scale);
    els.preview.height = Math.round(result.h * scale);
    els.preview.getContext("2d").drawImage(result.canvas, 0, 0, els.preview.width, els.preview.height);
    const blob = await canvasToBlob(result.canvas, els.format.value, result.quality);
    const kb = blob ? (blob.size / 1024).toFixed(1) : "?";
    const freeTag = unlocked ? "" : " · free limits applied";
    els.previewMeta.textContent = item.name + " · " + item.img.naturalWidth + "×" + item.img.naturalHeight +
      " → " + result.w + "×" + result.h + " · ~" + kb + " KB · q" + result.quality.toFixed(2) + freeTag;
  }

  async function downloadOne(index) {
    const item = items[index]; if (!item) return;
    const result = processToCanvas(item.img);
    const mime = els.format.value;
    const blob = await canvasToBlob(result.canvas, mime, result.quality); if (!blob) return;
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = baseName(item.name) + "_" + result.w + "x" + result.h + "." + extFor(mime);
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(function () { URL.revokeObjectURL(a.href); }, 2000);
  }

  async function downloadAll() {
    for (var i = 0; i < items.length; i++) {
      await downloadOne(i);
      await new Promise(function (r) { setTimeout(r, 200); });
    }
  }

  function clearAll() {
    items = []; activeIndex = -1;
    els.thumbs.innerHTML = ""; els.thumbs.hidden = true; els.dropEmpty.hidden = false;
    els.downloadBtn.disabled = true; els.downloadAllBtn.disabled = true; els.clearBtn.disabled = true;
    scheduleRender();
  }

  els.pickBtn.addEventListener("click", function () { els.fileInput.click(); });
  els.fileInput.addEventListener("change", function () { addFiles(els.fileInput.files); els.fileInput.value = ""; });
  ["dragenter", "dragover"].forEach(function (ev) {
    els.dropZone.addEventListener(ev, function (e) { e.preventDefault(); els.dropZone.classList.add("dragover"); });
  });
  ["dragleave", "drop"].forEach(function (ev) {
    els.dropZone.addEventListener(ev, function (e) { e.preventDefault(); els.dropZone.classList.remove("dragover"); });
  });
  els.dropZone.addEventListener("drop", function (e) { addFiles(e.dataTransfer.files); });
  els.preset.addEventListener("change", function () {
    els.customSize.hidden = els.preset.value !== "custom";
    scheduleRender();
  });
  ["width", "height", "keepAspect", "format", "quality"].forEach(function (id) {
    els[id].addEventListener("input", function () {
      if (id === "quality") els.qualityLabel.textContent = Number(els.quality.value).toFixed(2);
      if (id === "format") updateQualityVisibility();
      scheduleRender();
    });
  });
  els.downloadBtn.addEventListener("click", function () { downloadOne(activeIndex); });
  els.downloadAllBtn.addEventListener("click", downloadAll);
  els.clearBtn.addEventListener("click", clearAll);
  els.unlockBtn.addEventListener("click", openModal);
  els.unlockLink.addEventListener("click", openModal);
  els.footerUnlock.addEventListener("click", openModal);
  els.modalClose.addEventListener("click", closeModal);
  els.unlockModal.addEventListener("click", function (e) { if (e.target === els.unlockModal) closeModal(); });
  els.applyKeyBtn.addEventListener("click", function () { tryUnlock(els.licenseKey.value); });
  els.demoUnlockBtn.addEventListener("click", function () { tryUnlock(DEMO_KEY); });
  els.licenseKey.addEventListener("keydown", function (e) { if (e.key === "Enter") tryUnlock(els.licenseKey.value); });
  document.addEventListener("keydown", function (e) { if (e.key === "Escape" && !els.unlockModal.hidden) closeModal(); });

  els.freeDimLabel.textContent = String(FREE.maxLongSide);
  els.freeQLabel.textContent = String(FREE.maxQuality);
  refreshUnlockUI();
  scheduleRender();
})();
