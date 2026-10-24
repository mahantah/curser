/**
 * GHADIR Partner sidebar controls V1.
 *
 * Presentation + navigation only. Existing auth and sidebar handlers are reused.
 * This file is a bundler-free drop-in IIFE so it can replace the same path on
 * the live #app without a build step.
 *
 * @ts-check
 */
(function () {
  "use strict";

  /** Drawer breakpoint in pixels. Must match the production CSS media query. */
  const MOBILE_MAX_PX = 760;

  /**
   * Builds the animated switch and moves the account box into the sidebar footer.
   *
   * @returns {void}
   */
  function init() {
    const app = document.getElementById("app");
    const header = app && app.querySelector(":scope > header");
    const nav = header && header.querySelector(".topnav");
    const mobileButton = header && header.querySelector(".nav-toggle");
    const desktopClose = document.getElementById("desktopSidebarCollapse");
    const desktopOpen = document.getElementById("desktopSidebarOpen");
    const userbox =
      (header && header.querySelector(".userbox")) || (nav && nav.querySelector(".userbox"));
    if (!app || !header || !nav || !mobileButton || !desktopClose || !desktopOpen || !userbox) {
      console.warn(
        "Ghadir sidebar V1: existing controls are not available; original interface retained.",
      );
      return;
    }
    const shell = app;
    const top = header;
    const menu = /** @type {HTMLElement} */ (nav);
    const mobileToggle = /** @type {HTMLElement} */ (mobileButton);
    const account = /** @type {HTMLElement} */ (userbox);
    if (document.getElementById("gpSidebarSwitch")) {
      return;
    }
    if (!menu.id) {
      menu.id = "gpMainNavigation";
    }
    // Obsolete ×; original close controls remain through overlay/Escape.
    const obsoleteClose = menu.querySelector(".sidebar-close");
    if (obsoleteClose) {
      obsoleteClose.remove();
    }
    const toggle = document.createElement("button");
    toggle.type = "button";
    toggle.id = "gpSidebarSwitch";
    toggle.className = "gp-sidebar-switch";
    toggle.setAttribute("aria-controls", menu.id);
    toggle.setAttribute("aria-label", "جمع‌کردن منو");
    toggle.innerHTML =
      '<span class="gp-switch-bars" aria-hidden="true"><span class="gp-switch-bar"></span><span class="gp-switch-bar"></span><span class="gp-switch-bar"></span></span>';
    shell.appendChild(toggle);

    /**
     * @returns {boolean} True when the live site is in the mobile drawer breakpoint.
     */
    function mobile() {
      return window.matchMedia("(max-width:" + MOBILE_MAX_PX + "px)").matches;
    }

    /**
     * @returns {boolean} True when the sidebar or drawer is open.
     */
    function opened() {
      return mobile()
        ? menu.classList.contains("sidebar-open")
        : !shell.classList.contains("sidebar-collapsed");
    }

    /**
     * Mirrors open/closed state onto the switch and tells placement to track.
     *
     * @returns {void}
     */
    function sync() {
      const open = opened();
      toggle.classList.toggle("is-open", open);
      toggle.setAttribute("aria-expanded", String(open));
      toggle.setAttribute("aria-label", open ? "جمع‌کردن منو" : "بازکردن منو");
      toggle.title = toggle.getAttribute("aria-label") || "";
      // Placement must start tracking on the first frame of the transition.
      window.dispatchEvent(new CustomEvent("gp-sidebar-switch-sync", { detail: { open: open } }));
    }

    /**
     * Keeps the original account controls in the sidebar footer.
     *
     * @returns {void}
     */
    function placeUserbox() {
      if (account.parentElement !== menu) {
        menu.appendChild(account);
      }
      account.classList.add("gp-sidebar-userbox");
      account.classList.remove("mobile-nav-userbox");
      account.setAttribute("aria-label", "حساب کاربری");
    }

    toggle.addEventListener("click", function (event) {
      event.preventDefault();
      if (mobile()) {
        mobileToggle.click();
      } else if (shell.classList.contains("sidebar-collapsed")) {
        desktopOpen.click();
      } else {
        desktopClose.click();
      }
      sync();
    });
    placeUserbox();
    sync();
    let pending = false;
    const observer = new MutationObserver(function () {
      if (pending) {
        return;
      }
      pending = true;
      requestAnimationFrame(function () {
        pending = false;
        placeUserbox();
        sync();
      });
    });
    observer.observe(top, { childList: true });
    observer.observe(menu, { attributes: true, attributeFilter: ["class"] });
    observer.observe(shell, { attributes: true, attributeFilter: ["class"] });
    window.addEventListener(
      "resize",
      function () {
        requestAnimationFrame(function () {
          placeUserbox();
          sync();
        });
      },
      { passive: true },
    );
    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape") {
        requestAnimationFrame(sync);
      }
    });
    menu.addEventListener("click", function (event) {
      const target = /** @type {EventTarget | null} */ (event.target);
      if (target instanceof Element && target.closest("[data-tab]")) {
        requestAnimationFrame(sync);
      }
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
