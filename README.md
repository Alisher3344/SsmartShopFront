# SsmartShopFront

Frontend monorepo: 2 ta Vite + React app.

```
shop/    — asosiy do'kon (foydalanuvchilar uchun)
admin/   — admin panel
```

## Lokal ishga tushirish

```bash
cd shop && npm install && npm run dev
cd admin && npm install && npm run dev
```

## Deploy

Har bir ilova alohida Dockerfile (multi-stage: build + nginx serve) bilan
`docker compose` orqali production'da ko'tariladi. `infra/` SsmartShopBack
repo'sida joylashgan.
