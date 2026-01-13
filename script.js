// ==UserScript==
// @name         gibbon-ui-tweaks
// @namespace    http://tampermonkey.net/
// @version      1.8
// @description  Popup with Global, Timetable, Extension categories; Master toggle; link color; accent bar color+size; paragraph font (incl. Comic Sans MS); Gamer Party Mode; Better Tables; Endless Stream (Lazy Load + Auto Load More on Stream page) + Return to Top button; squared corners; better timetable; keybind selector; popup position; update checker. Fully merged.
// @match        https://gibbon.ichk.edu.hk/*
// @grant        none
// ==/UserScript==

(function () {
  'use strict';

  const CURRENT_VERSION = '1.8';

  const LS = {
    masterToggle: 'gibbon_masterToggle',
    linkColor: 'gibbon_linkColor',
    barAccent: 'gibbon_barAccent',
    barFontSize: 'gibbon_barFontSize',
    paragraphFont: 'gibbon_paragraphFont',
    squareToggle: 'gibbon_squareToggle',
    betterToggle: 'gibbon_betterToggle',
    gamerParty: 'gibbon_gamerParty',
    keybind: 'gibbon_keybind',
    menuVisible: 'gibbon_menuVisible',
    menuPosition: 'gibbon_menuPosition',
    streamEnhance: 'gibbon_streamEnhance',
    betterTables: 'gibbon_betterTables'
  };

  const DEFAULTS = {
    masterToggle: true,
    linkColor: '#0E70EB',
    barAccent: '#007acc',
    barFontSize: '15px',
    paragraphFont: 'Lexend',
    squareToggle: false,
    betterToggle: false,
    gamerParty: false,
    keybind: 'p',
    menuVisible: 'true',
    menuPosition: 'top-right',
    streamEnhance: false, // default OFF
    betterTables: false   // default OFF
  };

  const persisted = {
    masterToggle: localStorage.getItem(LS.masterToggle) !== 'false',
    linkColor: localStorage.getItem(LS.linkColor) || DEFAULTS.linkColor,
    barAccent: localStorage.getItem(LS.barAccent) || DEFAULTS.barAccent,
    barFontSize: localStorage.getItem(LS.barFontSize) || DEFAULTS.barFontSize,
    paragraphFont: localStorage.getItem(LS.paragraphFont) || DEFAULTS.paragraphFont,
    squareToggle: localStorage.getItem(LS.squareToggle) === 'true' || DEFAULTS.squareToggle,
    betterToggle: localStorage.getItem(LS.betterToggle) === 'true' || DEFAULTS.betterToggle,
    gamerParty: localStorage.getItem(LS.gamerParty) === 'true' || DEFAULTS.gamerParty,
    keybind: (localStorage.getItem(LS.keybind) || DEFAULTS.keybind).toLowerCase(),
    menuVisible: localStorage.getItem(LS.menuVisible) ?? DEFAULTS.menuVisible,
    menuPosition: localStorage.getItem(LS.menuPosition) || DEFAULTS.menuPosition,
    streamEnhance: localStorage.getItem(LS.streamEnhance) === 'true' || DEFAULTS.streamEnhance,
    betterTables: localStorage.getItem(LS.betterTables) === 'true' || DEFAULTS.betterTables
  };

  function setLS(key, value) { localStorage.setItem(key, value); }
  function upsertStyle(id, cssText) {
    let node = document.getElementById(id);
    if (!node) {
      node = document.createElement('style');
      node.id = id;
      document.head.appendChild(node);
    }
    node.textContent = cssText;
  }

  // Base CSS for menu UI and RGB animation
  upsertStyle('gibbonUiBase', `
    @import url('https://fonts.googleapis.com/css2?family=Lexend:wght@300;400;700&display=swap');

    @property --rgbHue { syntax: '<number>'; inherits: false; initial-value: 0; }
    @keyframes rgbCycle { from { --rgbHue: 0; } to { --rgbHue: 360; } }

    #controlMenu {
      position: fixed;
      top: 12px;
      ${persisted.menuPosition === 'top-left' ? 'left: 12px;' : 'right: 12px;'}
      width: 280px;
      max-height: 80vh;
      overflow-y: auto;
      background: rgba(255,255,255,0.96);
      border: 2px solid ${persisted.barAccent};
      padding: 12px;
      border-radius: 12px;
      box-shadow: 0 10px 22px rgba(0,0,0,0.18);
      z-index: 9999;
      display: flex;
      flex-direction: column;
      gap: 16px;
      font-family: 'Lexend', sans-serif;
      font-size: 13px;
      backdrop-filter: saturate(1.05) blur(6px);
    }
    #controlMenu .header { display: flex; justify-content: space-between; align-items: center; }
    #controlMenu .title { font-weight: 700; font-size: 14px; color: #333; }
    #controlMenu .meta { font-size: 12px; color: #666; }
    #controlMenu h4 { margin: 0; font-size: 13px; font-weight: 700; color: #222; border-bottom: 1px solid #e5e5e5; padding-bottom: 6px; }
    #controlMenu .section { display: flex; flex-direction: column; gap: 10px; }
    #controlMenu .group { display: flex; flex-direction: column; gap: 6px; }
    #controlMenu .row { display: flex; gap: 8px; align-items: center; }
    #controlMenu label, #controlMenu span { font-weight: 600; color: #333; }
    #controlMenu input[type="color"], #controlMenu select, #controlMenu button {
      height: 30px; border: 1px solid #ccc; border-radius: 8px; background: #fff; padding: 4px 8px; font-size: 13px;
    }
    #controlMenu button { cursor: pointer; background: #f7f7f7; font-weight: 700; }
    #controlMenu .hint { font-size: 11px; color: #777; }
    #updateBtn { margin-top: 8px; }
  `);

  // Apply site styles (respecting master toggle and gamer party mode)
  function applyAllStyles() {
    const s = document.getElementById('customStyles'); if (s) s.remove();
    if (!persisted.masterToggle) return;

    let css = `
      p,
      span.block.text-sm.text-gray-700.overflow-x-auto {
        font-family: '${persisted.paragraphFont}', sans-serif !important;
        font-size: 17px !important;
        line-height: 1.2 !important;
      }
    `;

    if (persisted.gamerParty) {
      css += `
        th {
          --rgbHue: 0;
          background-color: hsl(var(--rgbHue), 90%, 45%) !important;
          color: #fff !important;
          font-size: ${persisted.barFontSize} !important;
          animation: rgbCycle 6s linear infinite !important;
        }
        main a, .content a, article a, p a {
          --rgbHue: 0;
          color: hsl(var(--rgbHue), 90%, 50%) !important;
          animation: rgbCycle 6s linear infinite !important;
          display: inline-block;
        }
      `;
    } else {
      css += `
        th {
          background-color: ${persisted.barAccent} !important;
          color: #fff !important;
          font-size: ${persisted.barFontSize} !important;
        }
        main a, .content a, article a, p a { color: ${persisted.linkColor} !important; }
      `;
    }

    if (persisted.squareToggle) {
      css += `.ttItem { border-radius: 0 !important; }`;
    }
    if (persisted.betterToggle) {
      css += `
        .ttItem {
          padding: 10px !important;
          outline: 1px solid #0077cc !important;
          color: #C93F3F !important;
          font-size: 16px !important;
          line-height: 1.6 !important;
          font-weight: 500 !important;
          text-align: center !important;
        }
        .ttItem:hover { outline-color: #005fa3 !important; }
        .ttItem span { text-align: center !important; font-weight: bold !important; }
        .ttItem div.inline-block {
          display: inline-block !important;
          font-size: 12px !important;
          font-weight: bold !important;
          margin-top: 2px !important;
          color: inherit !important;
        }
      `;
    }

    // Better Tables (global)
    if (persisted.betterTables) {
      css += `
        th {
          font-family: 'Lexend', sans-serif !important;
          font-size: 15px !important;
          padding: 12px !important;
          letter-spacing: 0.5px !important;
          font-weight: bold !important;
          text-transform: uppercase !important;
          border-bottom: 3px solid #555 !important;
          background-color: #007acc !important;
          color: #fff !important;
        }
        tr:nth-child(even) {
          background-color: #f5f5f5 !important;
        }
      `;
    }

    upsertStyle('customStyles', css);
  }
  applyAllStyles();

  // Build popup menu
  const menu = document.createElement('div');
  menu.id = 'controlMenu';
  menu.style.display = (persisted.menuVisible === 'false') ? 'none' : 'flex';

  // Header
  const header = document.createElement('div');
  header.className = 'header';
  const title = document.createElement('div');
  title.className = 'title';
  title.textContent = 'Gibbon Controls';
  const meta = document.createElement('div');
  meta.className = 'meta';
  meta.textContent = `Version ${CURRENT_VERSION} • Toggle: ${persisted.keybind.toUpperCase()} • Position: ${persisted.menuPosition.replace('-', ' ')}`;
  header.appendChild(title);
  header.appendChild(meta);

  // Master toggle
  const masterGroup = document.createElement('label');
  masterGroup.className = 'group';
  const masterRow = document.createElement('div');
  masterRow.className = 'row';
  const masterText = document.createElement('span');
  masterText.textContent = 'Enable customizations';
  const masterToggleEl = document.createElement('input');
  masterToggleEl.type = 'checkbox';
  masterToggleEl.checked = persisted.masterToggle;
  masterRow.appendChild(masterText);
  masterRow.appendChild(masterToggleEl);
  masterGroup.appendChild(masterRow);

  // GLOBAL SECTION
  const globalSection = document.createElement('div');
  globalSection.className = 'section';
  const globalHeader = document.createElement('h4');
  globalHeader.textContent = 'Global';

  // Link color
  const linkGroup = document.createElement('div');
  linkGroup.className = 'group';
  const linkLabel = document.createElement('span');
  linkLabel.textContent = 'Link color';
  const linkPicker = document.createElement('input');
  linkPicker.type = 'color';
  linkPicker.value = persisted.linkColor;
  linkGroup.appendChild(linkLabel);
  linkGroup.appendChild(linkPicker);

  // Accent bar (color + font size)
  const accentGroup = document.createElement('div');
  accentGroup.className = 'group';
  const accentLabel = document.createElement('span');
  accentLabel.textContent = 'Accent bar';
  const accentRow = document.createElement('div');
  accentRow.className = 'row';
  const accentPicker = document.createElement('input');
  accentPicker.type = 'color';
  accentPicker.value = persisted.barAccent;
  const accentSize = document.createElement('select');
  ['13px','14px','15px','16px','18px','20px'].forEach(size => {
    const opt = document.createElement('option');
    opt.value = size;
    opt.textContent = size;
    accentSize.appendChild(opt);
  });
  accentSize.value = persisted.barFontSize;
  accentRow.appendChild(accentPicker);
  accentRow.appendChild(accentSize);
  accentGroup.appendChild(accentLabel);
  accentGroup.appendChild(accentRow);

  // Paragraph font (+ Comic Sans MS) with Apply
  const fontGroup = document.createElement('div');
  fontGroup.className = 'group';
  const fontLabel = document.createElement('span');
  fontLabel.textContent = 'Paragraph font';
  const fontRow = document.createElement('div');
  fontRow.className = 'row';
  const fontSelect = document.createElement('select');
  ['Lexend','Roboto','Open Sans','Montserrat','Arial','Georgia','Courier New','Comic Sans MS'].forEach(f => {
    const opt = document.createElement('option');
    opt.value = f;
    opt.textContent = f;
    fontSelect.appendChild(opt);
  });
  fontSelect.value = persisted.paragraphFont;
  const fontApply = document.createElement('button');
  fontApply.textContent = 'Apply';
  fontRow.appendChild(fontSelect);
  fontRow.appendChild(fontApply);
  fontGroup.appendChild(fontLabel);
  fontGroup.appendChild(fontRow);

  // Gamer Party Mode toggle
  const gamerGroup = document.createElement('label');
  gamerGroup.className = 'group';
  const gamerRow = document.createElement('div');
  gamerRow.className = 'row';
  const gamerText = document.createElement('span');
  gamerText.textContent = 'Gamer Party Mode';
  const gamerToggle = document.createElement('input');
  gamerToggle.type = 'checkbox';
  gamerToggle.checked = persisted.gamerParty;
  gamerRow.appendChild(gamerText);
  gamerRow.appendChild(gamerToggle);
  gamerGroup.appendChild(gamerRow);

  // Better Tables toggle
  const betterTablesGroup = document.createElement('label');
  betterTablesGroup.className = 'group';
  const betterTablesRow = document.createElement('div');
  betterTablesRow.className = 'row';
  const betterTablesText = document.createElement('span');
  betterTablesText.textContent = 'Better Tables';
  const betterTablesToggle = document.createElement('input');
  betterTablesToggle.type = 'checkbox';
  betterTablesToggle.checked = persisted.betterTables;
  betterTablesRow.appendChild(betterTablesText);
  betterTablesRow.appendChild(betterTablesToggle);
  betterTablesGroup.appendChild(betterTablesRow);
  const betterTablesHint = document.createElement('div');
  betterTablesHint.className = 'hint';
  betterTablesHint.textContent = 'Styles table headers and zebra-stripes rows.';
  betterTablesGroup.appendChild(betterTablesHint);

  // Endless Stream toggle + Return to Top button
  const streamGroup = document.createElement('label');
  streamGroup.className = 'group';
  const streamRow = document.createElement('div');
  streamRow.className = 'row';
  const streamText = document.createElement('span');
  streamText.textContent = 'Endless Stream';
  const streamToggle = document.createElement('input');
  streamToggle.type = 'checkbox';
  streamToggle.checked = persisted.streamEnhance;
  streamRow.appendChild(streamText);
  streamRow.appendChild(streamToggle);
  streamGroup.appendChild(streamRow);

  const streamHint = document.createElement('div');
  streamHint.className = 'hint';
  streamHint.textContent = 'Runs on Stream page only. Lazy loads images + auto-clicks Load More.';
  streamGroup.appendChild(streamHint);

  const returnBtn = document.createElement('button');
  returnBtn.textContent = 'Return to Top';
  returnBtn.addEventListener('click', () => {
    window.location.href = 'https://gibbon.ichk.edu.hk/index.php?q=%2Fmodules%2FStream%2Fstream.php#top';
  });
  streamGroup.appendChild(returnBtn);

  // Append Global section items
  globalSection.appendChild(globalHeader);
  globalSection.appendChild(linkGroup);
  globalSection.appendChild(accentGroup);
  globalSection.appendChild(fontGroup);
  globalSection.appendChild(gamerGroup);
  globalSection.appendChild(betterTablesGroup);
  globalSection.appendChild(streamGroup);

  // TIMETABLE SECTION
  const timetableSection = document.createElement('div');
  timetableSection.className = 'section';
  const timetableHeader = document.createElement('h4');
  timetableHeader.textContent = 'Timetable';

  const squareGroup = document.createElement('label');
  squareGroup.className = 'group';
  const squareText = document.createElement('span');
  squareText.textContent = 'Squared corners';
  const squareToggle = document.createElement('input');
  squareToggle.type = 'checkbox';
  squareToggle.checked = persisted.squareToggle;
  squareGroup.appendChild(squareText);
  squareGroup.appendChild(squareToggle);

  const betterGroup = document.createElement('label');
  betterGroup.className = 'group';
  const betterText = document.createElement('span');
  betterText.textContent = 'Better timetable';
  const betterToggle = document.createElement('input');
  betterToggle.type = 'checkbox';
  betterToggle.checked = persisted.betterToggle;
  betterGroup.appendChild(betterText);
  betterGroup.appendChild(betterToggle);

  timetableSection.appendChild(timetableHeader);
  timetableSection.appendChild(squareGroup);
  timetableSection.appendChild(betterGroup);

  // EXTENSION SECTION
  const extensionSection = document.createElement('div');
  extensionSection.className = 'section';
  const extensionHeader = document.createElement('h4');
  extensionHeader.textContent = 'Extension';

  // Keybind selector
  const keybindGroup = document.createElement('div');
  keybindGroup.className = 'group';
  const keybindLabel = document.createElement('span');
  keybindLabel.textContent = 'Toggle keybind';
  const keybindSelect = document.createElement('select');
  ['p','o','k','m','b','n','h','j'].forEach(k => {
    const opt = document.createElement('option');
    opt.value = k;
    opt.textContent = k.toUpperCase();
    keybindSelect.appendChild(opt);
  });
  keybindSelect.value = persisted.keybind;
  const keybindHint = document.createElement('div');
  keybindHint.className = 'hint';
  keybindHint.textContent = 'Press the selected key to show/hide the menu.';
  keybindGroup.appendChild(keybindLabel);
  keybindGroup.appendChild(keybindSelect);
  keybindGroup.appendChild(keybindHint);

  // Popup position selector
  const positionGroup = document.createElement('div');
  positionGroup.className = 'group';
  const positionLabel = document.createElement('span');
  positionLabel.textContent = 'Popup position';
  const positionSelect = document.createElement('select');
  [{ v: 'top-left', t: 'Top left' }, { v: 'top-right', t: 'Top right' }].forEach(p => {
    const opt = document.createElement('option');
    opt.value = p.v;
    opt.textContent = p.t;
    positionSelect.appendChild(opt);
  });
  positionSelect.value = persisted.menuPosition;
  const positionHint = document.createElement('div');
  positionHint.className = 'hint';
  positionHint.textContent = 'Choose where the popup menu docks.';
  positionGroup.appendChild(positionLabel);
  positionGroup.appendChild(positionSelect);
  positionGroup.appendChild(positionHint);

  extensionSection.appendChild(extensionHeader);
  extensionSection.appendChild(keybindGroup);
  extensionSection.appendChild(positionGroup);

  // Update checker button
  const updateBtn = document.createElement('button');
  updateBtn.id = 'updateBtn';
  updateBtn.textContent = 'Check for Updates';
  extensionSection.appendChild(updateBtn);

  // Assemble menu
  menu.appendChild(header);
  menu.appendChild(masterGroup);
  menu.appendChild(globalSection);
  menu.appendChild(timetableSection);
  menu.appendChild(extensionSection);
  document.body.appendChild(menu);

  // Event handlers

  // Master toggle: persist and reload both ON/OFF (disables everything except GUI)
  masterToggleEl.addEventListener('change', () => {
    setLS(LS.masterToggle, masterToggleEl.checked);
    location.reload();
  });

  // Link color (live update unless gamer party is ON)
  linkPicker.addEventListener('input', () => {
    setLS(LS.linkColor, linkPicker.value);
    if (masterToggleEl.checked && !gamerToggle.checked) applyAllStyles();
  });

  // Accent bar color + font size (live update unless gamer party is ON)
  function updateAccent() {
    setLS(LS.barAccent, accentPicker.value);
    setLS(LS.barFontSize, accentSize.value);
    menu.style.borderColor = accentPicker.value;
    if (masterToggleEl.checked && !gamerToggle.checked) applyAllStyles();
  }
  accentPicker.addEventListener('input', updateAccent);
  accentSize.addEventListener('change', updateAccent);

  // Paragraph font apply: persist and auto-refresh
  fontApply.addEventListener('click', () => {
    setLS(LS.paragraphFont, fontSelect.value);
    location.reload();
  });

  // Gamer Party Mode: persist and reload to cleanly apply/remove animation
  gamerToggle.addEventListener('change', () => {
    setLS(LS.gamerParty, gamerToggle.checked);
    location.reload();
  });

  // Better Tables toggle
  betterTablesToggle.addEventListener('change', () => {
    setLS(LS.betterTables, betterTablesToggle.checked);
    location.reload();
  });

  // Endless Stream toggle: persist and reload to initialize/disable on Stream page
  streamToggle.addEventListener('change', () => {
    setLS(LS.streamEnhance, streamToggle.checked);
    location.reload();
  });

  // Squared corners: persist and auto-refresh
  squareToggle.addEventListener('change', () => {
    setLS(LS.squareToggle, squareToggle.checked);
    location.reload();
  });

  // Better timetable: persist and auto-refresh
  betterToggle.addEventListener('change', () => {
    setLS(LS.betterToggle, betterToggle.checked);
    location.reload();
  });

  // Keybind selector
  keybindSelect.addEventListener('change', () => {
    const kb = keybindSelect.value.toLowerCase();
    setLS(LS.keybind, kb);
    meta.textContent = `Version ${CURRENT_VERSION} • Toggle: ${kb.toUpperCase()} • Position: ${positionSelect.value.replace('-', ' ')}`;
  });

  // Position selector (apply immediately)
  function applyMenuPosition(pos) {
    menu.style.left = '';
    menu.style.right = '';
    if (pos === 'top-left') menu.style.left = '12px';
    else menu.style.right = '12px';
    meta.textContent = `Version ${CURRENT_VERSION} • Toggle: ${(localStorage.getItem(LS.keybind) || DEFAULTS.keybind).toUpperCase()} • Position: ${pos.replace('-', ' ')}`;
  }
  positionSelect.addEventListener('change', () => {
    const pos = positionSelect.value;
    setLS(LS.menuPosition, pos);
    applyMenuPosition(pos);
  });
  applyMenuPosition(persisted.menuPosition);

  // Toggle menu visibility by keybind (GUI available even if master OFF)
  document.addEventListener('keydown', (e) => {
    const t = e.target;
    const typing = t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.tagName === 'SELECT' || t.isContentEditable);
    if (typing) return;
    const kb = (localStorage.getItem(LS.keybind) || DEFAULTS.keybind).toLowerCase();
    if (e.key && e.key.toLowerCase() === kb) {
      const newDisplay = (menu.style.display === 'none') ? 'flex' : 'none';
      menu.style.display = newDisplay;
      setLS(LS.menuVisible, newDisplay === 'flex' ? 'true' : 'false');
    }
  });

  // Persist menu visibility across reloads
  const visiblePersisted = localStorage.getItem(LS.menuVisible);
  menu.style.display = (visiblePersisted === 'false') ? 'none' : 'flex';

  // Update checker
  async function checkForUpdates() {
    try {
      const resp = await fetch('https://raw.githubusercontent.com/thelwc227/gibbon-ui-tweaks/main/script.js', { cache: 'no-store' });
      if (!resp.ok) { alert('Unable to check updates (network error).'); return; }
      const text = await resp.text();
      const match = text.match(/@version\s+([0-9.]+)/);
      if (!match) { alert('Could not determine remote version.'); return; }
      const remoteVersion = match[1];

      function cmp(a, b) {
        const pa = a.split('.').map(n => parseInt(n, 10));
        const pb = b.split('.').map(n => parseInt(n, 10));
        const len = Math.max(pa.length, pb.length);
        for (let i = 0; i < len; i++) {
          const va = pa[i] || 0, vb = pb[i] || 0;
          if (va > vb) return 1;
          if (va < vb) return -1;
        }
        return 0;
      }

      if (cmp(remoteVersion, CURRENT_VERSION) > 0) {
        if (confirm(`A newer version (${remoteVersion}) is available. Redirect to GitHub repo?`)) {
          window.location.href = 'https://github.com/thelwc227/gibbon-ui-tweaks/tree/main';
        }
      } else {
        alert('You are using the latest version.');
      }
    } catch (e) {
      alert('Error checking updates: ' + (e && e.message ? e.message : e));
    }
  }
  updateBtn.addEventListener('click', checkForUpdates);

  // --- Endless Stream (Lazy Load + Auto Load More) ---
  function isExactStreamPage() {
    // Exact page: https://gibbon.ichk.edu.hk/index.php?q=%2Fmodules%2FStream%2Fstream.php
    const u = new URL(window.location.href);
    const q = u.searchParams.get('q');
    return u.pathname === '/index.php' && decodeURIComponent(q || '') === '/modules/Stream/stream.php';
  }

  function initEndlessStream() {
    if (!persisted.masterToggle) return;
    if (!persisted.streamEnhance) return;
    if (!isExactStreamPage()) return;

    // Lazy Load Images
    function prepareImages(scope = document) {
      const imgs = scope.querySelectorAll('img');
      imgs.forEach(img => {
        if (img.dataset.lazyPrepared) return;
        if (img.src) {
          img.dataset.src = img.src;
          img.removeAttribute('src');
        }
        img.dataset.lazyPrepared = true;
      });
    }

    function setupLazyLoading() {
      const observer = new IntersectionObserver(entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const img = entry.target;
            if (img.dataset.src) {
              img.src = img.dataset.src;
              observer.unobserve(img);
            }
          }
        });
      }, {
        rootMargin: '120px',
        threshold: 0.05
      });

      document.querySelectorAll('img[data-src]').forEach(img => observer.observe(img));
      return observer;
    }

    prepareImages();
    const imgObserver = setupLazyLoading();

    const mutationObserver = new MutationObserver(mutations => {
      mutations.forEach(mutation => {
        mutation.addedNodes.forEach(node => {
          if (!(node instanceof Element)) return;
          if (node.tagName === 'IMG') {
            if (!node.dataset.lazyPrepared) {
              if (node.src) {
                node.dataset.src = node.src;
                node.removeAttribute('src');
              }
              node.dataset.lazyPrepared = true;
              if (node.dataset.src) imgObserver.observe(node);
            }
          } else {
            const imgs = node.querySelectorAll('img');
            if (imgs.length) {
              prepareImages(node);
              imgs.forEach(img => { if (img.dataset.src) imgObserver.observe(img); });
            }
          }
        });
      });
    });
    mutationObserver.observe(document.body, { childList: true, subtree: true });

    // Auto Click "Load More"
    function clickElement(el) {
      el.dispatchEvent(new MouseEvent('mouseover', { bubbles: true }));
      el.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }));
      el.dispatchEvent(new MouseEvent('mouseup', { bubbles: true }));
      el.click();
    }

    function setupAutoLoadMore() {
      const loadBtn = document.getElementById('loadPosts');
      if (!loadBtn) return null;
      if (loadBtn.dataset.autoLoadObserved === 'true') return null;
      loadBtn.dataset.autoLoadObserved = 'true';

      const observer = new IntersectionObserver(entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            requestAnimationFrame(() => clickElement(loadBtn));
          }
        });
      }, {
        rootMargin: '300px',
        threshold: 0.01
      });

      observer.observe(loadBtn);
      return observer;
    }

    let loadMoreObserver = setupAutoLoadMore();

    const btnObserver = new MutationObserver(() => {
      const btn = document.getElementById('loadPosts');
      if (btn && btn.dataset.autoLoadObserved !== 'true') {
        if (loadMoreObserver) loadMoreObserver.disconnect();
        loadMoreObserver = setupAutoLoadMore();
      }
    });
    btnObserver.observe(document.body, { childList: true, subtree: true });

    const initialBtn = document.getElementById('loadPosts');
    if (initialBtn) {
      const rect = initialBtn.getBoundingClientRect();
      const inViewport = rect.top < (window.innerHeight + 300) && rect.bottom > 0;
      if (inViewport) clickElement(initialBtn);
    }

    // Fallback polling for robustness
    let pollCount = 0;
    const poll = setInterval(() => {
      if (pollCount++ > 100) { clearInterval(poll); return; }
      const btn = document.getElementById('loadPosts');
      if (btn && btn.dataset.autoLoadObserved !== 'true') {
        if (loadMoreObserver) loadMoreObserver.disconnect();
        loadMoreObserver = setupAutoLoadMore();
      }
    }, 200);
  }

  // Initialize Endless Stream when DOM is ready
  if (document.readyState === 'complete' || document.readyState === 'interactive') {
    initEndlessStream();
  } else {
    document.addEventListener('DOMContentLoaded', initEndlessStream, { once: true });
  }
})();
