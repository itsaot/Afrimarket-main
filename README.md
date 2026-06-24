# AfriMarket

AfriMarket is a mobile-first B2B2C marketplace prototype inspired by eXobe Africa. It connects African vendors with buyers through a polished product discovery, cart, inquiry, and vendor dashboard experience.

## Submission Notes

This project was prepared for the eXobe Phase 2 technical assessment. I used Lovable for the initial UI foundation, then installed and configured the required dependencies myself through the terminal. Codex was used to debug issues, review the architecture, and pseudocode improvements while using the eXobe website as a product reference. Claude was used during the build process, after which I added the URL-based connectors and environment configuration myself.

I created and connected the Supabase project instance directly, then used Codex to check the implementation for mistakes, debug Supabase policy issues, and make the app Vercel-ready.

## What Is Included

- Landing page with premium marketplace positioning
- Product discovery with category filters, search, empty states, and smart suggestions
- Product detail pages with verified vendor trust labels
- Cart and mock checkout flow
- Buyer inquiry flow for contacting vendors
- Vendor dashboard with product management and recent activity
- AI-assisted product description support
- Supabase authentication, database, and image storage integration
- Responsive navigation, mobile bottom navigation, toast feedback, and loading states

## Currency

ZAR is the primary/base currency for the marketplace. The vendor product form also supports other African currencies, including NGN, KES, GHS, EGP, MAD, and XOF.

## Tech Stack

- React with TanStack Start and Vite
- TypeScript
- Tailwind CSS
- Shadcn UI components
- Supabase
- Zustand
- Vercel deployment output

## Local Setup

```bash
npm install
npm run dev
```

Create `.env.local` using `.env.example`, then add the matching Supabase project URL and publishable key.

## Build

```bash
npm run build
```

The project is configured to generate Vercel-compatible output.
