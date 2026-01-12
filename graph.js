/**
 * Graph.js - Graph Data Structure and Basic Operations
 */

class Graph {
    constructor(isDirected = false, isWeighted = false) {
        this.nodes = [];
        this.edges = [];
        this.isDirected = isDirected;
        this.isWeighted = isWeighted;
        this.nodePositions = {};
    }

    // Add a node to the graph
    addNode(id, x, y) {
        if (!this.nodes.find(n => n.id === id)) {
            this.nodes.push({ id, label: `V${id}` });
            this.nodePositions[id] = { x, y };
        }
    }

    // Add an edge to the graph
    addEdge(from, to, weight = 1) {
        // Avoid duplicate edges
        if (this.edges.find(e => e.from === from && e.to === to)) {
            return;
        }

        this.edges.push({
            from,
            to,
            weight: this.isWeighted ? weight : 1
        });

        // For undirected graphs, add reverse edge
        if (!this.isDirected) {
            if (!this.edges.find(e => e.from === to && e.to === from)) {
                this.edges.push({
                    from: to,
                    to: from,
                    weight: this.isWeighted ? weight : 1
                });
            }
        }
    }

    // Remove a node
    removeNode(id) {
        this.nodes = this.nodes.filter(n => n.id !== id);
        this.edges = this.edges.filter(e => e.from !== id && e.to !== id);
        delete this.nodePositions[id];
    }

    // Remove an edge
    removeEdge(from, to) {
        this.edges = this.edges.filter(e => !(e.from === from && e.to === to));
        if (!this.isDirected) {
            this.edges = this.edges.filter(e => !(e.from === to && e.to === from));
        }
    }

    // Get adjacent nodes of a given node
    getAdjacentNodes(nodeId) {
        return this.edges
            .filter(e => e.from === nodeId)
            .map(e => e.to);
    }

    // Get all edges from a node
    getEdgesFrom(nodeId) {
        return this.edges.filter(e => e.from === nodeId);
    }

    // Get edge weight
    getEdgeWeight(from, to) {
        const edge = this.edges.find(e => e.from === from && e.to === to);
        return edge ? edge.weight : Infinity;
    }

    // Get adjacency matrix representation
    getAdjacencyMatrix() {
        const n = this.nodes.length;
        const matrix = Array(n).fill(0).map(() => Array(n).fill(0));
        const idToIndex = {};

        this.nodes.forEach((node, idx) => {
            idToIndex[node.id] = idx;
        });

        this.edges.forEach(edge => {
            const i = idToIndex[edge.from];
            const j = idToIndex[edge.to];
            if (this.isWeighted) {
                matrix[i][j] = edge.weight;
            } else {
                matrix[i][j] = 1;
            }
        });

        return {
            matrix,
            nodeIds: this.nodes.map(n => n.id)
        };
    }

    // Get adjacency list representation
    getAdjacencyList() {
        const list = {};
        this.nodes.forEach(node => {
            list[node.id] = [];
        });

        this.edges.forEach(edge => {
            if (this.isWeighted) {
                list[edge.from].push(`${edge.to}(${edge.weight})`);
            } else {
                list[edge.from].push(edge.to);
            }
        });

        return list;
    }

    // Get edge list representation
    getEdgeList() {
        return this.edges.map(edge => ({
            from: edge.from,
            to: edge.to,
            weight: edge.weight
        }));
    }

    // Create from adjacency matrix
    static fromAdjacencyMatrix(matrix, nodeIds, isDirected, isWeighted) {
        const graph = new Graph(isDirected, isWeighted);

        // Add nodes (with dummy positions)
        nodeIds.forEach((id, idx) => {
            graph.addNode(id, idx * 100, 100);
        });

        // Add edges
        for (let i = 0; i < matrix.length; i++) {
            for (let j = 0; j < matrix[i].length; j++) {
                if (matrix[i][j] !== 0) {
                    graph.addEdge(nodeIds[i], nodeIds[j], matrix[i][j]);
                }
            }
        }

        return graph;
    }

    // Create from edge list
    static fromEdgeList(edges, isDirected, isWeighted) {
        const graph = new Graph(isDirected, isWeighted);
        const nodeIds = new Set();

        edges.forEach(edge => {
            nodeIds.add(edge.from);
            nodeIds.add(edge.to);
        });

        let idx = 0;
        nodeIds.forEach(id => {
            graph.addNode(id, idx * 100, 100);
            idx++;
        });

        edges.forEach(edge => {
            graph.addEdge(edge.from, edge.to, edge.weight);
        });

        return graph;
    }

    // Check if graph is empty
    isEmpty() {
        return this.nodes.length === 0;
    }

    // Get number of nodes
    getNodeCount() {
        return this.nodes.length;
    }

    // Get number of edges
    getEdgeCount() {
        return this.edges.length;
    }

    // Get node by id
    getNode(id) {
        return this.nodes.find(n => n.id === id);
    }

    // Clone the graph
    clone() {
        const newGraph = new Graph(this.isDirected, this.isWeighted);
        
        this.nodes.forEach(node => {
            const pos = this.nodePositions[node.id];
            newGraph.addNode(node.id, pos.x, pos.y);
        });

        this.edges.forEach(edge => {
            newGraph.addEdge(edge.from, edge.to, edge.weight);
        });

        return newGraph;
    }

    // Clear the graph
    clear() {
        this.nodes = [];
        this.edges = [];
        this.nodePositions = {};
    }

    // Serialize graph to JSON
    toJSON() {
        return {
            nodes: this.nodes,
            edges: this.edges,
            nodePositions: this.nodePositions,
            isDirected: this.isDirected,
            isWeighted: this.isWeighted
        };
    }

    // Deserialize graph from JSON
    static fromJSON(json) {
        const graph = new Graph(json.isDirected, json.isWeighted);
        graph.nodes = json.nodes;
        graph.edges = json.edges;
        graph.nodePositions = json.nodePositions;
        return graph;
    }
}

// Global graph instance
let globalGraph = new Graph(false, false);
