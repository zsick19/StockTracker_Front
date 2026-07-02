import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import { compileVolumeDerivative } from '../../Util/compileVolumeDerivative';
// import { compileVolumeDerivativeData } from '../utils/compileVolumeDerivativeData';

export const VolumeVelocityOscillator = ({ todaysCandles }) =>
{
    const oscillatorRef = useRef(null);
    const velocityMatrix = compileVolumeDerivative(todaysCandles);

    useEffect(() =>
    {
        if (!oscillatorRef.current || velocityMatrix.length === 0) return;

        // Clear out old frames to prevent layout ghosting
        d3.select(oscillatorRef.current).selectAll("*").remove();

        const margin = { top: 15, right: 30, bottom: 25, left: 60 };
        const width = 460 - margin.left - margin.right;
        const height = 140 - margin.top - margin.bottom;

        const svg = d3.select(oscillatorRef.current)
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
            .append("g")
            .attr("transform", `translate(${margin.left}, ${margin.top})`);

        // Scales
        const xBand = d3.scaleBand()
            .domain(velocityMatrix.map(d => d.timeLabel))
            .range([0, width])
            .padding(0.2);

        const extremeVelocityCeiling = d3.max(velocityMatrix, d => Math.abs(d.volumeVelocity)) || 10000;

        // Force a zero-centered symmetrical vertical scale axis
        const yLinear = d3.scaleLinear()
            .domain([-extremeVelocityCeiling, extremeVelocityCeiling])
            .range([height, 0]);

        // Draw Axes
        svg.append("g")
            .attr("transform", `translate(0, ${yLinear(0)})`) // Place X-Axis line exactly at zero baseline
            .call(d3.axisBottom(xBand).tickValues(velocityMatrix.filter((_, i) => i % 5 === 0).map(d => d.timeLabel)))
            .style("color", "#2c2d3a");

        svg.append("g")
            .call(d3.axisLeft(yLinear).ticks(4).tickFormat(d3.format(".1s")))
            .style("color", "#444");

        // PLOT VOLUMETRIC VELOCITY MOMENTUM BARS
        svg.selectAll(".velocity-bar")
            .data(velocityMatrix)
            .enter()
            .append("rect")
            .attr("class", "velocity-bar")
            .attr("x", d => xBand(d.timeLabel))
            .attr("y", d => d.volumeVelocity > 0 ? yLinear(d.volumeVelocity) : yLinear(0))
            .attr("width", xBand.bandwidth())
            .attr("height", d => Math.abs(yLinear(d.volumeVelocity) - yLinear(0)))
            // Dynamic color tracking: green if accelerating, red if weakening and exhausting
            .attr("fill", d => d.volumeVelocity > 0 ? "rgba(80, 250, 123, 0.75)" : "rgba(255, 85, 85, 0.75)")
            .attr("rx", 1);

    }, [velocityMatrix]);

    return (
        <div style={{ background: '#111219', padding: '20px', borderRadius: '4px', border: '1px solid #222', marginTop: '12px' }}>
            <h4 style={{ margin: '0 0 10px 0', color: '#6272a4', fontSize: '10px', letterSpacing: '1px' }}>
                🌊 INTRADAY VOLUME VELOCITY (1-MIN DERIVATIVE MOMENTUM)
            </h4>
            <div style={{ display: 'flex', justifyContent: 'center' }}>
                <svg ref={oscillatorRef}></svg>
            </div>
        </div>
    );
};
