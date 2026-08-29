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
          <a href="https://cfph.onstove.com/News/" target="_blank" rel="noopener">Open official news →</a>
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

    const eyebrow = document.createElement('div');
    eyebrow.className = 'qorvo-live-modal-eyebrow';
    eyebrow.innerHTML = '<span aria-hidden="true"></span> LIVE NOW';

    const title = document.createElement('h2');
    title.id = 'qorvo-live-modal-title';
    title.textContent = liveMembers.length === 1
      ? 'A QORVO MEMBER IS LIVE'
      : `${liveMembers.length} QORVO MEMBERS ARE LIVE`;

    const subtitle = document.createElement('p');
    subtitle.className = 'qorvo-live-modal-subtitle';
    subtitle.textContent = liveMembers.length === 1
      ? 'Jump into the stream and support the squad.'
      : 'Choose a stream and join the squad live on TikTok.';

    const listEl = document.createElement('div');
    listEl.className = 'qorvo-live-modal-list';

    liveMembers.forEach(member => {
      const row = document.createElement('div');
      row.className = 'qorvo-live-modal-member';

      const identity = document.createElement('div');
      identity.className = 'qorvo-live-modal-identity';

      const name = document.createElement('strong');
      name.textContent = member.name || member.username || 'QORVO Member';

      const username = document.createElement('span');
      username.textContent = member.username ? `@${member.username}` : 'TikTok LIVE';

      identity.append(name, username);

      const watch = document.createElement('a');
      watch.className = 'qorvo-live-modal-watch';
      watch.target = '_blank';
      watch.rel = 'noopener';
      watch.textContent = 'WATCH LIVE ↗';

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

      row.append(identity, watch);
      listEl.append(row);
    });

    const later = document.createElement('button');
    later.type = 'button';
    later.className = 'qorvo-live-modal-later';
    later.textContent = 'MAYBE LATER';

    panel.append(close, eyebrow, title, subtitle, listEl, later);
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
