# Movie Booking MERN App

A full-stack movie ticket booking platform built with React, Node.js/Express, and MongoDB.
It supports movie browsing, location-based listings, showtimes, seat selection, payments, and user authentication.

---

## Features

- Browse movies with posters, genres, and details
- Location-aware recommendations and search (movies + theatres)
- Real showtimes generated per date
- Seat selection with live occupied seats
- Bookings stored in MongoDB
- Auth with password, OTP (email/phone), and Google login
- Forgot/Reset password flow (email link)
- Admin dashboard to manage movies, theatres, and showtimes
- Light/Dark appearance toggle

---

## Tech Stack

- **Frontend:** React, Vite, Tailwind CSS
- **Backend:** Node.js, Express
- **Database:** MongoDB + Mongoose
- **Auth:** JWT + Google OAuth
- **Payments:** Razorpay (test mode supported)

---

## Getting Started

### 1. Install dependencies

```bash
cd server
npm install

cd ../client
npm install
```

### 2. Environment setup

Copy and update env files:

```bash
cp server/.env.example server/.env
cp client/.env.example client/.env
```

**Server (`server/.env`)**

```
PORT=5000
MONGODB_URI=mongodb://127.0.0.1:27017/movie_booking
CLIENT_URLS=http://localhost:5173
JWT_SECRET=your_jwt_secret_here
GOOGLE_CLIENT_ID=your_google_client_id_here
SMTP_HOST=
SMTP_PORT=
SMTP_USER=
SMTP_PASS=
SMTP_FROM=
OTP_BYPASS=phone
AUTO_SEED=true
RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret
ADMIN_EMAILS=admin@example.com
```

**Client (`client/.env`)**

```
VITE_API_URL=http://localhost:5000/api
VITE_GOOGLE_CLIENT_ID=your_google_client_id_here
```

### 3. Run the app

```bash
# Terminal 1
cd server
npm run dev

# Terminal 2
cd client
npm run dev
```

Open: `http://localhost:5173`

---

## Posters & Carousel Images

Posters are expected in:

```
client/public/posters/
```

The project includes a helper script to fetch posters from the web using OMDb.

### 1. Get a free OMDb API key
Sign up at: `https://www.omdbapi.com/apikey.aspx`

### 2. Run the fetch script (safe, no key stored)
```bash
OMDB_API_KEY=your_key_here node scripts/fetch-posters.mjs
```

This downloads posters into `client/public/posters/` with the filenames already used in `server/src/data/movies.js`.

---

## Using the App

1. **Browse movies** on the home page.
2. **Select a movie** and choose a showtime.
3. **Pick seats** and proceed to payment.
4. **Login required** for payment and bookings.

### Reset Password (Real)
- Use **Forgot Password** to get a reset link.
- If SMTP is configured, email will be sent.
- If SMTP is not configured, the reset link is logged in the server console.

### OTP Notes
- Phone OTP is bypassed by default (`OTP_BYPASS=phone`) because no SMS provider is used.
- Email OTP works when SMTP is configured.

---

## Admin Dashboard

Route: `http://localhost:5173/admin`

Access is limited to users whose email is listed in:

```
ADMIN_EMAILS=admin@example.com
```

Admin can:
- Add/update/delete movies
- Add/update/delete theatres
- Create and edit showtimes

---

## Folder Structure

```
client/            # React frontend
server/            # Express backend
docs/              # API documentation
```

---

## API Highlights

- `GET /api/movies` - list movies
- `GET /api/theatres` - list theatres
- `GET /api/showtimes?movieId=...&date=YYYY-MM-DD`
- `GET /api/showtimes/:id`
- `GET /api/showtimes/:id/occupied`
- `POST /api/bookings` (auth required)
- `POST /api/payments/order` + `POST /api/payments/verify`
- `POST /api/auth/forgot-password`
- `POST /api/auth/reset-password`
- `GET /api/admin/*` (admin only)

Full spec: `docs/api-spec.md`

---

## Notes (Resume Context)

This project is fully working as a MERN stack application for demo/resume use.
Production hardening (live SMS OTP, live payment keys, deployment) is optional and not required for resume usage.

---

## Author

Built by **Vivek**.
