import { BTree, Operators } from "@wecandobetter/btree";
import {
  type Entity,
  EntityType,
  PropertyType,
  type Relationship,
  type SerializedGraph,
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

    let tree: BTree<any, PropertyType>;

    if (thingType === "entity") {
      tree = new BTree<Entity, PropertyType>(
        2,
        compareProperty,
        createPropertySelector(property),
      );
    } else if (thingType === "relationship") {
      tree = new BTree<Relationship, PropertyType>(
        2,
        compareProperty,
        createPropertySelector(property),
      );
    } else {
      throw new Error(`Invalid thingType ${thingType}`);
    }

    // Set the index
    this.#indexes.entities.byProperty.set(property, tree);
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

  /**
   * Get an Entity by id.
   * @param id The id of the Entity to get.
   * @throws If an Entity with the given id does not exist.
   */
  getEntity(id: string) {
    const set = this.#indexes.entities.byId.search(id);

    if (!set.size) {
      throw new Error(`Entity with id ${id} does not exist`);
    }

    return set.values().next().value;
  }

  /**
   * Get a Relationship by id.
   * @param id The id of the Relationship to get.
   * @throws If a Relationship with the given id does not exist.
   */
  getRelationship(id: string) {
    const set = this.#indexes.relationships.byId.search(id);

    if (!set.size) {
      throw new Error(`Relationship with id ${id} does not exist`);
    }

    return set.values().next().value;
  }

  /**
   * Search the graph for Entities and Relationships that match the given
   * criteria. The criteria is a key, operator, and value. The key is the name
   * of the property to search. The operator is the comparison operator to use.
   * The value is the value to compare against.
   * @param key The name of the property to search.
   * @param operator The comparison operator to use.
   * @param value The value to compare against.
   * @param collector The collector to use for collecting results.
   * @returns A set of Entities and Relationships that match the search criteria.
   */
  search(
    key: string,
    operator: Operators,
    value: PropertyType,
    collector: Set<Entity | Relationship> = new Set(),
  ) {
    const entities = this.#indexes.entities.byProperty.get(key);
    const relationships = this.#indexes.relationships.byProperty.get(key);

    if (!entities && !relationships) {
      throw new Error(`No index for property ${key}`);
    }

    if (entities) {
      entities.search(value, operator, collector as Set<Entity>);
    }

    if (relationships) {
      relationships.search(value, operator, collector as Set<Relationship>);
    }

    return collector;
  }

  /**
   * Export the graph to a serialized form.
   * @returns The serialized form of the graph.
   * @see SerializedGraph
   */
  export(): SerializedGraph {
    const entities = [...this.#indexes.entities.byId];
    const relationships = [...this.#indexes.relationships.byId];

    return {
      entities,
      relationships,
    };
  }

  /**
   * Import a serialized graph.
   * @param serializedGraph The serialized graph to import.
   * @see SerializedGraph
   */
  import(serializedGraph: SerializedGraph) {
    for (const entity of serializedGraph.entities) {
      this.addEntity(entity);
    }

    for (const relationship of serializedGraph.relationships) {
      this.addRelationship(relationship);
    }
  }
}
