/**
 * GHADIR production sidebar placement V2.
 *
 * Geometry only: pin #gpSidebarSwitch to the live menubar (.sidebar-head)
 * on every animation frame while the drawer moves.
 *
 * This file is a bundler-free drop-in IIFE so it can replace the same path on
 * the live #app without a build step.
 *
 * @ts-check
 */
(function () {
  "use strict";

  /** How long to keep rAF tracking after a class or size change, milliseconds. */
  const TRACK_MS = 480;
  /** Fallback switch size when offsetWidth/Height is still 0, pixels. */
  const FALLBACK_SWITCH_PX = 40;
  /** Minimum menubar width that can still host the switch while closing, pixels. */
  const FOLLOW_SLACK_PX = 24;
  /** Viewport inset used when docking the closed switch, pixels. */
  const DOCK_INSET_PX = 14;
  /** Extra tracking after a short geometry event, milliseconds. */
  const SHORT_TRACK_MS = 80;
  /** Tracking after a resize observation, milliseconds. */
  const RESIZE_TRACK_MS = 120;
  /** How many times to wait for #gpSidebarSwitch if this file loads first. */
  const SWITCH_WAIT_TRIES = 40;
  /** Delay between those waits, milliseconds. */
  const SWITCH_WAIT_MS = 50;

  /**
   * Attaches geometry tracking to the existing animated switch.
   *
   * @returns {void}
   */
  function init() {
    const app = document.getElementById("app");
    const nav = app && app.querySelector(":scope > header .topnav");
    const switchButton = document.getElementById("gpSidebarSwitch");
    const legacyButton = document.getElementById("desktopSidebarCollapse");
    if (!app || !nav || !switchButton || !legacyButton) {
      return;
    }
    const shell = app;
    const menu = /** @type {HTMLElement} */ (nav);
    const toggle = switchButton;
    if (toggle.dataset.gpPlacementV2 === "1") {
      return;
    }
    toggle.dataset.gpPlacementV2 = "1";

    // The old element must remain attached so original click logic still works.
    legacyButton.hidden = true;
    legacyButton.tabIndex = -1;
    legacyButton.setAttribute("aria-hidden", "true");

    let trackUntil = 0;
    let rafId = 0;

    /**
     * @returns {Element} Brand row when present, otherwise the whole nav.
     */
    function headEl() {
      return menu.querySelector(".sidebar-head") || menu;
    }

    /**
     * @param {number} value
     * @param {number} min
     * @param {number} max
     * @returns {number}
     */
    function clamp(value, min, max) {
      return Math.max(min, Math.min(max, value));
    }

    /**
     * Writes --gp-sidebar-v2-* from the live menubar rect, or docks the switch.
     *
     * @returns {void}
     */
    function position() {
      const open = toggle.classList.contains("is-open");
      const head = headEl();
      const rect = head.getBoundingClientRect();
      const bw = toggle.offsetWidth || FALLBACK_SWITCH_PX;
      const bh = toggle.offsetHeight || FALLBACK_SWITCH_PX;
      const headVisible =
        !shell.classList.contains("hidden") &&
        rect.height > 2 &&
        rect.bottom > 0 &&
        rect.top < window.innerHeight &&
        rect.right > 0 &&
        rect.left < window.innerWidth;
      const followMenubar = headVisible && (open || rect.width > bw + FOLLOW_SLACK_PX);

      if (followMenubar) {
        let x = rect.left + (rect.width - bw) / 2;
        let y = rect.top + (rect.height - bh) / 2;
        x = clamp(x, 4, window.innerWidth - bw - 4);
        y = clamp(y, 4, window.innerHeight - bh - 4);
        toggle.style.setProperty("--gp-sidebar-v2-left", Math.round(x) + "px");
        toggle.style.setProperty("--gp-sidebar-v2-right", "auto");
        toggle.style.setProperty("--gp-sidebar-v2-top", Math.round(y) + "px");
        return;
      }

      let dockTop = DOCK_INSET_PX;
      if (window.visualViewport) {
        dockTop = Math.max(
          DOCK_INSET_PX,
          Math.round(window.visualViewport.offsetTop + DOCK_INSET_PX),
        );
      }
      toggle.style.setProperty("--gp-sidebar-v2-left", "auto");
      toggle.style.setProperty("--gp-sidebar-v2-right", DOCK_INSET_PX + "px");
      toggle.style.setProperty(
        "--gp-sidebar-v2-top",
        "calc(" + dockTop + "px + env(safe-area-inset-top, 0px))",
      );
    }

    /**
     * @param {number} now performance.now() for the current frame.
     * @returns {void}
     */
    function frame(now) {
      position();
      if (now < trackUntil) {
        rafId = window.requestAnimationFrame(frame);
      } else {
        rafId = 0;
        position();
      }
    }

    /**
     * @param {number} [durationMs] How long to keep following the menubar.
     * @returns {void}
     */
    function schedule(durationMs) {
      const ms = typeof durationMs === "number" ? durationMs : 64;
      trackUntil = Math.max(trackUntil, performance.now() + ms);
      if (!rafId) {
        rafId = window.requestAnimationFrame(frame);
      }
    }

    /**
     * Tracks for a full open/close transition.
     *
     * @returns {void}
     */
    function scheduleTrack() {
      schedule(TRACK_MS);
    }

    new MutationObserver(scheduleTrack).observe(toggle, {
      attributes: true,
      attributeFilter: ["class"],
    });
    new MutationObserver(scheduleTrack).observe(menu, {
      attributes: true,
      attributeFilter: ["class", "style"],
    });
    new MutationObserver(scheduleTrack).observe(shell, {
      attributes: true,
      attributeFilter: ["class"],
    });

    if (typeof ResizeObserver !== "undefined") {
      const ro = new ResizeObserver(function () {
        schedule(RESIZE_TRACK_MS);
      });
      ro.observe(menu);
      const head = headEl();
      if (head && head !== nav) {
        ro.observe(head);
      }
    }

    menu.addEventListener("transitionstart", scheduleTrack, true);
    menu.addEventListener("transitionrun", scheduleTrack, true);
    menu.addEventListener(
      "transitionend",
      function () {
        schedule(SHORT_TRACK_MS);
      },
      true,
    );
    window.addEventListener("resize", scheduleTrack, { passive: true });
    window.addEventListener("orientationchange", scheduleTrack, { passive: true });
    window.addEventListener("gp-sidebar-switch-sync", scheduleTrack);
    if (window.visualViewport) {
      window.visualViewport.addEventListener("resize", scheduleTrack, { passive: true });
      window.visualViewport.addEventListener(
        "scroll",
        function () {
          schedule(SHORT_TRACK_MS);
        },
        { passive: true },
      );
    }

    schedule(RESIZE_TRACK_MS);
  }

  /**
   * Waits for controls-v1 to create #gpSidebarSwitch when script order varies.
   *
   * @returns {void}
   */
  function boot() {
    if (document.getElementById("gpSidebarSwitch")) {
      init();
      return;
    }
    let tries = 0;
    const id = window.setInterval(function () {
      tries += 1;
      if (document.getElementById("gpSidebarSwitch") || tries > SWITCH_WAIT_TRIES) {
        window.clearInterval(id);
        init();
      }
    }, SWITCH_WAIT_MS);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot, { once: true });
  } else {
    boot();
  }
})();
