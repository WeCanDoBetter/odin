import { BTree } from "@wecandobetter/btree";
import {
  type Entity,
  EntityType,
  PropertyType,
  type Relationship,
  type WithoutId,
} from "../types";
import {
  compareProperty,
  compareString,
  createPropertySelector,
  relationshipToId,
  selectId,
  selectType,
} from "../util";

/**
 * A graph is a collection of Entities and Relationships.
 */
export class Graph {
  #indexes = {
    entities: {
      byType: new BTree<Entity, EntityType>(2, compareString, selectType),
      byId: new BTree<Entity, string>(2, compareString, selectId),
      byProperty: new Map<string, BTree<Entity, PropertyType>>(),
    },
    relationships: {
      byType: new BTree<Relationship, string>(2, compareString, selectType),
      byId: new BTree<Relationship, string>(2, compareString, selectId),
      byProperty: new Map<string, BTree<Relationship, PropertyType>>(),
    },
  };

  /**
   * Create an index for the given property.
   * @param thingType The type of thing to index.
   * @param property The property to index.
   * @throws If an index for the given property already exists.
   */
  createIndex(thingType: "entity" | "relationship", property: string) {
    const exists = thingType === "entity"
      ? this.#indexes.entities.byProperty.has(property)
      : this.#indexes.relationships.byProperty.has(property);

    if (exists) {
      throw new Error(
        `Index for ${thingType} property ${property} already exists`,
      );
    }

    if (thingType === "entity") {
      this.#indexes.entities.byProperty.set(
        property,
        new BTree<Entity, PropertyType>(
          2,
          compareProperty,
          createPropertySelector(property),
        ),
      );
    } else {
      this.#indexes.relationships.byProperty.set(
        property,
        new BTree<Relationship, PropertyType>(
          2,
          compareProperty,
          createPropertySelector(property),
        ),
      );
    }
  }

  /**
   * Add an Entity to the graph. The Entity must have a unique id.
   * @param entity The Entity to add.
   * @throws If an Entity with the same id already exists.
   */
  addEntity(entity: Entity) {
    const set = this.#indexes.entities.byId.search(entity.id);

    if (set.size) {
      throw new Error(`Entity with id ${entity.id} already exists`);
    }

    // Handle type and id indexes
    this.#indexes.entities.byType.insert(entity);
    this.#indexes.entities.byId.insert(entity);

    // Handle property indexes
    for (const [property, tree] of this.#indexes.entities.byProperty) {
      if (property in entity.properties) {
        tree.insert(entity);
      }
    }
  }

  /**
   * Add a Relationship to the graph. The Relationship must have a unique id.
   * @param relationship The Relationship to add.
   * @throws If a Relationship with the same id already exists.
   */
  addRelationship(relationship: WithoutId<Relationship>) {
    const fullRelationship: Relationship = {
      ...relationship,
      id: relationshipToId(relationship as Relationship),
    };

    const set = this.#indexes.relationships.byId.search(fullRelationship.id);

    if (set.size) {
      throw new Error(
        `Relationship with id ${fullRelationship.id} already exists`,
      );
    }

    // Handle type and id indexes
    this.#indexes.relationships.byType.insert(fullRelationship);
    this.#indexes.relationships.byId.insert(fullRelationship);

    // Handle property indexes
    for (const [property, tree] of this.#indexes.relationships.byProperty) {
      if (property in fullRelationship.properties) {
        tree.insert(fullRelationship);
      }
    }
  }
}
