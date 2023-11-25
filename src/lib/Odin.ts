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
