(() => {
  'use strict';

  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

  /* ---------- шапка ---------- */
  const hdr = $('.hdr');
  const onScroll = () => hdr.classList.toggle('is-scrolled', window.scrollY > 8);
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  /* ---------- мобильное меню ---------- */
  const burger = $('.burger');
  const mnav = $('#mnav');
  const mnavLinks = $$('.mnav a');
  let lastFocus = null;

  const setMenu = (open) => {
    burger.classList.toggle('is-open', open);
    mnav.classList.toggle('is-open', open);
    burger.setAttribute('aria-expanded', String(open));
    burger.setAttribute('aria-label', open ? 'Закрыть меню' : 'Открыть меню');
    mnav.setAttribute('aria-hidden', String(!open));
    document.body.style.overflow = open ? 'hidden' : '';
    if (open) {
      lastFocus = document.activeElement;
      mnavLinks[0]?.focus();
    } else if (lastFocus) {
      lastFocus.focus();
    }
  };

  burger?.addEventListener('click', () => setMenu(!mnav.classList.contains('is-open')));
  mnavLinks.forEach((a) => a.addEventListener('click', () => setMenu(false)));
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && mnav.classList.contains('is-open')) setMenu(false);
  });
  window.addEventListener('resize', () => {
    if (window.innerWidth > 900 && mnav.classList.contains('is-open')) setMenu(false);
  });

  /* ---------- сезоны и цены ---------- */
  const seasons = $$('.season');
  const prices = $$('.num');
  const rub = (n) => Number(n).toLocaleString('ru-RU') + '\u00A0₽';

  const setSeason = (key, btn) => {
    seasons.forEach((s) => {
      const active = s === btn;
      s.classList.toggle('is-active', active);
      s.setAttribute('aria-selected', String(active));
      s.tabIndex = active ? 0 : -1;
    });
    prices.forEach((cell) => {
      const value = cell.dataset[key];
      if (value) cell.textContent = rub(value);
    });
  };

  seasons.forEach((btn, i) => {
    btn.addEventListener('click', () => setSeason(btn.dataset.season, btn));
    btn.addEventListener('keydown', (e) => {
      const keys = ['ArrowRight', 'ArrowLeft', 'Home', 'End'];
      if (!keys.includes(e.key)) return;
      e.preventDefault();
      let next = i;
      if (e.key === 'ArrowRight') next = (i + 1) % seasons.length;
      if (e.key === 'ArrowLeft') next = (i - 1 + seasons.length) % seasons.length;
      if (e.key === 'Home') next = 0;
      if (e.key === 'End') next = seasons.length - 1;
      seasons[next].focus();
      setSeason(seasons[next].dataset.season, seasons[next]);
    });
  });

  /* ---------- появление при скролле ---------- */
  const targets = $$('.program__media, .day__media, .team__media, .gallery figure, .quote, .timeline li, .price-block');
  if ('IntersectionObserver' in window && !matchMedia('(prefers-reduced-motion: reduce)').matches) {
    targets.forEach((el) => el.classList.add('rv'));
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add('is-in');
          io.unobserve(entry.target);
        });
      },
      { rootMargin: '0px 0px -8% 0px', threshold: 0.04 }
    );
    targets.forEach((el) => io.observe(el));
  }

  /* ---------- форма ---------- */
  const form = $('.form');
  const phone = $('#phone');
  const note = $('.form__note');
  const consent = $('.check input');

  const setNote = (text, isError = false) => {
    note.textContent = text;
    note.classList.toggle('is-error', isError);
  };

  form?.addEventListener('submit', (e) => {
    e.preventDefault();
    const digits = phone.value.replace(/\D/g, '');

    if (digits.length < 10) {
      setNote('Проверьте номер: нужно 10 цифр.', true);
      phone.focus();
      return;
    }
    if (!consent.checked) {
      setNote('Нужно согласие на обработку данных.', true);
      consent.focus();
      return;
    }
    setNote('Спасибо! Перезвоним в течение 10 минут.');
    form.reset();
  });

  phone?.addEventListener('input', () => {
    if (note.classList.contains('is-error')) setNote('');
  });
})();
