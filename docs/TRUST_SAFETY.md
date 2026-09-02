# Trust and safety

This feature keeps provider trust signals tied to data the marketplace can verify. It does not call a paid identity, phone, or background-check provider.

## Database setup

For an existing PostgreSQL database, run the additive migration from the repository root with a database user that can alter the application schema:

```bash
psql "$DATABASE_URL" -f docs/migrations/20260903_add_trust_safety.sql
```

Take a database backup first. The migration adds provider check flags, review moderation fields, `user_blocks`, and `user_reports`. The full clean-install schema is also updated in `docs/database_schema.sql`.

## Provider trust signals

Public listings and provider profiles expose `providerVerification` / `verification` with these possible badges:

- `identity_verified`: existing KYC status is `verified`.
- `email_verified`: the existing email verification flow succeeded.
- `phone_verified`, `background_checked`, and `business_verified`: manually enabled by an administrator after reviewing evidence.
- `top_rated`: at least three published reviews with an average of 4.5 or higher.
- `reliable`: at least three bookings, at least three completed jobs, and an 80% or higher completion ratio.

Hidden reviews are excluded from all public ratings, provider statistics, and calculated activity badges.

## Safety controls

Authenticated users can report a provider or customer from a listing, provider profile, or received booking. Reports accept the categories `unsafe_behavior`, `harassment`, `fraud`, `inappropriate_content`, `no_show`, and `other`.

Users can block or unblock another non-admin user. A block prevents new bookings, chat-room creation, and messages in either direction; existing chat rooms are hidden. The API rejects self-blocks, self-reports, reports against admins, and duplicate open reports.

Administrators use **Review Moderation** and **Safety Reports** in the admin panel. Review moderation supports `published` and `hidden`; report handling supports `open`, `under_review`, `resolved`, and `rejected`.

## API endpoints

All paths are under `/api` and use the existing JWT authentication flow:

- `GET /providers/{id}` and `GET /providers/{id}/listings`
- `POST /safety/reports`, `GET /safety/reports/mine`
- `GET /safety/blocks`, `POST /safety/blocks/{userId}`, `DELETE /safety/blocks/{userId}`
- Admin: `PUT /admin/users/{id}/verification`
- Admin: `GET /admin/reviews`, `PUT /admin/reviews/{id}/moderation`
- Admin: `GET /admin/reports`, `PUT /admin/reports/{id}/status`
