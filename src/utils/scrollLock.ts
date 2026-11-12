import { useEffect } from 'react'

let lockCount = 0
let originalOverflow = ''
let originalOverscroll = ''

/**
 * Incrementally locks the body scroll.
 * Handles multiple stacked modals cleanly.
 */
export function lockBodyScroll(): void {
  if (typeof document === 'undefined') return
  if (lockCount === 0) {
    originalOverflow = document.body.style.overflow
    originalOverscroll = document.body.style.overscrollBehavior
    document.body.style.overflow = 'hidden'
    document.body.style.overscrollBehavior = 'contain'
  }
  lockCount++
}

/**
 * Decrements the body scroll lock count and restores original styles when zero.
 */
export function unlockBodyScroll(): void {
  if (typeof document === 'undefined') return
  lockCount = Math.max(0, lockCount - 1)
  if (lockCount === 0) {
    document.body.style.overflow = originalOverflow
    document.body.style.overscrollBehavior = originalOverscroll
  }
}

/**
 * React hook to lock body scrolling whenever `isOpen` is true.
 * Safely supports nested / stacked dialogs.
 */
export function useBodyScrollLock(isOpen: boolean = true): void {
  useEffect(() => {
    if (!isOpen) return
    lockBodyScroll()
    return () => {
      unlockBodyScroll()
    }
  }, [isOpen])
}
