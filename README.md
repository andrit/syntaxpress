# SyntaxPress — Next.js + Shopify Storefront

Artfully typeset prints, pressed onto things you actually wear.

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│  Vercel (Hosting + CDN + Edge Functions)                │
│  ┌───────────────────────────────────────────────┐      │
│  │  Next.js 14 (App Router)                      │      │
│  │  ├── Server Components (products, collections)│      │
│  │  ├── Client Components (cart, gallery, forms)  │      │
│  │  └── API Routes (webhook revalidation)        │      │
│  └────────────────────┬──────────────────────────┘      │
│                       │ GraphQL                         │
│                       ▼                                 │
│  ┌────────────────────────────────────────┐             │
│  │  Shopify (Backend)                      │             │
│  │  ├── Storefront API (products, cart)    │             │
│  │  ├── Checkout (hosted, PCI-compliant)   │             │
│  │  ├── Shopify Payments (Stripe)          │             │
│  │  └── Webhooks → /api/revalidate         │             │
│  └────────────────────┬───────────────────┘             │
│                       │ Auto-fulfill                    │
│                       ▼                                 │
│  ┌─────────────────────────────────┐                    │
│  │  Printful (Fulfillment)          │                    │
│  │  Print → Pack → Ship → Track     │                    │
│  └─────────────────────────────────┘                    │
└─────────────────────────────────────────────────────────┘
```

## Quick Start

### Prerequisites
- Node.js 18+
- A Shopify Partner account + development store
- Vercel account + custom domain

### 1. Clone and install

```bash
git clone <your-repo-url> syntaxpress
cd syntaxpress
npm install
```

### 2. Configure environment

```bash
cp .env.example .env.local
```

Fill in your Shopify credentials:

| Variable | Where to find it |
|----------|-----------------|
| `SHOPIFY_STORE_DOMAIN` | Your `.myshopify.com` domain (e.g. `syntaxpress.myshopify.com`) |
| `SHOPIFY_STOREFRONT_ACCESS_TOKEN` | Shopify Admin → Settings → Apps → Develop apps → Your app → API credentials → Storefront API access token |
| `SHOPIFY_ADMIN_ACCESS_TOKEN` | Same location, Admin API access token |
| `SHOPIFY_WEBHOOK_SECRET` | Generated when you create webhooks in Shopify |
| `REVALIDATION_SECRET` | Any random string you choose (use `openssl rand -hex 32`) |

### 3. Run locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### 4. Deploy to Vercel

```bash
npx vercel
```

Or connect your Git repo in the Vercel dashboard for automatic deployments on push.

Add all `.env.local` variables to your Vercel project's Environment Variables settings.

### 5. Set up Shopify webhooks

In your Shopify admin, go to **Settings → Notifications → Webhooks** and create webhooks for:

- `products/create` → `https://your-domain.com/api/revalidate`
- `products/update` → `https://your-domain.com/api/revalidate`
- `products/delete` → `https://your-domain.com/api/revalidate`
- `collections/create` → `https://your-domain.com/api/revalidate`
- `collections/update` → `https://your-domain.com/api/revalidate`
- `collections/delete` → `https://your-domain.com/api/revalidate`

Set the `x-revalidation-secret` header to match your `REVALIDATION_SECRET`.

### 6. Connect Printful

Install the Printful app from the Shopify App Store. Products created in Printful will sync to Shopify, which triggers the webhook, which revalidates the Next.js cache — your storefront updates automatically.

## Project Structure

```
src/
├── app/                          # Next.js App Router pages
│   ├── layout.tsx                # Root layout (fonts, header, footer, cart provider)
│   ├── page.tsx                  # Home page
│   ├── not-found.tsx             # 404 page
│   ├── loading.tsx               # Loading skeleton
│   ├── products/
│   │   ├── page.tsx              # All products (with sort)
│   │   └── [handle]/page.tsx     # Product detail
│   ├── collections/
│   │   ├── page.tsx              # All collections
│   │   └── [slug]/page.tsx       # Collection detail
│   ├── cart/page.tsx             # Cart page
│   ├── about/page.tsx            # About / FAQ / Contact
│   └── api/revalidate/route.ts   # Shopify webhook handler
├── components/
│   ├── layout/                   # Header, Footer, Logo
│   ├── product/                  # ProductCard, ProductGrid, ProductGallery, ProductActions
│   ├── cart/                     # CartProvider, CartButton
│   └── home/                    # Hero, FeaturedCollections
├── lib/
│   ├── shopify/                  # Shopify client, queries, fragments, server actions
│   └── utils/                    # Formatting, classnames
├── types/                        # TypeScript type definitions
└── styles/globals.css            # Tailwind + custom styles
```

## Design System

### Typography
- **Display**: Cormorant Garamond — elegant serif for headings and brand
- **Body**: DM Sans — clean geometric sans for readable body text
- **Mono**: JetBrains Mono — technical monospace for labels, prices, CTAs

### Colors
- **Ink** palette — warm near-black through cream (ink.50–ink.950)
- **Press** accent — warm red-orange (#c4451a) for brand highlights
- **Paper** backgrounds — warm off-white (#faf8f5)

### Components
- `.btn-press` — primary dark button with press-red hover
- `.btn-outline` — secondary outlined button
- `.mono-label` — tiny uppercase monospace labels
- `.rule-line` / `.rule-line-thick` — decorative horizontal rules
- `.product-card` — hover-lift card with overlay

## Multi-Platform Strategy

Redbubble, TeePublic, and Society6 do not offer product management APIs. The recommended workflow:

1. **Design in Canva Pro** → export all size variants
2. **Upload to Shopify via Printful** → auto-syncs to this storefront
3. **Upload manually** to Redbubble, TeePublic, Society6 using pre-staged assets and listing copy from your design batch worksheet

Future enhancement: build a `/admin/staging` dashboard into this app that pre-generates upload-ready asset packages with metadata for each platform, reducing manual data entry.

## Key Features

- **Server Components** — products and collections render on the server for SEO and performance
- **Optimistic Cart** — cart updates instantly on the client while syncing with Shopify
- **ISR + Webhooks** — pages revalidate on a 60-second interval AND on-demand when Shopify data changes
- **Responsive** — mobile-first layout with progressive enhancement
- **SEO** — dynamic metadata, OpenGraph tags, semantic HTML
- **Accessibility** — semantic markup, keyboard navigation, ARIA labels

## Next Steps

- [ ] Connect Shopify dev store and add first products
- [ ] Customize product page with size chart component
- [ ] Add email capture for Klaviyo integration
- [ ] Build Pinterest meta tags for rich pins
- [ ] Add search functionality
- [ ] Build `/admin/staging` dashboard for multi-platform upload prep
