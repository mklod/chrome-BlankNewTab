// Last modified: 2026-03-18--1430
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

  let allBookmarkNodes = [];

  function renderBookmarks() {
    const bar = document.getElementById("bookmarks-bar");
    bar.classList.add("visible");

    chrome.bookmarks.getTree((tree) => {
      const roots = tree[0].children;
      const bookmarksBar = roots[0];
      if (!bookmarksBar || !bookmarksBar.children) return;

      allBookmarkNodes = bookmarksBar.children.map((node) => buildNode(node));
      allBookmarkNodes.forEach((el) => bar.insertBefore(el, document.getElementById("overflow-wrap")));
      updateOverflow();
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

    // Available width = bar width minus padding minus overflow button reserved space
    const barRect = bar.getBoundingClientRect();
    const barPadding = 24; // 12px each side
    const overflowBtnWidth = 44; // approximate width of » button
    const availableWidth = barRect.width - barPadding;

    // Measure which items fit
    let usedWidth = 0;
    let firstOverflowIdx = -1;
    for (let i = 0; i < allBookmarkNodes.length; i++) {
      const el = allBookmarkNodes[i];
      const w = el.getBoundingClientRect().width + 4; // 4px gap
      if (firstOverflowIdx === -1 && usedWidth + w > availableWidth - overflowBtnWidth) {
        // Check if everything fits without the overflow button
        let totalW = usedWidth + w;
        let allFit = true;
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
        // This doesn't fit
      } else {
        usedWidth += w;
      }
    }

    if (firstOverflowIdx === -1) return; // everything fits

    // Hide overflowed items, clone them into the dropdown
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
