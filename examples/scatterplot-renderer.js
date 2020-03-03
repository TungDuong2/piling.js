import * as d3 from 'd3';
import { createSvgRenderer } from '../src/renderer';

const DEFAULT_PADDING = 20;
const DEFAULT_SIZE = 100;
const DEFAULT_DOTSIZE_RANGE = [1.5, 4];
const DEFAULT_COLOR_RANGE = d3.schemeDark2;
const DEFAULT_LINE_COLOR = '#333';
const DEFAULT_TEXT_COLOR = '#aaa';
const DEFAULT_OPACITY = 0.7;

const createScatterplotRenderer = ({
  width = 600,
  height = 600,
  x = 'fertilityRate',
  y = 'lifeExpectancy',
  size: r = 'population',
  color: colorProperty = 'region'
} = {}) => {
  const svgRenderer = createSvgRenderer({ width, height });

  const createXPos = domain =>
    d3
      .scaleLinear()
      .domain(domain)
      .rangeRound([DEFAULT_PADDING / 2, DEFAULT_SIZE - DEFAULT_PADDING / 2]);

  const createYPos = domain =>
    d3
      .scaleLinear()
      .domain(domain)
      .rangeRound([DEFAULT_SIZE - DEFAULT_PADDING / 2, DEFAULT_PADDING / 2]);

  const createSizeScale = domain =>
    d3
      .scaleLinear()
      .domain(domain)
      .range(DEFAULT_DOTSIZE_RANGE);

  const createColorMap = domain =>
    d3
      .scaleOrdinal()
      .domain(domain)
      .range(DEFAULT_COLOR_RANGE);

  const xAxis = xPos => axis =>
    axis
      .attr('transform', `translate(0, ${DEFAULT_PADDING / 2})`)
      .call(
        d3
          .axisBottom(xPos)
          .ticks(4)
          .tickSize(DEFAULT_SIZE - DEFAULT_PADDING)
      )
      .call(g => g.select('.domain').remove())
      .call(g => g.selectAll('.tick line').attr('stroke', DEFAULT_LINE_COLOR))
      .call(g =>
        g
          .selectAll('.tick text')
          .attr('fill', DEFAULT_TEXT_COLOR)
          .attr('font-size', 'smaller')
      );

  const yAxis = yPos => axis =>
    axis
      .attr('transform', `translate(${DEFAULT_PADDING / 2}, 0)`)
      .call(
        d3
          .axisLeft(yPos)
          .ticks(3)
          .tickSize(DEFAULT_PADDING - DEFAULT_SIZE)
      )
      .call(g => g.select('.domain').remove())
      .call(g => g.selectAll('.tick line').attr('stroke', DEFAULT_LINE_COLOR))
      .call(g =>
        g
          .selectAll('.tick text')
          .attr('fill', DEFAULT_TEXT_COLOR)
          .attr('font-size', 'smaller')
          .attr('writing-mode', 'vertical-lr')
          .attr('x', -6)
          .attr('dy', 12)
      );

  const createScatterplot = ({
    data,
    xProp,
    xPos,
    yProp,
    yPos,
    rProp,
    sizeScale,
    color
  }) => {
    const svg = d3
      .create('svg')
      .attr('viewBox', `0 0 ${DEFAULT_SIZE} ${DEFAULT_SIZE}`);

    const region = [data[0].region];

    svg
      .selectAll('#region-text')
      .data(region)
      .join('text')
      .attr('x', DEFAULT_SIZE / 2)
      .attr('y', 7)
      .attr('fill', color)
      .attr('font-size', '7px')
      .attr('text-anchor', 'middle')
      .text(d => d);

    const year = [data[0].year];

    svg
      .selectAll('#year-text')
      .data(year)
      .join('text')
      .attr('x', DEFAULT_SIZE - 5)
      .attr('y', DEFAULT_SIZE / 2)
      .attr('fill', DEFAULT_TEXT_COLOR)
      .attr('font-size', '7px')
      .attr('writing-mode', 'vertical-lr')
      .attr('text-anchor', 'middle')
      .text(d => `Year: ${d}`);

    svg.append('g').call(xAxis(xPos));

    svg.append('g').call(yAxis(yPos));

    const cell = svg.append('g');

    cell
      .append('rect')
      .attr('fill', 'none')
      .attr('stroke', DEFAULT_TEXT_COLOR)
      .attr('x', DEFAULT_PADDING / 2 + 0.5)
      .attr('y', DEFAULT_PADDING / 2 + 0.5)
      .attr('width', DEFAULT_SIZE - DEFAULT_PADDING)
      .attr('height', DEFAULT_SIZE - DEFAULT_PADDING);

    cell
      .selectAll('circle')
      .data(data)
      .join('circle')
      .attr('cx', d => xPos(d[xProp]))
      .attr('cy', d => yPos(d[yProp]))
      .attr('r', d => sizeScale(d[rProp]))
      .attr('fill', color)
      .attr('fill-opacity', DEFAULT_OPACITY);

    return svg.node();
  };

  const renderer = async sources => {
    const getDomain = prop => {
      const domain = sources
        .reduce((newDomain, source) => {
          const tmp = source.map(countryData => countryData[prop]);
          return [...newDomain, ...tmp];
        }, [])
        .filter(d => d !== null);

      const min = Math.min(...domain);
      const max = Math.max(...domain);

      return [min - (max - min) * 0.1, max + (max - min) * 0.1];
    };

    const colorDomain = sources.map(source => source[0][colorProperty]);
    const colorMap = createColorMap(colorDomain);

    const xDomain = getDomain(x);
    const yDomain = getDomain(y);
    const sizeDomain = getDomain(r);

    const xPos = createXPos(xDomain);
    const yPos = createYPos(yDomain);
    const sizeScale = createSizeScale(sizeDomain);

    const svgSources = sources.map(source => {
      const color = colorMap(source[0][colorProperty]);

      return createScatterplot({
        data: source,
        xProp: x,
        xPos,
        yProp: y,
        yPos,
        rProp: r,
        sizeScale,
        color
      });
    });

    return svgRenderer(svgSources);
  };

  return {
    renderer
  };
};

export default createScatterplotRenderer;
