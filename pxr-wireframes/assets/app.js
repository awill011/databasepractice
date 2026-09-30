/* PXR 2.0 wireframes: theme handling, shared navigation, and sample data.
   All data here is placeholder content for the wireframe. */
(function () {
  'use strict';

  var THEMES = [['blue', 'Blue'], ['eu', 'EU'], ['usa', 'American'], ['dark', 'Dark'], ['gray', 'Grayscale wireframe']];
  var KEY = 'pxr-theme';

  function valid(t) {
    return THEMES.some(function (x) { return x[0] === t; });
  }

  function getTheme() {
    var fromUrl = null;
    try { fromUrl = new URLSearchParams(window.location.search).get('theme'); } catch (e) {}
    if (valid(fromUrl)) return fromUrl;
    try {
      var saved = window.localStorage.getItem(KEY);
      if (valid(saved)) return saved;
    } catch (e) {}
    return 'blue';
  }

  var current = getTheme();
  document.documentElement.setAttribute('data-theme', current);

  function esc(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  // Original, simplified marks. Not the Great Seal or the official EU emblem.
  var EAGLE = '<svg data-show-theme="usa" width="36" height="36" viewBox="0 0 40 40" aria-hidden="true">' +
    '<circle cx="20" cy="20" r="18.5" fill="none" stroke="currentColor" stroke-width="1.5"></circle>' +
    '<path d="M5 17 C11 12 16 14 20 19 C24 14 29 12 35 17 C30 17 26 19 24 23 L20 29 L16 23 C14 19 10 17 5 17 Z" fill="currentColor"></path>' +
    '<path d="M18.8 16.5 L21.2 16.5 L21.5 20 L18.5 20 Z" fill="currentColor"></path>' +
    '<circle cx="20" cy="14.5" r="2.6" fill="currentColor"></circle>' +
    '<path d="M17 29 L20 34 L23 29 Z" fill="currentColor"></path></svg>';
  var STAR = '<svg data-show-theme="eu" width="30" height="30" viewBox="0 0 24 24" aria-hidden="true">' +
    '<path d="M12 2 L14.9 8.6 L22 9.3 L16.6 14 L18.2 21 L12 17.3 L5.8 21 L7.4 14 L2 9.3 L9.1 8.6 Z" fill="#ffcc00"></path></svg>';
  var STRIPES = '<div class="stripes" data-show-theme="usa" aria-hidden="true"><span></span><span></span><span></span></div>';

  function themeSelect(id) {
    return '<label class="theme-label" for="' + id + '">Color theme</label>' +
      '<select id="' + id + '" class="theme-select">' +
      THEMES.map(function (t) { return '<option value="' + t[0] + '">' + t[1] + '</option>'; }).join('') +
      '</select>';
  }

  function brand() {
    return '<div class="brand">' + EAGLE + STAR +
      '<div class="brand-text"><span class="brand-name">PXR 2.0</span><span class="brand-sub">EUR/ERA</span></div></div>';
  }

  function sidebar(active) {
    function link(href, label, key) {
      return '<a href="' + href + '"' + (key === active ? ' class="on" aria-current="page"' : '') + '>' + label + '</a>';
    }
    return brand() + STRIPES +
      '<div class="nav-group">' +
        link('this-week.html', 'This week', 'week') +
        link('weekly-email.html', 'Weekly email', 'email') +
        link('archive.html', 'Archive', 'archive') +
      '</div>' +
      '<div class="nav-label">Admin</div>' +
      '<div class="nav-group">' +
        link('priorities.html', 'Priorities and sources', 'priorities') +
        link('weekly-run.html', 'Weekly run', 'run') +
      '</div>' +
      '<div class="side-bottom">' +
        '<div class="theme-box">' + themeSelect('theme-side') + '</div>' +
        '<div class="user">[User name]</div>' +
        '<a href="signin.html">Sign out</a>' +
      '</div>';
  }

  // Keeps links, theme menus, and theme-specific marks in sync with the current theme.
  // The theme is also passed in each link so it carries over even where browsers
  // don't share localStorage between local files.
  function refresh() {
    var links = document.querySelectorAll('a[href]');
    for (var i = 0; i < links.length; i++) {
      var h = links[i].getAttribute('href');
      if (!h || h.charAt(0) === '#' || /^[a-z]+:/i.test(h) || !/\.html(\?|$)/.test(h)) continue;
      links[i].setAttribute('href', h.split('?')[0] + '?theme=' + current);
    }
    var selects = document.querySelectorAll('select.theme-select');
    for (var j = 0; j < selects.length; j++) selects[j].value = current;
    var marks = document.querySelectorAll('[data-show-theme]');
    for (var k = 0; k < marks.length; k++) {
      if (marks[k].getAttribute('data-show-theme') === current) marks[k].removeAttribute('hidden');
      else marks[k].setAttribute('hidden', '');
    }
  }

  function applyTheme(t) {
    current = valid(t) ? t : 'blue';
    document.documentElement.setAttribute('data-theme', current);
    try { window.localStorage.setItem(KEY, current); } catch (e) {}
    refresh();
  }

  document.addEventListener('change', function (e) {
    if (e.target && e.target.classList && e.target.classList.contains('theme-select')) applyTheme(e.target.value);
  });
  window.addEventListener('storage', function (e) {
    if (e.key === KEY && valid(e.newValue) && e.newValue !== current) applyTheme(e.newValue);
  });

  document.addEventListener('DOMContentLoaded', function () {
    var side = document.querySelector('nav.side[data-active]');
    if (side) side.innerHTML = sidebar(side.getAttribute('data-active'));
    var top = document.querySelector('[data-topbar]');
    if (top) {
      top.innerHTML = brand() +
        '<span class="top-note">Prototype. Not an official U.S. government website.</span>' +
        '<span class="spacer"></span>' +
        '<div class="theme-inline">' + themeSelect('theme-top') + '</div>';
    }
    try { localStorage.setItem(KEY, current); } catch (e) {}
    refresh();
  });

  var FLAGS = {
    int: { label: 'Intervene', cls: 'flag f-int' },
    mon: { label: 'Monitor', cls: 'flag f-mon' },
    fav: { label: 'Favorable', cls: 'flag f-fav' },
    none: { label: 'No impact', cls: 'flag f-none' }
  };

  function flag(k) {
    return '<span class="' + FLAGS[k].cls + '">' + FLAGS[k].label + '</span>';
  }

  function rating(n) {
    if (n > 0) return '+' + n;
    if (n < 0) return '\u2212' + Math.abs(n);
    return '0';
  }

  window.PXR = {
    esc: esc,
    flag: flag,
    rating: rating,
    FLAGS: FLAGS,
    refresh: refresh,
    theme: function () { return current; },
    go: function (page) { window.location.href = page + '?theme=' + current; },

    weekRows: [
      { flag: 'int', title: 'Regulation on [cloud services certification]', id: 'COM(2026) [###]', date: '[date]', rating: -7, tags: ['Technology and data', 'Trade'], status: 'Needs review' },
      { flag: 'mon', title: 'Regulation on [critical raw materials stockpiling]', id: 'COM(2026) [###]', date: '[date]', rating: -3, tags: ['Supply chains'], status: 'Needs review' },
      { flag: 'mon', title: 'Regulation on [methane rules for energy imports]', id: 'COM(2026) [###]', date: '[date]', rating: -2, tags: ['Energy'], status: 'Approved' },
      { flag: 'none', title: 'Regulation on [Baltic Sea fishing quotas]', id: 'COM(2026) [###]', date: '[date]', rating: 0, tags: ['Agriculture'], status: 'Needs review' },
      { flag: 'none', title: 'Directive on [packaging labels]', id: 'COM(2026) [###]', date: '[date]', rating: 0, tags: ['Environment'], status: 'Needs review' },
      { flag: 'fav', title: 'Decision on [defense industrial cooperation]', id: 'COM(2026) [###]', date: '[date]', rating: 4, tags: ['Security'], status: 'Approved' }
    ],

    archiveRows: [
      { week: '[Week 1]', flag: 'int', title: 'Regulation on [cloud services certification]', rating: -7, tags: 'Technology and data, Trade', emailed: 'Yes' },
      { week: '[Week 1]', flag: 'fav', title: 'Decision on [defense industrial cooperation]', rating: 4, tags: 'Security', emailed: 'Yes' },
      { week: '[Week 2]', flag: 'mon', title: 'Regulation on [methane rules for energy imports]', rating: -2, tags: 'Energy', emailed: 'Yes' },
      { week: '[Week 2]', flag: 'int', title: 'Directive on [digital services taxation]', rating: -6, tags: 'Trade, Technology and data', emailed: 'Yes' },
      { week: '[Week 3]', flag: 'none', title: 'Regulation on [Baltic Sea fishing quotas]', rating: 0, tags: 'Agriculture', emailed: 'No' },
      { week: '[Week 3]', flag: 'mon', title: 'Regulation on [hydrogen import standards]', rating: -3, tags: 'Energy, Trade', emailed: 'Yes' },
      { week: '[Week 4]', flag: 'fav', title: 'Decision on [sanctions coordination]', rating: 5, tags: 'Security', emailed: 'Yes' }
    ]
  };
})();
