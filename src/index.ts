import { BTree } from "@wecandobetter/btree/dist/BTree";
import type { Comparator, Selector } from "@wecandobetter/btree/dist/types";
import type { Entity, Relationship, Thing } from "./types";
import { relationshipToId } from "./util";

const stringComparator: Comparator<string> = (a, b) => a.localeCompare(b);
const idSelector: Selector<Thing, string> = (t) => t.id;

/**
 * Odin is a graph database.
 */
export default class Odin {
  #graphs = new Map<string, Graph>();

  /**
   * Create a new graph with the given name.
   * @param name The name of the graph.
   * @throws If a graph with the given name already exists.
   */
  createGraph(name: string) {
    let graph = this.#graphs.get(name);

    if (graph) {
      throw new Error(`Graph with name ${name} already exists`);
    }

    graph = new Graph();
    this.#graphs.set(name, graph);
    return graph;
  }

  /**
   * Get a graph by name.
   * @param name The name of the graph.
   * @throws If a graph with the given name does not exist.
   */
  getGraph(name: string) {
    const graph = this.#graphs.get(name);

    if (!graph) {
      throw new Error(`Graph with name ${name} does not exist`);
    }

    return graph;
  }
}

/**
 * A graph is a collection of Entities and Relationships.
 */
export class Graph {
  #indexes = {
    entities: new BTree<Entity, string>(2, stringComparator, idSelector),
    relationships: new BTree<Relationship, string>(
      2,
      stringComparator,
      idSelector,
    ),
  };

  /**
   * Add an Entity to the graph. The Entity must have a unique id.
   * @param entity The Entity to add.
   * @throws If an Entity with the same id already exists.
   */
  addEntity(entity: Entity) {
    const s = this.#indexes.entities.search(entity.id);

    if (s.size) {
      throw new Error(`Entity with id ${entity.id} already exists`);
    }

    this.#indexes.entities.insert(entity);
  }

  /**
   * Add a Relationship to the graph. The Relationship must have a unique id.
   * @param relationship The Relationship to add.
   * @throws If a Relationship with the same id already exists.
   */
  addRelationship(relationship: Omit<Relationship, "id">) {
    const fullRelationship: Relationship = {
      ...relationship,
      id: relationshipToId(relationship as Relationship),
    };

    const s = this.#indexes.relationships.search(fullRelationship.id);

    if (s.size) {
      throw new Error(
        `Relationship with id ${fullRelationship.id} already exists`,
      );
    }

    this.#indexes.relationships.insert(fullRelationship);
  }
}
