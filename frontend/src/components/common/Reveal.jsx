import React, { useEffect, useRef, useState } from 'react';

// Fades children in once they scroll into view. delay is in ms.
const Reveal = ({ children, delay = 0, className = '', as: Tag = 'div' }) => {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el || typeof IntersectionObserver === 'undefined') {
      setVisible(true);
      return undefined;
    }
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          io.disconnect();
        }
      },
      { threshold: 0.12 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <Tag ref={ref} style={{ '--d': `${delay}ms` }} className={`reveal ${visible ? 'is-visible' : ''} ${className}`}>
      {children}
    </Tag>
  );
};

export default Reveal;
