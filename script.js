const menuBtn = document.querySelector('.menu-btn');
const nav = document.querySelector('.nav');

menuBtn?.addEventListener('click', () => {
  const open = nav.classList.toggle('open');
  menuBtn.setAttribute('aria-expanded', String(open));
  menuBtn.textContent = open ? '✕' : '☰';
});

document.querySelectorAll('.nav a').forEach(link => {
  link.addEventListener('click', () => {
    nav.classList.remove('open');
    menuBtn?.setAttribute('aria-expanded', 'false');
    if (menuBtn) menuBtn.textContent = '☰';
  });
});

const year = document.getElementById('year');
if (year) year.textContent = new Date().getFullYear();

const io = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      io.unobserve(entry.target);
    }
  });
}, { threshold: .12 });

document.querySelectorAll('.reveal').forEach(el => io.observe(el));

function formatDate(value) {
  if (!value) return 'Official news';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return new Intl.DateTimeFormat('en-PH', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  }).format(d);
}

function cleanText(text = '', max = 180) {
  const normalized = String(text)
    .replace(/\s+/g, ' ')
    .replace(/https?:\/\/\S+/g, '')
    .trim();

  if (!normalized) return '';
  return normalized.length > max
    ? normalized.slice(0, max - 1).trimEnd() + '…'
    : normalized;
}

function setMedia(containerId, imageUrl) {
  const box = document.getElementById(containerId);
  if (!box || !imageUrl) return;

  box.classList.add('has-image');
  const old = box.querySelector('img.dynamic-image');
  if (old) old.remove();

  const img = document.createElement('img');
  img.className = 'dynamic-image';
  img.src = imageUrl;
  img.alt = '';
  img.loading = 'lazy';
  img.referrerPolicy = 'no-referrer';
  box.prepend(img);
}

async function loadServerIntel() {
  try {
    const response = await fetch('/api/crossfire-update', { cache: 'no-store' });
    const data = await response.json();

    if (!response.ok || !data.ok) throw new Error(data.error || 'CrossFire news unavailable');

    const date = document.getElementById('server-intel-date');
    const title = document.getElementById('server-intel-title');
    const text = document.getElementById('server-intel-text');
    const link = document.getElementById('server-intel-link');

    if (date) date.textContent = formatDate(data.date);
    if (title) title.textContent = data.title || 'Latest CrossFire update';
    if (text) text.textContent = cleanText(data.summary, 175) || 'Read the latest official CrossFire Philippines update.';
    if (link && data.url) link.href = data.url;

    setMedia('server-intel-media', data.image);
  } catch (error) {
    console.warn('CrossFire update:', error);

    const date = document.getElementById('server-intel-date');
    const title = document.getElementById('server-intel-title');
    const text = document.getElementById('server-intel-text');

    if (date) date.textContent = 'Official news';
    if (title) title.textContent = 'Latest CrossFire Philippines updates';
    if (text) text.textContent =
      'Open the official CrossFire Philippines news page for the latest game notices, events and updates.';
  }
}

loadServerIntel();
