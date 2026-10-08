// Widget registry: modules reference widgets by id (see js/data/modules.js).
import { structure, selector, split, workflow, clean } from './basics.js';
import { regline, gd, revenue, complexity } from './regression.js';
import { classlab, confusion, compare, leakage, boundary } from './classification.js';
import { kmeansLab } from './clustering.js';
import { final } from './final.js';

export const W = {
  structure, selector, split, workflow, 'workflow-full': el => workflow(el, { full: true }), clean,
  regline, gd, revenue, complexity,
  boundary, classlab, 'classlab-mini': el => classlab(el, { models: false }), confusion, compare, leakage,
  kmeans: kmeansLab, final
};
