const { escapeHtml, siteUrl, sendEmail, supabase, uuid, json } = require('../../lib/server');

function isSchemaError(error) {
  return /column|schema cache|could not find/i.test(String(error && error.message || error));
}

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') return json(res, 405, { ok: false, error: 'Method not allowed' });

  try {
    const body = req.body || {};
    if (body.website) return json(res, 200, { ok: true });

    const name = String(body.name || '').trim().slice(0, 120);
    const email = String(body.email || '').trim().slice(0, 200);
    const relationship = String(body.relationship || '').trim().slice(0, 80);
    const rating = Number(body.rating);
    const review = String(body.review || '').trim().slice(0, 5000);
    const consent = Boolean(body.consent);

    if (!name || !email || !relationship || !review || !consent || !Number.isInteger(rating) || rating < 1 || rating > 5) {
      return json(res, 400, { ok: false, error: 'Please complete all required review fields.' });
    }
    if (!/^\S+@\S+\.\S+$/.test(email)) return json(res, 400, { ok: false, error: 'Please enter a valid email address.' });

    const id = uuid();
    const token = uuid();

    try {
      await supabase('reviews', {
        method: 'POST',
        headers: { Prefer: 'return=minimal' },
        body: JSON.stringify({
          id,
          name,
          email,
          relationship,
          rating,
          review,
          consent,
          status: 'pending',
          approval_token: token
        })
      });
    } catch (error) {
      if (!isSchemaError(error)) throw error;
      await supabase('reviews', {
        method: 'POST',
        headers: { Prefer: 'return=minimal' },
        body: JSON.stringify({
          id,
          reviewer_name: name,
          reviewer_email: email,
          reviewer_type: relationship,
          rating,
          feedback: review,
          permission_to_publish: consent,
          status: 'pending',
          moderation_token: token
        })
      });
    }

    const origin = siteUrl(req);
    const approveUrl = `${origin}/api/reviews/moderate?id=${encodeURIComponent(id)}&token=${encodeURIComponent(token)}&action=approve`;
    const ignoreUrl = `${origin}/api/reviews/moderate?id=${encodeURIComponent(id)}&token=${encodeURIComponent(token)}&action=ignore`;
    const adminEmail = process.env.ADMIN_EMAIL || 'nazi157ranjbar@yahoo.com';
    const stars = '★'.repeat(rating) + '☆'.repeat(5 - rating);

    const adminHtml = `
      <div style="font-family:Arial,sans-serif;line-height:1.6;color:#342936;max-width:680px;margin:auto">
        <h2 style="color:#e45f7a">New Lots A Love Daycare Review</h2>
        <p><strong>${escapeHtml(name)}</strong> (${escapeHtml(relationship)}) submitted a review.</p>
        <p style="font-size:22px;color:#f3a61b">${stars}</p>
        <div style="background:#fff6f8;border-radius:14px;padding:18px;margin:18px 0">${escapeHtml(review).replace(/\n/g, '<br>')}</div>
        <p><strong>Reviewer email:</strong> ${escapeHtml(email)}</p>
        <p style="margin-top:28px">
          <a href="${approveUrl}" style="display:inline-block;background:#e45f7a;color:white;text-decoration:none;padding:13px 20px;border-radius:999px;margin-right:10px">Approve & Publish</a>
          <a href="${ignoreUrl}" style="display:inline-block;background:#f0ecee;color:#342936;text-decoration:none;padding:13px 20px;border-radius:999px">Ignore Review</a>
        </p>
        <p style="font-size:13px;color:#746b75">Only an approved review will appear on the website.</p>
      </div>`;

    const reviewerHtml = `
      <div style="font-family:Arial,sans-serif;line-height:1.6;color:#342936;max-width:620px;margin:auto">
        <h2 style="color:#e45f7a">Thank you for your feedback</h2>
        <p>Hi ${escapeHtml(name)},</p>
        <p>Your review for <strong>Lots A Love Daycare</strong> was submitted successfully to Nazi for review.</p>
        <p>If approved, it may be published on the daycare website.</p>
        <p>Thank you for taking the time to share your experience.</p>
        <p>— Lots A Love Daycare</p>
      </div>`;

    await Promise.all([
      sendEmail({ to: adminEmail, subject: `Review awaiting approval from ${name}`, html: adminHtml, replyTo: email }),
      sendEmail({ to: email, subject: 'Your Lots A Love Daycare review was submitted', html: reviewerHtml, replyTo: adminEmail })
    ]);

    return json(res, 200, { ok: true, message: 'Your review was submitted to Nazi for approval.' });
  } catch (error) {
    console.error(error);
    return json(res, 500, { ok: false, error: 'We could not submit the review right now. Please try again or contact the daycare directly.' });
  }
};
