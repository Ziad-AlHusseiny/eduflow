import { useEffect } from 'react';
import { addStudySeconds } from '../lib/learning.js';

const TICK = 15;
const IDLE = 120_000;

/**
 * Counts study time on learning pages: every 15 s while the tab is visible
 * and you've scrolled, typed or clicked in the last two minutes.
 */
export function useStudyTimer() {
  useEffect(() => {
    let last = Date.now();
    const active = () => {
      last = Date.now();
    };
    const events = ['scroll', 'keydown', 'pointerdown', 'pointermove'];
    events.forEach((e) => window.addEventListener(e, active, { passive: true }));
    const id = setInterval(() => {
      if (document.visibilityState === 'visible' && Date.now() - last < IDLE) addStudySeconds(TICK);
    }, TICK * 1000);
    return () => {
      clearInterval(id);
      events.forEach((e) => window.removeEventListener(e, active));
    };
  }, []);
}
