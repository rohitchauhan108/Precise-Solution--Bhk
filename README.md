# Admin Panel Backend (Express + MongoDB Atlas + Cloudinary)

REST API for the Next.js admin panel: admin login/logout (JWT in an httpOnly
cookie) and full product CRUD, with images stored on Cloudinary.

## 1. Install

```bash
cd server
npm install
```

## 2. Configure environment

```bash
cp .env.example .env
```

Fill in:
- `MONGODB_URI` — your MongoDB Atlas connection string (Atlas → Connect → Drivers)
- `JWT_SECRET` — any long random string, e.g. `openssl rand -base64 48`
- `CLOUDINARY_CLOUD_NAME` / `CLOUDINARY_API_KEY` / `CLOUDINARY_API_SECRET` — from your Cloudinary dashboard
- `CLIENT_URL` — the URL your Next.js site runs on (`http://localhost:3000` in dev)
- `ADMIN_EMAIL` / `ADMIN_PASSWORD` — used only once, to create the admin account (see step 3)

## 3. Create the admin account

This writes one admin document (with a bcrypt-hashed password) into your
`admin-panel` database in MongoDB Atlas:

```bash
npm run seed:admin
```

Run it again any time to change the admin's password (just update
`ADMIN_PASSWORD` in `.env` first).

## 4. Run the server

```bash
npm run dev     # nodemon, auto-restarts on changes
# or
npm start
```

The API is now live at `http://localhost:5000`.

## API Reference

All product-mutating routes require the admin to be logged in (the `token`
cookie is sent automatically by the browser once logged in — the frontend
must call `fetch` with `credentials: "include"`).

| Method | Route              | Auth | Body |
|--------|--------------------|------|------|
| POST   | `/api/auth/login`  | –    | `{ email, password }` |
| POST   | `/api/auth/logout` | –    | – |
| GET    | `/api/auth/me`     | ✅   | – |
| GET    | `/api/products`    | –    | query: `?search=&category=` |
| GET    | `/api/products/:id`| –    | – |
| POST   | `/api/products`    | ✅   | `multipart/form-data`: `name, category, stock, description, descriptionType, mainImage (file), images (files, up to 6)` |
| PUT    | `/api/products/:id`| ✅   | same fields, all optional; `removeImageIds` (JSON array of public_ids) to delete specific gallery images |
| DELETE | `/api/products/:id`| ✅   | – |

## Deploying

- Deploy this folder to any Node host (Render, Railway, Fly.io, etc).
- Set all the same environment variables there, with `NODE_ENV=production`
  and `CLIENT_URL` set to your deployed frontend's real URL.
- In production the login cookie is set with `SameSite=None; Secure`, which
  **requires HTTPS** on both the frontend and backend — most hosts provide
  this by default.

### Current Render + cPanel deployment

Use these values for the current deployment:

- Render service URL: `https://precise-solution-bhk.onrender.com`
- Frontend URL: `https://precisesolutionshk.com`
- Render start command: `npm start`
- Render environment variables:
  - `NODE_ENV=production`
  - `CLIENT_URL=https://precisesolutionshk.com`
  - `PORT` may be omitted; Render provides it automatically.
  - Set `MONGODB_URI`, `JWT_SECRET`, the three Cloudinary variables, and the
    admin seed variables from your private deployment configuration.

The frontend must be built with
`NEXT_PUBLIC_API_URL=https://precise-solution-bhk.onrender.com`, then upload
the contents of the frontend's generated `out` directory to the cPanel
document root. Do not upload the `out` directory itself as an extra nested
folder.
