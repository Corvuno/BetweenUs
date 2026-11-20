// Functions one app file defines on `window` for the others. tsc checks the files one by
// one and cannot see them, so each is declared here (add more as they are fixed properly).
declare function labelColor(baseHex: string): string;
declare function giltRailPaint(el: Element | null, baseHex: string | null): void;

// Profile flags config.js copies onto `window` (add more as they are fixed properly).
interface Window { SHOW_CARD_ID?: boolean }

// backs.js publishes the card backs' drawings and pick lists on `window`.
declare const Backs: {
  START_POOL: string[];
  INTERMEZZO_POOL: string[];
  markup(name: string, prefix: string): string;
  pick(pool: string[]): string;
};
