# PoroBidder Frontend

React + TypeScript + Vite + Ant Design.

## Stack

- **UI**: Ant Design 6 (`ConfigProvider` theme from `src/theme/`)
- **i18n**: i18next + react-i18next (`zh-CN` / `en-US`)
- **Routing**: React Router

## Directory layout

```text
src/
  app/           # App shell, providers
  api/           # HTTP / WebSocket clients (add when migrating features)
  components/
    common/      # LanguageSwitcher, shared widgets
    layout/      # AppLayout
  i18n/
    locales/     # zh-CN.json, en-US.json — all user-facing copy
  pages/         # Route-level screens
  theme/
    tokens.ts    # Design tokens (single source of truth)
    antdTheme.ts # Maps tokens → Ant Design theme
```

## Design tokens (code only, not a user-facing page)

All visual constants live in `src/theme/tokens.ts`:

- **color** — brand, semantic, surface, text, auction
- **font** — family, size, weight, lineHeight
- **spacing** — xs … xxl
- **radius** / **border** — width, color, corner radius
- **shadow** — card, panel, focus
- **layout** — max width, header height

`antdTheme.ts` maps the same values into Ant Design. When building pages, import `tokens` or use themed Ant components — do not hard-code hex values or pixel spacing.

## i18n

Add keys to both `zh-CN.json` and `en-US.json`; use `t('key')` in components. Ant Design locale follows the active language via `AppProviders`.

## Development

```powershell
cd frontend
npm install
npm run dev
```

Open http://localhost:5173 — API requests proxy to `http://localhost:8080`.

Start the Spring Boot backend separately when testing login / auction APIs.

## Build

```powershell
npm run build
```

Output: `frontend/dist/` (wire into nginx when replacing the legacy static site).
