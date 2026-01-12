/**
 * app.js - Main Application Logic
 */

// State variables
let drawingMode = 'addNode'; // 'addNode' or 'addEdge'
let selectedNode = null;
let nextNodeId = 0;

// Initialize app
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
});

function initializeApp() {
    // Canvas event listeners
    const graphCanvas = document.getElementById('graphCanvas');
    if (graphCanvas) {
        graphCanvas.addEventListener('click', handleCanvasClick);
        graphCanvas.addEventListener('mousemove', handleCanvasMouseMove);
        graphCanvas.addEventListener('mousedown', handleCanvasMouseDown);
        graphCanvas.addEventListener('mouseup', handleCanvasMouseUp);
    }

    // Toggle mode button
    const toggleModeBtn = document.getElementById('toggleMode');
    if (toggleModeBtn) {
        toggleModeBtn.addEventListener('click', toggleDrawingMode);
    }

    // Initial draw
    drawMainGraph();
}

// Tab switching
function showTab(tabName) {
    // Hide all tabs
    const tabs = document.querySelectorAll('.tab-content');
    tabs.forEach(tab => tab.classList.remove('active'));

    // Show selected tab
    const selectedTab = document.getElementById(tabName);
    if (selectedTab) {
        selectedTab.classList.add('active');

        // Redraw canvas for the tab
        setTimeout(() => {
            if (tabName === 'draw') {
                drawMainGraph();
            } else if (tabName === 'traversal') {
                visualizers['traversalCanvas']?.drawGraph(globalGraph);
            } else if (tabName === 'shortestPath') {
                visualizers['pathCanvas']?.drawGraph(globalGraph);
            } else if (tabName === 'bipartite') {
                visualizers['bipartiteCanvas']?.drawGraph(globalGraph);
            }
        }, 100);
    }
}

// Drawing mode toggle
function toggleDrawingMode() {
    const btn = document.getElementById('toggleMode');
    if (drawingMode === 'addNode') {
        drawingMode = 'addEdge';
        btn.textContent = '🔗 Chế độ: Thêm Cạnh';
        document.getElementById('instruction').textContent = 'Kéo từ một đỉnh đến đỉnh khác để tạo cạnh';
    } else {
        drawingMode = 'addNode';
        btn.textContent = '🔵 Chế độ: Thêm Đỉnh';
        document.getElementById('instruction').textContent = 'Click để thêm đỉnh, kéo để tạo cạnh';
    }
}

// Canvas click handler
function handleCanvasClick(e) {
    if (drawingMode !== 'addNode') return;

    const coord = visualizers['graphCanvas'].getCanvasCoordinates(e);
    const existingNode = visualizers['graphCanvas'].getNodeAtPosition(globalGraph, coord.x, coord.y);

    if (!existingNode) {
        globalGraph.addNode(nextNodeId, coord.x, coord.y);
        nextNodeId++;
        drawMainGraph();
    }
}

// Canvas mouse down handler
let dragStart = null;

function handleCanvasMouseDown(e) {
    if (drawingMode !== 'addEdge') return;

    const coord = visualizers['graphCanvas'].getCanvasCoordinates(e);
    dragStart = coord;
    selectedNode = visualizers['graphCanvas'].getNodeAtPosition(globalGraph, coord.x, coord.y);
}

// Canvas mouse move handler
function handleCanvasMouseMove(e) {
    if (drawingMode !== 'addEdge' || !dragStart || !selectedNode) return;

    const coord = visualizers['graphCanvas'].getCanvasCoordinates(e);
    
    // Redraw with preview line
    drawMainGraph();

    const startPos = globalGraph.nodePositions[selectedNode];
    if (startPos) {
        visualizers['graphCanvas'].drawEdge(startPos.x, startPos.y, coord.x, coord.y, null, globalGraph.isDirected);
    }
}

// Canvas mouse up handler
function handleCanvasMouseUp(e) {
    if (drawingMode !== 'addEdge' || !dragStart || !selectedNode) {
        dragStart = null;
        selectedNode = null;
        return;
    }

    const coord = visualizers['graphCanvas'].getCanvasCoordinates(e);
    const targetNode = visualizers['graphCanvas'].getNodeAtPosition(globalGraph, coord.x, coord.y);

    if (targetNode && targetNode !== selectedNode) {
        // Ask for weight if weighted graph
        let weight = 1;
        if (globalGraph.isWeighted) {
            weight = parseFloat(prompt('Nhập trọng số cạnh:', '1')) || 1;
        }
        globalGraph.addEdge(selectedNode, targetNode, weight);
        drawMainGraph();
    }

    dragStart = null;
    selectedNode = null;
}

// Add weight to existing edge
function addWeightToEdge() {
    if (!globalGraph.isWeighted) {
        alert('Vui lòng bật "Có trọng số" trước');
        return;
    }
    alert('Tính năng này sẽ được cập nhật');
}

// Clear graph
function clearGraph() {
    if (confirm('Bạn chắc chắn muốn xóa toàn bộ đồ thị?')) {
        globalGraph.clear();
        nextNodeId = 0;
        drawMainGraph();
        resetVisualization();
    }
}

// Reset visualization
function resetVisualization() {
    document.querySelectorAll('.result-box').forEach(box => {
        box.innerHTML = '';
    });
    document.querySelectorAll('canvas').forEach(canvas => {
        const ctx = canvas.getContext('2d');
        ctx.fillStyle = 'white';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
    });
}

// Generate random graph
function generateRandomGraph() {
    clearGraph();

    const nodeCount = parseInt(prompt('Số đỉnh:', '5')) || 5;
    const edgeCount = parseInt(prompt('Số cạnh:', '7')) || 7;

    // Add nodes in a circle
    const centerX = 400;
    const centerY = 300;
    const radius = 150;

    for (let i = 0; i < nodeCount; i++) {
        const angle = (i / nodeCount) * 2 * Math.PI;
        const x = centerX + radius * Math.cos(angle);
        const y = centerY + radius * Math.sin(angle);
        globalGraph.addNode(i, x, y);
        nextNodeId = i + 1;
    }

    // Add random edges
    const addedEdges = new Set();
    for (let i = 0; i < edgeCount; i++) {
        let from, to;
        do {
            from = Math.floor(Math.random() * nodeCount);
            to = Math.floor(Math.random() * nodeCount);
        } while (from === to || addedEdges.has(`${from}-${to}`));

        addedEdges.add(`${from}-${to}`);
        const weight = globalGraph.isWeighted ? Math.floor(Math.random() * 10) + 1 : 1;
        globalGraph.addEdge(from, to, weight);
    }

    drawMainGraph();
}

// ===== Basic Algorithms =====

// BFS Traversal
function performBFS() {
    const startNode = parseInt(document.getElementById('startNode').value);

    if (isNaN(startNode) || !globalGraph.getNode(startNode)) {
        alert('Vui lòng nhập đỉnh bắt đầu hợp lệ');
        return;
    }

    const { result, order, visited } = bfs(globalGraph, startNode);

    document.getElementById('traversalResult').innerHTML = 
        `<span class="success">✓ Duyệt thành công</span>`;
    document.getElementById('traversalOrder').innerHTML = 
        order.join(' → ');

    visualizers['traversalCanvas'].drawTraversal(globalGraph, order);
}

// DFS Traversal
function performDFS() {
    const startNode = parseInt(document.getElementById('startNode').value);

    if (isNaN(startNode) || !globalGraph.getNode(startNode)) {
        alert('Vui lòng nhập đỉnh bắt đầu hợp lệ');
        return;
    }

    const { result, order, visited } = dfs(globalGraph, startNode);

    document.getElementById('traversalResult').innerHTML = 
        `<span class="success">✓ Duyệt thành công</span>`;
    document.getElementById('traversalOrder').innerHTML = 
        order.join(' → ');

    visualizers['traversalCanvas'].drawTraversal(globalGraph, order);
}

// Find Shortest Path
function findShortestPath() {
    const source = parseInt(document.getElementById('sourceNode').value);
    const target = parseInt(document.getElementById('targetNode').value);

    if (isNaN(source) || isNaN(target) || !globalGraph.getNode(source) || !globalGraph.getNode(target)) {
        alert('Vui lòng nhập đỉnh hợp lệ');
        return;
    }

    const { distance, path } = getShortestPath(globalGraph, source, target);

    if (distance === Infinity) {
        document.getElementById('distance').innerHTML = 
            `<span class="error">✗ Không có đường đi</span>`;
        document.getElementById('pathResult').innerHTML = '';
    } else {
        document.getElementById('distance').innerHTML = distance;
        document.getElementById('pathResult').innerHTML = path.join(' → ');
    }

    const { distances } = dijkstra(globalGraph, source);
    visualizers['pathCanvas'].drawShortestPath(globalGraph, path, distances);
}

// Check Bipartite
function checkBipartite() {
    const { isBipartite, set1, set2 } = isBipartite(globalGraph);

    if (isBipartite) {
        document.getElementById('bipartiteResult').innerHTML = 
            `<span class="success">✓ Đồ thị là 2 phía</span>`;
    } else {
        document.getElementById('bipartiteResult').innerHTML = 
            `<span class="error">✗ Đồ thị không phải 2 phía</span>`;
    }

    document.getElementById('set1').innerHTML = set1.join(', ');
    document.getElementById('set2').innerHTML = set2.join(', ');

    visualizers['bipartiteCanvas'].drawBipartite(globalGraph, set1, set2);
}

// Show Adjacency Matrix
function showAdjacencyMatrix() {
    const { matrix, nodeIds } = globalGraph.getAdjacencyMatrix();
    let html = '<table style="border-collapse: collapse; width: 100%;">';

    // Header
    html += '<tr><th style="border: 1px solid #ddd; padding: 8px;">V</th>';
    nodeIds.forEach(id => {
        html += `<th style="border: 1px solid #ddd; padding: 8px;">${id}</th>`;
    });
    html += '</tr>';

    // Rows
    nodeIds.forEach((rowId, i) => {
        html += `<tr><th style="border: 1px solid #ddd; padding: 8px;">${rowId}</th>`;
        matrix[i].forEach(val => {
            html += `<td style="border: 1px solid #ddd; padding: 8px; text-align: center;">${val}</td>`;
        });
        html += '</tr>';
    });

    html += '</table>';
    document.getElementById('representationResult').innerHTML = html;
}

// Show Adjacency List
function showAdjacencyList() {
    const list = globalGraph.getAdjacencyList();
    let html = '<pre style="background: #f5f5f5; padding: 10px; border-radius: 4px; overflow-x: auto;">';

    for (const [nodeId, neighbors] of Object.entries(list)) {
        html += `${nodeId}: [${neighbors.join(', ')}]\n`;
    }

    html += '</pre>';
    document.getElementById('representationResult').innerHTML = html;
}

// Show Edge List
function showEdgeList() {
    const edges = globalGraph.getEdgeList();
    let html = '<table style="border-collapse: collapse; width: 100%;">';

    html += '<tr><th style="border: 1px solid #ddd; padding: 8px;">From</th>';
    html += '<th style="border: 1px solid #ddd; padding: 8px;">To</th>';
    if (globalGraph.isWeighted) {
        html += '<th style="border: 1px solid #ddd; padding: 8px;">Weight</th>';
    }
    html += '</tr>';

    edges.forEach(edge => {
        html += `<tr><td style="border: 1px solid #ddd; padding: 8px;">${edge.from}</td>`;
        html += `<td style="border: 1px solid #ddd; padding: 8px;">${edge.to}</td>`;
        if (globalGraph.isWeighted) {
            html += `<td style="border: 1px solid #ddd; padding: 8px; text-align: center;">${edge.weight}</td>`;
        }
        html += '</tr>';
    });

    html += '</table>';
    document.getElementById('representationResult').innerHTML = html;
}

// Save Graph
function saveGraph() {
    const graphData = globalGraph.toJSON();
    const json = JSON.stringify(graphData, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `graph_${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);

    document.getElementById('saveResult').innerHTML = 
        `<span class="success">✓ Lưu đồ thị thành công!</span>`;
}

// Load Graph
function loadGraph(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const json = JSON.parse(e.target.result);
            globalGraph = Graph.fromJSON(json);
            nextNodeId = Math.max(...globalGraph.nodes.map(n => n.id)) + 1 || 0;
            drawMainGraph();
            document.getElementById('saveResult').innerHTML = 
                `<span class="success">✓ Tải đồ thị thành công!</span>`;
        } catch (error) {
            alert('Lỗi khi tải file: ' + error.message);
        }
    };
    reader.readAsText(file);
}

// Export as Image
function exportAsImage() {
    const canvas = document.getElementById('graphCanvas');
    const image = canvas.toDataURL('image/png');
    const a = document.createElement('a');
    a.href = image;
    a.download = `graph_${Date.now()}.png`;
    a.click();
    document.getElementById('saveResult').innerHTML = 
        `<span class="success">✓ Xuất hình ảnh thành công!</span>`;
}

// ===== Advanced Algorithms =====

// Prim's Algorithm
function visualizePrim() {
    const startNode = parseInt(document.getElementById('primStart').value);

    if (isNaN(startNode) || !globalGraph.getNode(startNode)) {
        alert('Vui lòng nhập đỉnh bắt đầu hợp lệ');
        return;
    }

    if (!globalGraph.isWeighted) {
        alert('Prim yêu cầu đồ thị có trọng số');
        return;
    }

    const { mstEdges, totalCost, inMST } = prim(globalGraph, startNode);

    document.getElementById('primCost').innerHTML = totalCost;
    document.getElementById('primEdges').innerHTML = mstEdges
        .map(e => `(${e.from},${e.to}):${e.weight}`)
        .join(', ');

    visualizers['primCanvas'].drawMST(globalGraph, mstEdges);
}

// Kruskal's Algorithm
function visualizeKruskal() {
    if (!globalGraph.isWeighted) {
        alert('Kruskal yêu cầu đồ thị có trọng số');
        return;
    }

    const { mstEdges, totalCost } = kruskal(globalGraph);

    document.getElementById('kruskalCost').innerHTML = totalCost;
    document.getElementById('kruskalEdges').innerHTML = mstEdges
        .map(e => `(${e.from},${e.to}):${e.weight}`)
        .join(', ');

    visualizers['kruskalCanvas'].drawMST(globalGraph, mstEdges);
}

// Ford-Fulkerson
function visualizeFordFulkerson() {
    const source = parseInt(document.getElementById('ffSource').value);
    const sink = parseInt(document.getElementById('ffSink').value);

    if (isNaN(source) || isNaN(sink) || !globalGraph.getNode(source) || !globalGraph.getNode(sink)) {
        alert('Vui lòng nhập nguồn và đích hợp lệ');
        return;
    }

    if (!globalGraph.isDirected) {
        alert('Ford-Fulkerson yêu cầu đồ thị có hướng');
        return;
    }

    const { maxFlow } = fordFulkerson(globalGraph, source, sink);
    document.getElementById('maxFlow').innerHTML = maxFlow;
    visualizers['ffCanvas'].drawGraph(globalGraph);
}

// Fleury's Algorithm
function visualizeFleury() {
    const result = fleury(globalGraph);

    if (!result.hasEulerPath) {
        document.getElementById('fleuryResult').innerHTML = 
            `<span class="error">✗ ${result.message}</span>`;
        document.getElementById('fleuryPath').innerHTML = '';
    } else {
        document.getElementById('fleuryResult').innerHTML = 
            `<span class="success">✓ ${result.message}</span>`;
        document.getElementById('fleuryPath').innerHTML = result.path.join(' → ');
    }

    visualizers['fleuryCanvas'].drawGraph(globalGraph);
}

// Hierholzer's Algorithm
function visualizeHierholzer() {
    const result = hierholzer(globalGraph);

    if (!result.hasEulerCircuit) {
        document.getElementById('hierholzerResult').innerHTML = 
            `<span class="error">✗ ${result.message}</span>`;
        document.getElementById('hierholzerPath').innerHTML = '';
    } else {
        document.getElementById('hierholzerResult').innerHTML = 
            `<span class="success">✓ ${result.message}</span>`;
        document.getElementById('hierholzerPath').innerHTML = result.circuit.join(' → ');
    }

    visualizers['hierholzerCanvas'].drawGraph(globalGraph);
}

// Update graph properties
document.addEventListener('change', function(e) {
    if (e.target.id === 'directedCheckbox') {
        globalGraph.isDirected = e.target.checked;
        drawMainGraph();
    } else if (e.target.id === 'weightedCheckbox') {
        globalGraph.isWeighted = e.target.checked;
        drawMainGraph();
    }
});
