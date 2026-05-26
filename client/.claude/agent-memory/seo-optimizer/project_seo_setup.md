---
name: project-seo-setup
description: SEO stack and architecture for the Geometki Next.js client — next-seo, next-i18next, RTK Query SSR, bilingual ru/en site
metadata:
  type: project
---

Geometki client is a bilingual (ru default `/`, en at `/en`) Next.js Pages Router app using `next-seo` (custom fork from `next-seo/pages`) with `generateNextSeo` and `JsonLdScript`. All pages implement per-page SEO via `<Head>{generateNextSeo(...)}</Head>`. Hreflang is handled by `utils/seo.ts::buildHreflangTags`. JSON-LD schemas are in `utils/schema.ts` (PlaceSchema, UserSchema). Sitemap is server-rendered at `pages/sitemap.tsx`.

**Why:** Full audit performed 2026-05-26 — see findings in agent message.

**How to apply:** When suggesting SEO fixes, keep them within this architecture. Do not suggest switching SEO libraries. The `generateNextSeo` call pattern and `JsonLdScript` are the established conventions.
