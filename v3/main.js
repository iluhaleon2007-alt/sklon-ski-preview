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

  /* ---------- калькулятор ---------- */
  const calc = $('.calc');
  if (calc) {
    const services = {
      kids: [
        { label: '2 часа · 09:45–11:45', s: 3400, h: 3600, p: 4000 },
        { label: '2 часа · 12:00–14:00', s: 3200, h: 3400, p: 3800 },
        { label: '2 часа · 14:00–16:00', s: 3400, h: 3600, p: 4000 },
        { label: 'Весь день · 6 часов', s: 7700, h: 8500, p: 9800 },
      ],
      solo: [
        { label: '1 час · дети', s: 3600, h: 4200, p: 4800 },
        { label: '2 часа · взрослые', s: 6600, h: 7400, p: 8600 },
      ],
      duo: [{ label: '2 часа · двое', s: 9900, h: 11100, p: 13200 }],
      group: [{ label: '1 час · за человека', s: 1500, h: 1600, p: 1700 }],
    };
    const dates = {
      s: '01.11–21.12 · 01.04–31.05',
      h: '02.01–31.01 · 11.03–31.03',
      p: '28.12–08.01 · 02.10–03.03',
    };
    const typeBtns = $$('.calc__type', calc);
    const seasonBtns = $$('.calc__season', calc);
    const select = $('#calc-service');
    const priceEl = $('#calc-price');
    const datesEl = $('#calc-dates');

    const state = { type: 'kids', index: 0, season: 's' };

    const render = () => {
      const service = services[state.type][state.index];
      priceEl.textContent = rub(service[state.season]);
      datesEl.textContent = dates[state.season];
    };

    const setType = (type) => {
      state.type = type;
      state.index = 0;
      typeBtns.forEach((b) => {
        const active = b.dataset.type === type;
        b.classList.toggle('is-active', active);
        b.setAttribute('aria-pressed', String(active));
      });
      select.innerHTML = '';
      services[type].forEach((service) => {
        const option = document.createElement('option');
        option.textContent = service.label;
        select.append(option);
      });
      select.selectedIndex = 0;
      render();
    };

    typeBtns.forEach((b) => b.addEventListener('click', () => setType(b.dataset.type)));
    select.addEventListener('change', () => {
      state.index = select.selectedIndex;
      render();
    });
    seasonBtns.forEach((b) =>
      b.addEventListener('click', () => {
        state.season = b.dataset.season;
        seasonBtns.forEach((s) => {
          const active = s === b;
          s.classList.toggle('is-active', active);
          s.setAttribute('aria-pressed', String(active));
        });
        render();
      })
    );
  }

  /* ---------- появление при скролле ---------- */
  const targets = $$('.cmp, .timetable li, .price-block, .team__media, .quote, .gallery figure');
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
