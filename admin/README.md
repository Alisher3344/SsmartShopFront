# SSMART Punkt Admin Paneli

Topshirish punktlariga biriktirilgan adminlar uchun alohida frontend (React + Vite + Tailwind).

## Ishga tushirish

```bash
cd admin_frontend
npm install
cp .env.example .env
npm run dev
```

Sayt: http://localhost:5174

## Login

Login va parol **super admin** tomonidan beriladi. Super admin asosiy dashboard'da `Topshirish punktlari` → punkt karti → `Admin biriktirish` orqali yaratadi.

Admin login qilgach faqat **o'z punkti** ma'lumotlarini ko'radi.

## Backend talabi

Backend (`http://localhost:8000`) ishga tushgan bo'lishi kerak. Boshqa portni ishlatsangiz `.env`'da `VITE_API_URL`'ni o'zgartiring.
