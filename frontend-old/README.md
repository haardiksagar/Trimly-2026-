# Trimly frontend

A Vite frontend for this Spring Boot URL shortener.

## Development

Start the Spring Boot backend at `http://localhost:8080`, then run:

```powershell
cd frontend
npm install
npm run dev
```

Open `http://localhost:5173`. Vite proxies `/api` requests to Spring Boot, so no development CORS configuration is required.

## Production build

```powershell
npm run build
```

The optimized files are written to `dist/`. They can be deployed with any static host or copied into Spring Boot's `src/main/resources/static` directory.

## Custom backend addresses

By default, development API requests use Vite's proxy and generated short links point to `http://localhost:8080`. For another deployment, set either global before `/app.js` loads:

```html
<script>
  window.TRIMLY_API_BASE_URL = "https://api.example.com";
  window.TRIMLY_REDIRECT_BASE_URL = "https://short.example.com";
</script>
```

Backend contract:

- `POST /api/urls` with `{ "url": "https://example.com" }`
- `GET /{shortToken}` to follow a short link
