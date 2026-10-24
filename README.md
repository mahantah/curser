# Ghadir — فایل‌های نصب منوبار

چهار فایل آماده نصب این‌جا هستند:

```
install/
├── production-sidebar-controls-v1.css
├── production-sidebar-controls-v1.js
├── production-sidebar-placement-v2.css
├── production-sidebar-placement-v2.js
└── ghadir-sidebar-install.zip
```

همان نسخه‌ها در `assets/` هم هستند.

## نصب روی سایت

1. هر چهار فایل را از پوشه `install/` بگیرید (یا ZIP را باز کنید).
2. جایگزین همین نام‌ها در `assets/` سایت شوید.
3. در HTML اول **controls** و بعد **placement** را لود کنید:

```html
<link rel="stylesheet" href="assets/production-sidebar-controls-v1.css" />
<link rel="stylesheet" href="assets/production-sidebar-placement-v2.css" />
<script src="assets/production-sidebar-controls-v1.js"></script>
<script src="assets/production-sidebar-placement-v2.js"></script>
```

## دمو و دانلود از مرورگر

```bash
npm install
npm run dev
```

صفحه `http://localhost:3847` لینک دانلود هر فایل و ZIP را نشان می‌دهد.
