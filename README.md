# Theme Shell

Minimal React + MUI shell focused on theme configuration.

## Scripts

```bash
npm install
npm run start
npm run build
npm run lint
```

## API Theme Override

Set `VITE_THEME_CONFIG_URL` to a JSON endpoint. The provider accepts either a root theme object or a nested `theme`, `themeConfig`, `data.theme`, or `data.themeConfig` object.

Example response:

```json
{
  "theme": {
    "fontFamily": "Inter, sans-serif",
    "borderRadius": 10,
    "outlinedFilled": true,
    "palette": {
      "primary": {
        "main": "#2563eb"
      },
      "background": {
        "default": "#f8fafc",
        "paper": "#ffffff"
      }
    }
  }
}
```

The config is merged with local defaults and stored under `theme-config` in `localStorage`.
