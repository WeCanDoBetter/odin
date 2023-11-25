/**
 * A Thing is a generic object that can be either an Entity or a Relationship.
 */
export interface Thing {
  /** The unique identifier of the Thing. */
  id: string;
  /** The type of the Thing. */
  type: string;
}

/**
 * Represents a reference to an Entity. The reference is the Entity's id.
 */
export type EntityReference = string;

/**
 * An entity type is a string that represents the type of an Entity. An
 * entity type always starts with a capital letter.
 */
export type EntityType = string;

/**
 * A relationship type is a string that represents the type of a Relationship.
 * A relationship type is always all uppercase.
 */
export type RelationshipType = string;

/**
 * A property of an Entity or Relationship. A property can be a string, number,
 * or boolean.
 */
export type PropertyType = string | number | boolean;

/**
 * A map of properties. The keys are the names of the properties and the values
 * are the values of the properties.
 */
export type PropertyMap = Record<string, PropertyType>;

/**
 * An Entity is a Thing that represents a node in the graph.
 */
export interface Entity extends Thing {
  /** The type of the Entity. */
  entityType: EntityType;
  /** The properties of the Entity. */
  properties: PropertyMap;
}

/**
 * A Relationship is a Thing that represents an edge in the graph.
 */
export interface Relationship extends Thing {
  /** The type of the Relationship. */
  relationshipType: RelationshipType;
  /** The properties of the Relationship. */
  properties: PropertyMap;
  /** The source Entity of the Relationship. */
  source: EntityReference;
  /** The target Entity of the Relationship. */
  target: EntityReference;
}
