(() => {
  const DEFAULTS = { bgColor: "#1a1a1a", showBookmarks: false };

  chrome.storage.sync.get(DEFAULTS, (settings) => {
    document.body.style.backgroundColor = settings.bgColor;

    // Chrome exposes chrome.bookmarks only with the "bookmarks" permission,
    // but showing/hiding the *bookmarks bar* is a Chrome UI element we can't
    // control programmatically.  Instead we surface the instruction in the
    // options page.  The new-tab page itself just stays blank.
  });
})();
