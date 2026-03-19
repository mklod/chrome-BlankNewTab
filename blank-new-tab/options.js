(() => {
  const DEFAULTS = { bgColor: "#1a1a1a" };

  const PRESETS = [
    { color: "#000000", name: "Black" },
    { color: "#1a1a1a", name: "Near Black" },
    { color: "#2c2c2e", name: "Dark Gray" },
    { color: "#f5f5f7", name: "Light Gray" },
    { color: "#ffffff", name: "White" },
    { color: "#0a1628", name: "Midnight" },
    { color: "#1b2d1b", name: "Forest" },
    { color: "#2d1f1b", name: "Cocoa" },
    { color: "#1a1a2e", name: "Navy" },
    { color: "#2e1a2e", name: "Plum" },
  ];

  const $bgColor  = document.getElementById("bgColor");
  const $hexLabel = document.getElementById("hexLabel");
  const $hexInput = document.getElementById("hexInput");
  const $presets  = document.getElementById("presets");
  const $toast    = document.getElementById("toast");
  const $r = document.getElementById("rgbR");
  const $g = document.getElementById("rgbG");
  const $b = document.getElementById("rgbB");

  // ── Helpers ──
  function hexToRgb(hex) {
    const n = parseInt(hex.replace("#", ""), 16);
    return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
  }

  function rgbToHex(r, g, b) {
    return "#" + [r, g, b].map((v) => v.toString(16).padStart(2, "0")).join("");
  }

  function clamp(v) {
    return Math.max(0, Math.min(255, parseInt(v) || 0));
  }

  // ── Sync all controls to a hex value ──
  function syncAll(hex) {
    hex = hex.toLowerCase();
    $bgColor.value = hex;
    $hexLabel.textContent = hex;
    $hexInput.value = hex;
    const [r, g, b] = hexToRgb(hex);
    $r.value = r;
    $g.value = g;
    $b.value = b;
    highlightPreset(hex);
  }

  // ── Build preset swatches ──
  PRESETS.forEach((p) => {
    const el = document.createElement("button");
    el.className = "preset";
    el.style.backgroundColor = p.color;
    el.title = p.name;
    el.dataset.color = p.color;
    el.addEventListener("click", () => {
      syncAll(p.color);
      save();
    });
    $presets.appendChild(el);
  });

  function highlightPreset(hex) {
    document.querySelectorAll(".preset").forEach((el) => {
      el.classList.toggle("active", el.dataset.color === hex);
    });
  }

  // ── Color picker events ──
  $bgColor.addEventListener("input", () => {
    syncAll($bgColor.value);
    save();
  });

  // ── RGB input events ──
  [$r, $g, $b].forEach((el) => {
    el.addEventListener("input", () => {
      const hex = rgbToHex(clamp($r.value), clamp($g.value), clamp($b.value));
      syncAll(hex);
      save();
    });
  });

  // ── Hex text input ──
  $hexInput.addEventListener("change", () => {
    let val = $hexInput.value.trim();
    if (!val.startsWith("#")) val = "#" + val;
    if (/^#[0-9a-fA-F]{6}$/.test(val)) {
      syncAll(val);
      save();
    } else {
      // Revert to current
      $hexInput.value = $bgColor.value;
    }
  });

  // ── Save ──
  function save() {
    chrome.storage.sync.set({ bgColor: $bgColor.value }, flash);
  }

  function flash() {
    $toast.classList.add("show");
    clearTimeout(flash._t);
    flash._t = setTimeout(() => $toast.classList.remove("show"), 1200);
  }

  // ── Load ──
  chrome.storage.sync.get(DEFAULTS, (s) => {
    syncAll(s.bgColor);
  });
})();
