# Sukat: supplement recommendations, measured for you (MVP)

*Sukat* means "measure" in Malay and Filipino.

A brand-neutral, safety-first web app that helps people in **Southeast Asia** choose protein and creatine
for their goals and health, plus a **backoffice** where your team manages the catalog, the evidence and
the recommendation rules.

```
apps/
  web/      → user-facing questionnaire + results        (Next.js, port 3000)
  admin/    → backoffice: catalog, rules, review, audit  (Next.js, port 3001)
packages/
  engine/   → pure TypeScript rules engine + tests (no DB, no framework)
  db/       → Prisma schema, migrations, seed, knowledge-base loader
```

## Quick start

Requirements: Node 22+, pnpm 10, Docker (or any Postgres 16).

```bash
cp .env.example .env            # then set AUTH_SECRET: openssl rand -base64 32
docker compose up -d            # local Postgres
pnpm install
pnpm db:deploy                  # apply migrations
pnpm db:seed                    # starter rules, supplements, SAMPLE products, first admin
pnpm dev                        # web → http://localhost:3000, admin → http://localhost:3001
```

Sign in to the backoffice with `ADMIN_EMAIL` / `ADMIN_PASSWORD` from `.env`.

Other commands: `pnpm test` (engine tests), `pnpm typecheck`, `pnpm build`, `pnpm db:migrate` (after schema changes).

## How a recommendation is made

1. **Questionnaire** (`apps/web/components/Questionnaire.tsx`) collects goal, weight, training, diet, fish
   intake, halal / lactose / allergies, budget, conditions (incl. thalassaemia), medications, supplements
   already taken, and optional lab values: eGFR, creatinine, ALT, uric acid, HbA1c, vitamin D, ferritin, B12.
   Creatinine, uric acid, vitamin D and B12 accept SI or conventional units (default by country) and are
   stored in SI. Values that only make sense in the other unit get a "Switch unit" prompt.
   - **Lab report upload** (optional): `/api/extract-labs` sends the PDF/photo to Claude, which only
     *transcribes* values and units into a strict JSON schema. The form is filled and highlighted for the user
     to check; unknown units are skipped, never guessed. The file is never stored. Needs `ANTHROPIC_API_KEY`;
     without it the upload button simply doesn't appear. Rate-limited to 6 uploads per IP per 10 minutes.
     People must tick an explicit consent (naming Anthropic and the United States) before a file is sent; the API
     refuses uploads without it. `LAB_UPLOAD_OFF_COUNTRIES` (default `VN`) switches upload off where a cross-border
     transfer of health data needs more paperwork first (Vietnam's Decree 356 transfer assessment).
2. **Rules** (stored in the DB, edited in the backoffice) are evaluated against the profile. Each rule has an
   effect:
   - `BLOCK` – the supplement (or all supplements, for global rules) is not recommended; the user is
     told to see a professional. **Blocks always win.**
   - `CAUTION` – recommended, but with a warning shown.
   - `RECOMMEND` – the supplement is indicated for this profile.
3. **Dosing** – fixed ranges (daily, every other day for iron, or per hour of exercise for electrolytes).
   Protein targets a total g/kg/day by goal and recommends only the **gap** left after food, so people who
   already eat enough protein are told they don't need powder.

   Supplements covered: protein, creatine, vitamin D3, omega-3 (fish or algae), iron (only with a ferritin
   result), vitamin B12 and electrolytes.
4. **Products** are filtered (sold in the user's country, allergens, vegan, lactose, halal) and ranked on:
   third-party testing (35), value per gram of active ingredient (35), formulation quality (15) and personal
   fit, i.e. sugar for blood-sugar management and budget (15). **Affiliate commission is never a ranking factor.**
5. Results show the dose, servings per product, the reasons, the warnings (including double-ups with
   supplements already taken), research references and a disclaimer. People can share to WhatsApp, save a PDF
   for their doctor, save the check to **this device's** history (compare checks and lab values over time at
   `/history`), and add **calendar reminders** (.ics). The site is installable as an app (web manifest).
   The web app stores **no personal or health data** on the server: shared links carry answers in the URL
   fragment, history lives in the browser, and only an anonymous `{country, goal, recommended, blocked}`
   event is kept for the dashboard.

**New supplements go live only after review.** The seed publishes new *safety* rules straight away (they can
only hold a recommendation back) but adds new *recommend* rules as **Pending review**. A supplement isn't shown
to users until at least one of its recommend rules is published. `pnpm db:seed` is safe to re-run on a live
database: it only adds what's missing and never overwrites backoffice edits.

Rule conditions are a small JSON language:

```json
{ "all": [
  { "fact": "goal", "op": "in", "value": ["muscle_gain", "strength"] },
  { "fact": "labs.egfr", "op": "gte", "value": 60 }
] }
```

Unknown values (e.g. no lab result) never match a comparison; use `notExists` to target missing data. The rule
editor lists every fact and validates conditions before saving.

## Products outside Malaysia

`packages/db/prisma/catalog-sea.ts` holds products researched for SG, ID, TH, PH and VN. The retailer pages couldn't be
opened during research, so the seed adds them **inactive** with notes starting `UNVERIFIED —`, and the dashboard counts
them. Check each one on the shop page, correct it, and tick *Active*. Prices for SG/PH/TH/ID were also added to a few
Malaysian products sold there.

## Affiliate links

Buy links on the results page go through `/go/<productId>?c=<country>`. That route looks the link up in the catalog
(so it can't redirect anywhere else), adds the affiliate code if a program covers the shop, counts the click
anonymously (product, country, shop; no IP or profile) and redirects. Set programs up in the backoffice under
**Affiliate links** (admins only): a deep-link template from the shop's affiliate dashboard with `{url}` and optional
`{sub}` (e.g. `sukat_protein`), or parameters to add (e.g. `rcode=ABC123`). The page lists every shop the catalog links
to, whether a program covers it, and clicks in the last 30 days.

Affiliate code lives in `packages/engine/src/affiliate.ts` and is applied only after the click: a test fails if the
recommendation, ranking or dosing code ever references it. The website discloses it under every product list and on
`/how-it-works`.

## Languages

The website is in **English, Bahasa Melayu, Bahasa Indonesia, Thai and Vietnamese**. The language comes from a `lang`
cookie (set by the switcher in the header), else the browser's language, else English. Filipino isn't included: English
is widely used for health information in the Philippines.

- **Website text:** `apps/web/lib/i18n/messages.ts` (en, ms, id), `messages-th.ts`, `messages-vi.ts`. Every language is
  type-checked against `en`, so a missing string fails the build.
- **Engine text** (dose wording, reasons, product notes, labels): `packages/engine/src/i18n.ts` and
  `labels.ts`; Thai and Vietnamese, including the starter rules and supplements, in `packages/engine/src/locales/`. `recommend(profile, kb, { locale })`.
- **Rules and supplements:** each has a `translations` field, edited in the backoffice ("Message in Bahasa
  Melayu / Indonesia"; translated name, summary, timing and notes). Empty fields fall back to English. The
  seed adds a starter translation only for languages a row doesn't have yet.

The translations were written without a native-speaker review; have the medical wording proofread.

## Backoffice roles & review workflow

| Role | Can |
|---|---|
| `EDITOR` | Manage products and supplement text, draft rules, submit for review |
| `REVIEWER` | Everything an editor can + approve/publish/reject rules, change dosing & evidence grades |
| `ADMIN` | Everything + manage users |

Rules go **Draft → Pending review → Published** (or Archived). Only published rules affect users. A reviewer
can't publish a rule they created; someone else has to approve it. Admins are exempt so a very small team isn't blocked.
The **Simulator** runs any profile against the live rules (optionally including drafts) so reviewers can test
before publishing. Every change is recorded in the **Audit log** with before/after values.

## ⚠ Before you launch

- [ ] **Have a qualified professional review every rule.** The seeded rules (`packages/engine/src/defaults.ts`)
      are drafted from ISSN position stands but are *not* clinically validated. Give that person the `REVIEWER` role.
- [ ] **Replace the sample products.** The seeded products are fictional ("Sample Co.") with illustrative
      prices. The dashboard warns you while they exist.
- [ ] Verify halal certification bodies (JAKIM, MUI, MUIS…) and local registration (NPRA, HSA, BPOM, Thai FDA,
      PH FDA) for each real product.
- [ ] Legal review per market: health-data rules (Malaysia PDPA, Singapore PDPA, Indonesia PDP Law, Thailand PDPA,
      Philippines DPA, Vietnam PDPD) and supplement advertising rules.
- [ ] Set a strong `AUTH_SECRET` and `ADMIN_PASSWORD`, and change the seeded admin's password.
- [ ] Check the **Sukat** trademark (MyIPO, IPOS, DJKI, IPOPHL) and secure domains and social handles. The name can be overridden with `NEXT_PUBLIC_APP_NAME`.
- [ ] Disclose affiliate links if you add them (`rel="sponsored"` is already set on buy links).

## Deploying to Railway

The project has three parts: **Postgres**, **web** and **admin**. Both apps are built from the repository
root with their own Dockerfile (`apps/web/Dockerfile`, `apps/admin/Dockerfile`). When a container starts,
`scripts/start.sh` applies database migrations, seeds starter data if asked to, and starts the app on `$PORT`.

1. **Create the project.** In Railway: **New Project → Deploy from GitHub repo →** `shiuh-yaw/supplement`.
   The service it creates will be **web**, so rename it to `web`. Its first build may fail before step 3; that's expected.
2. **Add the database:** **+ Create → Database → PostgreSQL**. Keep the service name `Postgres`.
3. **Configure web** (service → *Variables*):

   | Variable | Value |
   |---|---|
   | `RAILWAY_DOCKERFILE_PATH` | `apps/web/Dockerfile` |
   | `DATABASE_URL` | `${{Postgres.DATABASE_URL}}` |
   | `NEXT_PUBLIC_APP_NAME` | `Sukat` (optional) |
   | `ANTHROPIC_API_KEY` | your Anthropic API key (optional — enables lab report upload) |

   Then *Settings → Networking → Generate Domain*. Leave *Root Directory* empty.
4. **Add admin:** **+ Create → GitHub Repo →** the same repo. Rename it to `admin` and set:

   | Variable | Value |
   |---|---|
   | `RAILWAY_DOCKERFILE_PATH` | `apps/admin/Dockerfile` |
   | `DATABASE_URL` | `${{Postgres.DATABASE_URL}}` |
   | `AUTH_SECRET` | a random string of 32+ characters (`openssl rand -base64 32`) |
   | `ADMIN_EMAIL` | your email |
   | `ADMIN_PASSWORD` | a strong password, 12+ characters |
   | `SEED_ON_DEPLOY` | `true` (first deploy only) |

   Then generate a domain for it as well.
5. **Deploy** both services. Check that you can sign in to the admin domain, then **delete `SEED_ON_DEPLOY`**.
   The seed never overwrites your edits, but if the catalog is ever empty it would add the sample products again.
6. **Optional:** to stop a change in one app from rebuilding the other, set *Settings → Watch Paths*:
   web `/apps/web/**`, `/packages/**`, `/pnpm-lock.yaml`; admin `/apps/admin/**`, `/packages/**`, `/pnpm-lock.yaml`.

Every push to `main` then redeploys automatically. The seed refuses to run in production with the example
password, and the admin app won't start without an `AUTH_SECRET` of 32+ characters.

Railway is replacing its older `railway.json` config files with `.railway/railway.ts`. This setup doesn't
use either, so it isn't affected.

Any other host that runs Dockerfiles works the same way. Build from the repository root with
`docker build -f apps/web/Dockerfile .` and provide the same variables.

## Roadmap

1. **Done:** five languages, affiliate links with disclosure, 7 supplements with lab-based safety rules, report upload with AI transcription, unit
   handling, "what I already take" checks, device history, calendar reminders, installable web app,
   backoffice with review workflow.
2. **Next:** see the roadmap page linked from the latest pull request: verify the SG/ID/TH/PH/VN catalog, add
   marketplace links for affiliate revenue, optional accounts with consent, pharmacist hand-off, label scanning.
3. **Later:** AI Q&A grounded on the user's own plan and the evidence library; partnerships to book blood
   tests or a dietitian (e.g. Halodoc, Pathlab, BP Healthcare, Prodia).
