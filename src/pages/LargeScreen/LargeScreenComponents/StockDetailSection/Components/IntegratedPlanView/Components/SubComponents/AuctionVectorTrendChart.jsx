import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';
// import { compileAuctionVectorChartData } from '../utils/compileAuctionVectorChartData';

export const AuctionVectorTrendChart = ({ planData }) =>
{
    const d3ChartSvgRef = useRef(null);
    const vectorDataMatrix = compileAuctionVectorChartData(planData);
    console.log(vectorDataMatrix)
    useEffect(() =>
    {
        if (!d3ChartSvgRef.current || vectorDataMatrix.length === 0) return;

        // Clear out old canvas layers from previous clicks to eliminate ghosting artifacts [INDEX]
        d3.select(d3ChartSvgRef.current).selectAll("*").remove();

        const margin = { top: 15, right: 35, bottom: 25, left: 55 };
        const width = 460 - margin.left - margin.right;
        const height = 180 - margin.top - margin.bottom;

        const svg = d3.select(d3ChartSvgRef.current)
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
            .append("g")
            .attr("transform", `translate(${margin.left}, ${margin.top})`);

        // =====================================================================
        // X & Y SCALING ENGINES [INDEX]
        // =====================================================================
        const xScalePoint = d3.scalePoint()
            .domain(vectorDataMatrix.map(d => d.timeLabel))
            .range([0, width]);

        const xScaleBand = d3.scaleBand()
            .domain(vectorDataMatrix.map(d => d.timeLabel))
            .range([0, width])
            .padding(0.4);

        const priceMin = d3.min(vectorDataMatrix, d => d.auctionPrice);
        const priceMax = d3.max(vectorDataMatrix, d => d.auctionPrice);
        const yPriceScale = d3.scaleLinear()
            .domain([priceMin * 0.98, priceMax * 1.02]) // 2% framing padding cushions [INDEX]
            .range([height * 0.55, 0]); // Clamps price line strictly to the upper half pane [INDEX]

        const maxAccel = d3.max(vectorDataMatrix, d => Math.abs(d.accelerationPace)) || 1.0;
        const yAccelScale = d3.scaleLinear()
            .domain([-maxAccel * 1.1, maxAccel * 1.1])
            .range([height, height * 0.65]); // Clamps oscillator bars strictly to the lower half [INDEX]

        // Draw structural line borders [INDEX]
        svg.append("g")
            .attr("transform", `translate(0, ${height - 50})`)
            .call(d3.axisBottom(xScalePoint))
            .style("color", "#2c2d3a");

        svg.append("g")
            .call(d3.axisLeft(yPriceScale).ticks(3))
            .style("color", "#333");

        // svg.append("g")
        //     .attr("transform", `translate(${width}, 0)`)
        //     .call(d3.axisRight(yAccelScale).ticks(2).tickFormat(d3.format(".1f")))
        //     .style("color", "#333");

        // =====================================================================
        // 📈 PANE LAYER 1: UPPER PRICE AUCTION VECTOR TREND LINE [INDEX]
        // =====================================================================
        const priceLineGenerator = d3.line()
            .x(d => xScalePoint(d.timeLabel))
            .y(d => yPriceScale(d.auctionPrice))
            .curve(d3.curveMonotoneX); // Smooth out timeline joints cleanly [INDEX]

        svg.append("path")
            .datum(vectorDataMatrix)
            .attr("fill", "none")
            .attr("stroke", "#ffb86c") // Institutional orange line [INDEX]
            .attr("stroke-width", 2)
            .attr("d", priceLineGenerator);

        svg.selectAll(".price-node-dot")
            .data(vectorDataMatrix)
            .enter()
            .append("circle")
            .attr("cx", d => xScalePoint(d.timeLabel))
            .attr("cy", d => yPriceScale(d.auctionPrice))
            .attr("r", 3.5)
            .attr("fill", "#ffb86c");

        // // =====================================================================
        // // 📊 PANE LAYER 2: LOWER VELOCITY RATE OF CHANGE OSCILLATOR BARS [INDEX]
        // // =====================================================================
        // // Zero baseline line for the acceleration lower quadrant chart
        svg.append("line")
            .attr("x1", 0)
            .attr("y1", yAccelScale(0))
            .attr("x2", width)
            .attr("y2", yAccelScale(0))
            .attr("stroke", "#222")
            .attr("stroke-width", 1);

        svg.selectAll(".accel-bar")
            .data(vectorDataMatrix.filter((_, i) => i >= 2)) // Derivative matches only past point 2 [INDEX]
            .enter()
            .append("rect")
            .attr("class", "accel-bar")
            .attr("x", d => xScaleBand(d.timeLabel))
            .attr("y", d => d.accelerationPace > 0 ? yAccelScale(d.accelerationPace) : yAccelScale(0))
            .attr("width", xScaleBand.bandwidth())
            .attr("height", d => Math.abs(yAccelScale(d.accelerationPace) - yAccelScale(0)))
            // Vibrant Green if compression/deceleration is helping, crimson red if gaining downward speed
            .attr("fill", d => d.accelerationPace > 0 ? "rgba(80, 250, 123, 0.7)" : "rgba(255, 85, 85, 0.7)")
            .attr("rx", 1);

    }, [vectorDataMatrix]);

    return (
        <div style={{ background: '#111219', borderRadius: '4px', border: '1px solid #222', }}>
            <h4 style={{ margin: '0 0 12px 0', color: '#6272a4', fontSize: '10px', letterSpacing: '1px' }}>
                📊 INSTITUTIONAL AXIS RUNWAY (6-DAY AUCTION SHIFTS & RATE OF CHANGE VELOCITY)
            </h4>
            {/* <div style={{ display: 'flex', justifyContent: 'center' }}> */}
            <div>
                <svg ref={d3ChartSvgRef}>

                </svg>
            </div>
        </div>
    );
};
/**
 * PRODUCTION COMPILER: compileAuctionVectorChartData
 * Synchronizes multi-day historical cross logs with today's live print and 
 * computes the step acceleration deltas required for D3 charting nodes [INDEX].
 */
function compileAuctionVectorChartData(planData)
{
    // if (!planData || !planData.openCrossMetrics) return [];

    const metrics = planData.metricConfig.openCross;
    const historyLogs = Array.isArray(metrics.previousOpenCross) ? [...metrics.previousOpenCross] : [];
    const todayCross = metrics.todaysOpenCross || {};

    if (historyLogs.length === 0 && !todayCross.officialAuctionCrossPrice) return [];

    // 1. Pack all available coordinates into a clean chronological timeline array [INDEX]
    const unifiedTimeline = [...historyLogs];

    if (todayCross.officialAuctionCrossPrice)
    {
        unifiedTimeline.push({
            date: todayCross.date || new Date().toISOString(),
            officialAuctionCrossPrice: todayCross.officialAuctionCrossPrice
        });
    }

    // Sort oldest-to-newest to protect line direction geometry [INDEX]
    unifiedTimeline.sort((a, b) => new Date(a.date) - new Date(b.date));

    // 2. COMPUTE CHRONOLOGICAL FIRST AND SECOND STEP PACING DELTAS [INDEX]
    return unifiedTimeline.map((node, index) =>
    {
        const rawDate = new Date(node.date);
        // Format date string to clean shorthand label tokens: "MM/DD" [INDEX]
        const label = `${rawDate.getMonth() + 1}/${rawDate.getDate()}`;
        const currentPrice = node.officialAuctionCrossPrice;

        let velocityDelta = 0;
        let accelerationRateChange = 0;

        if (index >= 1)
        {
            // Velocity 1: Pacing difference between current session and prior session [INDEX]
            velocityDelta = currentPrice - unifiedTimeline[index - 1].officialAuctionCrossPrice;
        }

        if (index >= 2)
        {
            const priorPrice = unifiedTimeline[index - 1].officialAuctionCrossPrice;
            const doublePriorPrice = unifiedTimeline[index - 2].officialAuctionCrossPrice;

            const priorVelocity = priorPrice - doublePriorPrice;
            const currentVelocity = currentPrice - priorPrice;

            // Second Derivative: Rate of change of the differences (Deceleration Vector) [INDEX]
            // If price is dropping but drops are getting smaller, this values shifts highly positive!
            accelerationRateChange = Math.abs(currentVelocity) - Math.abs(priorVelocity);
        }

        return {
            timeLabel: label,
            auctionPrice: currentPrice,
            // Negative = Compression/Deceleration (Good for Reversals) 🟩, Positive = Gaining Speed 🟥
            accelerationPace: -accelerationRateChange
        };
    });
}
