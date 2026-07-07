import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import { compileVolumeAccelerationDerivative } from '../../Util/compileVolumeAcceleration';
// import { compileVolumeAccelerationDerivative } from '../utils/compileVolumeAccelerationDerivative';

export const VolumeAccelerationChart = ({ todaysCandles, upTimeToPeak, downTimeToBottom }) =>
{
    const svgRef = useRef(null);
    const accelerationData = compileVolumeAccelerationDerivative(todaysCandles);

    const bottomHour = downTimeToBottom?.hour || 9;
    const bottomMin = downTimeToBottom?.minute || 37;
    const formattedBottomTime = `${bottomHour}:${bottomMin < 10 ? '0' + bottomMin : bottomMin}`;

    const peakHour = upTimeToPeak?.hour || 9;
    const peakMin = upTimeToPeak?.minute || 52;
    const formattedPeakTime = `${peakHour}:${peakMin < 10 ? '0' + peakMin : peakMin}`;

    useEffect(() =>
    {
        if (!svgRef.current || accelerationData.length === 0) return;

        d3.select(svgRef.current).selectAll("*").remove();

        const margin = { top: 20, right: 40, bottom: 30, left: 60 };
        const width = 480 - margin.left - margin.right;
        const height = 160 - margin.top - margin.bottom;

        const svg = d3.select(svgRef.current)
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
            .append("g")
            .attr("transform", `translate(${margin.left}, ${margin.top})`);

        // Scales
        const xScale = d3.scalePoint()
            .domain(accelerationData.map(d => d.timeLabel))
            .range([0, width]);

        const maxVal = d3.max(accelerationData, d => Math.abs(d.accelerationValue)) || 10000;
        const yScale = d3.scaleLinear()
            .domain([0, maxVal * 1.1])
            .range([height, 0]);

        // Draw Axes
        svg.append("g")
            .attr("transform", `translate(0, ${yScale(0)})`) // Zero center baseline
            .call(d3.axisBottom(xScale).tickValues(accelerationData.filter((_, i) => i % 5 === 0).map(d => d.timeLabel)))
            .style("color", "#222");

        svg.append("g")
            .call(d3.axisLeft(yScale).ticks(4).tickFormat(d3.format(".1s")))
            .style("color", "#444");

        // 📈 PLOT STRATION: DRAW THE SECOND DERIVATIVE MOMENTUM WAVE [INDEX]
        const lineGenerator = d3.line()
            .x(d => xScale(d.timeLabel))
            .y(d => yScale(Math.abs(d.accelerationValue)))
            .curve(d3.curveMonotoneX);

        svg.append("path")
            .datum(accelerationData)
            .attr("fill", "none")
            .attr("stroke", "#ffb86c") // Institutional orange acceleration line [INDEX]
            .attr("stroke-width", 2)
            .attr("d", lineGenerator);

        // =====================================================================
        // 🏁 DRAW THE VERTICAL HISTORICAL TIME LANDMARKS [INDEX]
        // =====================================================================
        const appendTimeMarkerSentry = (timeString, markerColor, markerLabel) =>
        {
            const xCoordinate = xScale(timeString);
            if (!xCoordinate) return; // Skip if the session clock hasn't reached this point yet

            // Draw vertical dashed line
            svg.append("line")
                .attr("x1", xCoordinate)
                .attr("y1", 0)
                .attr("x2", xCoordinate)
                .attr("y2", height)
                .attr("stroke", markerColor)
                .attr("stroke-width", 1.5)
                .attr("stroke-dasharray", "3,3");

            // Draw text label tab anchor
            svg.append("text")
                .attr("x", xCoordinate + 4)
                .attr("y", 12)
                .attr("fill", markerColor)
                .style("font-size", "8px")
                .style("font-weight", "bold")
                .text(markerLabel);
        };

        // Render your historical exhaustion walls right across your wave graphics [INDEX]
        appendTimeMarkerSentry(formattedBottomTime, "#ff5555", `HISTORICAL BOTTOM: ${formattedBottomTime}`);
        appendTimeMarkerSentry(formattedPeakTime, "#50fa7b", `HISTORICAL PEAK: ${formattedPeakTime}`);

    }, [accelerationData, formattedBottomTime, formattedPeakTime]);

    return (
        <div style={{ background: '#111219', borderRadius: '4px' }}>
            {/* <h4 style={{ margin: '0 0 10px 0', color: '#6272a4', fontSize: '10px', letterSpacing: '1px' }}>
                🌊 QUANT MOMENTUM FIELD (d²V/dt² RECKONER WITH TIME EXHAUSTION WALLS)
            </h4> */}
            <div style={{ display: 'flex', justifyContent: 'center' }}>
                <svg ref={svgRef}></svg>
            </div>
        </div>
    );
};
