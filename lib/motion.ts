import type { Variants } from "framer-motion";

/** Parent container that staggers children into view. */
export const stagger: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.06, delayChildren: 0.04 } },
};

/** Child item: fade + rise. Pair with `stagger`. */
export const fadeUp: Variants = {
  hidden: { opacity: 0, y: 14 },
  show: {
    opacity: 1,
    y: 0,
    transition: { type: "spring", stiffness: 260, damping: 24 },
  },
};
