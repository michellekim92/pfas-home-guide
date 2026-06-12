/**
 * Sunburst arc chart — editorial home hotspot map.
 * Real arc geometry, muted palette, no glow/neon clichés.
 */
const SunburstChart = (function () {
  const CFG = {
    size: 340,
    cx: 170,
    cy: 170,
    rInner: 36,
    rRoom: 88,
    rOuter: 142,
    padDeg: 1.6,
  };

  function polar(cx, cy, r, deg) {
    const rad = (deg * Math.PI) / 180;
    return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
  }

  function arcPath(cx, cy, r0, r1, a0, a1) {
    const span = a1 - a0;
    if (span >= 360) a1 = a0 + 359.98;
    const p0 = polar(cx, cy, r1, a1);
    const p1 = polar(cx, cy, r1, a0);
    const p2 = polar(cx, cy, r0, a0);
    const p3 = polar(cx, cy, r0, a1);
    const large = span <= 180 ? 0 : 1;
    return [
      'M', p0.x, p0.y,
      'A', r1, r1, 0, large, 0, p1.x, p1.y,
      'L', p2.x, p2.y,
      'A', r0, r0, 0, large, 1, p3.x, p3.y,
      'Z',
    ].join(' ');
  }

  function radialLine(cx, cy, r0, r1, deg) {
    const a = polar(cx, cy, r0, deg);
    const b = polar(cx, cy, r1, deg);
    return `M ${a.x} ${a.y} L ${b.x} ${b.y}`;
  }

  function buildSegments(rooms) {
    const n = rooms.length;
    const pad = CFG.padDeg;
    const roomSpan = (360 - pad * n) / n;
    let start = -90;
    const segments = [];

    rooms.forEach((room) => {
      const a0 = start + pad / 2;
      const a1 = start + roomSpan - pad / 2;

      segments.push({
        type: 'room',
        roomId: room.id,
        label: room.label,
        color: room.color,
        a0,
        a1,
        r0: CFG.rInner,
        r1: CFG.rRoom,
      });

      const innerSpan = a1 - a0;
      const itemSlot = innerSpan / room.items.length;

      room.items.forEach((item, idx) => {
        const ia0 = a0 + idx * itemSlot + pad / 3;
        const ia1 = a0 + (idx + 1) * itemSlot - pad / 3;
        segments.push({
          type: 'item',
          roomId: room.id,
          itemId: item.id,
          label: item.label,
          detail: item.detail,
          color: room.colorLight,
          a0: ia0,
          a1: ia1,
          r0: CFG.rRoom + 2,
          r1: CFG.rOuter,
        });
      });

      start += roomSpan;
    });

    return segments;
  }

  function render(container, rooms, onSelect) {
    const { cx, cy } = CFG;
    const segments = buildSegments(rooms);
    let selected = { roomId: rooms[0]?.id || 'kitchen', itemId: null };

    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('viewBox', `0 0 ${CFG.size} ${CFG.size}`);
    svg.setAttribute('class', 'sunburst-svg');
    svg.setAttribute('role', 'img');
    svg.setAttribute('aria-label', 'PFAS hotspots by room');

    const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
    const clip = document.createElementNS('http://www.w3.org/2000/svg', 'clipPath');
    clip.setAttribute('id', 'sunburst-clip');
    const clipCircle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    clipCircle.setAttribute('cx', cx);
    clipCircle.setAttribute('cy', cy);
    clipCircle.setAttribute('r', CFG.rOuter);
    clip.setAttribute('clipPathUnits', 'userSpaceOnUse');
    clip.appendChild(clipCircle);
    defs.appendChild(clip);
    svg.appendChild(defs);

    const gGuides = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    gGuides.setAttribute('class', 'sunburst-guides');

    [CFG.rRoom, CFG.rOuter].forEach((r) => {
      const c = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
      c.setAttribute('cx', cx);
      c.setAttribute('cy', cy);
      c.setAttribute('r', r);
      gGuides.appendChild(c);
    });

    segments
      .filter((s) => s.type === 'room')
      .forEach((seg) => {
        const line = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        line.setAttribute('d', radialLine(cx, cy, CFG.rInner, CFG.rOuter, seg.a0));
        gGuides.appendChild(line);
      });

    svg.appendChild(gGuides);

    const gItems = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    gItems.setAttribute('clip-path', 'url(#sunburst-clip)');
    const gRooms = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    gRooms.setAttribute('clip-path', 'url(#sunburst-clip)');

    segments.forEach((seg) => {
      const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      path.setAttribute('d', arcPath(cx, cy, seg.r0, seg.r1, seg.a0, seg.a1));
      path.setAttribute('class', `sunburst-seg sunburst-${seg.type}`);
      path.setAttribute('data-room', seg.roomId);
      if (seg.itemId) path.setAttribute('data-item', seg.itemId);
      path.setAttribute('fill', seg.color);
      path.setAttribute('tabindex', '0');
      path.setAttribute('role', 'button');
      path.setAttribute(
        'aria-label',
        seg.type === 'room' ? seg.label : `${seg.label} (${rooms.find((r) => r.id === seg.roomId)?.label})`
      );

      path.addEventListener('click', () => select(seg.roomId, seg.itemId || null));
      path.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          select(seg.roomId, seg.itemId || null);
        }
      });

      if (seg.type === 'room') gRooms.appendChild(path);
      else gItems.appendChild(path);
    });

    svg.appendChild(gItems);
    svg.appendChild(gRooms);

    const centerG = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    centerG.setAttribute('class', 'sunburst-center-group');

    const centerRing = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    centerRing.setAttribute('cx', cx);
    centerRing.setAttribute('cy', cy);
    centerRing.setAttribute('r', CFG.rInner);
    centerRing.setAttribute('class', 'sunburst-center-ring');
    centerG.appendChild(centerRing);

    const t1 = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    t1.setAttribute('x', cx);
    t1.setAttribute('y', cy - 1);
    t1.setAttribute('class', 'sunburst-center-title');
    t1.textContent = 'your';
    centerG.appendChild(t1);

    const t2 = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    t2.setAttribute('x', cx);
    t2.setAttribute('y', cy + 13);
    t2.setAttribute('class', 'sunburst-center-sub');
    t2.textContent = 'home';
    centerG.appendChild(t2);

    svg.appendChild(centerG);

    container.innerHTML = '';
    container.appendChild(svg);

    function updateActive() {
      svg.querySelectorAll('.sunburst-seg').forEach((p) => {
        const r = p.dataset.room;
        const i = p.dataset.item;
        const isRoom = !p.dataset.item;
        let active = r === selected.roomId;
        if (selected.itemId && i) active = i === selected.itemId;
        else if (selected.itemId && isRoom) active = false;
        p.classList.toggle('is-active', active);
        p.classList.toggle('is-dim', selected.roomId && r !== selected.roomId);
      });

      svg.querySelectorAll('.sunburst-guides path').forEach((line, idx) => {
        const seg = segments.filter((s) => s.type === 'room')[idx];
        line.classList.toggle('is-active', seg && seg.roomId === selected.roomId);
      });
    }

    function select(roomId, itemId) {
      selected = { roomId, itemId };
      updateActive();
      onSelect(roomId, itemId);
    }

    select(selected.roomId, null);
    return { select };
  }

  return { render, buildSegments };
})();
