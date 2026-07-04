# Maya 24-Hour Listing Launch Pack

Static Vercel sales page for the founding real estate agent offer.

## Offer

Send an MLS number or listing address. Maya returns a first-pass premium listing launch pack within 24 hours after the complete listing packet is received.

## Founding Price

- `$497` per property
- `$1,497` for a three-pack

## CTA

Public intake form:

`https://formsubmit.co/reports@michellesanchezrealtor.info`

Default notification inbox:

`reports@michellesanchezrealtor.info`

The public form uses FormSubmit's supported direct HTML form endpoint. The project also includes `/api/intake` for structured order-ID intake, optional webhook automation, and optional Supabase persistence once server-side delivery credentials are available.

The first FormSubmit submission can require one inbox activation click. Until activation is complete, FormSubmit sends an activation email to the intake inbox.

## Optional Environment Variables

- `MAYA_INTAKE_WEBHOOK_URL` - POST each validated order to Zapier, Make, n8n, Slack, or a custom backend.
- `MAYA_INTAKE_WEBHOOK_SECRET` - optional shared secret sent as `X-Maya-Webhook-Secret`.
- `SUPABASE_URL` - Supabase project URL for order logging.
- `SUPABASE_SERVICE_ROLE_KEY` - server-only Supabase key for inserting orders.

## Supabase Table

If Supabase logging is enabled, create this table first:

```sql
create table if not exists public.maya_listing_launch_orders (
  id bigint generated always as identity primary key,
  order_id text not null unique,
  submitted_at timestamptz not null,
  package_type text not null,
  agent_name text not null,
  agent_email text not null,
  agent_phone text not null,
  mls_number text,
  property_address text,
  listing_price text,
  go_live_date text,
  media_link text not null,
  preferred_cta text,
  compliance_notes text,
  source text not null,
  created_at timestamptz not null default now()
);

alter table public.maya_listing_launch_orders enable row level security;
```

Do not expose this table to public browser writes. Inserts should come from the Vercel serverless endpoint with a server-only key.

## Deployment

Deploy from this folder:

```powershell
vercel deploy -y --target=preview
```

Promote to production only when ready to use the page publicly.
