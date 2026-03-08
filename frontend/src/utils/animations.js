/**
 * Framer Motion пресеты анимаций
 * Единый источник для всех motion-вариантов приложения
 */

// Переход страниц (fade + slide-up)
export const pageTransition = {
  initial:   { opacity: 0, y: 12 },
  animate:   { opacity: 1, y: 0 },
  exit:      { opacity: 0, y: -8 },
  transition:{ duration: 0.25, ease: [0.16, 1, 0.3, 1] },
}

// Fade-only для простых элементов
export const fadeIn = {
  initial:   { opacity: 0 },
  animate:   { opacity: 1 },
  transition:{ duration: 0.2 },
}

// Slide-up для карточек
export const slideUp = {
  initial:   { opacity: 0, y: 16 },
  animate:   { opacity: 1, y: 0 },
  transition:{ duration: 0.3, ease: [0.16, 1, 0.3, 1] },
}

// Scale-in для модалей и поповеров
export const scaleIn = {
  initial:   { opacity: 0, scale: 0.95 },
  animate:   { opacity: 1, scale: 1 },
  exit:      { opacity: 0, scale: 0.95 },
  transition:{ duration: 0.2, ease: [0.16, 1, 0.3, 1] },
}

// Backdrop для модалей
export const backdropVariants = {
  initial:   { opacity: 0 },
  animate:   { opacity: 1 },
  exit:      { opacity: 0 },
  transition:{ duration: 0.2 },
}

// Modal content
export const modalVariants = {
  initial:   { opacity: 0, scale: 0.96, y: 12 },
  animate:   { opacity: 1, scale: 1, y: 0 },
  exit:      { opacity: 0, scale: 0.96, y: 8 },
  transition:{ duration: 0.25, ease: [0.16, 1, 0.3, 1] },
}

// Stagger для списков (контейнер)
export const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.06,
      delayChildren: 0.05,
    },
  },
}

// Дочерний элемент стаггера
export const staggerItem = {
  initial:   { opacity: 0, y: 12 },
  animate:   { opacity: 1, y: 0 },
  transition:{ duration: 0.3, ease: [0.16, 1, 0.3, 1] },
}

// Hover для карточек
export const cardHover = {
  whileHover: { scale: 1.01, transition: { duration: 0.15 } },
  whileTap:   { scale: 0.99 },
}

// Hover для кнопок
export const buttonTap = {
  whileTap: { scale: 0.97, transition: { duration: 0.1 } },
}

// Slide-in из правой стороны (для чата, уведомлений)
export const slideInRight = {
  initial:   { opacity: 0, x: 16 },
  animate:   { opacity: 1, x: 0 },
  transition:{ duration: 0.25, ease: [0.16, 1, 0.3, 1] },
}

// Slide-in из левой стороны
export const slideInLeft = {
  initial:   { opacity: 0, x: -16 },
  animate:   { opacity: 1, x: 0 },
  transition:{ duration: 0.25, ease: [0.16, 1, 0.3, 1] },
}

// Вспомогательная функция для задержки
export const withDelay = (variants, delay = 0) => ({
  ...variants,
  transition: { ...variants.transition, delay },
})
