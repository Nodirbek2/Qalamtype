import React, { useEffect, useRef } from 'react';
import { ArrowRight, RotateCcw } from 'lucide-react';

interface Props {
  nextLabel: string;
  retryLabel: string;
  onNext?: () => void;
  onRetry: () => void;
}

export function AcademyResultActions({ nextLabel, retryLabel, onNext, onRetry }: Props) {
  const nextAction = useRef(onNext);
  const primaryButton = useRef<HTMLButtonElement>(null);
  const actions = useRef<HTMLDivElement>(null);

  useEffect(() => { nextAction.current = onNext; }, [onNext]);
  useEffect(() => {
    // The finished drill may leave the page scrolled down behind the keyboard.
    actions.current?.closest('.academy-completion')?.scrollIntoView({ block: 'start' });
    primaryButton.current?.focus({ preventScroll: true });
    const handleEnter = (event: KeyboardEvent) => {
      if (typeof document !== 'undefined' && document.querySelector('dialog[open]')) return;
      if (event.key !== 'Enter' || event.repeat || event.isComposing || event.ctrlKey || event.altKey || event.metaKey || event.shiftKey || !nextAction.current) return;
      event.preventDefault();
      event.stopPropagation();
      nextAction.current();
    };
    window.addEventListener('keydown', handleEnter, true);
    return () => window.removeEventListener('keydown', handleEnter, true);
  }, []);

  return <div ref={actions} className="academy-result-actions">
    {onNext && <button ref={primaryButton} type="button" className="academy-next-action" onClick={onNext} aria-keyshortcuts="Enter">
      <span>{nextLabel}</span><ArrowRight size={18} aria-hidden="true"/><kbd>Enter ↵</kbd>
    </button>}
    <button ref={onNext ? undefined : primaryButton} type="button" className="academy-retry-action" onClick={onRetry}>
      <RotateCcw size={16} aria-hidden="true"/><span>{retryLabel}</span>
    </button>
  </div>;
}
