import React, { useMemo, useRef, useEffect } from 'react';
import * as d3 from 'd3';
import { VisualSqueezePanel } from './VisualSqueezeSummaryPanel';
import { useSelector } from 'react-redux';
import { selectNewsRunnerLargeSmallOrderById } from '../../../../../../../features/NewsRunnerEngine/NewsRunnerLocalSlice';

export function OrderVelocityAcceleration({ ticker })
{
    const tradeQuoteMetrics = useSelector((state) => selectNewsRunnerLargeSmallOrderById(state, ticker))
    const data = tradeQuoteMetrics.historicalChartIntervals

    const velocityRef = useRef(null);
    const accelerationRef = useRef(null);

    // Core dimensions forcing 200px by 200px square plotting spaces
    const chartSide = 405;
    const margin = { top: 0, right: 0, bottom: 0, left: 0 };

    const svgWidth = 400;
    const svgHeight = 225

    // Process data, scales, and line path vectors inside useMemo
    const plotData = useMemo(() =>
    {
        if (!data || data.length === 0) return null;

        // 1. Configure the X-Axis index step band scale
        const xScale = d3.scaleBand()
            .domain(d3.range(data.length))
            .range([0, chartSide]);

        // 2. Calculate symmetrical Y-domain boundaries for the Velocity Chart
        const maxVelocity = d3.max(data, d => Math.max(Math.abs(d.largeVelocity), Math.abs(d.smallVelocity))) * 1.1 || 1000;
        const yScaleVelocity = d3.scaleLinear().domain([-maxVelocity, maxVelocity]).range([225, 0]);

        // console.log(d.largeVelocity, d.smallVelocity)
        // console.log(d.largeAcceleration, d.smallAcceleration)


        // 3. Calculate symmetrical Y-domain boundaries for the Acceleration Chart
        // const maxAcceleration = d3.max(data, d => Math.max(Math.abs(d.largeAcceleration), Math.abs(d.smallAcceleration))) * 1.1 || 500;
        // const yScaleAcceleration = d3.scaleLinear().domain([-maxAcceleration, maxAcceleration]).range([150, 0]);

        // 4. Line path string templates
        const stepOffset = xScale.bandwidth() / 2;

        const largeVelLine = d3.line().x((_, i) => xScale(i) + stepOffset).y(d => { return d?.largeVelocity ? yScaleVelocity(d.largeVelocity) : yScaleVelocity(0) });
        const smallVelLine = d3.line().x((_, i) => xScale(i) + stepOffset).y(d => { return d?.smallVelocity ? yScaleVelocity(d.smallVelocity) : yScaleVelocity(0) });

        // const largeAccLine = d3.line().x((_, i) => xScale(i) + stepOffset).y(d => yScaleAcceleration(d.largeAcceleration));
        // const smallAccLine = d3.line().x((_, i) => xScale(i) + stepOffset).y(d => yScaleAcceleration(d.smallAcceleration));

        return {
            xScale,
            yScaleVelocity,
            // yScaleAcceleration,
            paths: {
                largeVelocity: largeVelLine(data),
                smallVelocity: smallVelLine(data),
                // largeAcceleration: largeAccLine(data),
                // smallAcceleration: smallAccLine(data)
            }
        };
    }, [data]);

    // Hook into layout lifecycle to draw ticks and borders
    useEffect(() =>
    {
        if (!plotData) return;

        // A. Render Velocity Axes
        const svgVel = d3.select(velocityRef.current);
        svgVel.selectAll('.axis').remove();

        const yAxisVel = d3.axisLeft(plotData.yScaleVelocity).ticks(4).tickFormat(d3.format(".1s"));
        svgVel.append('g').attr('class', 'axis').attr('transform', `translate(${margin.left}, ${margin.top})`).call(yAxisVel);

        // B. Render Acceleration Axes
        // const svgAcc = d3.select(accelerationRef.current);
        // svgAcc.selectAll('.axis').remove();

        // const yAxisAcc = d3.axisLeft(plotData.yScaleAcceleration).ticks(4).tickFormat(d3.format(".1s"));
        // svgAcc.append('g').attr('class', 'axis').attr('transform', `translate(${margin.left}, ${margin.top})`).call(yAxisAcc);

        // Dynamic X Timeline Axis tick placement formatter shared across both charts
        const xAxisGenerator = d3.axisBottom(plotData.xScale)
            .tickFormat(idx => `+${idx * 5}s`)
            .tickValues(plotData.xScale.domain().filter((_, i) => i % 6 === 0)); // Label axis grid every 30 seconds

        [svgVel].forEach(svg =>
        {
            svg.append('g')
                .attr('class', 'axis')
                .attr('transform', `translate(${margin.left}, ${margin.top + chartSide})`)
                .call(xAxisGenerator);

            // Apply uniform styling attributes
            svg.selectAll('.axis path, .axis line').attr('stroke', '#374151');
            svg.selectAll('.axis text').attr('fill', '#9ca3af').style('font-size', '10px');
        });

    }, [plotData]);

    if (!plotData) return <div className="text-gray-500">Awaiting vector updates...</div>;

    return (
        <div id='OrderDerivativeCharts'>
            <p>Large Small Order Velocity</p>
            <svg width={svgWidth} height={svgHeight}>
                <g transform={`translate(${margin.left}, ${margin.top})`}>
                    <line x1={0} x2={chartSide} y1={plotData.yScaleVelocity(0)} y2={plotData.yScaleVelocity(0)} stroke="#4b5563" strokeDasharray="3,3" />
                    <path d={plotData.paths.smallVelocity} fill="none" stroke="#6366f1" strokeWidth="1.5" opacity="0.6" />
                    <path d={plotData.paths.largeVelocity} fill="none" stroke="#10b981" strokeWidth="2" />
                </g>
            </svg>

            {/* <div className="OrderAcceleration">
                    <svg width={svgWidth} height={svgHeight} className="overflow-visible">
                        <g transform={`translate(${margin.left}, ${margin.top})`}>
                            <rect width={chartSide} height={chartSide} fill="none" stroke="#1f2937" strokeWidth="1" />

                            <line x1={0} x2={chartSide} y1={plotData.yScaleAcceleration(0)} y2={plotData.yScaleAcceleration(0)} stroke="#4b5563" strokeDasharray="3,3" />

                            <path d={plotData.paths.smallAcceleration} fill="none" stroke="#6366f1" strokeWidth="1.5" opacity="0.6" />
                            <path d={plotData.paths.largeAcceleration} fill="none" stroke="#10b981" strokeWidth="2" />
                        </g>
                    </svg>
                    <p className="text-xs font-bold text-gray-400 mb-2 font-sans">Acceleration (ΔA/5s)</p>
                </div> */}

        </div>
    );
}
