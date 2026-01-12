/**
 * visualization.js - Canvas Drawing and Visualization
 */

class GraphVisualizer {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas.getContext('2d');
        this.nodeRadius = 25;
        this.highlightedNodes = new Set();
        this.highlightedEdges = [];
        this.animationStep = 0;
    }

    clear() {
        this.ctx.fillStyle = 'white';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    }

    drawNode(x, y, id, color = '#3498db', radius = null) {
        const r = radius || this.nodeRadius;
        
        // Draw circle
        this.ctx.beginPath();
        this.ctx.arc(x, y, r, 0, 2 * Math.PI);
        this.ctx.fillStyle = color;
        this.ctx.fill();
        this.ctx.strokeStyle = '#2c3e50';
        this.ctx.lineWidth = 2;
        this.ctx.stroke();

        // Draw label
        this.ctx.fillStyle = 'white';
        this.ctx.font = 'bold 14px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        this.ctx.fillText(id, x, y);
    }

    drawEdge(fromX, fromY, toX, toY, weight = null, isDirected = false, color = '#2c3e50', lineWidth = 2) {
        this.ctx.strokeStyle = color;
        this.ctx.lineWidth = lineWidth;
        this.ctx.beginPath();
        this.ctx.moveTo(fromX, fromY);
        this.ctx.lineTo(toX, toY);
        this.ctx.stroke();

        // Draw arrow for directed graphs
        if (isDirected) {
            const angle = Math.atan2(toY - fromY, toX - fromX);
            const arrowSize = 15;

            this.ctx.beginPath();
            this.ctx.moveTo(toX, toY);
            this.ctx.lineTo(toX - arrowSize * Math.cos(angle - Math.PI / 6), toY - arrowSize * Math.sin(angle - Math.PI / 6));
            this.ctx.moveTo(toX, toY);
            this.ctx.lineTo(toX - arrowSize * Math.cos(angle + Math.PI / 6), toY - arrowSize * Math.sin(angle + Math.PI / 6));
            this.ctx.stroke();
        }

        // Draw weight if present
        if (weight !== null) {
            const midX = (fromX + toX) / 2;
            const midY = (fromY + toY) / 2;

            this.ctx.fillStyle = 'white';
            this.ctx.fillRect(midX - 15, midY - 10, 30, 20);
            this.ctx.fillStyle = '#2c3e50';
            this.ctx.font = '12px Arial';
            this.ctx.textAlign = 'center';
            this.ctx.textBaseline = 'middle';
            this.ctx.fillText(weight, midX, midY);
        }
    }

    drawGraph(graph, highlightedEdges = [], highlightedNodes = {}) {
        this.clear();

        // Draw edges
        graph.edges.forEach((edge, idx) => {
            const fromPos = graph.nodePositions[edge.from];
            const toPos = graph.nodePositions[edge.to];

            if (fromPos && toPos) {
                const isHighlighted = highlightedEdges.some(e => e.from === edge.from && e.to === edge.to);
                const color = isHighlighted ? '#e74c3c' : '#2c3e50';
                const lineWidth = isHighlighted ? 3 : 2;

                this.drawEdge(
                    fromPos.x,
                    fromPos.y,
                    toPos.x,
                    toPos.y,
                    graph.isWeighted ? edge.weight : null,
                    graph.isDirected,
                    color,
                    lineWidth
                );
            }
        });

        // Draw nodes
        graph.nodes.forEach(node => {
            const pos = graph.nodePositions[node.id];
            if (pos) {
                const color = highlightedNodes[node.id] || '#3498db';
                this.drawNode(pos.x, pos.y, node.id, color);
            }
        });
    }

    drawTraversal(graph, visitOrder, highlightedEdges = []) {
        this.clear();

        // Draw edges
        graph.edges.forEach(edge => {
            const fromPos = graph.nodePositions[edge.from];
            const toPos = graph.nodePositions[edge.to];

            if (fromPos && toPos) {
                const isHighlighted = highlightedEdges.some(e => e.from === edge.from && e.to === edge.to);
                const color = isHighlighted ? '#e74c3c' : '#bdc3c7';
                this.drawEdge(
                    fromPos.x,
                    fromPos.y,
                    toPos.x,
                    toPos.y,
                    graph.isWeighted ? edge.weight : null,
                    graph.isDirected,
                    color
                );
            }
        });

        // Draw nodes with visit order
        graph.nodes.forEach(node => {
            const pos = graph.nodePositions[node.id];
            if (pos) {
                const order = visitOrder.indexOf(node.id);
                const color = order >= 0 ? '#2ecc71' : '#95a5a6';
                this.drawNode(pos.x, pos.y, node.id, color);

                // Draw visit order
                if (order >= 0) {
                    this.ctx.fillStyle = '#e74c3c';
                    this.ctx.font = 'bold 12px Arial';
                    this.ctx.textAlign = 'center';
                    this.ctx.textBaseline = 'top';
                    this.ctx.fillText(order + 1, pos.x, pos.y + 35);
                }
            }
        });
    }

    drawShortestPath(graph, path, distances) {
        this.clear();

        // Draw edges
        graph.edges.forEach(edge => {
            const fromPos = graph.nodePositions[edge.from];
            const toPos = graph.nodePositions[edge.to];

            if (fromPos && toPos) {
                const isInPath = path.length > 1 && 
                    ((path.includes(edge.from) && path.includes(edge.to)) ||
                    (graph.isDirected && path.some((n, i) => n === edge.from && i < path.length - 1 && path[i + 1] === edge.to)));

                const color = isInPath ? '#e74c3c' : '#bdc3c7';
                const lineWidth = isInPath ? 3 : 2;

                this.drawEdge(
                    fromPos.x,
                    fromPos.y,
                    toPos.x,
                    toY,
                    graph.isWeighted ? edge.weight : null,
                    graph.isDirected,
                    color,
                    lineWidth
                );
            }
        });

        // Draw nodes
        graph.nodes.forEach(node => {
            const pos = graph.nodePositions[node.id];
            if (pos) {
                let color = '#3498db';
                if (path.includes(node.id)) {
                    color = '#e74c3c';
                }

                this.drawNode(pos.x, pos.y, node.id, color);

                // Draw distance
                if (distances && distances[node.id] !== Infinity) {
                    this.ctx.fillStyle = '#2c3e50';
                    this.ctx.font = '11px Arial';
                    this.ctx.textAlign = 'center';
                    this.ctx.textBaseline = 'top';
                    this.ctx.fillText(`d:${distances[node.id]}`, pos.x, pos.y + 35);
                }
            }
        });
    }

    drawBipartite(graph, set1, set2) {
        this.clear();

        // Draw edges
        graph.edges.forEach(edge => {
            const fromPos = graph.nodePositions[edge.from];
            const toPos = graph.nodePositions[edge.to];

            if (fromPos && toPos) {
                this.drawEdge(
                    fromPos.x,
                    fromPos.y,
                    toPos.x,
                    toPos.y,
                    graph.isWeighted ? edge.weight : null,
                    graph.isDirected,
                    '#bdc3c7'
                );
            }
        });

        // Draw nodes with different colors for each set
        graph.nodes.forEach(node => {
            const pos = graph.nodePositions[node.id];
            if (pos) {
                const color = set1.includes(node.id) ? '#3498db' : '#e74c3c';
                this.drawNode(pos.x, pos.y, node.id, color);
            }
        });
    }

    drawMST(graph, mstEdges, highlightedNodes = {}) {
        this.clear();

        // Draw all edges
        graph.edges.forEach(edge => {
            const fromPos = graph.nodePositions[edge.from];
            const toPos = graph.nodePositions[edge.to];

            if (fromPos && toPos) {
                const isInMST = mstEdges.some(e => 
                    (e.from === edge.from && e.to === edge.to) ||
                    (e.from === edge.to && e.to === edge.from)
                );

                const color = isInMST ? '#e74c3c' : '#bdc3c7';
                const lineWidth = isInMST ? 3 : 1;

                this.drawEdge(
                    fromPos.x,
                    fromPos.y,
                    toPos.x,
                    toPos.y,
                    graph.isWeighted ? edge.weight : null,
                    graph.isDirected,
                    color,
                    lineWidth
                );
            }
        });

        // Draw nodes
        graph.nodes.forEach(node => {
            const pos = graph.nodePositions[node.id];
            if (pos) {
                const color = highlightedNodes[node.id] || '#3498db';
                this.drawNode(pos.x, pos.y, node.id, color);
            }
        });
    }

    getCanvasCoordinates(event) {
        const rect = this.canvas.getBoundingClientRect();
        return {
            x: event.clientX - rect.left,
            y: event.clientY - rect.top
        };
    }

    getNodeAtPosition(graph, x, y) {
        for (const node of graph.nodes) {
            const pos = graph.nodePositions[node.id];
            if (pos) {
                const dx = x - pos.x;
                const dy = y - pos.y;
                const distance = Math.sqrt(dx * dx + dy * dy);

                if (distance <= this.nodeRadius) {
                    return node.id;
                }
            }
        }
        return null;
    }

    drawText(x, y, text, color = '#2c3e50', fontSize = '14px') {
        this.ctx.fillStyle = color;
        this.ctx.font = `${fontSize} Arial`;
        this.ctx.textAlign = 'left';
        this.ctx.textBaseline = 'top';
        this.ctx.fillText(text, x, y);
    }
}

// Create visualizers for each canvas
let visualizers = {};

function initVisualizers() {
    const canvases = [
        'graphCanvas',
        'traversalCanvas',
        'pathCanvas',
        'bipartiteCanvas',
        'primCanvas',
        'kruskalCanvas',
        'ffCanvas',
        'fleuryCanvas',
        'hierholzerCanvas'
    ];

    canvases.forEach(canvasId => {
        const element = document.getElementById(canvasId);
        if (element) {
            visualizers[canvasId] = new GraphVisualizer(canvasId);
        }
    });
}

// Initialize visualizers when page loads
window.addEventListener('load', initVisualizers);

// Draw the main graph
function drawMainGraph() {
    if (visualizers['graphCanvas']) {
        visualizers['graphCanvas'].drawGraph(globalGraph);
    }
}
