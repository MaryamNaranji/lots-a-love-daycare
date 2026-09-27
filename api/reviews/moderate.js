const { escapeHtml, supabase } = require('../../lib/server');

async function findReview(id, token) {
  try {
    const rows = await supabase(`reviews?id=eq.${encodeURIComponent(id)}&approval_token=eq.${encodeURIComponent(token)}&select=id,name,status`);
    if (Array.isArray(rows) && rows.length === 1) return { row: rows[0], tokenField: 'approval_token', nameField: 'name' };
  } catch (error) {}

  const rows = await supabase(`reviews?id=eq.${encodeURIComponent(id)}&moderation_token=eq.${encodeURIComponent(token)}&select=id,reviewer_name,status`);
  if (Array.isArray(rows) && rows.length === 1) return { row: rows[0], tokenField: 'moderation_token', nameField: 'reviewer_name' };
  return null;
}

module.exports = async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).send('Method not allowed');
  try {
    const { id, token, action } = req.query || {};
    if (!id || !token || !['approve', 'ignore'].includes(action)) return res.status(400).send('Invalid review link.');

    const found = await findReview(id, token);
    if (!found) return res.status(404).send('This review link is invalid or has already been used.');

    const status = action === 'approve' ? 'approved' : 'ignored';
    await supabase(`reviews?id=eq.${encodeURIComponent(id)}&${found.tokenField}=eq.${encodeURIComponent(token)}`, {
      method: 'PATCH',
      headers: { Prefer: 'return=minimal' },
      body: JSON.stringify({
        status,
        [found.tokenField]: null,
        ...(status === 'approved' ? { approved_at: new Date().toISOString() } : {})
      })
    });

    const title = status === 'approved' ? 'Review approved' : 'Review ignored';
    const text = status === 'approved'
      ? 'The review is now published on the Lots A Love Daycare reviews page.'
      : 'The review was not published.';
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    return res.status(200).send(`<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${title}</title></head><body style="margin:0;background:#fff7fb;font-family:Arial,sans-serif;color:#342936"><main style="max-width:650px;margin:80px auto;background:white;padding:40px;border-radius:24px;box-shadow:0 12px 45px rgba(74,45,62,.12);text-align:center"><div style="font-size:42px">${status === 'approved' ? '♥' : '✓'}</div><h1>${escapeHtml(title)}</h1><p>${escapeHtml(text)}</p><a href="/reviews.html" style="display:inline-block;margin-top:15px;background:#e45f7a;color:#fff;text-decoration:none;padding:13px 22px;border-radius:999px">View Reviews Page</a></main></body></html>`);
  } catch (error) {
    console.error(error);
    return res.status(500).send('We could not update this review. Please try again.');
  }
};
