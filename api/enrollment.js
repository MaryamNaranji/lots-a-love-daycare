const { escapeHtml, sendEmail, json } = require('../lib/server');

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') return json(res, 405, { ok: false, error: 'Method not allowed' });
  try {
    const body = req.body || {};
    if (body.website) return json(res, 200, { ok: true });

    const name = String(body.name || '').trim().slice(0, 120);
    const phone = String(body.phone || '').trim().slice(0, 60);
    const childAge = String(body.childAge || '').trim().slice(0, 60);
    const startDate = String(body.startDate || '').trim().slice(0, 60);
    const email = String(body.email || '').trim().slice(0, 200);
    const message = String(body.message || '').trim().slice(0, 5000);
    if (!name || !phone || !childAge || !email) return json(res, 400, { ok: false, error: 'Please complete all required enrollment fields.' });
    if (!/^\S+@\S+\.\S+$/.test(email)) return json(res, 400, { ok: false, error: 'Please enter a valid email address.' });

    const adminEmail = process.env.ADMIN_EMAIL || 'nazi157ranjbar@yahoo.com';
    const adminHtml = `
      <div style="font-family:Arial,sans-serif;line-height:1.6;color:#342936;max-width:680px;margin:auto">
        <h2 style="color:#e45f7a">New Enrollment Inquiry</h2>
        <table style="border-collapse:collapse;width:100%">
          <tr><td style="padding:8px 0"><strong>Parent/Guardian</strong></td><td>${escapeHtml(name)}</td></tr>
          <tr><td style="padding:8px 0"><strong>Phone</strong></td><td>${escapeHtml(phone)}</td></tr>
          <tr><td style="padding:8px 0"><strong>Email</strong></td><td>${escapeHtml(email)}</td></tr>
          <tr><td style="padding:8px 0"><strong>Child's Age</strong></td><td>${escapeHtml(childAge)}</td></tr>
          <tr><td style="padding:8px 0"><strong>Desired Start Date</strong></td><td>${escapeHtml(startDate || 'Not specified')}</td></tr>
        </table>
        <div style="background:#fff6f8;border-radius:14px;padding:18px;margin-top:18px"><strong>Message</strong><br>${escapeHtml(message || 'No additional message.').replace(/\n/g, '<br>')}</div>
      </div>`;
    const parentHtml = `
      <div style="font-family:Arial,sans-serif;line-height:1.6;color:#342936;max-width:620px;margin:auto">
        <h2 style="color:#e45f7a">Your enrollment inquiry was submitted</h2>
        <p>Hi ${escapeHtml(name)},</p>
        <p>Your enrollment inquiry was sent successfully to <strong>Nazi at Lots A Love Daycare</strong>.</p>
        <p>Nazi can review your information and contact you regarding availability and next steps.</p>
        <p>If you need immediate assistance, you can call <strong>703-888-9118</strong>.</p>
        <p>— Lots A Love Daycare</p>
      </div>`;

    await Promise.all([
      sendEmail({ to: adminEmail, subject: `Enrollment inquiry from ${name}`, html: adminHtml, replyTo: email }),
      sendEmail({ to: email, subject: 'Your Lots A Love Daycare enrollment inquiry was submitted', html: parentHtml, replyTo: adminEmail })
    ]);
    return json(res, 200, { ok: true, message: 'Your enrollment inquiry was sent to Nazi.' });
  } catch (error) {
    console.error(error);
    return json(res, 500, { ok: false, error: 'We could not send your inquiry right now. Please try again or call 703-888-9118.' });
  }
};
