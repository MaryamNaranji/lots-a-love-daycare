# One-time setup for working Reviews + Enrollment emails

The code is complete, but the live site needs two external services because a static browser page cannot securely send email or store pending reviews by itself.

## 1) Supabase (stores pending/approved reviews)
1. Create a free project at Supabase.
2. Open **SQL Editor**.
3. Paste the contents of `supabase-setup.sql` and click **Run**.
4. In **Project Settings > API**, copy:
   - Project URL
   - service_role key (keep this secret; never put it in HTML/JavaScript)

## 2) Resend (sends the emails)
1. Create a Resend account.
2. Add and verify your daycare domain in Resend. Follow Resend's DNS instructions at the company where you bought the domain.
3. Create a Resend API key.
4. Use a sender such as `Lots A Love Daycare <hello@YOUR-DOMAIN.com>` after the domain is verified.

## 3) Add Vercel environment variables
In Vercel: **Lots A Love Daycare project > Settings > Environment Variables**. Add these to Production, Preview, and Development:

- `SUPABASE_URL` = your Supabase Project URL
- `SUPABASE_SERVICE_ROLE_KEY` = your Supabase service_role key
- `RESEND_API_KEY` = your Resend API key
- `EMAIL_FROM` = `Lots A Love Daycare <hello@YOUR-DOMAIN.com>`
- `ADMIN_EMAIL` = `nazi157ranjbar@yahoo.com`
- `SITE_URL` = `https://YOUR-DOMAIN.com`

Do not include quotes around values.

## 4) Redeploy
After adding the environment variables, in Vercel open **Deployments**, choose the latest deployment, and click **Redeploy**.

## What happens after setup
### Review
1. Parent submits review.
2. Parent receives confirmation email.
3. Nazi receives the review by email with **Approve & Publish** and **Ignore Review** links.
4. Approve & Publish changes the review to approved in Supabase.
5. The Reviews page automatically displays approved reviews only.

### Enrollment inquiry
1. Parent submits the enrollment form.
2. Nazi receives the inquiry by email.
3. Parent receives confirmation that the inquiry was submitted to Nazi.

## Important
- Never expose `SUPABASE_SERVICE_ROLE_KEY` or `RESEND_API_KEY` in frontend files.
- Resend requires a verified sending domain to email arbitrary recipients reliably.
