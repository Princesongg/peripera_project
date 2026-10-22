/* 기존 화면의 인터랙션을 브라우저 기본 API로 구현합니다. */
(() => {
  'use strict';
  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
  const reduced = () => matchMedia('(prefers-reduced-motion: reduce)').matches;
  const clamp = value => Math.max(0, Math.min(1, value));
  const updates = [];
  let pending = false;
  const schedule = () => {
    if (pending) return;
    pending = true;
    requestAnimationFrame(() => { pending = false; updates.forEach(update => update()); });
  };
  window.addEventListener('scroll', schedule, { passive: true });
  window.addEventListener('resize', schedule);

  // 첫 화면: 자동으로 콜라주를 완성하고 Tap Me로 다시 재생합니다.
  const hero = $('.hero');
  const tap = $('.hero__tap');
  const art = $('.hero__art');
  const reveals = [
    ['lips', false], ['model', true],
    ['model-second', true], ['heart', true],
    ['heart-blue', true], ['products', false],
  ];
  const mobileHero = matchMedia('(max-width: 700px)');
  const mobileReveals = [reveals[0], reveals[2], reveals[1], ...reveals.slice(3)];
  const shown = new Set();
  let reveal = 0;
  let heroTimer;
  let playback = 0;
  const heroReady = Promise.all(reveals.map(([name]) => {
    const img = new Image();
    img.src = `./images/hero-${name}.png`;
    return img.decode().catch(() => {});
  }));
  const revealNext = () => {
    if (reveal >= reveals.length) return;
    const sequence = mobileHero.matches ? mobileReveals : reveals;
    const [name, wrapped] = sequence.find(([name]) => !shown.has(name));
    shown.add(name);
    reveal++;
    const img = document.createElement('img');
    img.src = `./images/hero-${name}.png`; img.alt = ''; img.draggable = false;
    const node = wrapped ? document.createElement('div') : img;
    node.className = `hero__${name}`;
    if (wrapped) node.append(img);
    art.append(node);
    hero.dataset.reveal = String(reveal);
    if (reveal < reveals.length) {
      if (reduced()) revealNext();
      else heroTimer = setTimeout(revealNext, 550);
    }
  };
  const playHero = async () => {
    const currentPlayback = ++playback;
    clearTimeout(heroTimer);
    reveals.forEach(([name]) => $(`.hero__${name}`, art)?.remove());
    shown.clear();
    reveal = 0;
    hero.dataset.reveal = '0';
    await heroReady;
    if (currentPlayback !== playback) return;
    if (reduced()) revealNext();
    else heroTimer = setTimeout(revealNext, 450);
  };
  hero.addEventListener('click', event => { if (!event.target.closest('button, a, input, nav')) playHero(); });
  tap.addEventListener('click', playHero);
  const hideTap = () => {
    tap.style.removeProperty('left');
    tap.style.removeProperty('top');
  };
  hero.addEventListener('pointermove', event => {
    if (event.pointerType !== 'mouse' || mobileHero.matches) return;
    if (event.target.closest('header, nav')) { hideTap(); return; }
    const bounds = hero.getBoundingClientRect();
    tap.style.left = `${Math.max(0, Math.min(event.clientX - bounds.left + 16, hero.clientWidth - tap.offsetWidth))}px`;
    tap.style.top = `${Math.max(0, Math.min(event.clientY - bounds.top + 12, hero.clientHeight - tap.offsetHeight))}px`;
  });
  hero.addEventListener('pointerleave', hideTap);
  window.addEventListener('blur', hideTap);
  window.addEventListener('resize', hideTap);
  playHero();
  const menu = $('.hero__menu');
  const nav = document.createElement('nav');
  nav.id = 'hero-navigation'; nav.className = 'hero__navigation'; nav.hidden = true;
  nav.setAttribute('aria-label', '메인 메뉴');
  nav.innerHTML = '<a href="#main">peripera 홈</a><button type="button">닫기</button>';
  hero.append(nav);
  const toggleMenu = open => { nav.hidden = !open; menu.setAttribute('aria-expanded', String(open)); menu.setAttribute('aria-label', open ? '메뉴 닫기' : '메뉴 열기'); };
  menu.addEventListener('click', () => toggleMenu(nav.hidden));
  nav.addEventListener('click', () => toggleMenu(false));
  $('.hero__logo').addEventListener('click', () => toggleMenu(false));
  document.addEventListener('keydown', event => { if (event.key === 'Escape') toggleMenu(false); });

  // 가로 제품 목록 드래그.
  const collection = $('.con1__viewport');
  let collectionScale;
  new ResizeObserver(() => requestAnimationFrame(() => {
    const scale = Math.max(collection.clientWidth / 1920, .45);
    const position = collectionScale ? collection.scrollLeft / collectionScale : 1084;
    collection.style.setProperty('--con1-scale', scale);
    collection.scrollLeft = position * scale; collectionScale = scale;
  })).observe(collection);
  let collectionDrag = null;
  collection.addEventListener('pointerdown', event => {
    if (event.pointerType !== 'mouse' || event.button !== 0) return;
    collectionDrag = { x: event.clientX, scroll: collection.scrollLeft };
    collection.classList.add('con1__viewport--dragging');
  });
  collection.addEventListener('pointermove', event => {
    if (!collectionDrag) return;
    const distance = event.clientX - collectionDrag.x;
    if (Math.abs(distance) > 6) { collection.setPointerCapture(event.pointerId); collection.scrollLeft = collectionDrag.scroll - distance; }
  });
  const stopCollection = event => {
    collectionDrag = null; collection.classList.remove('con1__viewport--dragging');
    if (collection.hasPointerCapture(event.pointerId)) collection.releasePointerCapture(event.pointerId);
  };
  collection.addEventListener('pointerup', stopCollection);
  collection.addEventListener('pointercancel', stopCollection);
  collection.addEventListener('pointerleave', event => { if (!collection.hasPointerCapture(event.pointerId)) stopCollection(event); });
  const brand = $('.brand');
  let brandVisible = false, brandReady = false;
  const showBrand = () => brand.classList.toggle('brand--visible', brandVisible && brandReady);
  Promise.allSettled($$('img', brand).map(img => img.decode())).then(() => { brandReady = true; showBrand(); });
  const brandObserver = new IntersectionObserver(([entry]) => {
    if (entry.isIntersecting) { brandVisible = true; showBrand(); brandObserver.disconnect(); }
  }, { rootMargin: '0px 0px -35% 0px', threshold: .12 });
  brandObserver.observe(brand);

  // 추천 카드의 회전 배치, 휠, 드래그, 방향키 이동.
  const card = $('.card'), cardViewport = $('.card__viewport'), cursor = $('.card__cursor');
  const items = $$('.card__item');
  const slots = [[-31.571,487.1125],[439.392,267.409],[960.5,192],[1482.392,274.409],[1952.429,489.1125]];
  const wrap = value => ((value % items.length) + items.length) % items.length;
  const relative = (index, current) => wrap(index - current + 2.5) - 2.5;
  let current = 2, drag = 0, dragging = false, cardPointer = null, suppressCard = false;
  const renderCards = () => {
    card.classList.toggle('card--dragging', dragging);
    items.forEach((item, index) => {
      const offset = relative(index, current - drag), point = offset + 2;
      const lower = Math.max(0, Math.min(3, Math.floor(point))), amount = point - lower;
      const [left, top] = slots[lower].map((value, axis) => value + (slots[lower + 1][axis] - value) * amount);
      item.style.left = `${left}px`; item.style.top = `${top}px`;
      item.style.setProperty('--card-angle', `${offset * 15}deg`); item.style.zIndex = 10 - Math.round(Math.abs(offset) * 2);
      const selected = index === wrap(current);
      item.classList.toggle('card__item--active', selected && !dragging);
      $('.card__photo', item).setAttribute('aria-pressed', String(selected));
      $('.card__photo', item).setAttribute('aria-label', `${$('img', item).alt}${selected ? ', 선택됨' : ' 선택'}`);
      $('.card__caption', item).setAttribute('aria-hidden', String(!selected));
    });
    $('.card__count').textContent = `${wrap(current) + 1} / ${items.length}`;
    $('.card__sr-only').textContent = `${$('.card__photo img', items[wrap(current)]).alt}. ${wrap(current) + 1}번째 추천 제품, 총 ${items.length}개.`;
  };
  const step = amount => { current += amount; renderCards(); };
  let wheelDistance = 0, lastWheelAt = 0, wheelLockedUntil = 0;
  cardViewport.addEventListener('wheel', event => {
    if (event.ctrlKey || cardPointer || !event.cancelable) return;
    // 카드가 펼쳐진 뒤에만 휠을 받아 진입 스크롤을 방해하지 않습니다.
    if (parseFloat(getComputedStyle(card).getPropertyValue('--card-reveal')) < .95) return;
    const delta = Math.abs(event.deltaX) > Math.abs(event.deltaY) ? event.deltaX : event.deltaY;
    if (!delta) return;
    const now = performance.now();
    if (now < wheelLockedUntil) {
      event.preventDefault();
      return;
    }
    const direction = Math.sign(delta), index = wrap(current);
    // 양 끝에서는 페이지 스크롤로 이어집니다. NEXT / PREV는 계속 순환합니다.
    if ((direction < 0 && index === 0) || (direction > 0 && index === items.length - 1)) {
      wheelDistance = 0;
      return;
    }
    event.preventDefault();
    if (now - lastWheelAt > 180 || Math.sign(wheelDistance) !== direction) wheelDistance = 0;
    lastWheelAt = now;
    const unit = event.deltaMode === 1 ? 16 : event.deltaMode === 2 ? innerHeight : 1;
    wheelDistance += delta * unit;
    if (Math.abs(wheelDistance) < 35) return;
    wheelDistance = 0;
    wheelLockedUntil = now + (reduced() ? 250 : 650);
    step(direction);
  }, { passive: false });
  new ResizeObserver(() => requestAnimationFrame(() => { card.style.setProperty('--card-scale', Math.max(card.clientWidth / 1920, .55)); schedule(); })).observe(card);
  cardViewport.addEventListener('pointerdown', event => { if (event.button !== 0 || event.target.closest('.card__controls')) return; suppressCard = false; cardPointer = { x: event.clientX }; });
  cardViewport.addEventListener('pointermove', event => {
    const b = cardViewport.getBoundingClientRect();
    if (event.pointerType === 'mouse') {
      cursor.style.left = `${event.clientX - b.left}px`; cursor.style.top = `${event.clientY - b.top}px`;
      cursor.classList.add('card__cursor--visible');
      $('.cloud-badge__label', cursor).textContent = dragging ? 'DRAG' : event.clientX - b.left < b.width / 2 ? 'PREV' : 'NEXT';
    }
    if (!cardPointer) return;
    const distance = event.clientX - cardPointer.x;
    if (Math.abs(distance) < 6 && !suppressCard) return;
    suppressCard = true; dragging = true; cardViewport.setPointerCapture(event.pointerId);
    const scale = parseFloat(getComputedStyle(card).getPropertyValue('--card-scale'));
    drag = Math.max(-1.9, Math.min(1.9, distance / (521 * scale))); renderCards();
  });
  const endCard = event => {
    if (!cardPointer) return;
    const distance = event.clientX - cardPointer.x;
    if (event.type !== 'pointercancel') current += Math.round(-drag) || (Math.abs(distance) > 55 ? -Math.sign(distance) : 0);
    cardPointer = null; drag = 0; dragging = false; renderCards();
    if (cardViewport.hasPointerCapture(event.pointerId)) cardViewport.releasePointerCapture(event.pointerId);
  };
  cardViewport.addEventListener('pointerup', endCard); cardViewport.addEventListener('pointercancel', endCard);
  const hideCursor = () => cursor.classList.remove('card__cursor--visible');
  cardViewport.addEventListener('pointerleave', hideCursor); window.addEventListener('blur', hideCursor); window.addEventListener('scroll', hideCursor, { passive: true });
  cardViewport.addEventListener('click', event => {
    if (suppressCard) { event.preventDefault(); suppressCard = false; return; }
    if (event.detail > 0 && cursor.classList.contains('card__cursor--visible')) {
      const b = cardViewport.getBoundingClientRect(); step(event.clientX - b.left < b.width / 2 ? -1 : 1); return;
    }
    const item = event.target.closest('.card__item');
    if (item) step(Math.round(relative(items.indexOf(item), current)));
  });
  cardViewport.addEventListener('keydown', event => { if (['ArrowRight','ArrowLeft'].includes(event.key)) { event.preventDefault(); step(event.key === 'ArrowRight' ? 1 : -1); } });
  updates.push(() => {
    const progress = reduced() ? 1 : clamp((innerHeight - card.parentElement.getBoundingClientRect().top) / innerHeight);
    const eased = progress * progress * (3 - 2 * progress);
    const width = card.clientWidth, radius = width * .16 * Math.pow(25, eased);
    const left = width / 2 - radius, right = width / 2 + radius, bottom = Math.max(card.offsetHeight, radius + 1);
    card.style.setProperty('--card-pin-top', `${-75 * (parseFloat(getComputedStyle(card).getPropertyValue('--card-scale')) || 1)}px`);
    card.style.clipPath = progress >= 1 ? 'none' : `path('M ${left} ${radius} A ${radius} ${radius} 0 0 1 ${right} ${radius} L ${right} ${bottom} L ${left} ${bottom} Z')`;
    card.style.setProperty('--card-reveal', clamp((progress - .65) / .3));
  });
  renderCards();

  // 타이핑 효과와 PLAY / YOUR / COLOR 카드 등장.
  const typeLetters = (letters, count, prefix, typing) => letters.forEach((letter, index) => {
    letter.classList.toggle(`${prefix}__letter--visible`, index < count);
    letter.classList.toggle(`${prefix}__letter--cursor`, typing && count < letters.length && index === Math.max(0, count - 1));
  });
  const text = $('.text'), headline = $$('.text__letter');
  const textObserver = new IntersectionObserver(([entry]) => {
    if (!entry.isIntersecting) return;
    textObserver.disconnect(); let count = 0;
    const type = () => {
      count = reduced() ? headline.length : count + 1;
      typeLetters(headline, count, 'text', true);
      text.classList.toggle('text--complete', count === headline.length);
      if (count < headline.length) setTimeout(type, headline[count - 1].textContent === ' ' ? 145 : 75);
    };
    setTimeout(type, reduced() ? 0 : 300);
  }, { threshold: .35 }); textObserver.observe(text);
  $$('.play').forEach(section => {
    const angle = section.classList.contains('color') ? 1.37 : section.classList.contains('your') ? 8.33 : -3.98;
    let start = null;
    updates.push(() => {
      const b = section.getBoundingClientRect(), next = section.nextElementSibling;
      section.style.setProperty('--play-pin-top', `${Math.min(0, innerHeight - section.offsetHeight)}px`);
      const covered = next?.classList.contains('play') && next.getBoundingClientRect().top <= innerHeight * .15;
      const presenting = mobileHero.matches
        ? b.top <= innerHeight * .75 && b.bottom > 0
        : b.top <= innerHeight * .15 && b.bottom >= innerHeight * .85 && !covered;
      if (!presenting) start = null;
      else if (start === null) start = performance.now();
      const elapsed = start === null ? 0 : performance.now() - start;
      const progress = reduced() ? 1 : clamp(elapsed / 1450), eased = 1 - Math.pow(1 - progress, 3);
      section.style.setProperty('--play-rise', `${reduced() ? 0 : (1 - eased) * 75}vh`);
      section.style.setProperty('--play-rotation', `${reduced() ? angle : 18 + eased * (angle - 18)}deg`);
      section.style.setProperty('--play-scale', reduced() ? 1 : .86 + eased * .14);
      const titleProgress = reduced() ? 1 : clamp((elapsed - 180) / 1100);
      section.style.setProperty('--play-title-opacity', 1 - Math.pow(1 - titleProgress, 2));
      if (presenting && (progress < 1 || titleProgress < 1)) schedule();
    });
    const more = $('.play__more', section);
    const notice = document.createElement('small'); notice.className = 'play__notice'; notice.hidden = true; notice.setAttribute('role', 'status'); notice.textContent = '개인 포트폴리오용으로 제작된 페이지입니다.';
    more.after(notice);
    more.addEventListener('click', () => { notice.hidden = !notice.hidden; more.setAttribute('aria-expanded', String(!notice.hidden)); });
  });
  const mood = $('.mood-marquee'), transition = $('.mood-transition');
  new IntersectionObserver(([entry]) => mood.classList.toggle('mood-marquee--playing', entry.isIntersecting)).observe(mood);
  updates.push(() => {
    const progress = reduced() || mobileHero.matches ? 1 : clamp(-transition.getBoundingClientRect().top / (innerHeight * .75));
    const eased = progress * progress * (3 - 2 * progress);
    mood.style.clipPath = progress >= 1 ? 'none' : `inset(0 ${(1 - eased) * 50}%)`;
    mood.style.setProperty('--mood-reveal', clamp((progress - .2) / .65));
    const sections = $$('.text-play > section');
    sections.forEach((section, index) => {
      const next = sections[index + 1];
      const covered = next ? clamp(next.classList.contains('mood-transition') ? -next.getBoundingClientRect().top / (innerHeight * .75) : 1 - next.getBoundingClientRect().top / innerHeight) : 0;
      section.style.setProperty('--stack-dim', covered * .32);
    });
  });

  // Instagram 갤러리: 자동 순환 및 드래그.
  const gallery = $('.pre-footer__viewport'), track = $('.pre-footer__track');
  let slide = 10, galleryPointer = null, resetTimer;
  const renderGallery = (distance = 0, moving = true) => {
    track.style.setProperty('--slide-index', slide); track.style.setProperty('--drag-distance', `${distance}px`);
    track.style.transition = moving ? '' : 'none';
  };
  const normalizeGallery = () => {
    if (slide >= 7 && slide < 14) return;
    slide = ((slide % 7) + 7) % 7 + 7; renderGallery(0, false);
    requestAnimationFrame(() => requestAnimationFrame(() => renderGallery()));
  };
  const moveGallery = amount => {
    clearTimeout(resetTimer); normalizeGallery(); slide += amount; renderGallery();
    resetTimer = setTimeout(normalizeGallery, reduced() ? 0 : 350);
  };
  track.addEventListener('transitionend', event => { if (event.target === track) normalizeGallery(); });
  setInterval(() => { if (!galleryPointer && !reduced() && !document.hidden && !gallery.matches(':hover') && !gallery.contains(document.activeElement)) moveGallery(1); }, 1800);
  gallery.addEventListener('keydown', event => { if (['ArrowRight','ArrowLeft'].includes(event.key)) { event.preventDefault(); moveGallery(event.key === 'ArrowRight' ? 1 : -1); } });
  gallery.addEventListener('pointerdown', event => {
    if (event.button !== 0 || event.target.closest('a')) return;
    clearTimeout(resetTimer); normalizeGallery(); galleryPointer = { x: event.clientX };
    gallery.setPointerCapture(event.pointerId); gallery.classList.add('pre-footer__viewport--dragging');
  });
  gallery.addEventListener('pointermove', event => { if (galleryPointer) renderGallery(event.clientX - galleryPointer.x, false); });
  const finishGallery = event => {
    if (!galleryPointer) return;
    const distance = event.clientX - galleryPointer.x; galleryPointer = null;
    gallery.classList.remove('pre-footer__viewport--dragging');
    if (event.type !== 'pointercancel' && Math.abs(distance) > 35) moveGallery(distance < 0 ? 1 : -1); else renderGallery();
    if (gallery.hasPointerCapture(event.pointerId)) gallery.releasePointerCapture(event.pointerId);
  };
  gallery.addEventListener('pointerup', finishGallery); gallery.addEventListener('pointercancel', finishGallery);
  renderGallery();

  const top = $('.top-button');
  top.addEventListener('click', () => window.scrollTo({ top: 0, behavior: reduced() ? 'instant' : 'smooth' }));
  updates.push(() => {
    const b = top.getBoundingClientRect(); let inverse = false;
    for (const layer of document.elementsFromPoint(b.left + b.width / 2, b.top + b.height / 2)) {
      if (top.contains(layer)) continue;
      const values = getComputedStyle(layer).backgroundColor.match(/[\d.]+/g)?.map(Number);
      if (!values || (values.length === 4 && values[3] < .5)) continue;
      const [r,g,blue] = values;
      inverse = (.2126*r + .7152*g + .0722*blue) / 255 < .55 || Math.hypot(r-195,g-95,blue-123) < 100;
      break;
    }
    top.classList.toggle('top-button--inverse', inverse);
  });
  schedule();
})();
