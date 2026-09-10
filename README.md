# Al-Birr Credit Union document upload portal

Internal-use document upload journey built with the IDMission WebSDK.

## Vercel configuration

Add these server-side environment variables to Development, Preview and Production:

- `IDMISSION_API_KEY_ID`
- `IDMISSION_API_KEY_SECRET`

Do not prefix either variable with `VITE_`; that would expose it to the browser.

## Local development

Install dependencies and run `npm run dev`. The Vite development server does not execute the Vercel API function itself; use `vercel dev` when testing live session creation locally.
