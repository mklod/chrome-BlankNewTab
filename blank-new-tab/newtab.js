// Last modified: 2026-03-18--1200
(() => {
  const DEFAULTS = { bgColor: "#1a1a1a", showBookmarks: false };

  chrome.storage.sync.get(DEFAULTS, (settings) => {
    document.body.style.backgroundColor = settings.bgColor;

    if (settings.showBookmarks) {
      renderBookmarks();
    }
  });

  function faviconUrl(pageUrl) {
    try {
      const u = new URL(pageUrl);
      return "https://www.google.com/s2/favicons?sz=32&domain=" + u.hostname;
    } catch {
      return "";
    }
  }

  function renderBookmarks() {
    const bar = document.getElementById("bookmarks-bar");
    bar.classList.add("visible");

    // Bookmarks bar is typically the first child of the root
    chrome.bookmarks.getTree((tree) => {
      const roots = tree[0].children;
      // Usually: [0] = Bookmarks Bar, [1] = Other Bookmarks
      const bookmarksBar = roots[0];
      if (!bookmarksBar || !bookmarksBar.children) return;

      bookmarksBar.children.forEach((node) => {
        bar.appendChild(buildNode(node));
      });
    });
  }

  function buildNode(node) {
    if (node.url) {
      // It's a bookmark link
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
      // It's a folder
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
