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

function setMedia(containerId, imageUrl, fallbackUrl = '') {
  const box = document.getElementById(containerId);
  if (!box) return;

  const finalUrl = imageUrl || fallbackUrl;
  const old = box.querySelector('img.dynamic-image');
  if (old) old.remove();

  if (!finalUrl) {
    box.classList.remove('has-image');
    return;
  }

  const img = document.createElement('img');
  img.className = 'dynamic-image';
  img.src = finalUrl;
  img.alt = '';
  img.loading = 'lazy';
  img.referrerPolicy = 'no-referrer';

  img.addEventListener('load', () => {
    box.classList.add('has-image');
  });

  img.addEventListener('error', () => {
    if (fallbackUrl && img.src !== new URL(fallbackUrl, window.location.href).href) {
      img.src = fallbackUrl;
      return;
    }
    img.remove();
    box.classList.remove('has-image');
  });

  box.prepend(img);
}

async function loadServerIntel() {
  const postsBox = document.getElementById('server-intel-posts');

  try {
    const response = await fetch('/data/news.json', { cache: 'no-store' });
    const data = await response.json();

    if (!response.ok) throw new Error('CrossFire news file unavailable');

    const posts = Array.isArray(data.posts) ? data.posts.slice(0, 3) : [];
    if (!posts.length) throw new Error('No CrossFire posts configured');

    if (postsBox) {
      postsBox.innerHTML = '';

      posts.forEach((post, index) => {
        const item = document.createElement('article');
        item.className = 'server-intel-post';
        if (index === 0) item.classList.add('is-latest');

        const meta = document.createElement('div');
        meta.className = 'server-intel-post-meta';

        const category = document.createElement('span');
        category.textContent = post.category || 'NEWS';

        const date = document.createElement('time');
        date.textContent = formatDate(post.date);

        const title = document.createElement('h4');
        title.textContent = post.title || 'CrossFire Philippines update';

        const summary = document.createElement('p');
        summary.textContent = cleanText(post.summary, 125) || 'Open the official CrossFire Philippines page for full details.';

        const link = document.createElement('a');
        link.href = post.url || 'https://cfph.onstove.com/News/List';
        link.target = '_blank';
        link.rel = 'noopener';
        link.textContent = post.direct === false ? 'Open official news →' : 'Read full update →';

        meta.append(category, date);
        item.append(meta, title, summary, link);
        postsBox.append(item);
      });
    }

    const firstImage = posts.find(post => post.image)?.image || data.image;
    setMedia('server-intel-media', firstImage, '/assets/qorvo-logo.jpg');
  } catch (error) {
    console.warn('CrossFire updates:', error);

    if (postsBox) {
      postsBox.innerHTML = `
        <article class="server-intel-post">
          <div class="server-intel-post-meta"><span>OFFICIAL NEWS</span><time>CFPH</time></div>
          <h4>CrossFire Philippines Updates</h4>
          <p>The local news file could not be loaded. Open the official CrossFire Philippines News page for the latest updates.</p>
          <a href="https://cfph.onstove.com/News/List" target="_blank" rel="noopener">Open official news →</a>
        </article>`;
    }

    setMedia('server-intel-media', null, '/assets/qorvo-logo.jpg');
  }
}

loadServerIntel();


/* Responsive Facebook Page Plugin
   Facebook renders the iframe using the width supplied in its URL.
   Rebuild the iframe URL to match the actual card width. */
const facebookIframe = document.querySelector('.facebook-page-plugin');
const facebookWrap = document.querySelector('.facebook-plugin-wrap');

function loadResponsiveFacebookPlugin() {
  if (!facebookIframe || !facebookWrap) return;

  const pageUrl = facebookIframe.dataset.pageUrl || 'https://www.facebook.com/qorvo.cfph';
  const wrapWidth = Math.floor(facebookWrap.getBoundingClientRect().width);

  // Facebook Page Plugin supports a practical minimum width.
  const pluginWidth = Math.max(180, Math.min(500, wrapWidth));
  const isMobile = window.matchMedia('(max-width: 480px)').matches;
  const isTablet = window.matchMedia('(max-width: 700px)').matches;
  const pluginHeight = isMobile ? 360 : (isTablet ? 390 : 420);

  const params = new URLSearchParams({
    href: pageUrl,
    tabs: 'timeline',
    width: String(pluginWidth),
    height: String(pluginHeight),
    small_header: 'true',
    adapt_container_width: 'true',
    hide_cover: 'true',
    show_facepile: 'false'
  });

  const nextSrc = `https://www.facebook.com/plugins/page.php?${params.toString()}`;

  if (facebookIframe.src !== nextSrc) {
    facebookIframe.width = pluginWidth;
    facebookIframe.height = pluginHeight;
    facebookIframe.src = nextSrc;
  }
}

let facebookResizeTimer;
function queueFacebookResize() {
  clearTimeout(facebookResizeTimer);
  facebookResizeTimer = setTimeout(loadResponsiveFacebookPlugin, 180);
}

window.addEventListener('load', loadResponsiveFacebookPlugin);
window.addEventListener('resize', queueFacebookResize);

if ('ResizeObserver' in window && facebookWrap) {
  const fbResizeObserver = new ResizeObserver(queueFacebookResize);
  fbResizeObserver.observe(facebookWrap);
}


// QORVO Messenger widget
const messengerWidget = document.getElementById('messenger-widget');
const messengerFab = document.getElementById('messenger-fab');
const messengerCard = document.getElementById('messenger-card');
const messengerClose = document.getElementById('messenger-close');

function setMessengerWidget(open) {
  if (!messengerWidget || !messengerFab || !messengerCard) return;
  messengerWidget.classList.toggle('open', open);
  messengerFab.setAttribute('aria-expanded', String(open));
  messengerCard.setAttribute('aria-hidden', String(!open));
}

messengerFab?.addEventListener('click', () => {
  setMessengerWidget(!messengerWidget?.classList.contains('open'));
});

messengerClose?.addEventListener('click', () => {
  setMessengerWidget(false);
  messengerFab?.focus();
});

document.addEventListener('keydown', event => {
  if (event.key === 'Escape' && messengerWidget?.classList.contains('open')) {
    setMessengerWidget(false);
    messengerFab?.focus();
  }
});

document.addEventListener('click', event => {
  if (!messengerWidget?.classList.contains('open')) return;
  if (!messengerWidget.contains(event.target)) setMessengerWidget(false);
});

// QORVO FAQ auto replies
const faqChat = document.getElementById('faq-chat');
const faqOptions = document.getElementById('faq-options');
const faqReset = document.getElementById('faq-reset');

const qorvoFaqs = {
  join: {
    question: 'How do I join QORVO CFPH?',
    answer: 'Thanks for your interest in joining QORVO CFPH! 🦅🔥 Send us your IGN and tell us that you want to join. A Clan Officer will reply with the current requirements and next steps.'
  },
  scrim: {
    question: 'How can we schedule a Clan War/Scrim?',
    answer: 'To challenge or schedule a Clan War/Scrim with us, please message us with your Clan Name, Leader/Representative IGN, proposed date and time, and match format (for example, 5v5). Our officers will review your request and reply shortly.'
  },
  requirements: {
    question: 'What are the clan requirements?',
    answer: 'Clan requirements may change depending on current recruitment needs. Send us your IGN through Messenger and a Clan Officer will provide the latest requirements and application details.'
  },
  officer: {
    question: 'How do I contact a Clan Officer?',
    answer: 'Tap “Continue on Messenger” below and send your concern to the QORVO CFPH Page. Please include your IGN and a short description so the appropriate Clan Officer can assist you.'
  },
  events: {
    question: 'Where can I see giveaways and events?',
    answer: 'Our latest giveaways, events, announcements, and community updates are posted on the QORVO CFPH Facebook Page. Follow the Page so you do not miss new posts.'
  },
  report: {
    question: 'How do I report a concern?',
    answer: 'Please message the QORVO CFPH Page with your IGN, the IGN of the player involved (if applicable), a clear description of the concern, and screenshots or video evidence when available. Our team will review it.'
  }
};

function addFaqMessage(text, sender) {
  if (!faqChat) return;

  const row = document.createElement('div');
  row.className = `faq-row faq-row-${sender}`;

  if (sender === 'bot') {
    const avatar = document.createElement('img');
    avatar.src = 'assets/qorvo-mark.png';
    avatar.alt = '';
    avatar.className = 'faq-avatar';
    row.appendChild(avatar);
  }

  const bubble = document.createElement('div');
  bubble.className = `faq-bubble faq-bubble-${sender}`;
  bubble.textContent = text;
  row.appendChild(bubble);

  faqChat.appendChild(row);
  faqChat.scrollTo({ top: faqChat.scrollHeight, behavior: 'smooth' });
}

faqOptions?.addEventListener('click', event => {
  const button = event.target.closest('.faq-option');
  if (!button) return;

  const faq = qorvoFaqs[button.dataset.faq];
  if (!faq) return;

  addFaqMessage(faq.question, 'user');
  button.disabled = true;
  button.setAttribute('aria-pressed', 'true');

  window.setTimeout(() => {
    addFaqMessage(faq.answer, 'bot');
    button.disabled = false;
    button.removeAttribute('aria-pressed');
  }, 280);
});

faqReset?.addEventListener('click', () => {
  if (!faqChat) return;
  faqChat.innerHTML = '';
  addFaqMessage('Hi! 👋 Welcome to QORVO CFPH. Choose a frequently asked question below for an instant answer.', 'bot');
});
