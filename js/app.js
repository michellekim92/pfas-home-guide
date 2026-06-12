(function () {
  'use strict';

  const views = {
    home: document.getElementById('view-home'),
    hotspot: document.getElementById('view-hotspot'),
    swaps: document.getElementById('view-swaps'),
    shop: document.getElementById('view-shop'),
  };

  const hotspotContent = document.getElementById('hotspot-content');
  const swapsContent = document.getElementById('swaps-content');
  const shopContainer = document.getElementById('shop-container');
  let expandedRoom = 'kitchen';

  function esc(s) {
    const d = document.createElement('div');
    d.textContent = s;
    return d.innerHTML;
  }

  function exposureTier(exposure) {
    return EXPOSURE_TIERS[exposure] || EXPOSURE_TIERS.moderate;
  }

  function exposureBadge(exposure, variant = 'short') {
    const tier = exposureTier(exposure);
    const text = variant === 'short' ? tier.short : tier.label;
    return `<span class="exposure-badge exposure-${exposure}" title="${esc(tier.hint)}">${esc(text)}</span>`;
  }

  function navigate(name) {
    Object.entries(views).forEach(([k, el]) => el?.classList.toggle('active', k === name));
    document.querySelectorAll('.tab').forEach((t) => t.classList.toggle('active', t.dataset.nav === name));
    document.body.classList.toggle('detail-open', name === 'hotspot');
    if (name === 'swaps') renderSwaps();
    if (name === 'shop') renderShop();
    window.scrollTo(0, 0);
  }

  function openHotspot(roomId, itemId) {
    renderHotspotDetail(roomId, itemId);
    navigate('hotspot');
  }

  let statIndex = 0;
  let statTimer = null;

  function initStatCarousel() {
    const track = document.getElementById('stat-track');
    const dots = document.getElementById('stat-dots');
    if (!track) return;

    track.innerHTML = REVOLVING_STATS.map((s, i) => `
      <article class="stat-slide${i === 0 ? ' active' : ''}" data-i="${i}">
        <div class="stat-value">${esc(s.value)}</div>
        <p class="stat-text">${esc(s.label)}</p>
        <a class="stat-link" href="${s.url}" target="_blank" rel="noopener noreferrer">${esc(s.source)} ↗</a>
      </article>`).join('');

    dots.innerHTML = REVOLVING_STATS.map((_, i) =>
      `<button type="button" class="stat-dot${i === 0 ? ' active' : ''}" data-i="${i}" aria-label="Stat ${i + 1}"></button>`
    ).join('');

    function goTo(i) {
      statIndex = i;
      track.querySelectorAll('.stat-slide').forEach((el, j) => el.classList.toggle('active', j === i));
      dots.querySelectorAll('.stat-dot').forEach((el, j) => el.classList.toggle('active', j === i));
    }

    function next() { goTo((statIndex + 1) % REVOLVING_STATS.length); }

    dots.querySelectorAll('.stat-dot').forEach((btn) => {
      btn.addEventListener('click', () => {
        goTo(+btn.dataset.i);
        clearInterval(statTimer);
        statTimer = setInterval(next, 5500);
      });
    });

    statTimer = setInterval(next, 5500);
  }

  function initExposureLegend() {
    const el = document.getElementById('exposure-legend');
    if (!el) return;
    el.innerHTML = Object.entries(EXPOSURE_TIERS)
      .sort((a, b) => a[1].order - b[1].order)
      .map(([key, tier]) => `
        <span class="exposure-legend-item">
          ${exposureBadge(key, 'short')}
          <span class="exposure-legend-hint">${esc(tier.hint)}</span>
        </span>`).join('');
  }

  function priorityChipHtml(room, item) {
    return `
      <button type="button" class="priority-chip exposure-row-${item.exposure}"
        data-room="${room.id}" data-item="${item.id}">
        <span class="priority-chip-room">${esc(room.label)}</span>
        <span class="priority-chip-label">${esc(item.label)}</span>
        ${exposureBadge(item.exposure)}
      </button>`;
  }

  function bindPriorityChips(root) {
    root.querySelectorAll('.priority-chip').forEach((btn) => {
      btn.addEventListener('click', () => openHotspot(btn.dataset.room, btn.dataset.item));
    });
  }

  function initPriorityStrip() {
    const el = document.getElementById('priority-strip');
    const moreEl = document.getElementById('priority-more');
    if (!el) return;

    const all = getRankedExposureEntries(SWAPS_LIST_LIMIT);
    const preview = all.slice(0, HOME_SWAP_PREVIEW);

    el.innerHTML = preview.map(({ room, item }) => priorityChipHtml(room, item)).join('');
    bindPriorityChips(el);

    if (moreEl) {
      if (all.length > preview.length) {
        moreEl.innerHTML = `
          <button type="button" class="priority-see-all" data-nav="swaps">
            See top 20 swaps →
          </button>`;
      } else {
        moreEl.innerHTML = '';
      }
    }
  }

  function initHotspotList() {
    const el = document.getElementById('hotspot-list');
    if (!el) return;

    function render() {
      el.innerHTML = HOTSPOT_ROOMS.map((room) => `
        <div class="hotspot-room">
          <div class="hotspot-room-head" data-room="${room.id}" role="button" tabindex="0">
            <span class="hotspot-room-dot" style="background:${room.color}"></span>
            ${esc(room.label)}
            <span class="hotspot-room-chevron">${expandedRoom === room.id ? '▾' : '▸'}</span>
          </div>
          ${expandedRoom === room.id ? `
            <div class="hotspot-room-body">
              ${sortItemsByExposure(room.items).map((item) => `
                <button type="button" class="hotspot-item-link exposure-row-${item.exposure}"
                  data-room="${room.id}" data-item="${item.id}">
                  <span class="hotspot-item-text">
                    <span class="hotspot-item-label-row">
                      <span class="hotspot-item-label">${esc(item.label)}</span>
                      ${exposureBadge(item.exposure)}
                    </span>
                    <span class="hotspot-item-preview">${esc(item.detail)}</span>
                  </span>
                  <span class="hotspot-item-arrow" aria-hidden="true">→</span>
                </button>`).join('')}
            </div>` : ''}
        </div>`).join('');

      el.querySelectorAll('.hotspot-room-head').forEach((head) => {
        const toggle = () => {
          expandedRoom = expandedRoom === head.dataset.room ? null : head.dataset.room;
          render();
        };
        head.addEventListener('click', toggle);
        head.addEventListener('keydown', (e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            toggle();
          }
        });
      });

      el.querySelectorAll('.hotspot-item-link').forEach((btn) => {
        btn.addEventListener('click', () => openHotspot(btn.dataset.room, btn.dataset.item));
      });
    }

    render();
  }

  function productCard(item) {
    const fb = IMG_FALLBACK_PRODUCT;
    return `
      <a class="swap-product amazon-link" href="${amazonProductLink(item)}" target="_blank" rel="noopener noreferrer sponsored">
        <img src="${amazonImage(item)}" alt="${esc(item.name)}" onerror="this.src='${fb}'">
        <div>
          <strong>${esc(item.name)}</strong>
          <span>${esc(item.desc)}</span>
        </div>
        <span class="arrow">→</span>
      </a>`;
  }

  function renderHotspotDetail(roomId, itemId) {
    const hit = findHotspot(roomId, itemId);
    if (!hit || !hotspotContent) return;

    const { room, item } = hit;
    const cat = item.productKey ? PRODUCTS[item.productKey] : null;
    const products = cat?.items ?? [];

    hotspotContent.innerHTML = `
      <button type="button" class="hotspot-back" id="hotspot-back">← Back to home</button>

      <header class="hotspot-detail-header">
        <p class="hotspot-detail-room" style="color:${room.color}">${esc(room.label)}</p>
        <div class="hotspot-detail-title-row">
          <h1 class="hotspot-detail-title">${esc(item.label)}</h1>
          ${exposureBadge(item.exposure, 'label')}
        </div>
        <p class="exposure-detail-hint">${esc(exposureTier(item.exposure).hint)}</p>
      </header>

      <section class="hotspot-section">
        <h3>Why PFAS shows up here</h3>
        <p>${esc(item.why)}</p>
      </section>

      <section class="hotspot-section">
        <h3>Better swaps</h3>
        <ul class="hotspot-bullets">
          ${item.alternatives.map((a) => `<li>${esc(a)}</li>`).join('')}
        </ul>
      </section>

      ${products.length ? `
        <section class="hotspot-section">
          <h3>Shop picks</h3>
          <p style="font-size:0.8rem;color:var(--muted);margin-bottom:0.65rem;">PFA-free alternatives — verify labels before buying.</p>
          ${products.map((p) => productCard(p)).join('')}
        </section>` : `
        <section class="hotspot-section">
          <p style="font-size:0.85rem;color:var(--muted);">No product picks for this item yet — try the swap tips above or explore more below.</p>
        </section>`}

      <section class="hotspot-detail-cta">
        <h3>Keep swapping</h3>
        <p class="hotspot-detail-cta-hint">See what else to tackle first, or browse the full product list.</p>
        <button type="button" class="btn btn-primary btn-block" data-nav="swaps">See top 20 swaps</button>
        <button type="button" class="btn btn-ghost btn-block" data-nav="shop">Browse all products</button>
      </section>

      <p class="fine-print">May earn from qualifying Amazon purchases.</p>`;

    document.getElementById('hotspot-back')?.addEventListener('click', () => navigate('home'));
  }

  function renderSwaps() {
    if (!swapsContent) return;

    const entries = getRankedExposureEntries(SWAPS_LIST_LIMIT);
    const swapHtml = entries.map(({ room, item }, idx) => {
      const cat = item.productKey ? PRODUCTS[item.productKey] : null;
      const topProduct = cat?.items[0];
      const alt = item.alternatives[0];
      return `
        <article class="swap-card">
          <div class="swap-card-head">
            <span class="swap-rank">${idx + 1}</span>
            <div>
              <span class="swap-card-room">${esc(room.label)}</span>
              <strong>${esc(item.label)}</strong>
              ${exposureBadge(item.exposure)}
              <p>${esc(item.detail)}</p>
              ${alt ? `<p class="swap-tip">${esc(alt)}</p>` : ''}
              <button type="button" class="swap-detail-btn" data-room="${room.id}" data-item="${item.id}">
                Full guide →
              </button>
            </div>
          </div>
          ${topProduct ? productCard(topProduct) : ''}
        </article>`;
    }).join('');

    swapsContent.innerHTML = `
      <div class="view-top">
        <h2>Top ${entries.length} swaps</h2>
        <p>Ranked by PFAS exposure — highest impact first.</p>
      </div>
      ${swapHtml}
      <p class="fine-print">May earn from qualifying purchases. Verify labels before buying.</p>`;

    swapsContent.querySelectorAll('.swap-detail-btn').forEach((btn) => {
      btn.addEventListener('click', () => openHotspot(btn.dataset.room, btn.dataset.item));
    });
  }

  function renderShop() {
    const fb = IMG_FALLBACK_PRODUCT;
    shopContainer.innerHTML = Object.entries(PRODUCTS).map(([key, cat]) => `
      <section class="shop-cat" id="cat-${key}">
        <h3>${esc(cat.title)}</h3>
        <div class="shop-grid">
          ${cat.items.map((item) => `
            <a class="shop-item amazon-link" href="${amazonProductLink(item)}" target="_blank" rel="noopener noreferrer sponsored">
              <img src="${amazonImage(item)}" alt="${esc(item.name)}" onerror="this.src='${fb}'">
              <strong>${esc(item.name)}</strong>
              <span>${esc(item.desc)}</span>
            </a>`).join('')}
        </div>
      </section>`).join('');
  }

  function initHome() {
    initStatCarousel();
    initExposureLegend();
    initPriorityStrip();
    initHotspotList();
  }

  document.addEventListener('click', (e) => {
    const nav = e.target.closest('[data-nav]');
    if (nav) {
      e.preventDefault();
      navigate(nav.dataset.nav);
      return;
    }

    const amazon = e.target.closest('a.amazon-link, a.swap-product, a.shop-item');
    if (!amazon) return;
    const href = amazon.getAttribute('href');
    if (!href || !href.includes('amazon.com')) return;

    e.preventDefault();
    const opened = window.open(href, '_blank', 'noopener,noreferrer');
    if (!opened) window.location.assign(href);
  });

  initHome();
  renderShop();
})();
