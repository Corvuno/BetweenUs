// Functions one app file defines on `window` for the others. tsc checks the files one by
// one and cannot see them, so each is declared here (add more as they are fixed properly).
declare function labelColor(baseHex: string): string;
