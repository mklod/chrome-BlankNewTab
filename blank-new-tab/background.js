// Last modified: 2026-03-19--0130
// Service worker: toggles native bookmarks bar on/off for new tab pages

function toggleBar() {
  chrome.runtime.sendNativeMessage(
    "com.blanktab.togglebar",
    { action: "toggle" },
    () => {
      if (chrome.runtime.lastError) {
        console.error("Native host error:", chrome.runtime.lastError.message);
      }
    }
  );
}

function isNewTabUrl(url) {
  if (!url) return false;
  return url === "chrome://newtab/"
    || url === "chrome-extension://" + chrome.runtime.id + "/newtab.html";
}

async function getBarVisible() {
  return new Promise((resolve) => {
    chrome.storage.session.get({ barVisible: false }, (r) => resolve(r.barVisible));
  });
}

async function setBarVisible(val) {
  await chrome.storage.session.set({ barVisible: val });
}

async function showBar() {
  if (!(await getBarVisible())) {
    toggleBar();
    await setBarVisible(true);
  }
}

async function hideBar() {
  if (await getBarVisible()) {
    toggleBar();
    await setBarVisible(false);
  }
}

// Fire as early as possible when a new tab is created — before it's visible
chrome.tabs.onCreated.addListener((tab) => {
  const url = tab.url || tab.pendingUrl || "";
  if (isNewTabUrl(url)) {
    showBar();
  }
});

// Handle tab switching
chrome.tabs.onActivated.addListener(async (activeInfo) => {
  const tab = await chrome.tabs.get(activeInfo.tabId);
  const url = tab.url || tab.pendingUrl || "";
  if (isNewTabUrl(url)) {
    showBar();
  } else {
    hideBar();
  }
});

// Handle navigation away from new tab
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (!changeInfo.url) return;
  // Tab navigated — if it was our new tab and now isn't, hide
  if (!isNewTabUrl(changeInfo.url)) {
    // Only hide if this is the active tab
    chrome.tabs.query({ active: true, lastFocusedWindow: true }, (tabs) => {
      if (tabs[0] && tabs[0].id === tabId) {
        hideBar();
      }
    });
  }
});

// Handle window focus changes
chrome.windows.onFocusChanged.addListener(async (windowId) => {
  if (windowId === chrome.windows.WINDOW_ID_NONE) return;
  const [tab] = await chrome.tabs.query({ active: true, windowId });
  if (!tab) return;
  const url = tab.url || tab.pendingUrl || "";
  if (isNewTabUrl(url)) {
    showBar();
  } else {
    hideBar();
  }
});
