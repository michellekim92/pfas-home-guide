/* ============================================================
   PFASWAP — application
   ============================================================ */

(function () {
  'use strict';

  /* ── State ─────────────────────────────────────────────── */

  var isMember = false;
  var memberChecked = false;
  var openRoom = 'kitchen';
  var currentRoute = { view: 'home' };
  var lastListView = 'home';

  var app = document.getElementById('app');

  /* ── Utilities ─────────────────────────────────────────── */

  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  function el(id) { return document.getElementById(id); }

  function setMeta(title, description) {
    document.title = title;
    var m = document.querySelector('meta[name="description"]');
    if (m && description) m.setAttribute('content', description);
  }

  /* ── Exposure signal ───────────────────────────────────── */

  function tierOf(exposure) {
    return EXPOSURE_TIERS[exposure] || EXPOSURE_TIERS.moderate;
  }

  function signalMeter(exposure) {
    var t = tierOf(exposure);
    var bars = '';
    for (var i = 0; i < 4; i++) bars += '<i class="' + (i < t.units ? 'on' : '') + '"></i>';
    return '<span class="signal" role="img" aria-label="' + esc(t.label) +
      ', ' + t.units + ' of 4">' + bars + '</span>';
  }

  function signalText(exposure) {
    var t = tierOf(exposure);
    return '<span class="signal-text' + (exposure === 'critical' ? ' is-first' : '') + '">' +
      esc(t.short) + '</span>';
  }

  function familyTags(families) {
    if (!families || !families.length) return '';
    return '<span class="family-tags">' + families.map(function (f) {
      var fam = FAMILIES[f];
      if (!fam) return '';
      var per = persistenceOf(f);
      return '<span class="family-tag" title="' + esc(fam.short + ' ' + per.hint) + '">' +
        '<span class="family-name">' + esc(fam.label) + '</span>' +
        '<span class="family-clock">' + esc(per.short) + '</span>' +
        '</span>';
    }).join('') + '</span>';
  }

  /* ── Membership ────────────────────────────────────────── */

  function cacheMember(v) {
    try { localStorage.setItem(MEMBER_CACHE_KEY, v ? '1' : '0'); } catch (e) { /* ignore */ }
  }

  function readCachedMember() {
    try { return localStorage.getItem(MEMBER_CACHE_KEY) === '1'; } catch (e) { return false; }
  }

  /**
   * Ask the server. The cached value only prevents a flash of the
   * locked state for a returning member — it never grants access,
   * and it is overwritten by whatever the server says.
   */
  function refreshMemberStatus() {
    if (!MEMBERSHIP_LIVE) {
      isMember = false;
      memberChecked = true;
      return Promise.resolve();
    }
    isMember = readCachedMember();
    return fetch('/api/member-status', { credentials: 'same-origin' })
      .then(function (r) { return r.json(); })
      .then(function (data) {
        isMember = !!(data && data.member);
        memberChecked = true;
        cacheMember(isMember);
      })
      .catch(function () {
        // Unreachable API (offline, or opened as a local file) means
        // no verified membership. Fail closed, never open.
        isMember = false;
        memberChecked = true;
        cacheMember(false);
      });
  }

  /** Exchange a Stripe Checkout session id for a verified cookie. */
  function handleCheckoutReturn() {
    if (!MEMBERSHIP_LIVE) return Promise.resolve();
    var params = new URLSearchParams(window.location.search);
    var sessionId = params.get('session_id');
    var canceled = params.get('canceled');

    if (!sessionId && !canceled) return Promise.resolve();

    var clean = window.location.pathname + window.location.hash;

    if (canceled) {
      history.replaceState({}, '', clean);
      return Promise.resolve();
    }

    return fetch('/api/verify-session', {
      method: 'POST',
      credentials: 'same-origin',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sessionId: sessionId })
    })
      .then(function (r) { return r.json(); })
      .then(function (data) {
        isMember = !!(data && data.member);
        cacheMember(isMember);
        history.replaceState({}, '', clean);
        if (isMember) window.location.hash = '#/priority';
      })
      .catch(function () {
        history.replaceState({}, '', clean);
      });
  }

  function startCheckout(triggerBtn) {
    var buttons = Array.prototype.slice.call(document.querySelectorAll('[data-checkout]'));
    buttons.forEach(function (b) { b.disabled = true; });
    showCheckoutError('');

    return fetch('/api/create-checkout-session', {
      method: 'POST',
      credentials: 'same-origin'
    })
      .then(function (r) { return r.json(); })
      .then(function (data) {
        if (data && data.url) {
          window.location.href = data.url;
          return;
        }
        showCheckoutError(data && data.error
          ? data.error
          : 'Checkout is unavailable right now. Please try again in a moment.');
      })
      .catch(function () {
        showCheckoutError('Could not reach checkout. Check your connection and try again.');
      })
      .then(function () {
        buttons.forEach(function (b) { b.disabled = false; });
      });
  }

  /** Inline, announced error text — replaces the old alert(). */
  function showCheckoutError(msg) {
    document.querySelectorAll('[data-checkout-error]').forEach(function (node) {
      node.textContent = msg || '';
      node.hidden = !msg;
    });
  }

  function signOut() {
    return fetch('/api/sign-out', { method: 'POST', credentials: 'same-origin' })
      .catch(function () { /* ignore */ })
      .then(function () {
        isMember = false;
        cacheMember(false);
        render();
      });
  }

  /**
   * The only gating question anywhere. With MEMBERSHIP_LIVE false the
   * whole guide is open, so no caller needs to know why.
   */
  function isHeld(rank) {
    if (!MEMBERSHIP_LIVE) return false;
    if (isMember) return false;
    return rank > FREE_RANKS;
  }

  function categoryHeld(catKey) {
    if (!MEMBERSHIP_LIVE || isMember) return false;
    return freeProductKeys().indexOf(catKey) === -1;
  }

  /* ── Shared fragments ──────────────────────────────────── */

  function gateBlock(heading, body) {
    return '<div class="gate">' +
      '<div class="gate-copy">' +
      '<h3>' + esc(heading) + '</h3>' +
      '<p>' + esc(body) + '</p>' +
      '</div>' +
      '<div class="gate-action">' +
      '<button type="button" class="btn btn-primary" data-checkout>' + esc(SUBSCRIPTION.cta) + '</button>' +
      '<p class="gate-note">' + esc(SUBSCRIPTION.note) + '</p>' +
      '<p class="form-error" data-checkout-error hidden></p>' +
      '</div></div>';
  }

  function disclosureLine(extra) {
    return '<p class="fine-print">' + esc(AMAZON_DISCLOSURE) +
      (extra ? ' ' + esc(extra) : '') + '</p>';
  }

  /* ── Ladder ────────────────────────────────────────────── */

  function ladder(limit) {
    var entries = getRankedEntries(limit);

    var rows = entries.map(function (e) {
      var locked = isHeld(e.item.rank);

      if (locked) {
        return '<li class="rung is-locked">' +
          '<span class="rung-rank">' + e.item.rank + '</span>' +
          '<span class="rung-body">' +
          '<span class="rung-room">' + esc(e.room.label) + '</span>' +
          '<span class="rung-title">' + esc(e.item.label) + '</span>' +
          '</span>' +
          '<span class="rung-meta"><span class="lockmark">' + esc(SUBSCRIPTION.lockedLabel) + '</span></span>' +
          '</li>';
      }

      return '<li>' +
        '<a class="rung" href="#/swap/' + e.room.id + '/' + e.item.id + '">' +
        '<span class="rung-rank">' + e.item.rank + '</span>' +
        '<span class="rung-body">' +
        '<span class="rung-room">' + esc(e.room.label) + '</span>' +
        '<span class="rung-title">' + esc(e.item.label) + '</span>' +
        '<span class="rung-detail">' + esc(e.item.detail) + '</span>' +
        '</span>' +
        '<span class="rung-meta">' + signalMeter(e.item.exposure) + signalText(e.item.exposure) + '</span>' +
        '</a></li>';
    }).join('');

    var gate = '';
    if (MEMBERSHIP_LIVE && !isMember) {
      var hidden = TOTAL_HOTSPOTS - FREE_RANKS;
      gate = gateBlock(
        hidden + ' more, ranked',
        'Ranks ' + (FREE_RANKS + 1) + '–' + TOTAL_HOTSPOTS +
        ', every verified product pick, and a re-check each quarter when labels change.'
      );
    }

    return '<ol class="ladder">' + rows + '</ol>' + gate;
  }

  /* ── Rooms ─────────────────────────────────────────────── */

  function rooms() {
    return '<div class="rooms">' + HOTSPOT_ROOMS.map(function (room) {
      var open = openRoom === room.id;
      var panelId = 'room-panel-' + room.id;

      var body = open
        ? '<div class="room-panel" id="' + panelId + '">' +
          '<p class="room-blurb">' + esc(room.blurb) + '</p>' +
          sortItemsByRank(room.items).map(function (item) {
            return '<a class="room-item" href="#/swap/' + room.id + '/' + item.id + '">' +
              '<span class="room-item-text">' +
              '<span class="room-item-title">' + esc(item.label) +
              '<span class="room-item-rank">#' + item.rank + '</span></span>' +
              '<span class="room-item-detail">' + esc(item.detail) + '</span>' +
              '</span>' +
              '<span class="rung-meta">' + signalMeter(item.exposure) + '</span>' +
              '</a>';
          }).join('') +
          '</div>'
        : '';

      return '<div class="room">' +
        '<button type="button" class="room-head" data-room-toggle="' + room.id + '"' +
        ' aria-expanded="' + open + '" aria-controls="' + panelId + '">' +
        '<span class="chev" aria-hidden="true">▸</span>' +
        '<span class="room-name">' + esc(room.label) + '</span>' +
        '<span class="room-count">' + room.items.length + '</span>' +
        '</button>' + body + '</div>';
    }).join('') + '</div>';
  }

  /* ── Products ──────────────────────────────────────────── */

  var SEAL_SVG =
    '<svg viewBox="0 0 20 20" width="16" height="16">' +
    '<circle cx="10" cy="10" r="8.4" fill="none" stroke="currentColor" stroke-width="1"></circle>' +
    '<path fill="currentColor" d="M10 6.5c1.8 1.1 2.5 3.2 0 5.4-2.5-2.2-1.8-4.3 0-5.4Z"></path>' +
    '</svg>';

  /**
   * Amazon's ASIN-derived image endpoint does not resolve for every product.
   * Rather than risk a grid of broken thumbnails — the exact defect this
   * rebuild set out to remove — any image that fails is swapped for the seal.
   * Capture phase, because `error` on <img> does not bubble.
   */
  document.addEventListener('error', function (e) {
    var img = e.target;
    if (!img || img.tagName !== 'IMG' || !img.classList.contains('pick-img')) return;
    var seal = document.createElement('span');
    seal.className = 'pick-seal';
    seal.setAttribute('aria-hidden', 'true');
    seal.innerHTML = SEAL_SVG;
    if (img.parentNode) img.parentNode.replaceChild(seal, img);
  }, true);

  var PICK_LABELS = {
    value: 'Best value',
    evidence: 'Strongest evidence',
    balance: 'Best all-round',
    compromise: 'If convenience wins',
  };

  /** Evidence strength as a small meter — same visual grammar as exposure. */
  function evidenceMeter(key) {
    var t = evidenceTier(key);
    var bars = '';
    for (var i = 0; i < 4; i++) bars += '<i class="' + (i < t.rank ? 'on' : '') + '"></i>';
    return '<span class="ev-meter" title="' + esc(t.hint) + '">' +
      '<span class="signal" role="img" aria-label="' + esc(EVIDENCE_COLUMN) + ': ' +
      esc(t.label) + ', ' + t.rank + ' of 4">' + bars + '</span>' +
      '<span class="ev-name">' + esc(t.label) + '</span></span>';
  }

  /**
   * The honest limit of a pick, in its own words. Quiet and always visible:
   * same size as body copy, not a warning, so tier B reads as confidence
   * labelling rather than a hazard notice.
   */
  function limitLine(item) {
    if (!item.shortfallNote) return '';
    return '<span class="pick-limit"><b>What this does not do</b> ' + esc(item.shortfallNote) + '</span>';
  }

  /** A tier and a pointer to today's price for Amazon picks; the real price for brand-site picks. */
  function priceHtml(item, asLink) {
    if (item.priceTier) {
      var today = asLink
        ? '<a class="price-today" href="' + esc(amazonProductLink(item)) + '" target="_blank" rel="noopener noreferrer sponsored">Today’s price on Amazon ↗</a>'
        : '<span class="price-today">Today’s price on Amazon ↗</span>';
      return '<span class="price-tier" title="' + esc(PRICE_TIERS[item.priceTier] || '') + '">' + esc(item.priceTier) + '</span>' + today;
    }
    return esc(item.price || '—');
  }

  /** Local calendar date as YYYY-MM-DD, so the window turns over at the reader's midnight. */
  function todayIso() {
    var d = new Date();
    return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
  }

  function dealTag(item) {
    if (!item.dealPick || typeof DEAL_WINDOW === 'undefined') return '';
    var t = todayIso();
    if (t < DEAL_WINDOW.start || t > DEAL_WINDOW.end) return '';
    return '<span class="pick-deal">' + esc(DEAL_WINDOW.label) + '</span>';
  }

  function productCard(item) {
    var img = amazonImage(item);
    var isDirect = !!item.directUrl;

    var thumb = img
      ? '<img class="pick-img" src="' + esc(img) + '" alt="" loading="lazy">'
      : '<span class="pick-seal" aria-hidden="true">' + SEAL_SVG + '</span>';

    // A direct-to-brand link is not sponsored and must not claim to be.
    var rel = isDirect ? 'noopener noreferrer' : 'noopener noreferrer sponsored';

    return '<a class="pick" href="' + esc(amazonProductLink(item)) + '"' +
      ' target="_blank" rel="' + rel + '">' +
      '<span class="pick-top">' +
      thumb +
      '<span class="pick-body">' +
      (item.pick ? '<span class="pick-tag">' + esc(PICK_LABELS[item.pick] || '') + '</span>' : '') +
      dealTag(item) +
      '<span class="pick-name">' + esc(item.name) + '</span>' +
      '<span class="pick-why">' + esc(item.why || item.desc || '') + '</span>' +
      limitLine(item) +
      '</span>' +
      '<span class="pick-price">' + priceHtml(item) + '</span>' +
      '</span>' +
      '<span class="pick-facts">' +
      evidenceMeter(item.evidence) +
      (item.lifespan ? '<span class="fact"><b>Lasts</b>' + esc(item.lifespan) + '</span>' : '') +
      (item.tradeoff ? '<span class="fact fact-wide"><b>Trade-off</b>' + esc(item.tradeoff) + '</span>' : '') +
      '</span>' +
      (isDirect ? '<span class="pick-flag pick-unpaid">Unpaid link — we earn nothing from this one</span>' : '') +
      (item.verified === false ? '<span class="pick-flag">Not yet verified</span>' : '') +
      '</a>';
  }

  /* ── Comparison table ──────────────────────────────────────
     Deliberately no composite score. A single number would hide
     the trade-off, which is the only thing worth showing: there
     is rarely one best pick, and the best evidence usually costs
     more. Columns stay separate so the reader decides.
     ──────────────────────────────────────────────────────── */

  var sortBy = {};   // { categoryKey: 'editorial' | 'price' | 'evidence' }

  /**
   * Sort key for "Lowest price". Amazon picks only have a tier, so every
   * pick is compared by tier band; within a band, a brand-site pick's real
   * price breaks the tie.
   */
  function priceNumber(item) {
    var band = { '$': 1, '$$': 2, '$$$': 3 };
    if (item.priceTier) return band[item.priceTier] * 1e6;
    if (!item.price) return Infinity;
    var n = parseFloat(String(item.price).replace(/[^0-9.]/g, ''));
    if (isNaN(n)) return Infinity;
    return (n < 25 ? 1 : n <= 60 ? 2 : 3) * 1e6 + n;
  }

  function sortedItems(cat, key) {
    var mode = sortBy[key] || 'editorial';
    var items = cat.items.slice();
    if (mode === 'price') {
      items.sort(function (a, b) { return priceNumber(a) - priceNumber(b); });
    } else if (mode === 'evidence') {
      items.sort(function (a, b) {
        var d = evidenceTier(b.evidence).rank - evidenceTier(a.evidence).rank;
        return d !== 0 ? d : priceNumber(a) - priceNumber(b);
      });
    }
    return items;
  }

  function sortChips(key) {
    var mode = sortBy[key] || 'editorial';
    var opts = [
      ['editorial', 'Our order'],
      ['evidence', 'Best evidence'],
      ['price', 'Lowest price'],
    ];
    return '<div class="compare-sort">' +
      '<span class="compare-sort-label">Sort</span>' +
      opts.map(function (o) {
        return '<button type="button" class="chip" data-sort="' + o[0] + '"' +
          ' data-cat="' + esc(key) + '" aria-pressed="' + (mode === o[0]) + '">' +
          esc(o[1]) + '</button>';
      }).join('') + '</div>';
  }

  function comparisonTable(cat, key) {
    var items = sortedItems(cat, key);

    var rows = items.map(function (item) {
      var isDirect = !!item.directUrl;
      var rel = isDirect ? 'noopener noreferrer' : 'noopener noreferrer sponsored';
      var t = evidenceTier(item.evidence);

      return '<tr>' +
        '<td data-label="Product">' +
          (item.pick ? '<span class="c-tag">' + esc(PICK_LABELS[item.pick] || '') + '</span>' : '') +
          dealTag(item) +
          '<a class="c-name" href="' + esc(amazonProductLink(item)) + '"' +
          ' target="_blank" rel="' + rel + '">' + esc(item.name) +
          '<span class="c-go" aria-hidden="true"> ↗</span></a>' +
          '<span class="c-why">' + esc(item.why || '') + '</span>' +
          limitLine(item) +
          (isDirect ? '<span class="pick-flag pick-unpaid">Unpaid link</span>' : '') +
          (item.verified === false ? '<span class="pick-flag">Not yet verified</span>' : '') +
        '</td>' +
        // One wrapper, so the mobile grid places label and value as a pair.
        '<td data-label="' + esc(EVIDENCE_COLUMN) + '"><span class="c-evwrap" title="' + esc(t.hint) + '">' +
          '<span class="signal" role="img" aria-label="' + esc(EVIDENCE_COLUMN) + ': ' +
          esc(t.label) + ', ' + t.rank + ' of 4">' + barsFor(t.rank) + '</span>' +
          '<span class="c-ev">' + esc(t.label) + '</span>' +
        '</span></td>' +
        '<td data-label="Price" class="c-price">' + priceHtml(item, true) + '</td>' +
        '<td data-label="Lasts" class="c-lasts">' + esc(item.lifespan || '—') + '</td>' +
        '<td data-label="Trade-off" class="c-trade">' + esc(item.tradeoff || '—') + '</td>' +
        '</tr>';
    }).join('');

    return sortChips(key) +
      '<div class="compare-scroll"><table class="compare">' +
      '<thead><tr>' +
      '<th scope="col">Product</th>' +
      '<th scope="col">' + esc(EVIDENCE_COLUMN) + '</th>' +
      '<th scope="col">Price</th>' +
      '<th scope="col">Lasts</th>' +
      '<th scope="col">Trade-off</th>' +
      '</tr></thead>' +
      '<tbody>' + rows + '</tbody></table></div>' + evidenceLegend();
  }


  /** Plain-English key for the evidence scale. Collapsed so it does not
      clutter, but present on every table because deep links land here. */
  function evidenceLegend() {
    var order = ['inherent', 'certified', 'tested', 'stated', 'unverified'];
    return '<details class="ev-legend">' +
      '<summary>What does \u201C' + esc(EVIDENCE_COLUMN) + '\u201D mean?</summary>' +
      '<dl>' + order.map(function (k) {
        var t = EVIDENCE_TIERS[k];
        return '<div class="ev-legend-row">' +
          '<dt><span class="signal" aria-hidden="true">' + barsFor(t.rank) + '</span>' +
          '<span class="ev-legend-name">' + esc(t.label) + '</span></dt>' +
          '<dd>' + esc(t.hint) + '</dd></div>';
      }).join('') + '</dl>' +
      '<p class="ev-legend-foot">Two products can both fill the bar for different reasons: a bare cast-iron pan has nothing on it to test, and a certified filter has been checked against a published standard. Neither is guesswork.</p>' +
      '</details>';
  }

  function barsFor(rank) {
    var out = '';
    for (var i = 0; i < 4; i++) out += '<i class="' + (i < rank ? 'on' : '') + '"></i>';
    return out;
  }

  /**
   * One item is a card; two or more is a comparison, because the
   * whole point is reading across them.
   */
  function productSection(cat, key) {
    var head = cat.note ? '<p class="cat-note">' + esc(cat.note) + '</p>' : '';
    var foot = cat.items.some(function (i) { return i.priceTier; })
      ? '<p class="price-key">' + esc(PRICE_TIER_NOTE) + '</p>' : '';
    if (cat.items.length < 2) {
      return head + '<div class="picks">' + cat.items.map(productCard).join('') + '</div>' + foot;
    }
    return head + comparisonTable(cat, key || cat.title) + foot;
  }

  var PROVISIONAL_NOTE =
    'Some picks below are still search links rather than checked listings — they are marked. ' +
    'Everything else has a confirmed product, a current price and a stated basis for its claim.';

  /** True only when a category still contains an unchecked item. */
  function hasUnverified(cat) {
    return !!(cat && cat.items && cat.items.some(function (i) { return i.verified === false; }));
  }

  function provisionalNote(cats) {
    return cats.some(hasUnverified)
      ? '<p class="provisional">' + esc(PROVISIONAL_NOTE) + '</p>'
      : '';
  }

  /* ── Views ─────────────────────────────────────────────── */

  function viewHome() {
    setMeta(
      SITE_NAME + ' — where forever chemicals hide at home, and what to swap first',
      'Twenty-one places PFAS get into an ordinary home, ranked by how much exposure each one actually adds. Start with rank one.'
    );

    return '' +
      '<header class="hero">' +
      '<p class="eyebrow">' + esc(SITE_TAGLINE) + '</p>' +
      '<h1 tabindex="-1">You can’t see PFAS. You <em>can</em> see what to swap.</h1>' +
      '<p class="hero-sub">' + esc(SUBSCRIPTION.subline) + '</p>' +
      '<div class="hero-actions">' +
      '<a class="btn btn-primary" href="#/priority">Start with rank one</a>' +
      '<a class="btn btn-ghost" href="#/rooms">Browse by room</a>' +
      '</div>' +
      '</header>' +

      section('01', 'What earns a place on this list',
        'Every pick clears four checks before it appears anywhere on the site.',
        '<div class="checks">' + VETTING_CHECKS.map(function (c, i) {
          return '<div class="check">' +
            '<span class="check-n">' + (i + 1) + '</span>' +
            '<h3>' + esc(c.label) + '</h3>' +
            '<p>' + esc(c.detail) + '</p></div>';
        }).join('') + '</div>' +
        '<p class="seal-line">Labels change. Entries are re-checked quarterly and every one carries its date.</p>') +

      section('02', 'Start here',
        MEMBERSHIP_LIVE
          ? 'The top three are free, in full. Everything below rank three is what membership buys.'
          : 'Ordered by how much exposure each one actually adds. The whole list is open.',
        ladder(MEMBERSHIP_LIVE && !isMember ? FREE_RANKS + 3 : 8) +
        '<p class="section-more"><a href="#/priority">See all ' + TOTAL_HOTSPOTS + ' →</a></p>') +

      section('03', 'What reducing exposure actually does',
        'Mechanism, not promises. No health outcome is claimed here or anywhere else on the site.',
        '<div class="benefits">' + BENEFITS.map(function (b) {
          return '<div class="benefit"><h3>' + esc(b.title) + '</h3><p>' + esc(b.body) + '</p></div>';
        }).join('') + '</div>' + clocksBlock()) +

      section('04', 'Why this is worth your attention',
        'Every claim links to its source.',
        '<div class="evidence">' + EVIDENCE.map(function (ev) {
          return '<div class="ev">' +
            '<div class="ev-fig">' + esc(ev.figure) + '</div>' +
            '<div class="ev-text">' + esc(ev.text) + '</div>' +
            '<div class="ev-src"><a href="' + esc(ev.url) + '" target="_blank" rel="noopener noreferrer">' +
            esc(ev.source) + ' ↗</a></div>' +
            '</div>';
        }).join('') + '</div>') +

      section('05', 'Or start where you’re standing',
        'The same ' + TOTAL_HOTSPOTS + ' hotspots, entered through the room you’re in. Always free.',
        rooms()) +

      (MEMBERSHIP_LIVE
        ? section('06', 'Membership', 'The price, what it buys, and how to leave.', plan())
        : section('06', 'Membership', 'What is coming, and what it will cost.', comingSoon()));
  }

  function clocksBlock() {
    return '<div class="clocks">' +
      '<h3 class="clocks-head">' + esc(CLOCKS.heading) + '</h3>' +
      '<p class="clocks-intro">' + esc(CLOCKS.intro) + '</p>' +
      '<div class="clocks-grid">' + CLOCKS.columns.map(function (c) {
        return '<div class="clock">' +
          '<p class="clock-family">' + esc(c.family) + '</p>' +
          '<p class="clock-time">' + esc(c.time) + '</p>' +
          '<p class="clock-body">' + esc(c.body) + '</p>' +
          '</div>';
      }).join('') + '</div>' +
      '<p class="clocks-line">' + esc(CLOCKS.line) + '</p>' +
      (CLOCKS.third
        ? '<div class="clocks-third">' +
          '<p class="clock-family">' + esc(CLOCKS.third.family) + '</p>' +
          '<p class="clock-body">' + esc(CLOCKS.third.body) + '</p>' +
          '</div>'
        : '') +
      '<p class="clocks-foot">' + esc(CLOCKS.foot) + '</p>' +
      '</div>';
  }

  function section(num, heading, purpose, body) {
    return '<section class="block">' +
      '<div class="block-head">' +
      '<span class="block-num">' + esc(num) + '</span>' +
      '<h2>' + esc(heading) + '</h2>' +
      '</div>' +
      (purpose ? '<p class="block-purpose">' + esc(purpose) + '</p>' : '') +
      body + '</section>';
  }

  function comingSoon() {
    return '<div class="soon">' +
      '<p class="soon-label">Membership</p>' +
      '<h3>The whole guide is open right now.</h3>' +
      '<p>A paid tier is coming \u2014 the full ranked list, the verified picks, and a re-check ' +
      'each quarter when labels change. Until it opens, none of it is held back.</p>' +
      '</div>';
  }

  function plan() {
    return '<div class="plan">' +
      '<div class="tier">' +
      '<p class="tier-name">Free</p>' +
      '<p class="tier-price">$0</p>' +
      '<ul>' +
      '<li>The full room library — all ' + TOTAL_HOTSPOTS + ' hotspots</li>' +
      '<li>Ranks 1–' + FREE_RANKS + ' of the priority list, in full</li>' +
      '<li>Every mechanism explained, every source linked</li>' +
      '<li>No account, no email required</li>' +
      '</ul>' +
      '<a class="btn btn-ghost" href="#/rooms">Browse free</a>' +
      '</div>' +
      '<div class="tier is-paid">' +
      '<p class="tier-name">Member</p>' +
      '<p class="tier-price">' + esc(SUBSCRIPTION.price) +
      '<small>' + esc(SUBSCRIPTION.priceUnit) + '</small></p>' +
      '<ul>' +
      '<li>The complete priority list, ranks 1–' + TOTAL_HOTSPOTS + '</li>' +
      '<li>Verified product picks, with the reason each one qualifies</li>' +
      '<li>Quarterly re-verification when formulations change</li>' +
      '<li>' + SUBSCRIPTION.trialDays + ' days free. Cancel any time, in one click</li>' +
      '</ul>' +
      (isMember
        ? '<p class="tier-active">◆ Your membership is active. <button type="button" class="linklike" data-signout>Sign out on this device</button></p>'
        : '<button type="button" class="btn btn-primary" data-checkout>' + esc(SUBSCRIPTION.cta) + '</button>' +
          '<p class="gate-note">' + esc(SUBSCRIPTION.note) + '</p>' +
          '<p class="form-error" data-checkout-error hidden></p>') +
      '</div></div>';
  }

  function viewPriority() {
    setMeta(
      'The priority list — ' + SITE_NAME,
      'All ' + TOTAL_HOTSPOTS + ' household PFAS hotspots, ranked by exposure. Frequency times directness.'
    );
    return '<header class="hero is-compact">' +
      '<p class="eyebrow">The priority list</p>' +
      '<h1 tabindex="-1">Ranked by exposure, not by alarm.</h1>' +
      '<p class="hero-sub">Frequency times directness. Something you touch daily and put in your mouth outranks something you wear twice a month. The kitchen and the bedroom lead, because that is where contact is longest.</p>' +
      '</header>' +
      '<section class="block is-flush">' + ladder() + '</section>';
  }

  function viewRooms() {
    setMeta('Hotspots by room — ' + SITE_NAME,
      'Every PFAS hotspot in an ordinary home, organised by the room you would find it in. Free to read.');
    return '<header class="hero is-compact">' +
      '<p class="eyebrow">By room</p>' +
      '<h1 tabindex="-1">Every hotspot, where you’d find it.</h1>' +
      '<p class="hero-sub">' + TOTAL_HOTSPOTS + ' entries across ' + HOTSPOT_ROOMS.length +
      ' rooms, ordered by rank within each. All free.</p>' +
      '</header>' +
      '<section class="block is-flush">' + rooms() + '</section>';
  }

  function viewPicks() {
    setMeta('Verified picks — ' + SITE_NAME,
      'Product swaps that clear the standard, each with the reason it qualifies.');

    var head = '<header class="hero is-compact">' +
      '<p class="eyebrow">Verified picks</p>' +
      '<h1 tabindex="-1">Products that clear the standard.</h1>' +
      '<p class="hero-sub">Each pick names why it qualifies, not just what it is.</p>' +
      '</header>';

    var free = freeProductKeys();
    var keys = Object.keys(PRODUCTS);
    var open = keys.filter(function (k) { return !categoryHeld(k); });
    var held = keys.filter(categoryHeld);

    var body = provisionalNote(open.map(function (k) { return PRODUCTS[k]; }));

    body += open.map(function (key) {
      var cat = PRODUCTS[key];
      return '<section class="block"><div class="block-head"><h2>' + esc(cat.title) + '</h2></div>' +
        productSection(cat, key) + '</section>';
    }).join('');

    if (held.length) {
      body += '<section class="block is-flush">' +
        gateBlock(held.length + ' more categories',
          'Picks for ranks ' + (FREE_RANKS + 1) + '–' + TOTAL_HOTSPOTS +
          ' — floss, bedding, air, outerwear and the rest — each with the mechanism it interrupts.') +
        '</section>';
    }

    body += disclosureLine('Verify current labels before buying.');

    return head + body;
  }

  function viewMembership() {
    if (!MEMBERSHIP_LIVE) {
      setMeta('Membership — ' + SITE_NAME, 'The whole guide is open. A paid tier is coming.');
      return '<header class="hero is-compact">' +
        '<p class="eyebrow">Membership</p>' +
        '<h1 tabindex="-1">Nothing is behind a paywall yet.</h1>' +
        '<p class="hero-sub">All ' + TOTAL_HOTSPOTS + ' hotspots, the full ranked list and every ' +
        'product pick are open to everyone. When a paid tier opens, the free guide keeps the room ' +
        'library and the top ' + FREE_RANKS + ' ranked swaps in full.</p>' +
        '<div class="hero-actions">' +
        '<a class="btn btn-primary" href="#/priority">See the ranked list</a>' +
        '<a class="btn btn-ghost" href="#/picks">Browse the picks</a>' +
        '</div></header>';
    }
    setMeta('Membership — ' + SITE_NAME,
      'Free gets you the room library and the top three swaps. Membership unlocks the full ranked list.');
    return '<header class="hero is-compact">' +
      '<p class="eyebrow">Membership</p>' +
      '<h1 tabindex="-1">Free gets you started. Membership finishes the job.</h1>' +
      '<p class="hero-sub">No account needed to read the room library or the top ' + FREE_RANKS +
      ' swaps. Membership unlocks the full ranked list and every verified pick.</p>' +
      '</header>' +
      '<section class="block is-flush">' + plan() + '</section>';
  }

  function viewDetail(roomId, itemId) {
    var hit = findHotspot(roomId, itemId);
    if (!hit) return viewNotFound();

    var room = hit.room;
    var item = hit.item;
    var tier = tierOf(item.exposure);
    var gated = isHeld(item.rank);

    setMeta(
      item.label + ' and PFAS — ' + SITE_NAME,
      item.detail + ' Rank ' + item.rank + ' of ' + TOTAL_HOTSPOTS + ' by exposure, with what to swap instead.'
    );

    var backTarget = lastListView === 'priority' ? '#/priority'
      : lastListView === 'rooms' ? '#/rooms' : '#/';
    var backLabel = lastListView === 'priority' ? 'Priority list'
      : lastListView === 'rooms' ? 'By room' : 'Home';

    if (gated) {
      return '<a class="backlink" href="' + backTarget + '">← ' + esc(backLabel) + '</a>' +
        '<header class="detail-head">' +
        '<p class="detail-room">' + esc(room.label) + ' · Rank ' + item.rank + ' of ' + TOTAL_HOTSPOTS + '</p>' +
        '<h1 tabindex="-1">' + esc(item.label) + '</h1>' +
        '<div class="detail-signal">' + signalMeter(item.exposure) + signalText(item.exposure) + '</div>' +
        '<p class="detail-hint">' + esc(item.detail) + '</p>' +
        '</header>' +
        '<section class="block is-flush">' +
        gateBlock('This one is for members',
          'Ranks 1–' + FREE_RANKS + ' are free in full. This is rank ' + item.rank +
          ' — membership opens it, along with the other ' + (TOTAL_HOTSPOTS - FREE_RANKS - 1) + '.') +
        '</section>';
    }

    var cat = item.productKey ? PRODUCTS[item.productKey] : null;
    var picks;

    // Reaching here means the hotspot itself is visible — a free rank, or a
    // member. Picks are shown either way: the paid tier is the ranked list,
    // not the existence of a shopping link.
    if (!cat) {
      picks = '<p class="muted-note">No product swap for this one — the fix is behavioural, ' +
        'and the alternatives above are the whole answer.</p>';
    } else {
      picks = provisionalNote([cat]) +
        productSection(cat, item.productKey) + disclosureLine('Verify current labels before buying.');
    }

    return '<a class="backlink" href="' + backTarget + '">← ' + esc(backLabel) + '</a>' +
      '<header class="detail-head">' +
      '<p class="detail-room">' + esc(room.label) + ' · Rank ' + item.rank + ' of ' + TOTAL_HOTSPOTS + '</p>' +
      '<h1 tabindex="-1">' + esc(item.label) + '</h1>' +
      '<div class="detail-signal">' + signalMeter(item.exposure) + signalText(item.exposure) +
      familyTags(item.families) + '</div>' +
      '<p class="detail-hint">' + esc(tier.hint) + '</p>' +
      (item.notPfas ? '<p class="relabel">' + esc(NOT_PFAS_NOTE) + '</p>' : '') +
      '</header>' +
      (item.callout ? '<aside class="callout"><h2>' + esc(item.callout.title) + '</h2><p>' +
        esc(item.callout.body) + '</p></aside>' : '') +
      '<div class="detail-grid">' +
      '<section class="dsec"><h2>How it gets to you</h2><p>' + esc(item.why) + '</p></section>' +
      '<section class="dsec"><h2>What to do instead</h2><ul class="swaps">' +
      item.alternatives.map(function (a) { return '<li>' + esc(a) + '</li>'; }).join('') +
      '</ul></section>' +
      '<section class="dsec is-span"><h2>Verified picks</h2>' + picks + '</section>' +
      '</div>';
  }

  function viewAbout() {
    setMeta('About — ' + SITE_NAME, 'What ' + SITE_NAME + ' is and how to use it.');
    return '<header class="hero is-compact">' +
      '<p class="eyebrow">About</p>' +
      '<h1 tabindex="-1">What this is, and how to use it.</h1>' +
      '</header>' +
      '<section class="block is-flush"><div class="prose">' +
      '<p><strong>' + esc(SITE_NAME) + '</strong> finds where PFAS — "forever chemicals" — show up in an ordinary home, ' +
      'and ranks the swaps that reduce exposure first. It leads with PFAS, and flags the neighbours that live in the ' +
      'same objects: microplastics, and the bisphenols and phthalates used in liners and coatings.</p>' +
      '<p>Content is organised by exposure, not by fear. Ranking is frequency times directness, weighted toward the kitchen ' +
      'and the bedroom — the two rooms where contact is daily and prolonged. The ranking is editorial: a person decides ' +
      'that a water filter outranks a rain jacket, and the reasoning is on every page.</p>' +
      '<p>The room library and the top ' + FREE_RANKS + ' ranked swaps are free. Membership opens the full ranked list ' +
      'and the verified product picks.</p>' +
      '<p>Picks favour options publicly marketed as PFAS-free or lower-PFAS, but formulations and labels change. ' +
      'Always verify current product claims before you buy.</p>' +
      '<p><strong>Contact:</strong> <span id="about-contact">—</span></p>' +
      '</div></section>';
  }

  function viewPrivacy() {
    setMeta('Privacy — ' + SITE_NAME, 'How ' + SITE_NAME + ' handles your information.');
    return '<header class="hero is-compact">' +
      '<p class="eyebrow">Privacy</p>' +
      '<h1 tabindex="-1">How this site handles your information.</h1>' +
      '<p class="hero-sub">Last updated September 2026.</p>' +
      '</header>' +
      '<section class="block is-flush"><div class="prose">' +

      '<p><strong>No account, no profile.</strong> There is no login, no username and no password. ' +
      'We do not ask for your name or address, and there is no comment system.</p>' +

      '<p><strong>Membership and payment.</strong> Membership is a recurring subscription handled entirely by ' +
      '<a href="https://stripe.com/privacy" target="_blank" rel="noopener noreferrer">Stripe</a>. ' +
      'Payment details are entered on Stripe’s own checkout page and are never seen by, or stored on, this site. ' +
      'Stripe tells us whether a subscription is active; it does not give us your card details.</p>' +

      '<p><strong>Cookies and local storage.</strong> This site uses both, for one purpose. When you subscribe, ' +
      'we set a single signed <code>HttpOnly</code> cookie recording that your subscription was active when we last ' +
      'checked. It expires after 24 hours and is renewed only by re-checking with Stripe. We also store one value in ' +
      'your browser’s local storage — whether you were a member last time — purely so the page does not flicker ' +
      'while it asks the server. Neither is used for advertising, analytics or tracking you across sites.</p>' +

      '<p><strong>Amazon links.</strong> Product links open Amazon.com in a new tab, and Amazon’s privacy policy ' +
      'applies once you leave. We use an Amazon Associates tracking ID, so Amazon may associate your visit with this site. ' +
      esc(AMAZON_DISCLOSURE) + '</p>' +

      '<p><strong>Hosting.</strong> The site runs on Vercel, which processes standard server logs — such as IP address ' +
      'and browser type — as described in Vercel’s privacy policy.</p>' +

      '<p><strong>Changes.</strong> This policy is updated whenever the site’s behaviour changes.</p>' +

      '<p><strong>Questions:</strong> <span id="privacy-contact">—</span></p>' +
      '</div></section>';
  }

  function viewNotFound() {
    setMeta('Not found — ' + SITE_NAME, 'That page does not exist.');
    return '<header class="hero is-compact">' +
      '<p class="eyebrow">404</p>' +
      '<h1 tabindex="-1">That page doesn’t exist.</h1>' +
      '<p class="hero-sub">It may have been renamed. The priority list is the best place to start.</p>' +
      '<div class="hero-actions"><a class="btn btn-primary" href="#/priority">Priority list</a>' +
      '<a class="btn btn-ghost" href="#/">Home</a></div>' +
      '</header>';
  }

  /* ── Routing ───────────────────────────────────────────── */

  function parseHash() {
    var raw = (window.location.hash || '').replace(/^#\/?/, '');
    var parts = raw.split('/').filter(Boolean);

    if (!parts.length) return { view: 'home' };
    if (parts[0] === 'swap' && parts[1] && parts[2]) {
      return { view: 'detail', room: parts[1], item: parts[2] };
    }
    if (['priority', 'rooms', 'picks', 'membership', 'about', 'privacy'].indexOf(parts[0]) !== -1) {
      return { view: parts[0] };
    }
    return { view: 'notfound' };
  }

  function render() {
    var r = currentRoute;
    var html;

    switch (r.view) {
      case 'priority':   html = viewPriority(); break;
      case 'rooms':      html = viewRooms(); break;
      case 'picks':      html = viewPicks(); break;
      case 'membership': html = viewMembership(); break;
      case 'about':      html = viewAbout(); break;
      case 'privacy':    html = viewPrivacy(); break;
      case 'detail':     html = viewDetail(r.room, r.item); break;
      case 'notfound':   html = viewNotFound(); break;
      default:           html = viewHome();
    }

    app.innerHTML = html;
    app.classList.toggle('is-detail', r.view === 'detail');

    fillContacts();
    markCurrentNav(r.view);
    updateMemberBadge();
  }

  function route(opts) {
    var prev = currentRoute.view;
    currentRoute = parseHash();

    if (currentRoute.view !== 'detail') lastListView = currentRoute.view;

    render();

    if (!opts || !opts.initial) {
      window.scrollTo(0, 0);
      // Move focus to the new view's heading so keyboard and screen
      // reader users land in the content, not on the old page.
      var h = app.querySelector('h1');
      if (h) h.focus({ preventScroll: true });
    }
    if (prev !== currentRoute.view) showCheckoutError('');
  }

  function markCurrentNav(view) {
    var key = view === 'detail' ? lastListView : view;
    document.querySelectorAll('[data-nav]').forEach(function (link) {
      if (link.dataset.nav === key) link.setAttribute('aria-current', 'page');
      else link.removeAttribute('aria-current');
    });
  }

  function updateMemberBadge() {
    var txt = isMember ? 'Member' : 'Not a member';
    document.querySelectorAll('[data-member-badge]').forEach(function (node) {
      node.hidden = !MEMBERSHIP_LIVE;
      node.textContent = txt;
      node.classList.toggle('is-on', isMember);
    });
  }

  function fillContacts() {
    var email = (SITE_CONTACT_EMAIL || '').trim();
    ['about-contact', 'privacy-contact'].forEach(function (id) {
      var node = el(id);
      if (!node) return;
      if (email) node.innerHTML = '<a href="mailto:' + esc(email) + '">' + esc(email) + '</a>';
      else node.textContent = 'Set SITE_CONTACT_EMAIL in js/data.js';
    });
  }

  function initSiteChrome() {
    var d = el('footer-disclosure');
    if (d) d.textContent = AMAZON_DISCLOSURE;
    var h = el('footer-health');
    if (h) h.textContent = HEALTH_DISCLAIMER;
  }

  /* ── Events ────────────────────────────────────────────── */

  document.addEventListener('click', function (e) {
    var toggle = e.target.closest('[data-room-toggle]');
    if (toggle) {
      var id = toggle.dataset.roomToggle;
      openRoom = openRoom === id ? null : id;
      render();
      var again = document.querySelector('[data-room-toggle="' + id + '"]');
      if (again) again.focus({ preventScroll: true });
      return;
    }

    var sortChip = e.target.closest('[data-sort]');
    if (sortChip) {
      e.preventDefault();
      sortBy[sortChip.dataset.cat] = sortChip.dataset.sort;
      render();
      var again = document.querySelector('[data-sort="' + sortChip.dataset.sort +
        '"][data-cat="' + sortChip.dataset.cat + '"]');
      if (again) again.focus({ preventScroll: true });
      return;
    }

    if (e.target.closest('[data-checkout]')) {
      e.preventDefault();
      startCheckout();
      return;
    }

    if (e.target.closest('[data-signout]')) {
      e.preventDefault();
      signOut();
      return;
    }
  });

  window.addEventListener('hashchange', function () { route(); });

  /* ── Boot ──────────────────────────────────────────────── */

  initSiteChrome();
  currentRoute = parseHash();
  if (currentRoute.view !== 'detail') lastListView = currentRoute.view;
  render();

  handleCheckoutReturn()
    .then(refreshMemberStatus)
    .then(function () { render(); });
})();
