import React, { useMemo, useRef, useEffect } from 'react';
import * as d3 from 'd3';
import { useSelector } from 'react-redux';
import { selectNewsRunnerById } from '../../../../../../../features/NewsRunnerEngine/NewsRunnerLocalSlice';

export function MinuteMacdChart({ ticker, width = 720, height = 200 })
{

  const currentNewsRunner = useSelector((state) => selectNewsRunnerById(state, ticker))
  const macdData = currentNewsRunner?.MACDPoints

  const containerRef = useRef(null);

  // Chart padding geometry metrics
  const margin = { top: 20, right: 20, bottom: 35, left: 55 };
  const innerWidth = width - margin.left - margin.right;
  const innerHeight = height - margin.top - margin.bottom;

  // 1. Process Data Strings and Compute Scales
  const chartMatrix = useMemo(() =>
  {
    if (!macdData || macdData.length === 0) return null;

    // Parse text ISO string fields into chronological Date structures
    const formattedData = macdData.map(d => ({
      ...d,
      dateObject: new Date(d.Timestamp)
    })).sort((a, b) => a.dateObject - b.dateObject);

    // Continuous Temporal Horizontal Axis Scale
    const timeExtent = d3.extent(formattedData, d => d.dateObject);
    const xScale = d3.scaleTime()
      .domain(timeExtent)
      .range([0, innerWidth]);

    // Symmetrical Vertical Metric Axis Scale
    const maxVal = d3.max(formattedData, d => Math.max(Math.abs(d.macd), Math.abs(d.signal), Math.abs(d.histogram))) * 1.15 || 0.05;
    const yScale = d3.scaleLinear()
      .domain([-maxVal, maxVal])
      .range([innerHeight, 0]);

    // Continuous Line String Generation Vector Paths
    const macdLineGenerator = d3.line()
      .x(d => xScale(d.dateObject))
      .y(d => yScale(d.macd))
      .curve(d3.curveMonotoneX);

    const signalLineGenerator = d3.line()
      .x(d => xScale(d.dateObject))
      .y(d => yScale(d.signal))
      .curve(d3.curveMonotoneX);

    return {
      xScale,
      yScale,
      formattedData,
      macdPath: macdLineGenerator(formattedData),
      signalPath: signalLineGenerator(formattedData)
    };
  }, [macdData, innerWidth, innerHeight]);

  // 2. Render Chromatic Axes via Side Effects Lifecycle
  useEffect(() =>
  {
    if (!chartMatrix) return;

    const svg = d3.select(containerRef.current);
    svg.selectAll('.axis-layer').remove(); // Clean sweep frame cache

    // Format horizontal ticks as standard hours:minutes trading timestamps
    const xAxis = d3.axisBottom(chartMatrix.xScale)
      .ticks(Math.min(6, chartMatrix.formattedData.length))
      .tickFormat(d3.timeFormat('%H:%M:%S'));

    const yAxis = d3.axisLeft(chartMatrix.yScale)
      .ticks(5)
      .tickFormat(d3.format('.3f'));

    // Append X-Axis to the geometric floor boundary
    svg.append('g')
      .attr('class', 'axis-layer text-gray-500 text-[10px]')
      .attr('transform', `translate(${margin.left}, ${margin.top + innerHeight})`)
      .call(xAxis);

    // Append Y-Axis vertical grid reference markers
    svg.append('g')
      .attr('class', 'axis-layer text-gray-500 text-[10px]')
      .attr('transform', `translate(${margin.left}, ${margin.top})`)
      .call(yAxis);

    // Apply corporate terminal styling overrides
    svg.selectAll('.axis-layer path, .axis-layer line').attr('stroke', '#374151');
    svg.selectAll('.axis-layer text').attr('fill', '#9ca3af');

  }, [chartMatrix, margin.left, margin.top, innerHeight]);

  if (!macdData || !chartMatrix) return <div className="text-gray-500 font-sans text-xs">Awaiting MACD Stream Core...</div>;

  return (
    <div className="bg-gray-950 p-4 rounded-xl border border-gray-800 shadow-xl w-fit">
      <svg
        ref={containerRef}
        width={width}
        height={height}
        className="overflow-visible"
      >
        <g transform={`translate(${margin.left}, ${margin.top})`}>
          {/* A. HORIZONTAL REFERENCE BASELINE (Zero Center Line) */}
          <line
            x1={0}
            x2={innerWidth}
            y1={chartMatrix.yScale(0)}
            y2={chartMatrix.yScale(0)}
            stroke="#4b5563"
            strokeDasharray="2,4"
            strokeWidth="1.2"
          />

          {/* B. HISTOGRAM BARS PLOT GENERATION LAYER */}
          {chartMatrix.formattedData.map((d, index) =>
          {
            const isPositive = d.histogram >= 0;
            const xCoord = chartMatrix.xScale(d.dateObject);

            // Dynamic width scaling based on density allocation factors
            const nextX = index < chartMatrix.formattedData.length - 1
              ? chartMatrix.xScale(chartMatrix.formattedData[index + 1].dateObject)
              : innerWidth;
            const barWidth = Math.max(2, (nextX - xCoord) * 0.7);

            const barHeight = Math.abs(chartMatrix.yScale(0) - chartMatrix.yScale(d.histogram));
            const barY = isPositive ? chartMatrix.yScale(d.histogram) : chartMatrix.yScale(0);

            return (
              <rect
                key={index}
                x={xCoord - barWidth / 2} // Centers bar directly over time coordinate
                y={barY}
                width={barWidth}
                height={Math.max(1, barHeight)}
                fill={isPositive ? '#10b981' : '#ef4444'} // Emerald Green vs Scarlet Red
                opacity="0.75"
              />
            );
          })}

          {/* C. CONTINUOUS TECHNICAL OVERLAY PATH TRACKERS */}
          <path d={chartMatrix.macdPath} fill="none" stroke="#3b82f6" strokeWidth="2" />
          <path d={chartMatrix.signalPath} fill="none" stroke="#f59e0b" strokeWidth="1.5" />
        </g>
      </svg>
    </div>
  );
}
