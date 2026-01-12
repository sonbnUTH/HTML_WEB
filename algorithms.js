/**
 * algorithms.js - Graph Algorithms Implementation
 */

// BFS - Breadth First Search
function bfs(graph, startNodeId) {
    const visited = new Set();
    const queue = [startNodeId];
    const result = [];
    const order = [];

    visited.add(startNodeId);

    while (queue.length > 0) {
        const nodeId = queue.shift();
        result.push(nodeId);
        order.push(nodeId);

        const adjacentNodes = graph.getAdjacentNodes(nodeId);
        for (const neighbor of adjacentNodes) {
            if (!visited.has(neighbor)) {
                visited.add(neighbor);
                queue.push(neighbor);
            }
        }
    }

    return { result, order, visited };
}

// DFS - Depth First Search
function dfs(graph, startNodeId) {
    const visited = new Set();
    const result = [];
    const order = [];

    function dfsHelper(nodeId) {
        visited.add(nodeId);
        result.push(nodeId);
        order.push(nodeId);

        const adjacentNodes = graph.getAdjacentNodes(nodeId);
        for (const neighbor of adjacentNodes) {
            if (!visited.has(neighbor)) {
                dfsHelper(neighbor);
            }
        }
    }

    dfsHelper(startNodeId);
    return { result, order, visited };
}

// Dijkstra's Algorithm - Shortest Path
function dijkstra(graph, sourceId) {
    const distances = {};
    const previous = {};
    const unvisited = new Set();

    graph.nodes.forEach(node => {
        distances[node.id] = Infinity;
        previous[node.id] = null;
        unvisited.add(node.id);
    });

    distances[sourceId] = 0;

    while (unvisited.size > 0) {
        let minNode = null;
        let minDistance = Infinity;

        for (const nodeId of unvisited) {
            if (distances[nodeId] < minDistance) {
                minDistance = distances[nodeId];
                minNode = nodeId;
            }
        }

        if (minNode === null || minDistance === Infinity) break;

        unvisited.delete(minNode);

        const edges = graph.getEdgesFrom(minNode);
        for (const edge of edges) {
            if (unvisited.has(edge.to)) {
                const alt = distances[minNode] + edge.weight;
                if (alt < distances[edge.to]) {
                    distances[edge.to] = alt;
                    previous[edge.to] = minNode;
                }
            }
        }
    }

    return { distances, previous };
}

// Get shortest path from source to target
function getShortestPath(graph, sourceId, targetId) {
    const { distances, previous } = dijkstra(graph, sourceId);
    const path = [];
    let current = targetId;

    if (distances[targetId] === Infinity) {
        return { distance: Infinity, path: [] };
    }

    while (current !== null) {
        path.unshift(current);
        current = previous[current];
    }

    return { distance: distances[targetId], path };
}

// Check if graph is bipartite (2-colorable)
function isBipartite(graph) {
    const colors = {};
    const set1 = [];
    const set2 = [];

    graph.nodes.forEach(node => {
        colors[node.id] = null;
    });

    for (const node of graph.nodes) {
        if (colors[node.id] === null) {
            const queue = [node.id];
            colors[node.id] = 0;

            while (queue.length > 0) {
                const current = queue.shift();
                const color = colors[current];

                const adjacentNodes = graph.getAdjacentNodes(current);
                for (const neighbor of adjacentNodes) {
                    if (colors[neighbor] === null) {
                        colors[neighbor] = 1 - color;
                        queue.push(neighbor);
                    } else if (colors[neighbor] === color) {
                        return { isBipartite: false, set1: [], set2: [] };
                    }
                }
            }
        }
    }

    // Collect nodes in each set
    for (const [nodeId, color] of Object.entries(colors)) {
        if (color === 0) set1.push(nodeId);
        else set2.push(nodeId);
    }

    return { isBipartite: true, set1, set2 };
}

// Prim's Algorithm - Minimum Spanning Tree
function prim(graph, startNodeId) {
    const inMST = new Set();
    const mstEdges = [];
    let totalCost = 0;

    inMST.add(startNodeId);

    while (inMST.size < graph.nodes.length) {
        let minEdge = null;
        let minWeight = Infinity;

        // Find minimum weight edge
        for (const nodeId of inMST) {
            const edges = graph.getEdgesFrom(nodeId);
            for (const edge of edges) {
                if (!inMST.has(edge.to) && edge.weight < minWeight) {
                    minWeight = edge.weight;
                    minEdge = edge;
                }
            }
        }

        if (minEdge === null) break;

        mstEdges.push(minEdge);
        totalCost += minEdge.weight;
        inMST.add(minEdge.to);
    }

    return { mstEdges, totalCost, inMST };
}

// Kruskal's Algorithm - Minimum Spanning Tree
function kruskal(graph) {
    const mstEdges = [];
    let totalCost = 0;

    // Sort edges by weight
    const sortedEdges = [...graph.edges].sort((a, b) => a.weight - b.weight);

    // Union-Find data structure
    const parent = {};
    const rank = {};

    graph.nodes.forEach(node => {
        parent[node.id] = node.id;
        rank[node.id] = 0;
    });

    function find(x) {
        if (parent[x] !== x) {
            parent[x] = find(parent[x]);
        }
        return parent[x];
    }

    function union(x, y) {
        const px = find(x);
        const py = find(y);

        if (px === py) return false;

        if (rank[px] < rank[py]) {
            parent[px] = py;
        } else if (rank[px] > rank[py]) {
            parent[py] = px;
        } else {
            parent[py] = px;
            rank[px]++;
        }
        return true;
    }

    for (const edge of sortedEdges) {
        if (union(edge.from, edge.to)) {
            mstEdges.push(edge);
            totalCost += edge.weight;
            if (mstEdges.length === graph.nodes.length - 1) break;
        }
    }

    return { mstEdges, totalCost };
}

// Ford-Fulkerson Algorithm - Maximum Flow
function fordFulkerson(graph, sourceId, sinkId) {
    const residualGraph = {};
    let maxFlow = 0;

    // Initialize residual graph
    graph.nodes.forEach(node => {
        residualGraph[node.id] = {};
        graph.nodes.forEach(node2 => {
            residualGraph[node.id][node2.id] = 0;
        });
    });

    // Set capacities
    graph.edges.forEach(edge => {
        residualGraph[edge.from][edge.to] = edge.weight;
    });

    // BFS to find augmenting paths
    function findAugmentingPath(source, sink) {
        const parent = {};
        const visited = new Set();
        const queue = [source];
        visited.add(source);

        while (queue.length > 0) {
            const current = queue.shift();

            for (const next of graph.nodes.map(n => n.id)) {
                if (!visited.has(next) && residualGraph[current][next] > 0) {
                    visited.add(next);
                    parent[next] = current;
                    queue.push(next);

                    if (next === sink) {
                        const path = [];
                        let node = sink;
                        while (node !== source) {
                            path.unshift(node);
                            node = parent[node];
                        }
                        path.unshift(source);
                        return path;
                    }
                }
            }
        }

        return null;
    }

    // Find augmenting paths and update flow
    let path = findAugmentingPath(sourceId, sinkId);
    while (path) {
        // Find minimum capacity along path
        let minCapacity = Infinity;
        for (let i = 0; i < path.length - 1; i++) {
            minCapacity = Math.min(minCapacity, residualGraph[path[i]][path[i + 1]]);
        }

        // Update residual capacities
        for (let i = 0; i < path.length - 1; i++) {
            residualGraph[path[i]][path[i + 1]] -= minCapacity;
            residualGraph[path[i + 1]][path[i]] += minCapacity;
        }

        maxFlow += minCapacity;
        path = findAugmentingPath(sourceId, sinkId);
    }

    return { maxFlow, residualGraph };
}

// Fleury's Algorithm - Find Euler Path
function fleury(graph) {
    // Check if Euler path exists
    const degrees = {};
    graph.nodes.forEach(node => {
        degrees[node.id] = graph.getAdjacentNodes(node.id).length;
    });

    let oddDegreeCount = 0;
    let oddNode = null;

    for (const [nodeId, degree] of Object.entries(degrees)) {
        if (degree % 2 === 1) {
            oddDegreeCount++;
            oddNode = nodeId;
        }
    }

    if (oddDegreeCount !== 0 && oddDegreeCount !== 2) {
        return { hasEulerPath: false, path: [], message: 'No Euler path exists' };
    }

    const startNode = oddNode || graph.nodes[0].id;
    const edges = JSON.parse(JSON.stringify(graph.edges));
    const path = [startNode];
    let current = startNode;

    while (edges.length > 0) {
        let nextEdgeIndex = -1;

        // Find next edge
        for (let i = 0; i < edges.length; i++) {
            if (edges[i].from === current) {
                nextEdgeIndex = i;
                break;
            }
        }

        if (nextEdgeIndex === -1) break;

        const edge = edges[nextEdgeIndex];
        edges.splice(nextEdgeIndex, 1);
        current = edge.to;
        path.push(current);
    }

    return { hasEulerPath: edges.length === 0, path, message: 'Euler path found' };
}

// Hierholzer's Algorithm - Find Euler Circuit
function hierholzer(graph) {
    // Check if Euler circuit exists (all vertices have even degree)
    const degrees = {};
    graph.nodes.forEach(node => {
        degrees[node.id] = graph.getAdjacentNodes(node.id).length;
    });

    for (const [nodeId, degree] of Object.entries(degrees)) {
        if (degree % 2 !== 0) {
            return { hasEulerCircuit: false, circuit: [], message: 'No Euler circuit exists' };
        }
    }

    if (graph.nodes.length === 0) {
        return { hasEulerCircuit: false, circuit: [], message: 'Graph is empty' };
    }

    const edges = JSON.parse(JSON.stringify(graph.edges));
    const stack = [graph.nodes[0].id];
    const circuit = [];

    while (stack.length > 0) {
        const current = stack[stack.length - 1];
        let foundEdge = false;

        for (let i = 0; i < edges.length; i++) {
            if (edges[i].from === current) {
                stack.push(edges[i].to);
                edges.splice(i, 1);
                foundEdge = true;
                break;
            }
        }

        if (!foundEdge) {
            circuit.push(stack.pop());
        }
    }

    circuit.reverse();

    return { hasEulerCircuit: edges.length === 0, circuit, message: 'Euler circuit found' };
}

// Degree of a node
function getNodeDegree(graph, nodeId) {
    return graph.getAdjacentNodes(nodeId).length;
}

// Is graph connected
function isConnected(graph) {
    if (graph.nodes.length === 0) return true;

    const visited = new Set();
    const queue = [graph.nodes[0].id];
    visited.add(graph.nodes[0].id);

    while (queue.length > 0) {
        const current = queue.shift();
        const adjacentNodes = graph.getAdjacentNodes(current);

        for (const neighbor of adjacentNodes) {
            if (!visited.has(neighbor)) {
                visited.add(neighbor);
                queue.push(neighbor);
            }
        }
    }

    return visited.size === graph.nodes.length;
}
