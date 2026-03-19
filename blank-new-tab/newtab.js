// Last modified: 2026-03-18--1545
(() => {
  const DEFAULTS = { bgColor: "#1a1a1a" };

  chrome.storage.sync.get(DEFAULTS, (settings) => {
    document.body.style.backgroundColor = settings.bgColor;
    localStorage.setItem("bgColor", settings.bgColor);
  });
})();
