import React, { useEffect, useRef } from 'react';
import { axisBottom, axisLeft, curveMonotoneX, format, line, max, scaleLinear, scalePoint, select, tickFormat, ticks } from 'd3'
import { compileVolumeAccelerationDerivative, computePolynomialBestFitVector, computeSmoothedVector } from '../../Util/compileVolumeAcceleration';
import { useResizeObserver } from '../../../../../../../../hooks/useResizeObserver';

export const VolumeAccelerationChart = ({ todaysCandles, upTimeToPeak, downTimeToBottom, ticksFirstHour }) =>
{
    const svgRef = useRef(null);
    const accelerationData = compileVolumeAccelerationDerivative(todaysCandles);
    const smoothedAccelerationData = computePolynomialBestFitVector(accelerationData)

    // const bottomHour = downTimeToBottom?.hour || 9;
    // const bottomMin = downTimeToBottom?.minute || 37;
    // const formattedBottomTime = `${bottomHour}:${bottomMin < 10 ? '0' + bottomMin : bottomMin}`;

    // const peakHour = upTimeToPeak?.hour || 9;
    // const peakMin = upTimeToPeak?.minute || 52;
    // const formattedPeakTime = `${peakHour}:${peakMin < 10 ? '0' + peakMin : peakMin}`;

    
    const preDimensionsAndCandleCheck = () => { return !chartDimensions }

    const candleSVGWrapper = useRef(null)
    const chartDimensions = useResizeObserver(candleSVGWrapper)



    useEffect(() =>
    {
        if (preDimensionsAndCandleCheck()) return
        if (!svgRef.current || accelerationData.length === 0) return;

        select(svgRef.current).select('.accelerationLine').selectAll('path').remove();

        const margin = { top: 10, right: 20, bottom: 20, left: 35 };
        const width = chartDimensions.width - margin.left - margin.right;
        const height = 200 - margin.top - margin.bottom;

        const svg = select(svgRef.current)

        const xScale = scalePoint().domain(ticksFirstHour.map(d => d)).range([0, width]);
        const maxVal = max(accelerationData, d => Math.abs(d.accelerationValue)) || 10000;
        const yScale = scaleLinear().domain([0, maxVal * 1.1]).range([height, 0]);



        // Draw Axes
        svg.select('.xAxis')

            .call(axisBottom(xScale).tickValues(ticksFirstHour.filter((_, i) => i % 10 === 0).map(d => d)))
            .style("color", "#222")
            .attr("transform", `translate(${margin.left}, ${height + margin.bottom - margin.top})`);



        svg.select('.yAxis').call(axisLeft(yScale).ticks(4).tickFormat(format(".1s")))
            .style("color", "#444").attr("transform", `translate(${margin.left}, ${margin.top})`);

        const lineGenerator = line().x(d => xScale(d.timeLabel)).y(d => yScale(d.accelerationValue)).curve(curveMonotoneX)
        // .curve(curveMonotoneX)
        svg.select('.accelerationLine').append("path")
            .datum(smoothedAccelerationData)
            .attr("fill", "none")
            .attr("stroke", "#05c299")
            .attr("stroke-width", 2)
            .attr("d", lineGenerator)
            .attr("transform", `translate(${margin.left}, ${margin.top})`);

        svg.select('.accelerationLine').append("path")
            .datum(accelerationData)
            .attr("fill", "none")
            .attr("stroke", "#ffb86c")
            .attr("stroke-width", 2)
            .attr("d", lineGenerator)
            .attr("transform", `translate(${margin.left}, ${margin.top})`);


        // =====================================================================
        // 🏁 DRAW THE VERTICAL HISTORICAL TIME LANDMARKS [INDEX]
        // =====================================================================
        // const appendTimeMarkerSentry = (timeString, markerColor, markerLabel) =>
        // {
        //     const xCoordinate = xScale(timeString);
        //     if (!xCoordinate) return; // Skip if the session clock hasn't reached this point yet

        //     // Draw vertical dashed line
        //     svg.append("line")
        //         .attr("x1", xCoordinate)
        //         .attr("y1", 0)
        //         .attr("x2", xCoordinate)
        //         .attr("y2", height)
        //         .attr("stroke", markerColor)
        //         .attr("stroke-width", 1.5)
        //         .attr("stroke-dasharray", "3,3");

        //     // Draw text label tab anchor
        //     svg.append("text")
        //         .attr("x", xCoordinate + 4)
        //         .attr("y", 12)
        //         .attr("fill", markerColor)
        //         .style("font-size", "8px")
        //         .style("font-weight", "bold")
        //         .text(markerLabel);
        // };

        // // Render your historical exhaustion walls right across your wave graphics [INDEX]
        // appendTimeMarkerSentry(formattedBottomTime, "#ff5555", `HISTORICAL BOTTOM: ${formattedBottomTime}`);
        // appendTimeMarkerSentry(formattedPeakTime, "#50fa7b", `HISTORICAL PEAK: ${formattedPeakTime}`);

    }, [accelerationData, chartDimensions]);

    return (
        <div ref={candleSVGWrapper}>
            <svg ref={svgRef}>
                <g className='xAxis' />
                <g className='yAxis' />
                <g className='accelerationLine' />
            </svg>
        </div>
    );
};
