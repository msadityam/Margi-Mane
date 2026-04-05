# Margi Mane MVP

Production-ready MVP for Margi Mane (Bengaluru) with Spring Boot + PostgreSQL backend and React (Vite) + Tailwind frontend.

## Stack
- Backend: Spring Boot 3, JPA/Hibernate, Flyway, JWT
- Frontend: React + Vite + Tailwind CSS
- Database: PostgreSQL

## Project Structure
- `backend/` Spring Boot API
- `frontend/` React app
- `docs/api.md` endpoint list

## Backend Setup
1. Create PostgreSQL DB: `margi_mane`
2. Copy `backend/.env.example` values into your environment
3. Run:
   - `cd backend`
   - `mvn spring-boot:run`

Flyway/PostgreSQL 18 compatibility mode:
- For local PG 18 where Flyway may not support your DB version yet:
  - `FLYWAY_ENABLED=false`
  - `JPA_DDL_AUTO=update`
- For production (recommended):
  - `FLYWAY_ENABLED=true`
  - `JPA_DDL_AUTO=validate`

Admin password login:
- `ADMIN_MOBILE=9999999999`
- `ADMIN_PASSWORD=godisgreat`
- If login mobile matches `ADMIN_MOBILE`, backend requires admin password.

Seed data includes:
- Admin: `9999999999`
- Demo user: `8888888888`
- Default reward config: `Rs 100 => 10 points`
- Full menu + welcome announcement

## Frontend Setup
1. Copy `frontend/.env.example` to `.env`
2. Run:
   - `cd frontend`
   - `npm install`
   - `npm run dev`

## MVP Features Implemented
- Login with name + mobile (auto-register user)
- USER / ADMIN role-based access
- Menu listing + admin menu APIs
- Payment submission, approval/rejection
- Reward config and points earning/redeeming
- User points + payment history
- Admin dashboard, users management APIs
- Announcements APIs and display on homepage
- Business info API (hotel name/phone/maps)

## API Documentation
See `docs/api.md`.
