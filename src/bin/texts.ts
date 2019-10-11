#!/usr/bin/node

import { sync } from '../services/gutenberg';

(async () => {
  await sync();
})();
