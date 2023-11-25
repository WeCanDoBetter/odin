export type {
  Entity,
  EntityReference,
  EntityType,
  PropertyMap,
  PropertyType,
  Relationship,
  RelationshipType,
  Thing,
  WithoutId,
} from "./types";

export type { Comparator, Selector } from "@wecandobetter/btree";

export { Odin } from "./lib/Odin";
export { Graph } from "./lib/Graph";

export {
  compareBoolean,
  compareNumber,
  compareProperty,
  compareString,
  createPropertySelector,
  relationshipToId,
  selectId,
} from "./util";
