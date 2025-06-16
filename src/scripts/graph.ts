import { renderGraph, type NodeData, type LinkData } from '../lib/graph';

interface GraphData { nodes: NodeData[]; links: LinkData[]; }

const dataEl = document.getElementById('graph-data');
const data = dataEl ? JSON.parse(dataEl.textContent || '{}') as GraphData : { nodes: [], links: [] };

const container = document.getElementById('graph');
if (container) {
  renderGraph(container, data.nodes, data.links);
}
