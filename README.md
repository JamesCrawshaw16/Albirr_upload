# Al-Birr Credit Union document upload portal

Internal-use document upload journey built with the IDMission WebSDK.

## Vercel configuration

Add these server-side environment variables to Development, Preview and Production:

- `IDMISSION_API_KEY_ID`
- `IDMISSION_API_KEY_SECRET`
- `PORTAL_ACCESS_PIN` (the shared alphanumeric staff access PIN)

Do not prefix any of these variables with `VITE_`; that would expose them to the browser. The PIN is checked by a server-side function and the browser receives only a temporary secure cookie.

## Local development

Install dependencies and run `npm run dev`. The Vite development server does not execute the Vercel API function itself; use `vercel dev` when testing live session creation locally.
