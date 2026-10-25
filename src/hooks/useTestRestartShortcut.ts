import { useEffect } from 'react';

// Capture before the typing input consumes Tab, and before result-screen Enter.
export function useTestRestartShortcut(enabled: boolean, onRestart: () => void) {
  useEffect(() => {
    if (!enabled) return;
    let tabArmed = false;
    let focusFrame: number | null = null;
    const clear = () => { tabArmed = false; };
    const handleKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      const otherControl = target?.closest?.(
        'input:not([data-typing-input]), textarea, select, [contenteditable]:not([contenteditable="false"]), button, a, [role="button"], [role="combobox"]'
      );
      if (event.defaultPrevented || event.isComposing || event.ctrlKey || event.altKey || event.metaKey || event.shiftKey || otherControl ||
          document.querySelector('dialog[open], [role="dialog"], [aria-modal="true"]')) {
        clear();
        return;
      }
      if (event.repeat) return;
      if (event.key === 'Tab') {
        tabArmed = true;
        event.preventDefault();
        event.stopImmediatePropagation();
        return;
      }
      const restart = (event.key === 'Enter' && tabArmed) || event.key === 'Escape';
      clear();
      if (!restart) return;
      event.preventDefault();
      event.stopImmediatePropagation();
      onRestart();
      if (focusFrame !== null) window.cancelAnimationFrame(focusFrame);
      focusFrame = window.requestAnimationFrame(() => {
        focusFrame = null;
        document.querySelector<HTMLInputElement>('[data-typing-input="true"]')?.focus({ preventScroll: true });
      });
    };
    window.addEventListener('keydown', handleKeyDown, true);
    window.addEventListener('pointerdown', clear, true);
    window.addEventListener('blur', clear);
    return () => {
      window.removeEventListener('keydown', handleKeyDown, true);
      window.removeEventListener('pointerdown', clear, true);
      window.removeEventListener('blur', clear);
      if (focusFrame !== null) window.cancelAnimationFrame(focusFrame);
    };
  }, [enabled, onRestart]);
}
