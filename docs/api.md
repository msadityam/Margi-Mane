# Margi Mane API

Base URL: `http://localhost:8080/api`

Auth header for protected APIs:
`Authorization: Bearer <jwt>`

## Auth
- `POST /auth/login` -> body: `{ "name": "Aditya", "mobileNumber": "9876543210" }`
- `GET /auth/me`

## Public
- `GET /menu`
- `GET /announcements`
- `GET /public/business-info`

## User
- `POST /payments` body: `{ "amount": 240, "upiRefId": "optional" }`
- `GET /payments/my`
- `GET /points/me`
- `POST /points/redeem` body: `{ "points": 20 }`

## Admin
- `GET /admin/dashboard`
- `GET /admin/users`
- `PATCH /admin/users/{id}/role`
- `PATCH /admin/users/{id}/points`
- `POST /admin/menu`
- `PUT /admin/menu/{id}`
- `DELETE /admin/menu/{id}`
- `GET /admin/reward-config`
- `PUT /admin/reward-config`
- `GET /admin/payments?status=PENDING`
- `PATCH /admin/payments/{id}/approve`
- `PATCH /admin/payments/{id}/reject`
- `POST /admin/announcements`
- `PATCH /admin/announcements/{id}`
- `DELETE /admin/announcements/{id}`
