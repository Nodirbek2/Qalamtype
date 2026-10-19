import React, { useEffect, useId, useLayoutEffect, useRef, useState } from 'react';
import { Check, ChevronDown } from 'lucide-react';

export type FilterOption<T extends string> = { value: T; label: string; group?: string };
interface Props<T extends string> {
  label: string;
  value: T;
  options: FilterOption<T>[];
  icon: React.ReactNode;
  onChange: (value: T) => void;
}
const titleCase = (text: string) => text.charAt(0).toLocaleUpperCase() + text.slice(1);

export function LeaderboardFilter<T extends string>({ label, value, options, icon, onChange }: Props<T>) {
  const id = useId();
  const root = useRef<HTMLDivElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const menu = useRef<HTMLDivElement>(null);
  const search = useRef({ text: '', at: 0 });
  const [open, setOpen] = useState(false);
  const selected = Math.max(0, options.findIndex(option => option.value === value));
  const [active, setActive] = useState(selected);
  const [position, setPosition] = useState<React.CSSProperties>({ visibility: 'hidden' });

  useLayoutEffect(() => {
    if (!open) return;
    const place = () => {
      const rect = trigger.current?.getBoundingClientRect();
      if (!rect) return;
      const below = window.innerHeight - rect.bottom - 12;
      const above = rect.top - 12;
      const flip = below < 280 && above > below;
      setPosition({
        left: Math.max(12, Math.min(rect.left, window.innerWidth - rect.width - 12)),
        width: Math.min(rect.width, window.innerWidth - 24),
        maxHeight: Math.max(80, Math.min(360, flip ? above - 8 : below - 8)),
        ...(flip ? { bottom: window.innerHeight - rect.top + 8 } : { top: rect.bottom + 8 }),
      });
    };
    place();
    window.addEventListener('resize', place);
    window.addEventListener('scroll', place, true);
    return () => {
      window.removeEventListener('resize', place);
      window.removeEventListener('scroll', place, true);
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const dismiss = (event: PointerEvent) => {
      if (!root.current?.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener('pointerdown', dismiss);
    return () => document.removeEventListener('pointerdown', dismiss);
  }, [open]);

  useEffect(() => {
    if (open) menu.current?.querySelector<HTMLElement>(`[data-option-index="${active}"]`)?.scrollIntoView({ block: 'nearest' });
  }, [open, active]);

  function choose(index: number) {
    onChange(options[index].value);
    setOpen(false);
    search.current.text = '';
  }

  function handleKeyDown(event: React.KeyboardEvent<HTMLButtonElement>) {
    if (event.altKey || event.ctrlKey || event.metaKey || event.nativeEvent.isComposing) return;
    if (event.key === 'Tab' || event.key === 'Escape') {
      setOpen(false);
      search.current.text = '';
      if (event.key === 'Escape' && open) { event.preventDefault(); event.stopPropagation(); }
      return;
    }
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      if (open) choose(active);
      else { setActive(selected); setOpen(true); }
      return;
    }
    if (['ArrowDown', 'ArrowUp', 'Home', 'End'].includes(event.key)) {
      event.preventDefault();
      const start = open ? active : selected;
      setActive(event.key === 'Home' ? 0 : event.key === 'End' ? options.length - 1 :
        !open ? selected : (start + (event.key === 'ArrowDown' ? 1 : -1) + options.length) % options.length);
      setOpen(true);
      return;
    }
    if (event.key.length === 1) {
      event.preventDefault();
      const now = Date.now();
      const text = (now - search.current.at < 700 ? search.current.text : '') + event.key.toLocaleLowerCase();
      search.current = { text, at: now };
      const match = options.findIndex(option => option.label.toLocaleLowerCase().startsWith(text));
      if (match >= 0) { setActive(match); setOpen(true); }
    }
  }

  return <div ref={root} className="lb-filter">
    <button ref={trigger} type="button" role="combobox" className="lb-filter-trigger"
      aria-expanded={open} aria-haspopup="listbox" aria-controls={open ? `${id}-menu` : undefined}
      aria-labelledby={`${id}-label ${id}-value`} aria-activedescendant={open ? `${id}-option-${active}` : undefined}
      onClick={() => { setActive(selected); search.current.text = ''; setOpen(!open); }}
      onKeyDown={handleKeyDown} onBlur={event => { if (!root.current?.contains(event.relatedTarget as Node)) setOpen(false); }}>
      <span className="lb-filter-icon" aria-hidden="true">{icon}</span>
      <span className="lb-filter-copy"><span id={`${id}-label`} className="lb-filter-label">{label}</span>
        <span id={`${id}-value`} className="lb-filter-value">{titleCase(options[selected].label)}</span></span>
      <ChevronDown size={17} className="lb-filter-chevron" aria-hidden="true"/>
    </button>
    {open && <div ref={menu} id={`${id}-menu`} className="lb-filter-menu" role="listbox" aria-labelledby={`${id}-label`} style={position}>
      {options.map((option, index) => <React.Fragment key={option.value}>
        {option.group && option.group !== options[index - 1]?.group && <div className="lb-filter-group" role="presentation">{titleCase(option.group)}</div>}
        <div role="option" id={`${id}-option-${index}`} aria-selected={option.value === value} data-option-index={index}
          data-active={active === index} className="lb-filter-option"
          onPointerMove={() => setActive(index)} onPointerDown={event => event.preventDefault()} onClick={() => choose(index)}>
          <span>{titleCase(option.label)}</span><Check size={16} className="lb-filter-check" aria-hidden="true"/>
        </div>
      </React.Fragment>)}
    </div>}
  </div>;
}
