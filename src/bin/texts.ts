#!/usr/bin/node

import gutenbergService from '../services/gutenberg';

(async () => {
  gutenbergService.sync();
})();
