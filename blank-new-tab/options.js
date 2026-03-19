(() => {
  const DEFAULTS = { bgColor: "#1a1a1a", showBookmarks: false };

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

  const $bgColor      = document.getElementById("bgColor");
  const $hexLabel      = document.getElementById("hexLabel");
  const $presets       = document.getElementById("presets");
  const $showBookmarks = document.getElementById("showBookmarks");
  const $toast         = document.getElementById("toast");

  // ── Build preset swatches ──
  PRESETS.forEach((p) => {
    const el = document.createElement("button");
    el.className = "preset";
    el.style.backgroundColor = p.color;
    el.title = p.name;
    el.dataset.color = p.color;
    el.addEventListener("click", () => {
      $bgColor.value = p.color;
      $hexLabel.textContent = p.color;
      highlightPreset(p.color);
      save();
    });
    $presets.appendChild(el);
  });

  function highlightPreset(hex) {
    document.querySelectorAll(".preset").forEach((el) => {
      el.classList.toggle("active", el.dataset.color === hex.toLowerCase());
    });
  }

  // ── Color picker events ──
  $bgColor.addEventListener("input", () => {
    $hexLabel.textContent = $bgColor.value;
    highlightPreset($bgColor.value);
    save();
  });

  // ── Toggle event ──
  $showBookmarks.addEventListener("change", save);

  // ── Save ──
  function save() {
    const data = {
      bgColor: $bgColor.value,
      showBookmarks: $showBookmarks.checked,
    };
    chrome.storage.sync.set(data, flash);
  }

  function flash() {
    $toast.classList.add("show");
    clearTimeout(flash._t);
    flash._t = setTimeout(() => $toast.classList.remove("show"), 1200);
  }

  // ── Load ──
  chrome.storage.sync.get(DEFAULTS, (s) => {
    $bgColor.value = s.bgColor;
    $hexLabel.textContent = s.bgColor;
    $showBookmarks.checked = s.showBookmarks;
    highlightPreset(s.bgColor);
  });
})();
