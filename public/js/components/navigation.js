(function initialiseGlobalNavigation() {
  function getFocusableElements(root) {
    return root.querySelectorAll('a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])');
  }

  function onReady() {
    const navigation = document.querySelector('[data-global-navigation]');
    if (!navigation) {
      return;
    }

    const toggleButton = navigation.querySelector('[data-navigation-toggle]');
    const navigationMenu = navigation.querySelector('[data-navigation-menu]');

    if (!(toggleButton instanceof HTMLButtonElement) || !(navigationMenu instanceof HTMLElement)) {
      return;
    }

    navigation.classList.add('is-enhanced');

    let lastFocused = null;

    const setMenuState = (expanded) => {
      navigation.classList.toggle('is-open', expanded);
      toggleButton.setAttribute('aria-expanded', expanded ? 'true' : 'false');
      document.body.classList.toggle('is-navigation-open', expanded);

      if (expanded) {
        const firstFocusable = getFocusableElements(navigationMenu)[0];
        if (firstFocusable instanceof HTMLElement) {
          firstFocusable.focus();
        }
      }
    };

    const closeMenu = () => {
      const isOpen = toggleButton.getAttribute('aria-expanded') === 'true';
      if (!isOpen) {
        return;
      }

      setMenuState(false);
      if (lastFocused instanceof HTMLElement) {
        lastFocused.focus();
      } else {
        toggleButton.focus();
      }
    };

    const openMenu = () => {
      lastFocused = document.activeElement;
      setMenuState(true);
    };

    const toggleMenu = () => {
      const isExpanded = toggleButton.getAttribute('aria-expanded') === 'true';
      if (isExpanded) {
        closeMenu();
        return;
      }
      openMenu();
    };

    const handleDocumentClick = (event) => {
      const isOpen = toggleButton.getAttribute('aria-expanded') === 'true';
      if (!isOpen) {
        return;
      }

      const target = event.target;
      if (!(target instanceof Node)) {
        return;
      }

      if (!navigation.contains(target)) {
        closeMenu();
      }
    };

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        closeMenu();
        return;
      }

      if (event.key !== 'Tab') {
        return;
      }

      const isOpen = toggleButton.getAttribute('aria-expanded') === 'true';
      if (!isOpen) {
        return;
      }

      const focusables = Array.from(getFocusableElements(navigationMenu));
      if (focusables.length === 0) {
        return;
      }

      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      const active = document.activeElement;

      if (event.shiftKey && active === first) {
        event.preventDefault();
        if (last instanceof HTMLElement) {
          last.focus();
        }
      } else if (!event.shiftKey && active === last) {
        event.preventDefault();
        if (first instanceof HTMLElement) {
          first.focus();
        }
      }
    };

    const updateScrollState = () => {
      navigation.classList.toggle('is-scrolled', window.scrollY > 10);
    };

    toggleButton.addEventListener('click', toggleMenu);
    document.addEventListener('click', handleDocumentClick);
    document.addEventListener('keydown', handleKeyDown);
    window.addEventListener('scroll', updateScrollState, { passive: true });
    window.addEventListener('resize', () => {
      if (window.innerWidth >= 1024) {
        setMenuState(false);
      }
    });

    setMenuState(false);
    updateScrollState();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', onReady);
    return;
  }

  onReady();
})();