import type { Variants } from 'motion/react'

/** Staggered fade/rise-in used for the main content column. */
export const containerVariants: Variants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.04,
    },
  },
}

export const itemVariants: Variants = {
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: 'spring', stiffness: 260, damping: 28 },
  },
}

/** Slightly larger rise for the hero, since it leads the sequence. */
export const heroVariants: Variants = {
  hidden: { opacity: 0, y: 24, scale: 0.985 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { type: 'spring', stiffness: 220, damping: 26 },
  },
}