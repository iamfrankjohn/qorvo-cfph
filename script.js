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

function buildCfphArticleUrl(post) {
  // CFPH currently uses a sequential numeric content ID, but the URL
  // section still matters (for example /Event/Detail/... vs /News/Detail/...).
  // Store both `id` and `section` in data/news.json so each link is generated
  // consistently without having to paste a full URL for every post.
  const id = Number(post?.id);
  const rawSection = String(post?.section || post?.category || 'News').trim();
  const section = /^event$/i.test(rawSection) ? 'Event' : 'News';

  if (Number.isInteger(id) && id > 0) {
    return `https://cfph.onstove.com/${section}/Detail/${id}?category=0&searchText=`;
  }

  // Backward compatibility if a manually supplied URL is ever needed.
  return post?.url || 'https://cfph.onstove.com/News/';
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
        link.href = buildCfphArticleUrl(post);
        link.target = '_blank';
        link.rel = 'noopener';
        link.textContent = 'Read full update →';

        meta.append(category, date);
        item.append(meta, title, summary, link);
        postsBox.append(item);
      });
    }

    // WEB v6.9 — Server Intel is a STOVE-sourced section, so always use
    // the STOVE branded visual instead of a post/article image.
    setMedia('server-intel-media', null, '/assets/stove-brand.svg');
  } catch (error) {
    console.warn('CrossFire updates:', error);

    if (postsBox) {
      postsBox.innerHTML = `
        <article class="server-intel-post">
          <div class="server-intel-post-meta"><span>OFFICIAL NEWS</span><time>CFPH</time></div>
          <h4>CrossFire Philippines Updates</h4>
          <p>The local news file could not be loaded. Open the official CrossFire Philippines News page for the latest updates.</p>
          <a href="https://cfph.onstove.com/News/" target="_blank" rel="noopener">Open official news →</a>
        </article>`;
    }

    setMedia('server-intel-media', null, '/assets/stove-brand.svg');
  }
}

loadServerIntel();

// WEB v6.6 — preserve Facebook caption formatting
function formatFacebookCaption(value) {
  let text = String(value || '')
    .replace(/\\r\\n/g, '\n')
    .replace(/\\n/g, '\n')
    .replace(/\r\n?/g, '\n')
    .trim();

  // Remove a small piece of Facebook UI text that can occasionally be
  // included by the public-page checker after the real caption.
  text = text.replace(/\s*[·•]\s*\d*\s*Send message\s*$/i, '').trim();

  // If Facebook already supplied line breaks, keep them and only tidy
  // excessive empty lines.
  if (text.includes('\n')) {
    return text
      .split('\n')
      .map(line => line.trimEnd())
      .join('\n')
      .replace(/\n{3,}/g, '\n\n')
      .trim();
  }

  // Some public Facebook renders flatten the caption before our checker
  // receives it. Restore QORVO's common stacked slogan and separate the
  // hashtag block so the website still resembles the original post.
  text = text
    .replace(/\s+(?=LOCK IN\.)/i, '\n\n')
    .replace(/\s+(?=QORVO UP\.)/i, '\n')
    .replace(/\s+(?=DOMINATE\.)/i, '\n')
    .replace(/\s+(?=#[\p{L}\p{N}_])/u, '\n\n');

  return text.trim();
}

// WEB v6.7 — Latest public QORVO Facebook post with automatic refresh
const LATEST_FACEBOOK_REFRESH_MS = 60 * 1000;
let latestFacebookLoading = false;
let latestFacebookHasLoaded = false;

async function loadLatestFacebookPost() {
  const card = document.getElementById('latest-facebook-card');
  const image = document.getElementById('latest-facebook-image');
  const author = document.getElementById('latest-facebook-author');
  const age = document.getElementById('latest-facebook-age');
  const status = document.getElementById('latest-facebook-status');
  const caption = document.getElementById('latest-facebook-caption');
  const link = document.getElementById('latest-facebook-link');
  if (!card || !image || !author || !age || !status || !caption || !link) return;
  if (latestFacebookLoading) return;

  const fallbackUrl = 'https://www.facebook.com/qorvo.cfph';
  const fallbackImage = new URL('/assets/qorvo-cover.jpg', window.location.href).href;

  latestFacebookLoading = true;

  try {
    const response = await fetch(`/api/facebook-latest?t=${Date.now()}`, {
      cache: 'no-store'
    });
    const payload = await response.json();
    const post = payload?.post;

    if (!response.ok || !payload?.ok || !post?.url) {
      throw new Error(payload?.error || payload?.warning || 'Latest Facebook post unavailable');
    }

    author.textContent = post.author || 'QORVO CFPH';
    age.textContent = post.age ? `Posted ${post.age} ago` : 'Latest public post';
    status.textContent = payload.stale ? 'Cached Post' : 'Latest Post';
    caption.textContent = formatFacebookCaption(post.caption) || 'Open the latest QORVO CFPH post on Facebook.';
    link.href = post.url;
    link.textContent = 'View post →';

    if (post.image) {
      const nextImage = post.image;
      if (image.src !== nextImage) {
        image.alt = post.imageAlt || 'Latest QORVO CFPH Facebook post image';
        image.src = nextImage;
      }
      image.addEventListener('error', () => {
        image.src = fallbackImage;
        image.alt = 'QORVO CFPH';
      }, { once: true });
    }

    card.classList.add('facebook-latest-ready');
    latestFacebookHasLoaded = true;
  } catch (error) {
    console.warn('Latest Facebook post:', error);

    // On the first failed request, show the normal fallback. After a post has
    // already loaded successfully, keep it visible during temporary checker
    // failures and retry automatically on the next interval.
    if (!latestFacebookHasLoaded) {
      author.textContent = 'QORVO CFPH';
      age.textContent = 'Official Facebook Page';
      status.textContent = 'Facebook';
      caption.textContent = 'The latest post could not be loaded right now. Retrying automatically…';
      link.href = fallbackUrl;
      link.textContent = 'Open Facebook Page →';
      image.src = fallbackImage;
    }
  } finally {
    latestFacebookLoading = false;
  }
}

loadLatestFacebookPost();

// Keep the card live without requiring a full website refresh.
// The self-hosted checker still controls its own server-side post cache, so
// this lightweight browser poll does not launch Chromium every minute.
setInterval(() => {
  if (!document.hidden) {
    loadLatestFacebookPost();
  }
}, LATEST_FACEBOOK_REFRESH_MS);

// Refresh immediately when the visitor returns to the tab.
document.addEventListener('visibilitychange', () => {
  if (!document.hidden) {
    loadLatestFacebookPost();
  }
});

// WEB v5.16 — live QORVO Facebook Reels with in-site player
async function loadQorvoReels() {
  const panel = document.getElementById('qorvo-reels-panel');
  const stage = document.getElementById('reels-stage');
  const dots = document.getElementById('reels-dots');
  const prev = document.getElementById('reels-prev');
  const next = document.getElementById('reels-next');
  const captionTitle = document.getElementById('reels-caption-title');
  const modal = document.getElementById('reel-player-modal');
  const modalVideo = document.getElementById('reel-player-video');
  const modalClose = document.getElementById('reel-player-close');
  const modalFacebook = document.getElementById('reel-player-facebook');
  const modalStatus = document.getElementById('reel-player-status');
  const modalTitle = document.getElementById('reel-player-title');
  if (!panel || !stage || !dots || !prev || !next) return;

  const reelsPage = 'https://www.facebook.com/qorvo.cfph/reels';
  let reels = [];
  let active = 0;
  let timer = null;
  let modalOpen = false;

  const reelLabel = index => index === 0 ? 'LATEST REEL' : `REEL ${index + 1}`;
  const reelIdFrom = reel => String(reel?.id || (reel?.url?.match(/\/reel\/([0-9]+)/i) || [])[1] || '');

  function restartTimer() {
    window.clearInterval(timer);
    if (!modalOpen && reels.length > 1) {
      timer = window.setInterval(() => {
        active = (active + 1) % reels.length;
        render();
      }, 6000);
    }
  }

  function positionFor(index) {
    const count = reels.length;
    if (index === active) return 'active';
    if (index === (active - 1 + count) % count) return 'left';
    if (index === (active + 1) % count) return 'right';
    return 'hidden';
  }

  function closePlayer() {
    if (!modal) return;
    modalOpen = false;
    modal.classList.remove('is-open');
    modal.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('reel-player-open');
    if (modalVideo) {
      modalVideo.pause();
      modalVideo.removeAttribute('src');
      modalVideo.load();
    }
    if (modalStatus) {
      modalStatus.hidden = false;
      modalStatus.innerHTML = '<span class="reel-player-spinner"></span><strong>PREPARING REEL</strong><small>Loading video + audio...</small>';
    }
    restartTimer();
  }

  function openPlayer(reel, index) {
    const id = reelIdFrom(reel);
    if (!modal || !modalVideo || !id) {
      window.open(reel.url || reelsPage, '_blank', 'noopener');
      return;
    }

    modalOpen = true;
    window.clearInterval(timer);
    modal.classList.add('is-open');
    modal.setAttribute('aria-hidden', 'false');
    document.body.classList.add('reel-player-open');
    if (modalTitle) modalTitle.textContent = `QORVO // ${reelLabel(index)}`;
    if (modalFacebook) modalFacebook.href = reel.url || reelsPage;
    if (modalStatus) {
      modalStatus.hidden = false;
      modalStatus.innerHTML = '<span class="reel-player-spinner"></span><strong>PREPARING REEL</strong><small>First play may take a few seconds</small>';
    }

    modalVideo.poster = reel.thumbnail || '/assets/qorvo-cover.jpg';
    modalVideo.src = `/api/facebook-reel-video?id=${encodeURIComponent(id)}`;
    modalVideo.load();

    const playAttempt = modalVideo.play();
    if (playAttempt?.catch) playAttempt.catch(() => {});
    window.setTimeout(() => modalClose?.focus(), 50);
  }

  modalClose?.addEventListener('click', closePlayer);
  modal?.addEventListener('click', event => {
    if (event.target === modal) closePlayer();
  });
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && modalOpen) closePlayer();
  });
  modalVideo?.addEventListener('loadeddata', () => {
    if (modalStatus) modalStatus.hidden = true;
  });
  modalVideo?.addEventListener('canplay', () => {
    if (modalStatus) modalStatus.hidden = true;
  });
  modalVideo?.addEventListener('error', () => {
    if (!modalStatus) return;
    modalStatus.hidden = false;
    modalStatus.innerHTML = '<strong>REEL UNAVAILABLE</strong><small>Use “View on Facebook” below to watch this Reel.</small>';
  });

  function render() {
    stage.innerHTML = '';
    dots.innerHTML = '';

    reels.forEach((reel, index) => {
      const position = positionFor(index);
      const card = document.createElement('button');
      card.type = 'button';
      card.className = `reel-card reel-${position}`;
      card.setAttribute('aria-label', `Play QORVO ${reelLabel(index)}`);
      card.addEventListener('click', () => {
        active = index;
        render();
        openPlayer(reel, index);
      });

      const img = document.createElement('img');
      img.src = reel.thumbnail || '/assets/qorvo-cover.jpg';
      img.alt = `QORVO CFPH ${reelLabel(index)} thumbnail`;
      img.loading = index === active ? 'eager' : 'lazy';
      img.addEventListener('error', () => { img.src = '/assets/qorvo-cover.jpg'; }, { once: true });

      const shade = document.createElement('span');
      shade.className = 'reel-card-shade';
      const play = document.createElement('span');
      play.className = 'reel-play';
      play.textContent = '▶';
      const info = document.createElement('span');
      info.className = 'reel-card-info';
      const metric = reel.metric ? `<small>${reel.metric}</small>` : '';
      info.innerHTML = `<strong>${reelLabel(index)}</strong>${metric}`;

      card.append(img, shade, play, info);
      stage.append(card);

      const dot = document.createElement('button');
      dot.type = 'button';
      dot.className = `reels-dot${index === active ? ' is-active' : ''}`;
      dot.setAttribute('aria-label', `Show reel ${index + 1}`);
      dot.addEventListener('click', () => {
        active = index;
        render();
        restartTimer();
      });
      dots.append(dot);
    });

    if (captionTitle) captionTitle.textContent = `${reelLabel(active)} // PLAY ON QORVO`;
  }

  function move(direction) {
    if (!reels.length) return;
    active = (active + direction + reels.length) % reels.length;
    render();
    restartTimer();
  }

  prev.addEventListener('click', () => move(-1));
  next.addEventListener('click', () => move(1));
  panel.addEventListener('mouseenter', () => window.clearInterval(timer));
  panel.addEventListener('mouseleave', restartTimer);
  panel.addEventListener('focusin', () => window.clearInterval(timer));
  panel.addEventListener('focusout', restartTimer);

  let touchStartX = null;
  stage.addEventListener('touchstart', event => {
    touchStartX = event.changedTouches?.[0]?.clientX ?? null;
  }, { passive: true });
  stage.addEventListener('touchend', event => {
    if (touchStartX === null) return;
    const endX = event.changedTouches?.[0]?.clientX ?? touchStartX;
    const delta = endX - touchStartX;
    touchStartX = null;
    if (Math.abs(delta) > 45) move(delta > 0 ? -1 : 1);
  }, { passive: true });

  try {
    const response = await fetch('/api/facebook-reels', { cache: 'no-store' });
    const payload = await response.json();
    if (!response.ok || !payload?.ok || !Array.isArray(payload.reels) || !payload.reels.length) {
      throw new Error(payload?.warning || payload?.error || 'Reels unavailable');
    }

    reels = payload.reels.filter(reel => reel?.url && reelIdFrom(reel)).slice(0, 5);
    if (!reels.length) throw new Error('No valid Reels');
    panel.classList.add('reels-ready');
    render();
    restartTimer();
  } catch (error) {
    console.warn('QORVO Reels:', error);
    stage.innerHTML = `
      <a class="reels-fallback" href="${reelsPage}" target="_blank" rel="noopener">
        <img src="/assets/qorvo-cover.jpg" alt="QORVO CFPH">
        <span class="reel-card-shade"></span>
        <span class="reel-play">▶</span>
        <span class="reel-card-info"><strong>QORVO REELS</strong><small>OPEN FACEBOOK</small></span>
      </a>`;
    dots.innerHTML = '';
    prev.disabled = true;
    next.disabled = true;
    if (captionTitle) captionTitle.textContent = 'QORVO CFPH // FACEBOOK REELS';
  }
}

loadQorvoReels();


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

// QORVO featured Facebook post
async function loadFeaturedQorvoPost() {
  const iframe = document.getElementById('featured-facebook-post');
  const placeholder = document.getElementById('pinned-post-placeholder');
  const tag = document.getElementById('pinned-post-tag');
  const title = document.getElementById('pinned-post-title');
  const link = document.getElementById('pinned-post-link');
  const time = document.getElementById('pinned-post-time');
  if (!iframe || !placeholder || !tag || !title || !link) return;

  try {
    const response = await fetch('/api/featured-post', { cache: 'no-store' });
    const payload = await response.json();
    const post = payload && payload.post ? payload.post : null;

    if (!response.ok || !post || !post.enabled || !post.url) {
      iframe.style.display = 'none';
      placeholder.style.display = 'flex';

      const placeholderText = placeholder.querySelector('p');
      if (placeholderText) {
        placeholderText.textContent = 'No featured post selected right now. Follow QORVO CFPH for the latest updates.';
      }

      title.textContent = 'No Featured Post Right Now';
      if (time) time.textContent = 'QORVO Updates';
      link.href = 'https://www.facebook.com/qorvo.cfph';
      link.textContent = 'Open Facebook Page →';
      return;
    }

    tag.textContent = post.label || 'PINNED FROM QORVO';
    title.textContent = post.title || 'Featured QORVO Post';
    link.href = post.url;
    time.textContent = 'Pinned Pick';

    const wrap = document.getElementById('pinned-post-wrap');

    const renderFeaturedFacebookPost = () => {
      if (!wrap) return;

      // Facebook's embedded-post iframe is not truly responsive when its URL
      // is generated with a fixed width. Build the plugin URL using the
      // CURRENT card width so mobile devices do not get a 500px-wide post
      // cropped inside a narrower card.
      const availableWidth = Math.floor(wrap.getBoundingClientRect().width);
      const pluginWidth = Math.max(350, Math.min(500, availableWidth || 500));

      const params = new URLSearchParams({
        href: post.url,
        show_text: 'true',
        width: String(pluginWidth)
      });

      const nextSrc = `https://www.facebook.com/plugins/post.php?${params.toString()}`;
      iframe.width = pluginWidth;
      iframe.dataset.pluginWidth = String(pluginWidth);
      iframe.style.width = '100%';
      iframe.style.maxWidth = `${pluginWidth}px`;
      iframe.style.margin = '0 auto';

      if (iframe.src !== nextSrc) iframe.src = nextSrc;
    };

    renderFeaturedFacebookPost();
    iframe.style.display = 'block';
    placeholder.style.display = 'none';

    // Rebuild only when the card crosses into a meaningfully different width.
    // This keeps rotation/resizing responsive without constantly reloading FB.
    if ('ResizeObserver' in window && wrap) {
      let resizeTimer;
      const observer = new ResizeObserver(() => {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(() => {
          const widthNow = Math.floor(wrap.getBoundingClientRect().width);
          const target = Math.max(350, Math.min(500, widthNow || 500));
          const current = Number(iframe.dataset.pluginWidth || 0);
          if (Math.abs(target - current) >= 8) renderFeaturedFacebookPost();
        }, 180);
      });
      observer.observe(wrap);
    }
  } catch (error) {
    console.error('Featured post load failed:', error);
    iframe.style.display = 'none';
    placeholder.style.display = 'flex';

    const placeholderText = placeholder.querySelector('p');
    if (placeholderText) {
      placeholderText.textContent = 'Featured post is temporarily unavailable. Visit QORVO CFPH on Facebook for the latest updates.';
    }

    title.textContent = 'QORVO Updates';
    if (time) time.textContent = 'Facebook';
    link.href = 'https://www.facebook.com/qorvo.cfph';
    link.textContent = 'Open Facebook Page →';
  }
}

loadFeaturedQorvoPost();

// Hidden admin shortcut: click the footer QORVO brand 3 times quickly.
(() => {
  const trigger = document.getElementById('qorvo-admin-trigger');
  if (!trigger) return;
  let clicks = 0;
  let timer = null;

  trigger.addEventListener('click', (event) => {
    // Never follow the footer brand link. A normal 1x or 2x click should do nothing.
    event.preventDefault();

    clicks += 1;
    clearTimeout(timer);

    if (clicks >= 3) {
      clicks = 0;
      window.location.href = '/qorvo-control';
      return;
    }

    timer = setTimeout(() => {
      clicks = 0;
    }, 900);
  });
})();

// Dynamic QORVO Events & Live Schedule + automatic TikTok LIVE detection
(() => {
  const list = document.getElementById('event-list');
  if (!list) return;
  const esc = (v='') => String(v).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c]));
  const dateParts = (date) => {
    if (!date) return {day:'TBA', month:'NEXT'};
    const d = new Date(`${date}T00:00:00`);
    if (Number.isNaN(d.getTime())) return {day:'TBA', month:'NEXT'};
    return {day:String(d.getDate()).padStart(2,'0'), month:d.toLocaleString('en-US',{month:'short'}).toUpperCase()};
  };
  const active = (e) => {
    if (e.enabled === false) return false;
    if (e.alwaysOpen) return true;
    if (!e.date) return true;
    const today = new Date(); today.setHours(0,0,0,0);
    const d = new Date(`${e.date}T23:59:59`);
    return !Number.isNaN(d.getTime()) && d >= today;
  };
  const sortEvents = (a,b) => {
    if (a.alwaysOpen !== b.alwaysOpen) return a.alwaysOpen ? 1 : -1;
    return String(a.date||'9999-12-31').localeCompare(String(b.date||'9999-12-31'));
  };
  function maybeShowLiveModal(liveMembers) {
    if (!Array.isArray(liveMembers) || !liveMembers.length) return;

    // Show at most once per browser session. If nobody is LIVE when the
    // visitor first arrives, the modal can still appear later if a refresh
    // detects a LIVE member.
    try {
      if (sessionStorage.getItem('qorvoLiveModalShown') === '1') return;
      sessionStorage.setItem('qorvoLiveModalShown', '1');
    } catch (_) {
      // If sessionStorage is unavailable, still show the modal once for this page load.
      if (window.__qorvoLiveModalShown) return;
      window.__qorvoLiveModalShown = true;
    }

    const existing = document.getElementById('qorvo-live-modal');
    if (existing) existing.remove();

    const overlay = document.createElement('div');
    overlay.id = 'qorvo-live-modal';
    overlay.className = 'qorvo-live-modal';
    overlay.setAttribute('role', 'dialog');
    overlay.setAttribute('aria-modal', 'true');
    overlay.setAttribute('aria-labelledby', 'qorvo-live-modal-title');

    const panel = document.createElement('div');
    panel.className = 'qorvo-live-modal-panel';

    const close = document.createElement('button');
    close.type = 'button';
    close.className = 'qorvo-live-modal-close';
    close.setAttribute('aria-label', 'Close LIVE notification');
    close.textContent = '×';

    const modalHead = document.createElement('div');
    modalHead.className = 'qorvo-live-modal-head';

    const headingCopy = document.createElement('div');
    headingCopy.className = 'qorvo-live-modal-heading-copy';

    const eyebrow = document.createElement('div');
    eyebrow.className = 'qorvo-live-modal-eyebrow';
    eyebrow.innerHTML = '<span aria-hidden="true"></span> LIVE ALERT';

    const title = document.createElement('h2');
    title.id = 'qorvo-live-modal-title';
    title.innerHTML = liveMembers.length === 1
      ? 'A QORVO MEMBER <em>IS LIVE NOW</em>'
      : 'QORVO MEMBERS <em>ARE LIVE NOW</em>';

    const subtitle = document.createElement('p');
    subtitle.className = 'qorvo-live-modal-subtitle';
    subtitle.textContent = liveMembers.length === 1
      ? 'One of the squad is streaming now. Drop in and show some support.'
      : 'The squad is live. Pick a stream and jump into the action.';

    headingCopy.append(eyebrow, title, subtitle);

    const signal = document.createElement('div');
    signal.className = 'qorvo-live-modal-signal';
    signal.setAttribute('aria-hidden', 'true');
    signal.innerHTML = '<span class="qorvo-live-modal-signal-core">▶</span>';

    modalHead.append(headingCopy, signal);

    const listEl = document.createElement('div');
    listEl.className = 'qorvo-live-modal-list';

    liveMembers.forEach(member => {
      const row = document.createElement('div');
      row.className = 'qorvo-live-modal-member';

      const memberProfile = document.createElement('div');
      memberProfile.className = 'qorvo-live-modal-profile';

      const avatar = document.createElement('span');
      avatar.className = 'qorvo-live-modal-avatar';
      const displayName = member.name || member.username || 'QORVO Member';
      avatar.textContent = String(displayName).trim().charAt(0).toUpperCase() || 'Q';

      const identity = document.createElement('div');
      identity.className = 'qorvo-live-modal-identity';

      const name = document.createElement('strong');
      name.textContent = displayName;

      const username = document.createElement('span');
      username.textContent = member.username ? `@${member.username}` : 'TikTok LIVE';

      identity.append(name, username);
      memberProfile.append(avatar, identity);

      const watch = document.createElement('a');
      watch.className = 'qorvo-live-modal-watch';
      watch.target = '_blank';
      watch.rel = 'noopener';
      watch.innerHTML = '<span>WATCH LIVE</span><svg class="qorvo-live-external-icon" aria-hidden="true" viewBox="0 0 24 24" focusable="false"><path d="M14 5h5v5"/><path d="M19 5l-9 9"/><path d="M18 13v5a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5"/></svg>';

      let liveUrl = '';
      try {
        const parsed = new URL(String(member.url || ''));
        if (parsed.protocol === 'https:' && /(^|\.)tiktok\.com$/i.test(parsed.hostname)) {
          liveUrl = parsed.href;
        }
      } catch (_) {}
      if (!liveUrl && member.username) {
        liveUrl = `https://www.tiktok.com/@${encodeURIComponent(member.username)}/live`;
      }
      watch.href = liveUrl || 'https://www.tiktok.com/';

      row.append(memberProfile, watch);
      listEl.append(row);
    });

    const later = document.createElement('button');
    later.type = 'button';
    later.className = 'qorvo-live-modal-later';
    later.textContent = 'MAYBE LATER';

    panel.append(close, modalHead, listEl, later);
    overlay.append(panel);
    document.body.append(overlay);

    const dismiss = () => {
      overlay.classList.add('is-closing');
      window.setTimeout(() => overlay.remove(), 180);
    };

    close.addEventListener('click', dismiss);
    later.addEventListener('click', dismiss);
    overlay.addEventListener('click', event => {
      if (event.target === overlay) dismiss();
    });

    const onKeydown = event => {
      if (event.key === 'Escape') {
        dismiss();
        document.removeEventListener('keydown', onKeydown);
      }
    };
    document.addEventListener('keydown', onKeydown);

    requestAnimationFrame(() => overlay.classList.add('is-open'));
    close.focus({ preventScroll: true });
  }

  function render(events, live) {
    const rows = [];
    (live || []).forEach(x => {
      const viewers = x.viewers > 0 ? `${x.viewers.toLocaleString()} VIEWERS` : 'TIKTOK LIVE';
      rows.push(`<div class="event-row event-row-live"><div class="event-live-status"><span class="live-status-pill"><i aria-hidden="true"></i>LIVE</span><span class="live-now">NOW</span><span class="live-viewers">${esc(viewers)}</span></div><div class="event-info event-live-info"><span>TIKTOK LIVE</span><h3>${esc(x.name || x.username)} IS LIVE</h3></div><div class="event-type event-live-user">@${esc(x.username)}</div><a class="event-live-link" href="${esc(x.url)}" target="_blank" rel="noopener" aria-label="Watch ${esc(x.name || x.username)} live on TikTok">↗</a></div>`);
    });
    (events || []).forEach(e => {
      const dp=e.alwaysOpen?{day:'OPEN',month:'24/7'}:dateParts(e.date);
      const link=e.url?`<a href="${esc(e.url)}" target="_blank" rel="noopener" aria-label="Open ${esc(e.title)}">↗</a>`:'<span></span>';
      rows.push(`<div class="event-row"><div class="event-date"><b class="event-day">${esc(dp.day)}</b><span class="event-month">${esc(dp.month)}</span>${e.time?`<span class="event-time">${esc(e.time)}</span>`:''}</div><div class="event-info"><span>${esc(e.category||'COMMUNITY')}</span><h3>${esc(e.title)}</h3></div><div class="event-type">${esc(e.badge||'CFPH')}</div>${link}</div>`);
    });
    if (!rows.length) {
      list.innerHTML='<div class="event-empty"><strong>NO UPCOMING DEPLOYMENTS</strong><span>No QORVO events are currently scheduled and no monitored member is live right now.</span></div>';
      return;
    }
    list.innerHTML=rows.join('');
  }
  async function refreshSchedule(){
    try{
      const [eventsRes, liveRes] = await Promise.all([
        fetch('/api/events',{cache:'no-store'}),
        fetch('/api/tiktok-live',{cache:'no-store'})
      ]);
      const eventsData = await eventsRes.json();
      const liveData = await liveRes.json();
      const events=(Array.isArray(eventsData.events)?eventsData.events:[]).filter(active).sort(sortEvents);
      const live=Array.isArray(liveData.live)?liveData.live:[];
      render(events, live);
      maybeShowLiveModal(live);
    }catch(error){ console.warn('Schedule refresh failed:',error); }
  }
  refreshSchedule();
  window.setInterval(refreshSchedule, 120000);
})();;

// WEB v4.1 — QORVO Rewards
function rewardEsc(v=''){return String(v).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c]));}
function rewardActive(g){
  if(!g || g.enabled===false || g.status==='draft' || g.status==='ended') return false;
  const now=new Date();
  if(g.startDate && now < new Date(g.startDate+'T00:00:00')) return false;
  if(g.endDate && now > new Date(g.endDate+'T23:59:59')) return false;
  return true;
}
function rewardDate(v){if(!v)return '';return new Date(v+'T00:00:00').toLocaleDateString(undefined,{year:'numeric',month:'short',day:'numeric'});}
async function loadGiveaways(){
  const box=document.getElementById('giveaway-state'); if(!box)return;
  try{
    const r=await fetch('/api/giveaways',{cache:'no-store'}); if(!r.ok)throw new Error();
    const d=await r.json(), list=(Array.isArray(d.giveaways)?d.giveaways:[]).filter(rewardActive);
    if(!list.length){
      box.innerHTML=`<div class="reward-card reward-empty"><small>SUPPLY DROP</small><h3>NO ACTIVE GIVEAWAY</h3><p>No supply drop is active right now. Follow QORVO CFPH so you don't miss the next drop.</p><div class="reward-actions"><a class="btn primary" href="https://www.facebook.com/qorvo.cfph" target="_blank" rel="noopener">Facebook ↗</a></div></div>`;
      return;
    }
    box.innerHTML=list.map(g=>{
      const meta=[];
      if(g.prize)meta.push(`<span>${rewardEsc(g.prize)}</span>`);
      if(g.winners)meta.push(`<span>${rewardEsc(g.winners)} winner${String(g.winners)==='1'?'':'s'}</span>`);
      if(g.endDate)meta.push(`<span>Ends ${rewardEsc(rewardDate(g.endDate))}</span>`);
      return `<article class="reward-card reward-live"><small>GIVEAWAY LIVE</small><h3>${rewardEsc(g.title||'QORVO CFPH GIVEAWAY')}</h3>${g.description?`<p>${rewardEsc(g.description)}</p>`:''}${meta.length?`<div class="reward-meta">${meta.join('')}</div>`:''}${g.url?`<div class="reward-actions"><a class="btn primary" href="${rewardEsc(g.url)}" target="_blank" rel="noopener">View Giveaway ↗</a></div>`:''}</article>`;
    }).join('');
  }catch{box.innerHTML='<div class="reward-card reward-empty"><small>SUPPLY DROP</small><h3>REWARDS TEMPORARILY UNAVAILABLE</h3><p>Please check back shortly.</p></div>';}
}
document.addEventListener('DOMContentLoaded',loadGiveaways);

// WEB v6.12 — QORVO Command photo lightbox
(()=>{const items=[['/assets/command/qorvo-command-group.webp','QORVO CFPH Clan Master and Officers group portrait','QORVO CFPH // CLAN MASTER & OFFICERS'],['/assets/command/iox-q-clan-master.webp','IOX.Q — QORVO Clan Master','IOX.Q // CLAN MASTER'],['/assets/command/t3r-q-officer.webp','T3r.Q — QORVO Officer','T3r.Q // OFFICER'],['/assets/command/daichi-q-officer.webp','Daichi.Q — QORVO Officer','DAICHI.Q // OFFICER'],['/assets/command/haeqt-officer.webp','HaeQt. — QORVO Officer','HAEQT. // OFFICER'],['/assets/command/reed-q-officer.webp','Reed.Q — QORVO Officer','REED.Q // OFFICER'],['/assets/command/jvra-q-officer.webp','JVRA.Q — QORVO Officer','JVRA.Q // OFFICER'],['/assets/command/neonqt-officer.webp','NeonQt. — QORVO Officer','NEONQT. // OFFICER'],['/assets/command/pynouc-q-officer.webp','Pynouc.Q — QORVO Officer','PYNOUC.Q // OFFICER'],['/assets/command/grim-q-officer.webp','Grim.Q — QORVO Officer','GRIM.Q // OFFICER']];const m=document.getElementById('command-lightbox'),im=document.getElementById('command-lightbox-image'),cap=document.getElementById('command-lightbox-caption'),cl=document.getElementById('command-lightbox-close'),pr=document.getElementById('command-lightbox-prev'),nx=document.getElementById('command-lightbox-next');if(!m||!im)return;let a=0;const r=()=>{im.src=items[a][0];im.alt=items[a][1];cap.textContent=items[a][2]},o=i=>{a=Number(i)||0;r();m.classList.add('is-open');m.setAttribute('aria-hidden','false');document.body.classList.add('command-lightbox-open')},s=()=>{m.classList.remove('is-open');m.setAttribute('aria-hidden','true');document.body.classList.remove('command-lightbox-open')},mv=d=>{a=(a+d+items.length)%items.length;r()};document.querySelectorAll('[data-command-index]').forEach(b=>b.addEventListener('click',()=>o(b.dataset.commandIndex)));cl.addEventListener('click',s);pr.addEventListener('click',()=>mv(-1));nx.addEventListener('click',()=>mv(1));m.addEventListener('click',e=>{if(e.target===m)s()});document.addEventListener('keydown',e=>{if(!m.classList.contains('is-open'))return;if(e.key==='Escape')s();if(e.key==='ArrowLeft')mv(-1);if(e.key==='ArrowRight')mv(1)})})();


// WEB v6.14 — one-line QORVO Command carousel
(() => {
  const track = document.getElementById('command-carousel');
  const prev = document.getElementById('command-carousel-prev');
  const next = document.getElementById('command-carousel-next');
  const dotsWrap = document.getElementById('command-carousel-dots');
  if (!track || !prev || !next || !dotsWrap) return;

  const cards = [...track.querySelectorAll('.command-card')];
  if (!cards.length) return;

  const getStep = () => {
    const card = cards[0];
    const styles = getComputedStyle(track);
    const gap = parseFloat(styles.columnGap || styles.gap || 0) || 0;
    return card.getBoundingClientRect().width + gap;
  };

  const visibleCount = () => Math.max(1, Math.floor((track.clientWidth + 1) / getStep()));
  const pageCount = () => Math.max(1, cards.length - visibleCount() + 1);

  const rebuildDots = () => {
    const count = pageCount();
    dotsWrap.innerHTML = '';
    for (let i = 0; i < count; i++) {
      const dot = document.createElement('button');
      dot.className = 'command-carousel-dot';
      dot.type = 'button';
      dot.tabIndex = -1;
      dot.addEventListener('click', () => {
        track.scrollTo({ left: i * getStep(), behavior: 'smooth' });
      });
      dotsWrap.appendChild(dot);
    }
    updateDots();
  };

  const updateDots = () => {
    const dots = [...dotsWrap.children];
    if (!dots.length) return;
    const index = Math.max(0, Math.min(dots.length - 1, Math.round(track.scrollLeft / getStep())));
    dots.forEach((dot, i) => dot.classList.toggle('is-active', i === index));
  };

  prev.addEventListener('click', () => {
    track.scrollBy({ left: -getStep(), behavior: 'smooth' });
  });
  next.addEventListener('click', () => {
    track.scrollBy({ left: getStep(), behavior: 'smooth' });
  });
  track.addEventListener('scroll', () => requestAnimationFrame(updateDots), { passive:true });
  track.addEventListener('keydown', event => {
    if (event.key === 'ArrowLeft') {
      event.preventDefault();
      track.scrollBy({ left: -getStep(), behavior:'smooth' });
    }
    if (event.key === 'ArrowRight') {
      event.preventDefault();
      track.scrollBy({ left: getStep(), behavior:'smooth' });
    }
  });

  let resizeTimer;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(rebuildDots, 120);
  });

  rebuildDots();
})();



// WEB v6.28 — Reel-style one-click officer image viewer
(() => {
  const modal = document.getElementById('officer-photo-modal');
  const modalImage = document.getElementById('officer-photo-modal-image');
  const modalClose = modal?.querySelector('.officer-photo-modal-close');
  const modalTitle = document.getElementById('officer-viewer-title');
  const cards = [...document.querySelectorAll('.command-officer-view[data-command-view-src]')];

  if (!modal || !modalImage || !modalClose || !cards.length) return;

  let lastTrigger = null;

  const openOfficerImage = card => {
    lastTrigger = card;
    const name = card.dataset.commandViewLabel || 'QORVO OFFICER';
    modalImage.src = card.dataset.commandViewSrc;
    modalImage.alt = `${name} officer image`;
    if (modalTitle) modalTitle.textContent = `QORVO // ${name.toUpperCase()}`;
    modal.classList.add('is-open');
    modal.setAttribute('aria-hidden', 'false');
    document.body.classList.add('officer-photo-modal-open');
    modalClose.focus({preventScroll:true});
  };

  const closeOfficerImage = () => {
    if (!modal.classList.contains('is-open')) return;
    modal.classList.remove('is-open');
    modal.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('officer-photo-modal-open');
    modalImage.removeAttribute('src');
    if (modalTitle) modalTitle.textContent = 'QORVO // OFFICER VIEWER';
    lastTrigger?.focus({preventScroll:true});
  };

  cards.forEach(card => {
    card.addEventListener('click', () => openOfficerImage(card));
  });

  modalClose.addEventListener('click', closeOfficerImage);

  modal.addEventListener('click', event => {
    if (event.target === modal) closeOfficerImage();
  });

  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && modal.classList.contains('is-open')) {
      closeOfficerImage();
    }
  });
})();


// WEB v6.34 — Reel-style manual event modal with external arrows and adjacent-card peek.
(() => {
  const modal = document.getElementById('event-opening-modal');
  const close = modal?.querySelector('.site-opening-modal-close');
  const viewport = document.getElementById('event-opening-modal-viewport');
  const track = document.getElementById('event-opening-modal-track');
  const prev = document.getElementById('event-opening-modal-prev');
  const next = document.getElementById('event-opening-modal-next');
  const dots = document.getElementById('event-opening-modal-dots');
  const count = document.getElementById('event-opening-modal-count');
  const action = document.getElementById('event-opening-modal-action');
  const cta = document.getElementById('event-opening-modal-cta');

  if (!modal || !close || !viewport || !track || !prev || !next || !dots || !count) return;

  let images = [];
  let index = 0;
  let timer = null;
  let touchStartX = null;

  const imageUrl = item => {
    const url = item.imageUrl || `/${item.imagePath}`;
    return `${url}${url.includes('?') ? '&' : '?'}v=${Date.now()}`;
  };

  const updatePosition = () => {
    const slides = [...track.children];
    if (!slides.length) return;

    if (images.length <= 1) {
      track.style.transform = 'translateX(0)';
      prev.hidden = true;
      next.hidden = true;
      count.textContent = '';
    } else {
      const first = slides[0];
      const gap = parseFloat(getComputedStyle(track).gap || 0) || 0;
      const step = first.getBoundingClientRect().width + gap;
      track.style.transform = `translateX(${-index * step}px)`;
      prev.hidden = false;
      next.hidden = false;
      count.textContent = `${index + 1} / ${images.length}`;
    }

    [...dots.children].forEach((dot, dotIndex) => {
      dot.classList.toggle('is-active', dotIndex === index);
      dot.setAttribute('aria-current', dotIndex === index ? 'true' : 'false');
    });
  };

  const show = nextIndex => {
    if (!images.length) return;
    index = (nextIndex + images.length) % images.length;
    updatePosition();
  };

  const buildSlides = title => {
    track.innerHTML = '';
    dots.innerHTML = '';
    track.classList.toggle('is-single', images.length === 1);

    images.forEach((item, itemIndex) => {
      const slide = document.createElement('div');
      slide.className = 'site-opening-modal-slide';

      const img = document.createElement('img');
      img.src = imageUrl(item);
      img.alt = `${title || 'QORVO event announcement'} — image ${itemIndex + 1} of ${images.length}`;
      img.loading = itemIndex === 0 ? 'eager' : 'lazy';

      slide.appendChild(img);
      track.appendChild(slide);

      if (images.length > 1) {
        const dot = document.createElement('button');
        dot.className = 'site-opening-modal-dot';
        dot.type = 'button';
        dot.setAttribute('aria-label', `View event image ${itemIndex + 1}`);
        dot.addEventListener('click', () => show(itemIndex));
        dots.appendChild(dot);
      }
    });

    requestAnimationFrame(updatePosition);
  };

  const shut = () => {
    if (timer) clearTimeout(timer);
    modal.classList.remove('is-open');
    modal.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('site-opening-modal-open');
  };

  prev.addEventListener('click', () => show(index - 1));
  next.addEventListener('click', () => show(index + 1));
  close.addEventListener('click', shut);

  modal.addEventListener('click', event => {
    if (event.target === modal) shut();
  });

  viewport.addEventListener('touchstart', event => {
    touchStartX = event.touches[0]?.clientX ?? null;
  }, { passive:true });

  viewport.addEventListener('touchend', event => {
    if (touchStartX == null || images.length < 2) return;
    const endX = event.changedTouches[0]?.clientX ?? touchStartX;
    const delta = endX - touchStartX;
    touchStartX = null;
    if (Math.abs(delta) < 42) return;
    show(delta < 0 ? index + 1 : index - 1);
  }, { passive:true });

  document.addEventListener('keydown', event => {
    if (!modal.classList.contains('is-open')) return;
    if (event.key === 'Escape') shut();
    if (event.key === 'ArrowLeft' && images.length > 1) show(index - 1);
    if (event.key === 'ArrowRight' && images.length > 1) show(index + 1);
  });

  window.addEventListener('resize', () => {
    if (modal.classList.contains('is-open')) requestAnimationFrame(updatePosition);
  });

  (async () => {
    try {
      const response = await fetch(`/api/event-modal?t=${Date.now()}`, { cache:'no-store' });
      const payload = await response.json();
      const config = payload.modal;
      if (!response.ok || !config?.enabled) return;

      images = Array.isArray(config.images) && config.images.length
        ? config.images
        : (config.imageUrl ? [{ imagePath:config.imagePath, imageUrl:config.imageUrl }] : []);
      if (!images.length) return;

      buildSlides(config.title);

      const label = String(config.buttonLabel || '').trim();
      const url = String(config.buttonUrl || '').trim();
      if (action && cta && label && /^https?:\/\//i.test(url)) {
        cta.textContent = label;
        cta.href = url;
        action.hidden = false;
      } else if (action) {
        action.hidden = true;
      }

      // Manual navigation only. No automatic slide timer.
      timer = setTimeout(() => {
        modal.classList.add('is-open');
        modal.setAttribute('aria-hidden', 'false');
        document.body.classList.add('site-opening-modal-open');
        requestAnimationFrame(updatePosition);
      }, Math.max(0, Math.min(30000, Number(config.delaySeconds || 0) * 1000)));
    } catch {
      // Event announcement is optional.
    }
  })();
})();
