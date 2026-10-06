// Session-only badge state: which badges popped this session (they play the
// spring pop in the grid too) and a short hold while the auto-advance toast
// counts down, so the badge modal waits for the navigation to settle (PRD §7.4).

let heldUntil = 0;
export const holdBadges = (ms) => {
  heldUntil = Math.max(heldUntil, Date.now() + ms);
};
export const releaseBadges = () => {
  heldUntil = 0;
};
export const badgeHoldRemaining = () => Math.max(0, heldUntil - Date.now());

export const justEarned = new Set();

// Restoring a backup brings back badges earned elsewhere: they're not news,
// so for a moment every change is taken as the new baseline instead of popping.
let quietUntil = 0;
export const quietBadges = (ms = 1500) => {
  quietUntil = Date.now() + ms;
};
export const badgesQuiet = () => Date.now() < quietUntil;
