import type { Comparator, Selector } from "@wecandobetter/btree/dist/types";
import type { Entity, PropertyType, Relationship, Thing } from "./types";

/**
 * Turns a Relationship into a unique id. The id is a string that is the
 * concatenation of the source Entity's id, the relationship type, and the
 * target Entity's id.
 * @param r The Relationship to turn into an id.
 */
export function relationshipToId(r: Relationship) {
  return `${r.source}:${r.relationshipType}:${r.target}`;
}

// Comparators

/** Compare two strings. */
export const compareString: Comparator<string> = (a, b) => a.localeCompare(b);
/** Compare two numbers. */
export const compareNumber: Comparator<number> = (a, b) => a - b;
/** Compare two booleans. */
export const compareBoolean: Comparator<boolean> = (a, b) =>
  a === b ? 0 : a ? 1 : -1;

/** Compare two PropertyTypes. */
export const compareProperty = <T extends PropertyType>(
  a: T,
  b: T,
): number => {
  if (isString(a) && isString(b)) {
    return compareString(a, b);
  } else if (isNumber(a) && isNumber(b)) {
    return compareNumber(a, b);
  } else if (isBoolean(a) && isBoolean(b)) {
    return compareBoolean(a, b);
  } else if (typeof a !== typeof b) {
    throw new Error(`Cannot compare ${typeof a} and ${typeof b}`);
  } else {
    throw new Error(`Cannot compare ${a} and ${b}`);
  }
};

// Selectors

/** Select the id of a Thing. */
export const selectId: Selector<Thing, string> = (thing) => thing.id;

/** Select the type of a Thing. */
export const selectType: Selector<Thing, string> = (thing) => thing.type;

/**
 * Create a selector for the given property.
 * @param property The property to select.
 */
export const createPropertySelector =
  (property: string) =>
  <T extends Entity | Relationship>(thing: T): PropertyType =>
    thing.properties[property];

export const isString = (value: unknown): value is string =>
  typeof value === "string";
export const isNumber = (value: unknown): value is number =>
  typeof value === "number";
export const isBoolean = (value: unknown): value is boolean =>
  typeof value === "boolean";
