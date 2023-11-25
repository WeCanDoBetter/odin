import type { Relationship } from "./types";

/**
 * Turns a Relationship into a unique id. The id is a string that is the
 * concatenation of the source Entity's id, the relationship type, and the
 * target Entity's id.
 */
export function relationshipToId(r: Relationship) {
  return `${r.source}${r.relationshipType}${r.target}`;
}
