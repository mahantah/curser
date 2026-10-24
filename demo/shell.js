/**
 * Mock partner-shell handlers that the production drop-in scripts reuse.
 * @ts-check
 */

/** Drawer breakpoint in pixels. Must match production CSS/JS and config/base.yaml. */
const MOBILE_MAX_PX = 760;

/**
 * Binds the existing #app controls so the production switch can click them.
 */
class DemoSidebarShell {
  /**
   * @param {HTMLElement} app Authenticated shell root.
   * @param {HTMLElement} nav Sidebar navigation.
   * @param {HTMLElement} mobileBtn Original mobile drawer toggle.
   * @param {HTMLElement} closeBtn Original desktop collapse control.
   * @param {HTMLElement} openBtn Original desktop expand control.
   */
  constructor(app, nav, mobileBtn, closeBtn, openBtn) {
    this.app = app;
    this.nav = nav;
    this.mobileBtn = mobileBtn;
    this.closeBtn = closeBtn;
    this.openBtn = openBtn;
  }

  /**
   * Whether the mock shell is in the mobile drawer breakpoint.
   *
   * @returns {boolean} True when the viewport is at or below MOBILE_MAX_PX.
   */
  isMobile() {
    return window.matchMedia(`(max-width:${MOBILE_MAX_PX}px)`).matches;
  }

  /**
   * Attaches the original click and Escape handlers.
   *
   * @returns {void}
   */
  bind() {
    this.mobileBtn.addEventListener("click", () => {
      this.nav.classList.toggle("sidebar-open");
    });
    this.closeBtn.addEventListener("click", () => {
      if (this.isMobile()) {
        this.nav.classList.remove("sidebar-open");
      } else {
        this.app.classList.add("sidebar-collapsed");
      }
    });
    this.openBtn.addEventListener("click", () => {
      if (this.isMobile()) {
        this.nav.classList.add("sidebar-open");
      } else {
        this.app.classList.remove("sidebar-collapsed");
      }
    });
    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape") {
        this.nav.classList.remove("sidebar-open");
      }
    });
  }
}

/**
 * Wires the demo shell if every required control is present.
 *
 * @returns {void}
 */
function bootDemoShell() {
  const app = document.getElementById("app");
  const nav = /** @type {HTMLElement | null} */ (document.querySelector("#app > header .topnav"));
  const mobileBtn = document.getElementById("navToggle");
  const closeBtn = document.getElementById("desktopSidebarCollapse");
  const openBtn = document.getElementById("desktopSidebarOpen");
  if (!app || !nav || !mobileBtn || !closeBtn || !openBtn) {
    return;
  }
  new DemoSidebarShell(app, nav, mobileBtn, closeBtn, openBtn).bind();
}

bootDemoShell();
