import { X } from 'lucide-react';
import { useEffect, useId, useRef, useState } from 'react';
import { t } from '../../i18n/index.js';
import { lockScroll, unlockScroll } from '../../lib/dialogs.js';


const FOCUSABLE = 'a[href], button:not([disabled]), input:not([disabled]):not([type="hidden"]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

/**
 * A focus-trapped modal (PRD §6.3, §8.3) on the native <dialog>: Esc,
 * backdrop click and the X close it; Tab cycles inside; the page behind is
 * inert and doesn't scroll; focus returns to the opener (or `returnFocus()`).
 * A bottom sheet under 768px. Rises in, fades out (opacity only under
 * reduced motion).
 */
export default function Modal({ open, onClose, title, description, children, footer, initialFocus, returnFocus, size = 'md', className = '', bodyClassName = '', testId, full = false }) {
  const ref = useRef(null);
  const opener = useRef(null);
  const titleId = useId();
  const descId = useId();
  // Content stays mounted through the closing animation.
  const [shown, setShown] = useState(open);
  if (open && !shown) setShown(true);
  const onCloseRef = useRef(onClose);
  const returnRef = useRef(returnFocus);
  useEffect(() => {
    onCloseRef.current = onClose;
    returnRef.current = returnFocus;
  });

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return undefined;
    if (open && !dialog.open) {
      opener.current = document.activeElement;
      dialog.classList.remove('closing');
      dialog.showModal();
      lockScroll();
      const target = initialFocus?.current ?? dialog.querySelector('[data-autofocus]') ?? dialog.querySelector(FOCUSABLE);
      target?.focus({ preventScroll: true });
      return undefined;
    }
    if (!open && dialog.open) {
      dialog.classList.add('closing');
      let done = false;
      const finish = () => {
        if (done) return;
        done = true;
        dialog.classList.remove('closing');
        dialog.close();
        setShown(false);
        unlockScroll();
        const back = returnRef.current?.() ?? opener.current;
        if (back && back.isConnected) back.focus({ preventScroll: true });
      };
      dialog.addEventListener('animationend', finish, { once: true });
      const timer = setTimeout(finish, 320);
      return () => {
        clearTimeout(timer);
        dialog.removeEventListener('animationend', finish);
      };
    }
    return undefined;
  }, [open, initialFocus]);

  // Unmounting while open (route change): put the page back.
  useEffect(() => {
    const dialog = ref.current;
    return () => {
      if (dialog?.open) unlockScroll();
    };
  }, []);

  function onKeyDown(e) {
    if (e.key !== 'Tab') return;
    const items = [...ref.current.querySelectorAll(FOCUSABLE)].filter((el) => el.offsetParent !== null || el === document.activeElement);
    if (!items.length) return;
    const first = items[0];
    const last = items.at(-1);
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  }

  const widths = { sm: 'md:max-w-[420px]', md: 'md:max-w-[560px]', lg: 'md:max-w-[720px]' };
  const frame = full
    ? 'm-0 h-dvh max-h-dvh w-screen max-w-none rounded-none'
    : `sheet mx-0 mt-auto mb-0 max-h-[92dvh] w-full max-w-full rounded-t-2xl md:m-auto md:max-h-[86dvh] md:rounded-2xl ${widths[size]}`;

  return (
    <dialog
      ref={ref}
      className={`modal bg-surface p-0 text-ink shadow-modal backdrop:bg-backdrop ${frame} ${className}`}
      aria-labelledby={titleId}
      aria-describedby={description ? descId : undefined}
      onCancel={(e) => {
        e.preventDefault();
        onCloseRef.current?.();
      }}
      onClick={(e) => {
        if (e.target === ref.current) onCloseRef.current?.();
      }}
      onKeyDown={onKeyDown}
      data-testid={testId}
    >
      {shown && (
        <div className={`flex max-h-[inherit] flex-col ${full ? 'h-full' : ''}`}>
          {!full && (
            <div className="flex items-start gap-3 border-b border-border px-5 pt-5 pb-4 md:px-6">
              <div className="min-w-0 flex-1">
                <h2 id={titleId} className="type-h3 text-ink">
                  {title}
                </h2>
                {description && (
                  <p id={descId} className="mt-1 text-sm text-ink-muted">
                    {description}
                  </p>
                )}
              </div>
              <button type="button" onClick={() => onCloseRef.current?.()} className="-me-2 -mt-1 grid size-11 shrink-0 place-items-center rounded-full text-ink-muted transition-colors hover:bg-surface-muted hover:text-ink" aria-label={t('a11y.close')}>
                <X aria-hidden="true" size={22} />
              </button>
            </div>
          )}
          {full && (
            <h2 id={titleId} className="sr-only">
              {title}
            </h2>
          )}
          {/* Focusable so the keyboard can scroll it when it overflows. */}
          <div tabIndex={full ? undefined : 0} className={`min-h-0 flex-1 overflow-y-auto overscroll-contain outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-inset ${full ? '' : 'px-5 py-4 md:px-6'} ${bodyClassName}`}>
            {children}
          </div>
          {footer && <div className="border-t border-border px-5 py-4 pb-[max(1rem,env(safe-area-inset-bottom))] md:px-6">{footer}</div>}
        </div>
      )}
    </dialog>
  );
}
