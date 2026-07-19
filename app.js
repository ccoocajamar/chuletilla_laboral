(() => {
  const sectionNav = document.getElementById('sectionNav');
  const mobileNav = document.getElementById('mobileSectionNav');
  const mobileMenuButton = document.getElementById('mobileMenuButton');
  const mobileMenuBackdrop = document.getElementById('mobileMenuBackdrop');
  const searchInput = document.getElementById('searchInput');
  const sections = [...document.querySelectorAll('.searchable')];
  const desktopNavLinks = sectionNav ? [...sectionNav.querySelectorAll('a')] : [];
  const mobileNavLinks = mobileNav ? [...mobileNav.querySelectorAll('a')] : [];
  const navLinks = [...desktopNavLinks, ...mobileNavLinks];
  const noResults = document.getElementById('noResults');
  const backTop = document.getElementById('backTop');

  const normalize = (value) => value
    .toLocaleLowerCase('es')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');

  const closeMobileMenu = () => {
    if (!mobileMenuButton || !mobileMenuBackdrop) return;
    mobileMenuButton.setAttribute('aria-expanded', 'false');
    mobileMenuButton.setAttribute('aria-label', 'Abrir menú de secciones');
    mobileMenuBackdrop.hidden = true;
    document.body.classList.remove('menu-open');
  };

  const openMobileMenu = () => {
    if (!mobileMenuButton || !mobileMenuBackdrop) return;
    mobileMenuButton.setAttribute('aria-expanded', 'true');
    mobileMenuButton.setAttribute('aria-label', 'Cerrar menú de secciones');
    mobileMenuBackdrop.hidden = false;
    document.body.classList.add('menu-open');
  };

  if (mobileMenuButton) {
    mobileMenuButton.addEventListener('click', () => {
      const open = mobileMenuButton.getAttribute('aria-expanded') === 'true';
      open ? closeMobileMenu() : openMobileMenu();
    });
  }

  if (mobileMenuBackdrop) {
    mobileMenuBackdrop.addEventListener('click', (event) => {
      if (event.target === mobileMenuBackdrop) closeMobileMenu();
    });
  }

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') closeMobileMenu();
  });

  window.addEventListener('resize', () => {
    if (window.innerWidth > 760) closeMobileMenu();
  });

  searchInput.addEventListener('input', () => {
    const query = normalize(searchInput.value.trim());
    let visible = 0;

    sections.forEach((section) => {
      section.classList.remove('search-hit');
      if (!query) {
        section.hidden = false;
        visible += 1;
        return;
      }

      const haystack = normalize(`${section.dataset.search || ''} ${section.textContent}`);
      const matches = haystack.includes(query);
      section.hidden = !matches;
      if (matches) {
        section.classList.add('search-hit');
        visible += 1;
      }
    });

    noResults.hidden = visible !== 0;
  });

  const setActiveLink = (id) => {
    navLinks.forEach((link) => {
      const active = link.getAttribute('href') === `#${id}`;
      link.classList.toggle('active', active);
      if (active) {
        link.setAttribute('aria-current', 'true');
      } else {
        link.removeAttribute('aria-current');
      }
    });

    const desktopActive = desktopNavLinks.find((link) => link.getAttribute('href') === `#${id}`);
    if (desktopActive && window.innerWidth > 760) {
      desktopActive.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
    }
  };

  const observer = new IntersectionObserver((entries) => {
    const visible = entries
      .filter((entry) => entry.isIntersecting && !entry.target.hidden)
      .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
    if (visible) setActiveLink(visible.target.id);
  }, { rootMargin: '-30% 0px -58% 0px', threshold: [0, 0.15, 0.35] });

  sections.forEach((section) => observer.observe(section));
  if (sections[0]) setActiveLink(sections[0].id);

  navLinks.forEach((link) => {
    link.addEventListener('click', () => {
      const id = link.getAttribute('href').slice(1);
      setActiveLink(id);
      closeMobileMenu();
    });
  });

  const updateBackTop = () => backTop.classList.toggle('visible', window.scrollY > 700);
  window.addEventListener('scroll', updateBackTop, { passive: true });
  updateBackTop();
  backTop.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
})();
