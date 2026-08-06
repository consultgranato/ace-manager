// =============================================================
// Ace Manager — goal bank generator: core
// =============================================================
// Thin adapter over js/goal-model.js. There is exactly ONE definition of what a
// goal is and how a template expands into one, and it lives in the app so the
// offline bank and the running product can never drift apart. This file only
// re-exports it for the authoring DSL and the builder.

'use strict';

const model = require('../../js/goal-model.js');

module.exports = {
  BANDS: model.BANDS,
  BAND_TOKENS: model.BAND_TOKENS,
  WINDOWS: model.WINDOWS,
  SCAFFOLDS: model.SCAFFOLDS,
  METRICS: model.METRICS,
  TIMEFRAME: model.TIMEFRAME,
  fill: model.fill,
  pick: model.pick,
  expand: model.expand,
  metric: model.metric,
  vagueVerb: model.vagueVerb
};
