# API Specification

Base URL (local): `http://localhost:5000/api`

All requests and responses are JSON unless noted.

---

## Conventions

- Content-Type: `application/json`
- Dates use `YYYY-MM-DD`
- Times use `10:00 AM` format

### Auth header
Protected endpoints require a JWT in the `Authorization` header:

```
Authorization: Bearer <token>
```

### Common error format
```
{ "message": "Readable error message" }
```

Some endpoints return extra fields. Example (seat conflict):

```
{
  "message": "Some seats are already booked.",
  "seats": ["A1", "A2"]
}
```

### Status codes used
- 200 OK
- 201 Created
- 400 Bad Request
- 401 Unauthorized
- 403 Forbidden
- 404 Not Found
- 409 Conflict
- 429 Too Many Requests
- 500 Server Error

---

## Health

### GET `/health`

**Response**
```
{ "status": "ok" }
```

**cURL**
```bash
curl http://localhost:5000/api/health
```

---

## Auth

### POST `/auth/register`
Create a user with email or phone.

**Body**
```
{
  "name": "Vivek",
  "email": "vivek@example.com",
  "phone": "+919999999999",
  "password": "secret123"
}
```

**Response**
```
{
  "user": { "id": "...", "name": "...", "email": "...", "phone": "...", "avatar": null },
  "token": "jwt..."
}
```

**cURL**
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Vivek","email":"vivek@example.com","password":"secret123"}'
```

### POST `/auth/login`
Login using password.

**Body**
```
{ "identifier": "vivek@example.com", "password": "secret123" }
```

You can also pass `email` or `phone` instead of `identifier`.

**Response**
```
{ "user": { ... }, "token": "jwt..." }
```

**cURL**
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"identifier":"vivek@example.com","password":"secret123"}'
```

### POST `/auth/request-otp`
Request OTP for login or signup.

**Body**
```
{
  "identifier": "vivek@example.com",
  "channel": "email",
  "purpose": "login"
}
```

For signup you must also pass `name` and `password`:

```
{
  "identifier": "+919999999999",
  "channel": "phone",
  "purpose": "signup",
  "name": "Vivek",
  "password": "secret123"
}
```

**Response**
```
{ "message": "OTP sent." }
```

### POST `/auth/verify-otp`
Verify OTP and create/login user.

**Body**
```
{
  "identifier": "vivek@example.com",
  "channel": "email",
  "code": "123456",
  "purpose": "login"
}
```

**Response**
```
{ "user": { ... }, "token": "jwt..." }
```

### POST `/auth/google`
Google OAuth login.

**Body**
```
{ "credential": "<google_id_token>" }
```

**Response**
```
{ "user": { ... }, "token": "jwt..." }
```

### GET `/auth/me` (auth required)
Returns current user profile.

**Response**
```
{ "user": { ... } }
```

**cURL**
```bash
curl http://localhost:5000/api/auth/me \
  -H "Authorization: Bearer <token>"
```

### PATCH `/auth/me` (auth required)
Update profile.

**Body**
```
{ "name": "New Name", "email": "new@example.com", "phone": "+91..." }
```

**Response**
```
{ "user": { ... } }
```

### POST `/auth/forgot-password`
Send reset link to email.

**Body**
```
{ "email": "vivek@example.com" }
```

**Response**
```
{ "message": "If the account exists, a reset link was sent." }
```

**cURL**
```bash
curl -X POST http://localhost:5000/api/auth/forgot-password \
  -H "Content-Type: application/json" \
  -d '{"email":"vivek@example.com"}'
```

### POST `/auth/reset-password`
Reset password using token from email link.

**Body**
```
{
  "email": "vivek@example.com",
  "token": "<reset_token>",
  "password": "newpass123"
}
```

**Response**
```
{ "message": "Password updated successfully." }
```

---

## Movies

### GET `/movies`
List all movies.

**Response**
```
[
  {
    "_id": "...",
    "slug": "oppenheimer",
    "title": "Oppenheimer",
    "genre": "Drama",
    "language": "English",
    "poster": "https://...",
    "duration": "3h 00m",
    "certificate": "U/A",
    "description": ""
  }
]
```

**cURL**
```bash
curl http://localhost:5000/api/movies
```

### GET `/movies/:slug`
Fetch movie by slug.

---

## Theatres

### GET `/theatres`
List all theatres.

**Response**
```
[
  {
    "_id": "...",
    "name": "PVR Cinemas",
    "area": "Forum Mall",
    "distance": "3 km",
    "city": "Bhopal",
    "state": "MP",
    "shows": ["10:00 AM", "1:00 PM"]
  }
]
```

**cURL**
```bash
curl http://localhost:5000/api/theatres
```

---

## Showtimes

### GET `/showtimes?movieId=...&date=YYYY-MM-DD`
Returns showtimes for a given movie/date.
If none exist, the server auto-creates them from theatre show schedules.

**Response**
```
[
  {
    "_id": "...",
    "movie": { ... },
    "theatre": { ... },
    "date": "2026-02-06",
    "time": "10:00 AM",
    "seatLayout": [[...]]
  }
]
```

**cURL**
```bash
curl "http://localhost:5000/api/showtimes?movieId=<movieId>&date=2026-02-06"
```

### GET `/showtimes/:id`
Get one showtime by id.

### GET `/showtimes/:id/occupied`
Get booked seats for a showtime.

**Response**
```
{ "seats": ["A1", "A2"] }
```

---

## Bookings (auth required)

### GET `/bookings`
List bookings for logged in user.

**cURL**
```bash
curl http://localhost:5000/api/bookings \
  -H "Authorization: Bearer <token>"
```

### POST `/bookings`
Create booking (used in non-payment flows).

**Body**
```
{
  "showtimeId": "...",
  "seats": ["A1", "A2"],
  "amount": 700
}
```

**Response**
```
{
  "_id": "...",
  "showtimeId": "...",
  "movieTitle": "Oppenheimer",
  "theatre": "PVR Cinemas",
  "date": "2026-02-06",
  "time": "10:00 AM",
  "seats": ["A1", "A2"],
  "amount": 700
}
```

**Seat conflict error**
```
{
  "message": "Some seats are already booked.",
  "seats": ["A1"]
}
```

---

## Payments (auth required)

### POST `/payments/order`
Create a Razorpay order.

**Body**
```
{
  "showtimeId": "...",
  "seats": ["A1", "A2"],
  "amount": 700
}
```

**Response**
```
{
  "orderId": "order_...",
  "amount": 70000,
  "currency": "INR",
  "keyId": "rzp_test_...",
  "paymentId": "...",
  "showtime": {
    "id": "...",
    "movieTitle": "Oppenheimer",
    "theatre": "PVR Cinemas",
    "datetime": "2026-02-06 - 10:00 AM"
  }
}
```

**cURL**
```bash
curl -X POST http://localhost:5000/api/payments/order \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"showtimeId":"...","seats":["A1","A2"],"amount":700}'
```

### POST `/payments/verify`
Verify payment and create booking.

**Body**
```
{
  "orderId": "order_...",
  "paymentId": "pay_...",
  "signature": "razorpay_signature"
}
```

**Response**
```
{ "booking": { ... } }
```

---

## Admin (auth + admin email required)

Admin access is restricted to users listed in `ADMIN_EMAILS`.

### GET `/admin/status`
```
{ "isAdmin": true }
```

### Movies
- GET `/admin/movies`
- POST `/admin/movies`
- PUT `/admin/movies/:id`
- DELETE `/admin/movies/:id`

**Create/Update Body**
```
{
  "slug": "oppenheimer",
  "title": "Oppenheimer",
  "genre": "Drama",
  "language": "English",
  "poster": "https://...",
  "duration": "3h 00m",
  "certificate": "U/A",
  "description": ""
}
```

### Theatres
- GET `/admin/theatres`
- POST `/admin/theatres`
- PUT `/admin/theatres/:id`
- DELETE `/admin/theatres/:id`

**Create/Update Body**
```
{
  "name": "PVR Cinemas",
  "area": "Forum Mall",
  "distance": "3 km",
  "city": "Bhopal",
  "state": "MP",
  "shows": ["10:00 AM", "1:00 PM"]
}
```

### Showtimes
- GET `/admin/showtimes?movieId=...&date=YYYY-MM-DD`
- POST `/admin/showtimes`
- PUT `/admin/showtimes/:id`
- DELETE `/admin/showtimes/:id`

**Create/Update Body**
```
{
  "movieId": "...",
  "theatreId": "...",
  "date": "2026-02-06",
  "time": "10:00 AM",
  "seatLayout": [[...]]
}
```

---

## Quick End-to-End Flow

1. Fetch movies: `GET /movies`
2. Pick a movie, then fetch showtimes: `GET /showtimes?movieId=...&date=YYYY-MM-DD`
3. Get occupied seats: `GET /showtimes/:id/occupied`
4. Create order: `POST /payments/order`
5. Verify payment: `POST /payments/verify` -> booking created
6. View bookings: `GET /bookings`

---

## Notes

- `date` format: `YYYY-MM-DD`
- OTP bypass for phone is enabled by default (set in `server/.env`)
- If SMTP is not configured, password reset links are logged in the server console
