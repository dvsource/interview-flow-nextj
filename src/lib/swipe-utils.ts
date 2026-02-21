/**
 * Checks if an event target is inside an element with horizontal scroll.
 * Used to prevent swipe navigation when the user is scrolling a code block.
 */
export function isInsideHorizontalScroll(
  target: EventTarget | null,
): boolean {
  let el = target as HTMLElement | null;
  while (el) {
    if (el.scrollWidth > el.clientWidth) {
      const style = window.getComputedStyle(el);
      if (style.overflowX === "auto" || style.overflowX === "scroll") {
        return true;
      }
    }
    el = el.parentElement;
  }
  return false;
}
