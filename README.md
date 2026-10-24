# Ghadir — production sidebar controls

Drop-in assets for the authenticated partner `#app` shell: animated sidebar switch + placement that keeps the button locked to the menubar while it opens and closes.

## Assets

```
assets/
├── production-sidebar-controls-v1.css
├── production-sidebar-controls-v1.js
├── production-sidebar-placement-v2.css
└── production-sidebar-placement-v2.js
```

Load **controls** first, then **placement** (CSS and JS).

## Local demo

```bash
npm install
npm run dev
```

Open `http://localhost:3847` — mock partner shell to verify the switch tracks the sidebar brand row.

## Behavior

- Reuses existing `#desktopSidebarCollapse`, `#desktopSidebarOpen`, and `.nav-toggle` handlers.
- While the menu is open, `#gpSidebarSwitch` is centered on `.sidebar-head` and tracks its live `getBoundingClientRect` during width/transform transitions.
- While closed, the same control docks at the top-end corner so the menu can be reopened.
- Account `.userbox` is moved into the sidebar footer without changing auth wiring.
