import type { SerializedGraph } from "../types";
import { Graph } from "./Graph";

/**
 * Odin is a graph database.
 */
export class Odin {
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
   * Create a graph from a serialized graph. The serialized graph can be
   * created by calling the `export` method on a graph.
   * @param name The name of the graph.
   * @param serialized The serialized graph.
   */
  createGraphFromSerialized(name: string, serialized: SerializedGraph) {
    const graph = this.createGraph(name);
    graph.import(serialized);
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
