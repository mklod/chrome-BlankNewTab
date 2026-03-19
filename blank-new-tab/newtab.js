// Last modified: 2026-03-19--0200
(() => {
  chrome.storage.sync.get({ bgColor: "#1a1a1a" }, (s) => {
    document.body.style.backgroundColor = s.bgColor;
    localStorage.setItem("bgColor", s.bgColor);
  });
})();
