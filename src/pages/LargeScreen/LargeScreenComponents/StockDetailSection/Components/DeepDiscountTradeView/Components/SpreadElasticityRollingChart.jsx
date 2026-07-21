import React, { useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
import * as d3 from 'd3';
// import { deepInterceptionAdapter } from '../store/interceptSentrySlice';

// Compile our selector tool once outside the rendering thread loop to save CPU cycles [INDEX]
// const interceptSentrySelectors = deepInterceptionAdapter.getSelectors((state) => state.interceptSentry);

export const SpreadElasticityRollingChart = ({ tickerSymbol, currentSpread, rawQuoteHistory }) =>
{
    const svgRef = useRef(null);

    useEffect(() =>
    {
        if (!svgRef.current || !rawQuoteHistory) return;

        // Extract your self-cleaning rolling 5-minute memory matrix array [INDEX]
        const dataPoints = rawQuoteHistory || [];
        if (dataPoints.length < 2)
        {
            d3.select(svgRef.current).selectAll("*").remove();
            return;
        }

        // 📐 CLEAN DRAWING CANVAS LAYER CODES: Clear previous nodes to prevent canvas memory leaks [INDEX]
        d3.select(svgRef.current).selectAll("*").remove();

        const margin = { top: 15, right: 20, bottom: 25, left: 45 };
        const width = 325 - margin.left - margin.right;
        const height = 250 - margin.top - margin.bottom;

        const svg = d3.select(svgRef.current)
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
            .append("g")
            .attr("transform", `translate(${margin.left}, ${margin.top})`);

        // =====================================================================
        // 📐 REAL-TIME TIME-SERIES SCALING & BOUNDS [INDEX]
        // =====================================================================
        // X-Axis Scale maps absolute epoch timestamps over your rolling 5-minute horizon
        const liveEndTime = dataPoints[dataPoints.length - 1].time;
        const rollingStartTime = liveEndTime - (5 * 60 * 1000); // 5 Minute Rolling Delta Window

        const xScale = d3.scaleTime()
            .domain([new Date(rollingStartTime), new Date(liveEndTime)])
            .range([0, width]);

        // Y-Axis Scale handles spread width in cents, auto-scaling to catch extreme slippage spikes [INDEX]
        const maxSpreadObserved = d3.max(dataPoints, d => d.spread) || 0.05;

        const yScale = d3.scaleLinear()
            .domain([0, maxSpreadObserved * 1.25]) // Add a clean 10% structural visual padding cushion
            .range([height, 0]);

        // =====================================================================
        // 🎨 GRADIENT VECTOR INJECTION LAYER [INDEX]
        // =====================================================================
        // Use a linear vertical gradient to fill underneath the curve based on width risk
        const gradientId = `spread-gradient-${tickerSymbol}`;
        const defs = d3.select(svgRef.current).append("defs");

        const linearGradient = defs.append("linearGradient")
            .attr("id", gradientId)
            .attr("x1", "0%").attr("y1", "0%")
            .attr("x2", "0%").attr("y2", "100%");

        // Wide spreads (Top of chart): Render Warning Crimson [INDEX]
        linearGradient.append("stop")
            .attr("offset", "0%")
            .attr("stop-color", "rgba(255, 85, 85, 0.22)")
            .attr("stop-opacity", 1);

        // Tight compressed spreads (Bottom of chart): Fade into Neon Cyan [INDEX]
        linearGradient.append("stop")
            .attr("offset", "100%")
            .attr("stop-color", "rgba(0, 255, 255, 0.04)")
            .attr("stop-opacity", 0.2);

        // =====================================================================
        // 📈 PATH GENERATOR INTEGRATIONS [INDEX]
        // =====================================================================
        // Area path pourer binds the baseline to absolute zero floor
        const areaGenerator = d3.area()
            .x(d => xScale(new Date(d.time)))
            .y0(height)
            .y1(d => yScale(d.spread))
            .curve(d3.curveMonotoneX); // Curves segments fluidly to eliminate blocky stepping artifacts [INDEX]

        svg.append("path")
            .datum(dataPoints)
            .attr("fill", `url(#${gradientId})`)
            .attr("d", areaGenerator);

        // Core Price-Spread Trajectory line
        const lineGenerator = d3.line()
            .x(d => xScale(new Date(d.time)))
            .y(d => yScale(d.spread))
            .curve(d3.curveMonotoneX);

        svg.append("path")
            .datum(dataPoints)
            .attr("fill", "none")
            .attr("stroke", "#00ffff") // Neon Cyan line accent separates clearly from background fills [INDEX]
            .attr("stroke-width", 2)
            .attr("d", lineGenerator);

        // =====================================================================
        // 🗺️ AXES GRID RENDERING MECHANICS [INDEX]
        // =====================================================================
        const xAxisGenerator = d3.axisBottom(xScale)
            .ticks(5)
            .tickFormat(d3.timeFormat("%H:%M:%S")); // Format ticks down to the specific second label [INDEX]

        svg.append("g")
            .attr("transform", `translate(0, ${height})`)
            .call(xAxisGenerator)
            .style("color", "#44475a")
            .selectAll("text")
            .style("fill", "#6272a4")
            .style("font-size", "10px");

        svg.append("g")
            .call(d3.axisLeft(yScale).ticks(4).tickFormat(d => `$${d.toFixed(2)}`))
            .style("color", "#44475a")
            .selectAll("text")
            .style("fill", "#6272a4")
            .style("font-size", "10px");

    }, [rawQuoteHistory, tickerSymbol]);

    return (
        <div style={{ background: '#0e0f15', padding: '20px', borderRadius: '4px', border: '1px solid #222', boxSizing: 'border-box', width: '350px', height: '300px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', textTransform: 'uppercase', fontSize: '10px', color: '#00ffff', fontFamily: 'monospace' }}>
                <p>Bid: ${currentSpread.BidPrice.toFixed(2)} - {currentSpread.BidSize}</p>
                <p>Ask: ${currentSpread.AskPrice.toFixed(2)} - {currentSpread.AskSize}</p>
                <p>Spread: ${(currentSpread.AskPrice - currentSpread.BidPrice)?.toFixed(4) || "0.0000"}</p>
            </div>

            <div style={{ display: 'flex', justifyContent: 'center', overflow: 'hidden' }}>
                <svg ref={svgRef}></svg>
            </div>
        </div>
    );
};
