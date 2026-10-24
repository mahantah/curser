/* GHADIR_PRODUCTION_SIDEBAR_PLACEMENT_V2_20261024
   Geometry-only: pin #gpSidebarSwitch to the live menubar (.sidebar-head)
   on every animation frame while the drawer moves, so the button travels
   exactly with the menu instead of jumping at transition start/end. */
(function () {
  'use strict';

  var TRACK_MS = 480;

  function init() {
    var app = document.getElementById('app');
    var nav = app && app.querySelector(':scope > header .topnav');
    var switchButton = document.getElementById('gpSidebarSwitch');
    var legacyButton = document.getElementById('desktopSidebarCollapse');
    if (!app || !nav || !switchButton || !legacyButton) return;
    if (switchButton.dataset.gpPlacementV2 === '1') return;
    switchButton.dataset.gpPlacementV2 = '1';

    // The old element must remain attached so delegated/original click logic
    // continues to work; it is excluded from keyboard and assistive UI.
    legacyButton.hidden = true;
    legacyButton.tabIndex = -1;
    legacyButton.setAttribute('aria-hidden', 'true');

    var trackUntil = 0;
    var rafId = 0;

    function headEl() {
      return nav.querySelector('.sidebar-head') || nav;
    }

    function clamp(value, min, max) {
      return Math.max(min, Math.min(max, value));
    }

    function position() {
      var open = switchButton.classList.contains('is-open');
      var head = headEl();
      var rect = head.getBoundingClientRect();
      var bw = switchButton.offsetWidth || 40;
      var bh = switchButton.offsetHeight || 40;

      // Stay glued to the menubar for the whole open/close transition:
      // - while open, always follow .sidebar-head (even if still narrow)
      // - while closing, keep following until the head is too small to host it
      // Only then dock at the page corner so the control stays reachable.
      var headVisible =
        !app.classList.contains('hidden') &&
        rect.height > 2 &&
        rect.bottom > 0 &&
        rect.top < window.innerHeight &&
        rect.right > 0 &&
        rect.left < window.innerWidth;
      var followMenubar = headVisible && (open || rect.width > bw + 24);

      if (followMenubar) {
        var x = rect.left + (rect.width - bw) / 2;
        var y = rect.top + (rect.height - bh) / 2;
        x = clamp(x, 4, window.innerWidth - bw - 4);
        y = clamp(y, 4, window.innerHeight - bh - 4);
        switchButton.style.setProperty('--gp-sidebar-v2-left', Math.round(x) + 'px');
        switchButton.style.setProperty('--gp-sidebar-v2-right', 'auto');
        switchButton.style.setProperty('--gp-sidebar-v2-top', Math.round(y) + 'px');
      } else {
        var dockTop = 14;
        if (window.visualViewport) {
          dockTop = Math.max(14, Math.round(window.visualViewport.offsetTop + 14));
        }
        switchButton.style.setProperty('--gp-sidebar-v2-left', 'auto');
        switchButton.style.setProperty('--gp-sidebar-v2-right', '14px');
        switchButton.style.setProperty(
          '--gp-sidebar-v2-top',
          'calc(' + dockTop + 'px + env(safe-area-inset-top, 0px))'
        );
      }
    }

    function frame(now) {
      position();
      if (now < trackUntil) {
        rafId = window.requestAnimationFrame(frame);
      } else {
        rafId = 0;
        position();
      }
    }

    function schedule(durationMs) {
      var ms = typeof durationMs === 'number' ? durationMs : 64;
      trackUntil = Math.max(trackUntil, performance.now() + ms);
      if (!rafId) rafId = window.requestAnimationFrame(frame);
    }

    function scheduleTrack() {
      schedule(TRACK_MS);
    }

    new MutationObserver(scheduleTrack).observe(switchButton, {
      attributes: true, attributeFilter: ['class']
    });
    new MutationObserver(scheduleTrack).observe(nav, {
      attributes: true, attributeFilter: ['class', 'style']
    });
    new MutationObserver(scheduleTrack).observe(app, {
      attributes: true, attributeFilter: ['class']
    });

    if (typeof ResizeObserver !== 'undefined') {
      var ro = new ResizeObserver(function () { schedule(120); });
      ro.observe(nav);
      var head = headEl();
      if (head && head !== nav) ro.observe(head);
    }

    nav.addEventListener('transitionstart', scheduleTrack, true);
    nav.addEventListener('transitionrun', scheduleTrack, true);
    nav.addEventListener('transitionend', function () { schedule(80); }, true);
    window.addEventListener('resize', scheduleTrack, { passive: true });
    window.addEventListener('orientationchange', scheduleTrack, { passive: true });
    window.addEventListener('gp-sidebar-switch-sync', scheduleTrack);
    if (window.visualViewport) {
      window.visualViewport.addEventListener('resize', scheduleTrack, { passive: true });
      window.visualViewport.addEventListener('scroll', function () { schedule(80); }, { passive: true });
    }

    schedule(120);
  }

  function boot() {
    // Controls-v1 creates #gpSidebarSwitch; retry briefly if script order varies.
    if (document.getElementById('gpSidebarSwitch')) {
      init();
      return;
    }
    var tries = 0;
    var id = window.setInterval(function () {
      tries += 1;
      if (document.getElementById('gpSidebarSwitch') || tries > 40) {
        window.clearInterval(id);
        init();
      }
    }, 50);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot, { once: true });
  } else {
    boot();
  }
})();
