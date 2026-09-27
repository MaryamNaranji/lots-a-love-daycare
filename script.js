const menuToggle = document.querySelector('.menu-toggle');
const navLinks = document.querySelector('.nav-links');

if (menuToggle && navLinks) {
  menuToggle.addEventListener('click', () => {
    const open = navLinks.classList.toggle('open');
    menuToggle.setAttribute('aria-expanded', open ? 'true' : 'false');
  });

  navLinks.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', () => {
      navLinks.classList.remove('open');
      menuToggle.setAttribute('aria-expanded', 'false');
    });
  });
}

const year = document.getElementById('year');
if (year) year.textContent = new Date().getFullYear();

const enrollmentForm = document.getElementById('enrollmentForm');
if (enrollmentForm) {
  enrollmentForm.addEventListener('submit', (event) => {
    event.preventDefault();
    const name = document.getElementById('parentName').value.trim();
    const phone = document.getElementById('parentPhone').value.trim();
    const age = document.getElementById('childAge').value.trim();
    const start = document.getElementById('startDate').value || 'Not specified';
    const email = document.getElementById('parentEmail').value.trim();
    const message = document.getElementById('parentMessage').value.trim();

    const subject = encodeURIComponent(`Enrollment Inquiry from ${name}`);
    const body = encodeURIComponent(
`Hello Nazi,\n\nI am interested in Lots A Love Daycare.\n\nParent/Guardian: ${name}\nPhone: ${phone}\nEmail: ${email}\nChild's age: ${age}\nDesired start date: ${start}\n\nMessage:\n${message}\n\nThank you.`
    );
    window.location.href = `mailto:nazi157ranjbar@yahoo.com?subject=${subject}&body=${body}`;
  });
}

const reviewForm = document.getElementById('reviewForm');
if (reviewForm) {
  reviewForm.addEventListener('submit', (event) => {
    event.preventDefault();
    const name = document.getElementById('reviewName').value.trim();
    const email = document.getElementById('reviewEmail').value.trim();
    const relationship = document.getElementById('reviewRelationship').value;
    const rating = document.getElementById('reviewRating').value;
    const message = document.getElementById('reviewMessage').value.trim();
    const consent = document.getElementById('reviewConsent').checked ? 'Yes' : 'No';

    const subject = encodeURIComponent(`Daycare Review from ${name}`);
    const body = encodeURIComponent(
`Hello Nazi,\n\nI would like to submit feedback for Lots A Love Daycare.\n\nName: ${name}\nEmail: ${email}\nRelationship: ${relationship}\nRating: ${rating}\nPermission to consider publishing: ${consent}\n\nReview:\n${message}\n\nThank you.`
    );
    window.location.href = `mailto:nazi157ranjbar@yahoo.com?subject=${subject}&body=${body}`;
  });
}
