const menuToggle = document.querySelector('.menu-toggle');
const navLinks = document.querySelector('.nav-links');

if (menuToggle && navLinks) {
  menuToggle.addEventListener('click', () => {
    const open = navLinks.classList.toggle('open');
    menuToggle.setAttribute('aria-expanded', open ? 'true' : 'false');
  });
  navLinks.querySelectorAll('a').forEach((link) => link.addEventListener('click', () => {
    navLinks.classList.remove('open');
    menuToggle.setAttribute('aria-expanded', 'false');
  }));
}

const year = document.getElementById('year');
if (year) year.textContent = new Date().getFullYear();

async function postJson(url, payload) {
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok || data.ok === false) throw new Error(data.error || 'Something went wrong. Please try again.');
  return data;
}

function setStatus(element, message, type) {
  if (!element) return;
  element.textContent = message;
  element.className = `form-status ${type || ''}`.trim();
}

const enrollmentForm = document.getElementById('enrollmentForm');
if (enrollmentForm) {
  enrollmentForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    const button = document.getElementById('enrollmentSubmit');
    const status = document.getElementById('enrollmentStatus');
    button.disabled = true;
    button.textContent = 'Sending…';
    setStatus(status, 'Sending your inquiry…', 'pending');
    try {
      const result = await postJson('/api/enrollment', {
        name: document.getElementById('parentName').value.trim(),
        phone: document.getElementById('parentPhone').value.trim(),
        childAge: document.getElementById('childAge').value.trim(),
        startDate: document.getElementById('startDate').value,
        email: document.getElementById('parentEmail').value.trim(),
        message: document.getElementById('parentMessage').value.trim(),
        website: document.getElementById('enrollmentWebsite')?.value || ''
      });
      setStatus(status, result.message || 'Your enrollment inquiry was sent to Nazi. Please check your email for confirmation.', 'success');
      enrollmentForm.reset();
    } catch (error) {
      setStatus(status, error.message, 'error');
    } finally {
      button.disabled = false;
      button.textContent = 'Send Enrollment Inquiry';
    }
  });
}

const reviewForm = document.getElementById('reviewForm');
if (reviewForm) {
  reviewForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    const button = document.getElementById('reviewSubmit');
    const status = document.getElementById('reviewStatus');
    button.disabled = true;
    button.textContent = 'Submitting…';
    setStatus(status, 'Submitting your review…', 'pending');
    try {
      const result = await postJson('/api/reviews/submit', {
        name: document.getElementById('reviewName').value.trim(),
        email: document.getElementById('reviewEmail').value.trim(),
        relationship: document.getElementById('reviewRelationship').value,
        rating: Number(document.getElementById('reviewRating').value),
        review: document.getElementById('reviewMessage').value.trim(),
        consent: document.getElementById('reviewConsent').checked,
        website: document.getElementById('reviewWebsite')?.value || ''
      });
      setStatus(status, result.message || 'Your review was submitted to Nazi for approval. Please check your email for confirmation.', 'success');
      reviewForm.reset();
    } catch (error) {
      setStatus(status, error.message, 'error');
    } finally {
      button.disabled = false;
      button.textContent = 'Send My Feedback';
    }
  });
}

function escapeText(text) {
  const div = document.createElement('div');
  div.textContent = text ?? '';
  return div.innerHTML;
}

const approvedReviews = document.getElementById('approvedReviews');
if (approvedReviews) {
  fetch('/api/reviews/list')
    .then((response) => response.json())
    .then((data) => {
      const reviews = Array.isArray(data.reviews) ? data.reviews : [];
      if (!reviews.length) {
        approvedReviews.innerHTML = '<article class="testimonial-card"><div class="stars">★★★★★</div><p class="reviewer">Approved parent reviews will appear here.</p></article>';
        return;
      }
      approvedReviews.innerHTML = reviews.map((item) => {
        const rating = Math.max(1, Math.min(5, Number(item.rating) || 5));
        const stars = '★'.repeat(rating) + '☆'.repeat(5 - rating);
        return `<article class="testimonial-card"><div class="stars">${stars}</div><blockquote>“${escapeText(item.review)}”</blockquote><p class="reviewer">— ${escapeText(item.name)}, ${escapeText(item.relationship)}</p></article>`;
      }).join('');
    })
    .catch(() => {
      approvedReviews.innerHTML = '<article class="testimonial-card"><p class="reviewer">Reviews are temporarily unavailable. Please try again later.</p></article>';
    });
}


async function loadDaycareGallery() {
  const gallery = document.getElementById("dynamicGallery");
  if (!gallery) return;

  const SUPABASE_URL = "https://rbcnqropwclaloeaurxt.supabase.co";
  const SUPABASE_KEY = "sb_publishable_L5Gy0rYzivcSma-ob4Jy2w_UfgiGC5X";

  const client = window.supabase.createClient(
    SUPABASE_URL,
    SUPABASE_KEY
  );

  const { data, error } = await client
    .from("daycare_gallery")
    .select("image_path, caption, description, media_type")
    .eq("published", true)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Gallery loading failed:", error);
    return;
  }

  gallery.replaceChildren();

  for (const item of data || []) {
    const { data: urlData } = client.storage
      .from("daycare-media")
      .getPublicUrl(item.image_path);

    const figure = document.createElement("figure");
    const media = document.createElement(
      item.media_type === "video" ? "video" : "img"
    );

    media.src = urlData.publicUrl;

    if (item.media_type === "video") {
      media.controls = true;
      media.preload = "metadata";
    } else {
      media.alt = item.caption || "Daycare activity";
      media.loading = "lazy";
    }

    figure.appendChild(media);

    const caption = document.createElement("figcaption");
    caption.textContent = [item.caption, item.description]
      .filter(Boolean)
      .join(" — ");

    figure.appendChild(caption);
    gallery.appendChild(figure);
  }
}

if (document.getElementById("dynamicGallery")) {
  loadDaycareGallery().catch(console.error);
}
