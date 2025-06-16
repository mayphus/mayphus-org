import * as d3 from 'd3';

export interface NodeData extends d3.SimulationNodeDatum {
  id: string;
  slug: string;
  title: string;
}

export interface LinkData {
  source: string;
  target: string;
}

export function renderGraph(container: HTMLElement, nodes: NodeData[], links: LinkData[]): void {
  const width = container.clientWidth;
  const height = container.clientHeight;

  const svg = d3.select(container).append('svg')
    .attr('width', width)
    .attr('height', height);

  const simulation = d3.forceSimulation<NodeData>(nodes)
    .force('link', d3.forceLink<NodeData, LinkData>(links).id((d: NodeData) => d.id).distance(80))
    .force('charge', d3.forceManyBody().strength(-200))
    .force('center', d3.forceCenter(width / 2, height / 2));

  const link = svg.append('g')
    .attr('stroke', '#999')
    .attr('stroke-opacity', 0.6)
    .selectAll('line')
    .data(links)
    .enter().append('line');

  const node = svg.append('g')
    .attr('stroke', '#fff')
    .attr('stroke-width', 1.5)
    .selectAll('circle')
    .data(nodes)
    .enter().append('circle')
    .attr('r', 6)
    .attr('fill', '#3182bd')
    .on('click', (_: any, d: NodeData) => {
      location.href = `/content/${d.slug}/`;
    });

  const label = svg.append('g')
    .selectAll('text')
    .data(nodes)
    .enter().append('text')
    .attr('class', 'label')
    .attr('text-anchor', 'middle')
    .attr('dy', '-0.8em')
    .text((d: NodeData) => d.title);

  simulation.on('tick', () => {
    link
      .attr('x1', (d: any) => (d.source as any).x)
      .attr('y1', (d: any) => (d.source as any).y)
      .attr('x2', (d: any) => (d.target as any).x)
      .attr('y2', (d: any) => (d.target as any).y);

    node
      .attr('cx', (d: any) => (d as any).x)
      .attr('cy', (d: any) => (d as any).y);

    label
      .attr('x', (d: any) => (d as any).x)
      .attr('y', (d: any) => (d as any).y);
  });
}
