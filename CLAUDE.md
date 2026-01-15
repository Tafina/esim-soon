# Simlak - eSIM Selling Platform

## Important Notes for Claude

- **DO NOT run `npm run build`** - The user will build manually when needed
- **DO NOT run `npx convex deploy`** - Convex dev is already running and auto-syncs

## Build & Development Commands

```bash
# Development
npm run dev           # Start Next.js dev server (http://localhost:3000)
npx convex dev        # Start Convex backend in dev mode (run in separate terminal)

# Production
npm run build         # Build for production
npm run start         # Start production server

# Linting
npm run lint          # Run ESLint
```

## Project Architecture

### Tech Stack
- **Frontend**: Next.js 16.1.1 (App Router) with React 19
- **Backend**: Convex (serverless database + functions)
- **Auth**: Clerk (with webhook sync to Convex)
- **Styling**: Tailwind CSS 4 with custom CSS variables
- **UI Components**: shadcn/ui (Radix primitives)
- **Icons**: Lucide React
- **Font**: Montserrat (via next/font)
- **eSIM Provider**: eSIM Access API with HMAC-SHA256 authentication

### Directory Structure
```
simlak/
├── src/app/                    # Next.js App Router pages
│   ├── page.tsx                # Landing page
│   ├── destinations/
│   │   ├── page.tsx            # Browse all destinations
│   │   └── [country]/page.tsx  # Country-specific packages
│   ├── dashboard/
│   │   ├── page.tsx            # User dashboard (My eSIMs)
│   │   └── esim/[id]/page.tsx  # eSIM detail page
│   ├── checkout/page.tsx       # Checkout flow
│   ├── support/page.tsx        # Support & FAQ
│   ├── how-it-works/page.tsx   # How it works guide
│   ├── sign-in/[[...sign-in]]/ # Clerk sign-in page
│   └── sign-up/[[...sign-up]]/ # Clerk sign-up page
├── src/components/             # React components
│   ├── ui/                     # shadcn/ui components
│   ├── providers/              # Context providers
│   │   ├── convex-provider.tsx
│   │   ├── cart-provider.tsx
│   │   └── user-sync.tsx       # Clerk-Convex user sync
│   ├── navbar.tsx              # Main navigation with cart
│   └── footer.tsx              # Site footer
├── convex/                     # Convex backend
│   ├── schema.ts               # Database schema
│   ├── http.ts                 # HTTP routes (Clerk webhook)
│   ├── users.ts                # User queries/mutations
│   ├── packages.ts             # Package queries
│   ├── packagesActions.ts      # eSIM Access API integration
│   ├── cart.ts                 # Shopping cart mutations
│   ├── orders.ts               # Order management
│   └── ordersActions.ts        # Order fulfillment actions
└── public/                     # Static assets
```

## Key Patterns & Conventions

### Pricing
- Wholesale prices from eSIM Access API are marked up by **70%**
- All prices stored in **cents** (multiply by 100)
- Retail price calculation: `retailPrice = Math.ceil(wholesalePrice * 1.7)`

### Package Display
- All packages are shown (no duration filtering)
- Package counts are computed dynamically at query time
- Countries must have valid 2-letter ISO codes to display

### Session-Based Cart
- Cart uses `sessionId` stored in localStorage
- Generated on first visit: `crypto.randomUUID()`
- Cart persists across page refreshes without authentication

### eSIM Access API Integration
- Base URL: `https://api.esimaccess.com`
- Authentication: HMAC-SHA256 signature
- Signature = `hmac(timestamp + requestId + accessCode + body, secretKey)`
- Required headers: `RT-AccessCode`, `RT-RequestID`, `RT-Timestamp`, `RT-Signature`
- Price format: API returns price × 10,000 (e.g., 15000 = $1.50)

**Available Endpoints (in `ordersActions.ts`):**
| Action | Endpoint | Purpose |
|--------|----------|---------|
| `syncPackages` | `/api/v1/open/package/list` | Fetch all available packages |
| `fulfillOrder` | `/api/v1/open/esim/order` | Order eSIM profiles |
| `refreshEsimStatus` | `/api/v1/open/esim/query` | Get eSIM status/usage |
| `suspendEsim` | `/api/v1/open/esim/suspend` | Temporarily suspend eSIM |
| `unsuspendEsim` | `/api/v1/open/esim/unsuspend` | Reactivate suspended eSIM |
| `cancelEsim` | `/api/v1/open/esim/cancel` | Cancel before installation |
| `revokeEsim` | `/api/v1/open/esim/revoke` | Permanently remove eSIM |
| `getMerchantBalance` | `/api/v1/open/balance/query` | Check account balance |

### Order Flow
1. User adds packages to cart (session-based)
2. Checkout creates order with status `paid` (payment integration pending)
3. `fulfillOrder` action calls eSIM Access API to provision eSIMs
4. eSIM records created in database with QR codes and activation codes
5. User views eSIMs in dashboard, can refresh data usage anytime

## Database Schema (Convex)

| Table | Purpose |
|-------|---------|
| `users` | User accounts (email, name, optional Clerk ID) |
| `packages` | eSIM packages synced from API |
| `countries` | Country metadata (flag, region, popularity) |
| `cart` | Session-based shopping carts |
| `orders` | Purchase orders with line items |
| `esims` | Provisioned eSIM records (ICCID, activation code, QR) |

### Key Indexes
- `packages.by_location` - Query packages by country code
- `packages.by_packageCode` - Lookup single package
- `countries.by_code` - Lookup country by ISO code
- `cart.by_session` - Get cart by session ID
- `orders.by_transactionId` - Lookup order

### Clerk Authentication
- Users sync to Convex via two methods:
  1. **Client-side**: `UserSync` component runs on page load when signed in
  2. **Webhook**: Convex HTTP endpoint at `/clerk-webhook` handles `user.created`, `user.updated`, `user.deleted`
- Webhook endpoint requires `CLERK_WEBHOOK_SECRET` env var (set in Convex dashboard)
- Set up webhook in Clerk Dashboard pointing to `https://<your-convex-deployment>.convex.site/clerk-webhook`

## Environment Variables

```env
# Convex
CONVEX_DEPLOYMENT=
NEXT_PUBLIC_CONVEX_URL=

# Clerk
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
CLERK_SECRET_KEY=
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
# Note: CLERK_WEBHOOK_SECRET is set in Convex dashboard, not here

# eSIM Access API (set in Convex dashboard)
ESIM_ACCESS_CODE=
ESIM_SECRET_KEY=
```

## Common Tasks

### Sync Packages from eSIM Access API
Run the `syncPackages` action in Convex dashboard or via:
```typescript
import { api } from "@/convex/_generated/api";
await convex.action(api.packagesActions.syncPackages, {});
```

### Add New Page
1. Create `src/app/[route]/page.tsx`
2. Use Convex queries via `useQuery` hook
3. Follow existing design patterns (hero section, content, CTA)

### Modify Package Queries
All package queries live in `convex/packages.ts`. Remember to:
- Compute counts dynamically, not from stored `packageCount`
- Always use uppercase for country codes in queries
