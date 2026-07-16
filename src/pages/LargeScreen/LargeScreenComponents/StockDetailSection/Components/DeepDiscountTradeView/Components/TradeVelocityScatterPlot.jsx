import React, { useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
import * as d3 from 'd3';

// Compile our selector tool once outside the rendering thread loop to save CPU cycles [INDEX]
// const interceptSentrySelectors = deepInterceptionAdapter.getSelectors((state) => state.interceptSentry);

export const TradeVelocityScatterPlot = ({ tickerSymbol, tradesHistory }) =>
{
    const svgRef = useRef(null);

    // 🟢 O(1) CONSTANT DICTIONARY POINTER EXTRACTION:
    // This hook extracts strictly the single asset document matching your string token [INDEX]!
    // const liveAssetNode = useSelector((state) => interceptSentrySelectors.selectById(state, tickerSymbol));

    useEffect(() =>
    {
        if (!svgRef.current || !tradesHistory) return;

        // Extract your self-cleaning rolling 3-minute time & sales memory matrix array [INDEX]
        const dataPoints = tradesHistory || [];
        if (dataPoints.length === 0) return;

        // 📐 CLEAR DRAWING CANVAS LAYER CODES: Clear previous nodes to prevent canvas memory leaks [INDEX]
        d3.select(svgRef.current).selectAll("*").remove();

        const margin = { top: 15, right: 25, bottom: 25, left: 45 };
        const width = 600 - margin.left - margin.right;
        const height = 220 - margin.top - margin.bottom;

        const svg = d3.select(svgRef.current)
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
            .append("g")
            .attr("transform", `translate(${margin.left}, ${margin.top})`);

        // =====================================================================
        // 📐 REAL-TIME TIMELINE SCALING & BOUNDS [INDEX]
        // =====================================================================
        // X-Axis Scale maps absolute epoch timestamps over your rolling 3-minute horizon
        const liveEndTime = dataPoints[dataPoints.length - 1].time;
        const rollingStartTime = liveEndTime - (3 * 60 * 1000); // 3 Minute Rolling Delta Window

        const xScale = d3.scaleTime()
            .domain([new Date(rollingStartTime), new Date(liveEndTime)])
            .range([0, width]);

        // Y-Axis Scale maps the absolute execution prices, autoscaling to track raw tick wicks [INDEX]
        const priceMin = d3.min(dataPoints, d => d.price) || 0;
        const priceMax = d3.max(dataPoints, d => d.price) || 10;

        svg.append("g").attr("class", "grid-lines"); // Optional background grid support anchors

        const yScale = d3.scaleLinear()
            .domain([priceMin * 0.995, priceMax * 1.005]) // Smooth 0.5% buffer padding [INDEX]
            .range([height, 0]);

        // =====================================================================
        // 🔮 THE RADIAL NODE SIZE EXPANSION SCALAR [INDEX]
        // =====================================================================
        // Scale circle radius quadratically based on share size to highlight institutional blocks
        const radiusScale = d3.scaleSqrt()
            .domain([1, d3.max(dataPoints, d => d.size) || 10000])
            .range([1.5, 14]); // Tiny retail lots are small dots; giant blocks expand to 14px nodes!

        // =====================================================================
        // 🟢 RENDERING THE SCATTER PLOT DOT VECTOR MATRIX
        // =====================================================================
        svg.selectAll(".trade-node")
            .data(dataPoints)
            .enter()
            .append("circle")
            .attr("class", "trade-node")
            .attr("cx", d => xScale(new Date(d.time)))
            .attr("cy", d => yScale(d.price))
            .attr("r", d => radiusScale(d.size))
            .attr("fill", d =>
            {
                // Color mapping: Green for Ask fills (Buying Urgency), Red for Bid fills (Selling Panic)
                if (d.fillType === 'ASK_SWEEP' || d.isUpTick) return '#50fa7b'; // Neon Green [INDEX]
                return '#ff5555'; // Vibrant Crimson [INDEX]
            })
            .attr("fill-opacity", d =>
            {
                // Institutional opacity: Make larger blocks look more solid and pronounced on-screen
                if (d.size >= 1000) return 0.75;
                if (d.size >= 100) return 0.45;
                return 0.20; // Dim down background retail odd-lot noise
            })
            .attr("stroke", d => d.size >= 5000 ? '#fff' : 'none') // Wrap giant blocks in a white rim
            .attr("stroke-width", 1);

        // =====================================================================
        // 🗺️ AXES GRID RERUN GENERATIONS [INDEX]
        // =====================================================================
        svg.append("g")
            .attr("transform", `translate(0, ${height})`)
            .call(d3.axisBottom(xScale).ticks(4).tickFormat(d3.timeFormat("%H:%M:%S")))
            .style("color", "#2c2d3a")
            .selectAll("text").style("fill", "#6272a4").style("font-size", "10px");

        svg.append("g")
            .call(d3.axisLeft(yScale).ticks(4).tickFormat(d => `$${d.toFixed(3)}`)) // 3 Decimals for cheap sub-$3 names [INDEX]
            .style("color", "#2c2d3a")
            .selectAll("text").style("fill", "#6272a4").style("font-size", "10px");

    }, [tradesHistory, tickerSymbol]);

    return (
        <div style={{ background: '#0e0f15', padding: '20px', borderRadius: '4px', border: '1px solid #222', boxSizing: 'border-box', width: '100%' }}>
            {/* HUD CHART METRIC STATUS HEADER */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', fontFamily: 'monospace' }}>
                <div>
                    <span style={{ fontSize: '11px', color: '#6272a4', fontWeight: 'bold', letterSpacing: '0.5px' }}>
                        🛰️ ROLLING 3-MIN TIME & SALES VELOCITY PLOT
                    </span>
                </div>
                <div style={{ fontSize: '10px', color: '#6272a4', fontStyle: 'italic' }}>
                    Node Size ∝ Share Volume Size Block
                </div>
            </div>

            {/* CORE SVG ELEMENT LAYER */}
            <div style={{ display: 'flex', justifyContent: 'center', overflow: 'hidden' }}>
                <svg ref={svgRef}></svg>
            </div>
        </div>
    );
};
// 🔬 3 Hidden Order-Flow Tells Solved Visually By projecting your self-cleaning trade array onto this localized canvas,
//     your peripheral vision can decode three vital microstructure events instantly:

// 1) Spotting the Iceberg Trail (Node Density): If a stock drops below your stop-loss and the chart suddenly prints a dense,
//    vertical cluster of small circles perfectly aligned on a single horizontal price line, your eyes have uncovered an Institutional
//    Iceberg Algorithm. Big money is slicing a giant order into small pieces to absorb shares without moving the market.

// 2) The Climax Capitulation Signal (Dot Radius Acceleration): When a stock flushes violently downward into your deep discount zone,
//    watch the size of the circles. If the dot sizes suddenly swell into massive, expanded circles near your absolute historical low,
//    it proves that retail panic-selling volume has hit an un-breakable wall of institutional buy bids.

// 3) The Aggressive Sweep Velocity (Color Shifting): Your chart maps price aggression using direct color states: Neon Green for Ask Fills
//    (buying urgency) and Vibrant Crimson for Bid Fills (selling panic). If the lower bounds of your chart are painted heavy red, but the
//    exact millisecond the asset touches your floor the plot transitions into massive green circles, it validates an immediate, V-shaped
//    institutional reversal.