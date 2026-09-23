import type { SchemaTypeDefinition } from "sanity";

import {
  coupon,
  order,
  product,
  shippingZone,
  subscriber,
  testimonial,
  user,
} from "./documents";
import {
  localeString,
  localeText,
  note,
  notePyramid,
  orderItem,
  orderTotals,
  variant,
} from "./objects";

export const schemaTypes: SchemaTypeDefinition[] = [
  // objects
  localeString,
  localeText,
  variant,
  note,
  notePyramid,
  orderItem,
  orderTotals,
  // documents
  product,
  testimonial,
  order,
  coupon,
  shippingZone,
  subscriber,
  user,
];

export const schema = { types: schemaTypes };
