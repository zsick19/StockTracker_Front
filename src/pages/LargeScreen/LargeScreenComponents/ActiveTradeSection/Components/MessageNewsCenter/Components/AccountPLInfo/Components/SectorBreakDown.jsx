import React, { useMemo, useState } from 'react';
import * as d3 from 'd3';
import { useDispatch } from 'react-redux';
import { setStockDetailStateWithTicker } from '../../../../../../../../../features/SelectedStocks/StockDetailControlSlice';
import { sectorToTicker } from '../../../../../../../../../Utilities/SectorsAndIndustries';

const SectorPieChart = ({ data, width = 500, height = 400 }) =>
{
  const dispatch = useDispatch()
  // Track hovered item data and screen mouse position
  const [hoveredSlice, setHoveredSlice] = useState(null);
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });

  // 1. Calculate total value and filter data
  const totalValue = useMemo(() =>
  {
    return Object.values(data).reduce((sum, value) => sum + value, 0);
  }, [data]);

  const chartData = useMemo(() =>
  {
    return Object.entries(data)
      .filter(([_, value]) => value > 0)
      .map(([key, value]) => ({
        label: key,
        value: Number(value.toFixed(2)),
        percentage: ((value / totalValue) * 100).toFixed(1) // Pre-calculate %
      }));
  }, [data, totalValue]);

  // 2. Setup D3 spatial parameters
  const radius = Math.min(width, height) / 2 - 20;
  const centerX = width / 2;
  const centerY = height / 2;

  const colorScale = useMemo(() =>
  {
    return d3.scaleOrdinal()
      .domain(chartData.map(d => d.label))
      .range(d3.schemeCategory10);
  }, [chartData]);

  const pieGenerator = useMemo(() => d3.pie().value(d => d.value).sort(null), []);
  const arcGenerator = d3.arc().innerRadius(0).outerRadius(radius);
  const arcs = pieGenerator(chartData);

  // Handle cursor positioning updates
  const handleMouseMove = (event) =>
  {
    setTooltipPos({
      x: event.clientX + 15, // Offset to place tooltip slightly right of cursor
      y: event.clientY + 15  // Offset to place tooltip slightly below cursor
    });
  };

  return (
    <div style={{ display: 'flex', alignItems: 'center', position: 'relative' }}>
      <svg width={width} height={height}>
        <g transform={`translate(${centerX}, ${centerY})`}>
          {arcs.map((arc, i) =>
          {
            const isHovered = hoveredSlice?.label === arc.data.label;

            return (
              <path onClick={() => dispatch(setStockDetailStateWithTicker({ detail: 19, ticker: sectorToTicker[arc.data.label] }))}
                key={i}
                d={arcGenerator(arc)}
                fill={colorScale(arc.data.label)}
                strokeWidth="2"
                /* Interactive triggers */
                onMouseEnter={() => setHoveredSlice(arc.data)}
                onMouseMove={handleMouseMove}
                onMouseLeave={() => setHoveredSlice(null)}
                style={{
                  cursor: 'pointer',
                  /* Slightly scale up the hovered slice natively with css scale/transform-origin */
                  transform: isHovered ? 'scale(1.04)' : 'scale(1)',
                  transformOrigin: '0 0',
                  transition: 'all 0.15s ease-out'
                }}
              />
            );
          })}
        </g>
      </svg>

      {/* Floating Tooltip Element */}
      {hoveredSlice && (
        <div
          style={{
            position: 'fixed',
            left: `${tooltipPos.x}px`,
            top: `${tooltipPos.y}px`,
            backgroundColor: 'rgba(33, 33, 33, 0.95)',
            color: '#fff',
            padding: '8px 12px',
            borderRadius: '4px',
            fontSize: '13px',
            pointerEvents: 'none', // Prevents tooltip from flickering under mouse cursor
            boxShadow: '0px 4px 10px rgba(0,0,0,0.15)',
            zIndex: 9999,
            display: 'flex',
            flexDirection: 'column',
            gap: '2px'
          }}
        >
          <strong style={{ borderBottom: '1px solid rgba(255,255,255,0.2)', paddingBottom: '3px', marginBottom: '2px' }}>
            {hoveredSlice.label}
          </strong>
          <span>Value: ${hoveredSlice.value}</span>
          <span>Share: {hoveredSlice.percentage}%</span>
        </div>
      )}

    </div>
  );
};

export default SectorPieChart;
