import { useLayoutEffect } from 'react';

// Publishes the sticky site header's height as --nav-h so full-bleed sections can clear it.
const useNavHeight = () => {
  useLayoutEffect(() => {
    const header = document.querySelector('header');
    if (!header) return undefined;
    const set = () => document.documentElement.style.setProperty('--nav-h', `${header.offsetHeight}px`);
    set();
    const ro = new ResizeObserver(set);
    ro.observe(header);
    return () => ro.disconnect();
  }, []);
};

export default useNavHeight;
