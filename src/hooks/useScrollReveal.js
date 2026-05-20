import { useInView } from 'react-intersection-observer';
import { useAnimation } from 'framer-motion';
import { useEffect } from 'react';

export function useScrollReveal({ threshold = 0.1, once = true } = {}) {
  const controls = useAnimation();
  const [ref, inView] = useInView({ threshold, triggerOnce: once });

  useEffect(() => {
    if (inView) controls.start('visible');
    else if (!once) controls.start('hidden');
  }, [inView, controls, once]);

  const variants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } },
  };

  return { ref, controls, variants, inView };
}
