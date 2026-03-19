// Last modified: 2026-03-18--1500
(() => {
  const DEFAULTS = { bgColor: "#1a1a1a", showBookmarks: false };
  const CACHE_KEY = "bookmarksBarCache";

  chrome.storage.sync.get(DEFAULTS, (settings) => {
    document.body.style.backgroundColor = settings.bgColor;

    if (settings.showBookmarks) {
      restoreCachedBar();
      renderBookmarks();
    }
  });

  function faviconUrl(pageUrl) {
    try {
      const u = new URL(pageUrl);
      return "chrome-extension://" + chrome.runtime.id + "/_favicon/?pageUrl=" + encodeURIComponent(u.origin) + "&size=32";
    } catch {
      return "";
    }
  }

  // Instantly restore cached HTML so bar appears before API call completes
  function restoreCachedBar() {
    const bar = document.getElementById("bookmarks-bar");
    const cached = localStorage.getItem(CACHE_KEY);
    if (cached) {
      bar.classList.add("visible");
      // Insert cached items before the overflow-wrap
      const overflowWrap = document.getElementById("overflow-wrap");
      const temp = document.createElement("div");
      temp.innerHTML = cached;
      while (temp.firstChild) {
        bar.insertBefore(temp.firstChild, overflowWrap);
      }
    }
  }

  let allBookmarkNodes = [];

  function renderBookmarks() {
    const bar = document.getElementById("bookmarks-bar");

    chrome.bookmarks.getTree((tree) => {
      const roots = tree[0].children;
      const bookmarksBar = roots[0];
      if (!bookmarksBar || !bookmarksBar.children) return;

      // Clear any cached nodes (they'll be replaced with fresh ones)
      const overflowWrap = document.getElementById("overflow-wrap");
      while (bar.firstChild && bar.firstChild !== overflowWrap) {
        bar.removeChild(bar.firstChild);
      }

      bar.classList.add("visible");
      allBookmarkNodes = bookmarksBar.children.map((node) => buildNode(node));
      allBookmarkNodes.forEach((el) => bar.insertBefore(el, overflowWrap));
      updateOverflow();

      // Cache the rendered HTML for instant restore next time
      const html = allBookmarkNodes.map((el) => el.outerHTML).join("");
      localStorage.setItem(CACHE_KEY, html);
    });
  }

  function updateOverflow() {
    const bar = document.getElementById("bookmarks-bar");
    const overflowWrap = document.getElementById("overflow-wrap");
    const overflowDropdown = document.getElementById("overflow-dropdown");

    // Reset: show all items
    allBookmarkNodes.forEach((el) => { el.style.display = ""; });
    overflowWrap.classList.remove("visible");
    overflowDropdown.innerHTML = "";

    const barRect = bar.getBoundingClientRect();
    const barPadding = 24;
    const overflowBtnWidth = 44;
    const availableWidth = barRect.width - barPadding;

    // Measure which items fit
    let usedWidth = 0;
    let firstOverflowIdx = -1;
    for (let i = 0; i < allBookmarkNodes.length; i++) {
      const el = allBookmarkNodes[i];
      const w = el.getBoundingClientRect().width + 4;
      if (firstOverflowIdx === -1 && usedWidth + w > availableWidth - overflowBtnWidth) {
        let totalW = usedWidth + w;
        for (let j = i + 1; j < allBookmarkNodes.length; j++) {
          totalW += allBookmarkNodes[j].getBoundingClientRect().width + 4;
        }
        if (totalW <= availableWidth) {
          usedWidth += w;
          continue;
        }
        firstOverflowIdx = i;
      }
      if (firstOverflowIdx !== -1 && i >= firstOverflowIdx) {
        // doesn't fit
      } else {
        usedWidth += w;
      }
    }

    if (firstOverflowIdx === -1) return;

    overflowWrap.classList.add("visible");
    for (let i = firstOverflowIdx; i < allBookmarkNodes.length; i++) {
      allBookmarkNodes[i].style.display = "none";
      const clone = allBookmarkNodes[i].cloneNode(true);
      clone.style.display = "";
      overflowDropdown.appendChild(clone);
    }
  }

  window.addEventListener("resize", updateOverflow);

  function buildNode(node) {
    if (node.url) {
      const a = document.createElement("a");
      a.href = node.url;
      a.title = node.title || node.url;
      const icon = document.createElement("img");
      icon.src = faviconUrl(node.url);
      icon.alt = "";
      a.appendChild(icon);
      const span = document.createElement("span");
      span.textContent = node.title || node.url;
      a.appendChild(span);
      return a;
    } else {
      const wrap = document.createElement("div");
      wrap.className = "folder-wrap";

      const label = document.createElement("div");
      label.className = "folder";
      label.innerHTML = '<svg class="folder-icon" viewBox="0 0 16 16" fill="none" stroke="rgba(255,255,255,0.7)" stroke-width="1.3"><path d="M2 4.5A1.5 1.5 0 013.5 3H6l1.5 1.5h5A1.5 1.5 0 0114 6v5.5a1.5 1.5 0 01-1.5 1.5h-9A1.5 1.5 0 012 11.5z"/></svg>';
      const span = document.createElement("span");
      span.textContent = node.title || "Folder";
      label.appendChild(span);
      wrap.appendChild(label);

      if (node.children && node.children.length) {
        const dropdown = document.createElement("div");
        dropdown.className = "folder-dropdown";
        node.children.forEach((child) => {
          if (child.url) {
            const a = document.createElement("a");
            a.href = child.url;
            a.title = child.title || child.url;
            const icon = document.createElement("img");
            icon.src = faviconUrl(child.url);
            icon.alt = "";
            a.appendChild(icon);
            const s = document.createElement("span");
            s.textContent = child.title || child.url;
            a.appendChild(s);
            dropdown.appendChild(a);
          }
        });
        wrap.appendChild(dropdown);
      }
      return wrap;
    }
  }
})();
