import { CloudOff, RotateCcw } from 'lucide-react';
import { Component } from 'react';
import { t } from '../../i18n/index.js';
import Button from '../ui/Button.jsx';

/**
 * Catches a page that failed to load (offline and not cached, or a chunk a
 * deploy replaced) so the navbar, footer and the learner's tools stay up.
 * "Try again" re-renders: failed loads aren't memoized, so it refetches.
 */
export default class PageErrorBoundary extends Component {
  state = { error: null };

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidUpdate(_, prev) {
    if (this.state.error && !prev.error) document.getElementById('page-error')?.focus({ preventScroll: true });
  }

  render() {
    if (!this.state.error) return this.props.children;
    const offline = typeof navigator !== 'undefined' && navigator.onLine === false;
    return (
      <div className="container-page py-16">
        <div id="page-error" tabIndex={-1} role="alert" className="mx-auto max-w-lg rounded-[20px] border border-border bg-surface p-8 text-center outline-none" data-testid="page-error">
          <CloudOff aria-hidden="true" size={36} className="mx-auto text-ink-muted" />
          <h1 className="mt-4 text-2xl font-bold text-ink">{t('pageError.title')}</h1>
          <p className="mt-2 text-ink-muted">{offline ? t('pageError.offline') : t('pageError.text')}</p>
          <div className="mt-6 flex flex-wrap justify-center gap-2">
            <Button icon={RotateCcw} onClick={() => this.setState({ error: null })} data-testid="page-error-retry">
              {t('pageError.retry')}
            </Button>
            <Button variant="secondary" onClick={() => location.reload()}>
              {t('pageError.reload')}
            </Button>
          </div>
        </div>
      </div>
    );
  }
}
