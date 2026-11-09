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

1. **Questionnaire** (`apps/web/components/Questionnaire.tsx`) collects goal, weight, training, diet,
   halal / lactose / allergies, budget, conditions, medications and optional lab values (eGFR, creatinine,
   ALT, uric acid, HbA1c).
2. **Rules** (stored in the DB, edited in the backoffice) are evaluated against the profile. Each rule has an
   effect:
   - `BLOCK` – the supplement (or all supplements, for global rules) is not recommended; the user is
     told to see a professional. **Blocks always win.**
   - `CAUTION` – recommended, but with a warning shown.
   - `RECOMMEND` – the supplement is indicated for this profile.
3. **Dosing** – creatine uses a fixed range (3–5 g/day). Protein targets a total g/kg/day by goal and
   recommends only the **gap** left after food, so people who already eat enough protein are told they don't need powder.
4. **Products** are filtered (sold in the user's country, allergens, vegan, lactose, halal) and ranked on:
   third-party testing (35), value per gram of active ingredient (35), formulation quality (15) and personal
   fit, i.e. sugar for blood-sugar management and budget (15). **Affiliate commission is never a ranking factor.**
5. Results show the dose, the reasons, the warnings, the research references and a disclaimer. The web app
   stores **no personal or health data**, only an anonymous `{country, goal, recommended, blocked}` event for
   the dashboard.

Rule conditions are a small JSON language:

```json
{ "all": [
  { "fact": "goal", "op": "in", "value": ["muscle_gain", "strength"] },
  { "fact": "labs.egfr", "op": "gte", "value": 60 }
] }
```

Unknown values (e.g. no lab result) never match a comparison; use `notExists` to target missing data. The rule
editor lists every fact and validates conditions before saving.

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

## Deploying

- Postgres: Neon, Supabase or any managed Postgres. Run `pnpm db:deploy` against it.
- Apps: deploy `apps/web` and `apps/admin` as two Vercel projects (root directory = the app folder) with
  `DATABASE_URL` and (admin) `AUTH_SECRET` set. Put the admin on its own domain and consider IP restrictions.

## Roadmap

1. **Now (MVP):** protein + creatine, questionnaire, manually entered labs, backoffice with review workflow.
2. **Next:** user accounts (save and re-check plans), more supplements (vitamin D, omega-3, magnesium,
   electrolytes, iron) with their lab-based rules, Bahasa Malaysia / Bahasa Indonesia / Thai / Vietnamese translations.
3. **Later:** upload a medical report (PDF/photo) → AI extracts lab values → **user confirms** → the same
   deterministic rules decide. Expert-reviewed personal plans, retest reminders.
