import React, { useEffect, useRef } from 'react';
import { axisBottom, axisLeft, format, max, scaleBand, scaleLinear, select, selectAll } from 'd3';
import { compileVolumeDerivative } from '../../Util/compileVolumeDerivative';
import { useResizeObserver } from '../../../../../../../../hooks/useResizeObserver';
import { eachMinuteOfInterval, set } from 'date-fns';

export const VolumeVelocityOscillator = ({ todaysCandles, ticksFirstHour }) =>
{
    const oscillatorRef = useRef(null);
    const velocityMatrix = compileVolumeDerivative(todaysCandles);

    const preDimensionsAndCandleCheck = () => { return !chartDimensions }

    const candleSVG = useRef()
    const candleSVGWrapper = useRef(null)

    const chartDimensions = useResizeObserver(candleSVGWrapper)



    useEffect(() =>
    {
        if (preDimensionsAndCandleCheck()) return
        if (!oscillatorRef.current || velocityMatrix.length === 0) return;
        select(oscillatorRef.current).selectAll(".velocity-bar").remove()

        // Clear out old frames to prevent layout ghosting
        select(oscillatorRef.current).selectAll("*").remove();

        const margin = { top: 10, right: 20, bottom: 20, left: 35 };
        const width = chartDimensions.width - margin.left - margin.right;
        const height = 200 - margin.top - margin.bottom;

        const svg = select(oscillatorRef.current)
            .attr("width", chartDimensions.width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom).append("g")
            .attr("transform", `translate(${margin.left}, ${margin.top})`);

        // Scales

        const xBand = scaleBand()
            .domain(ticksFirstHour)
            .range([0, width])
            .padding(0.2);

        const extremeVelocityCeiling = max(velocityMatrix, d => Math.abs(d.rawBarVolume)) || 10000;
        const yLinear = scaleLinear().domain([0, (extremeVelocityCeiling * 1.1)]).range([height, 0]);

        // Draw Axes
        svg.append("g").attr("transform", `translate(0, ${yLinear(0)})`)
            .call(axisBottom(xBand).tickValues(ticksFirstHour.filter((_, i) => i % 10 === 0).map(d => d)))
            .style("color", "#2c2d3a")

        svg.append("g")
            .call(axisLeft(yLinear).ticks(4).tickFormat(format(".1s")))
            .style("color", "#444");

        // PLOT VOLUMETRIC VELOCITY MOMENTUM BARS
        svg.selectAll(".velocity-bar")
            .data(velocityMatrix)
            .enter()
            .append("rect")
            .attr("class", "velocity-bar")
            .attr("x", d => xBand(d.timeLabel))
            .attr("y", d => yLinear(Math.abs(d.rawBarVolume)))
            .attr("width", xBand.bandwidth())
            .attr("height", d => height - yLinear(Math.abs(d.rawBarVolume)))
            .attr("fill", d => d.volumeVelocity > 0 ? "rgba(80, 250, 123, 0.75)" : "rgba(255, 85, 85, 0.75)")

    }, [velocityMatrix, chartDimensions]);

    return (
        <div ref={candleSVGWrapper}>
            <svg ref={oscillatorRef}></svg>
        </div>

    );
};
