#!/usr/bin/node

import { sync } from '../gutenberg/gutenberg';

(async () => {
  await sync();
})();
