const { supabase, json } = require('../../lib/server');

module.exports = async function handler(req, res) {
  if (req.method !== 'GET') return json(res, 405, { ok: false, error: 'Method not allowed' });
  try {
    let rows;
    try {
      rows = await supabase('reviews?status=eq.approved&select=id,name,relationship,rating,review,approved_at&order=approved_at.desc');
    } catch (error) {
      rows = await supabase('reviews?status=eq.approved&select=id,reviewer_name,reviewer_type,rating,feedback,approved_at&order=approved_at.desc');
      rows = (rows || []).map((r) => ({
        id: r.id,
        name: r.reviewer_name,
        relationship: r.reviewer_type,
        rating: r.rating,
        review: r.feedback,
        approved_at: r.approved_at
      }));
    }
    res.setHeader('Cache-Control', 's-maxage=60, stale-while-revalidate=300');
    return json(res, 200, { ok: true, reviews: rows || [] });
  } catch (error) {
    console.error(error);
    return json(res, 500, { ok: false, reviews: [] });
  }
};
