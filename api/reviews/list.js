const { supabase, json } = require('../../lib/server');

module.exports = async function handler(req, res) {
  if (req.method !== 'GET') return json(res, 405, { ok: false, error: 'Method not allowed' });
  try {
    const rows = await supabase('reviews?status=eq.approved&select=id,name,relationship,rating,review,approved_at&order=approved_at.desc');
    res.setHeader('Cache-Control', 's-maxage=60, stale-while-revalidate=300');
    return json(res, 200, { ok: true, reviews: rows || [] });
  } catch (error) {
    console.error(error);
    return json(res, 500, { ok: false, reviews: [] });
  }
};
