import React, { useMemo, useRef, useEffect } from 'react';
import * as d3 from 'd3';

function SectorIndustryPieChart({ dataToDisplay, isSector })
{
    const svgRef = useRef(null);

    // 1. Transform and clean the data
    const chartData = useMemo(() =>
    {
        if (!dataToDisplay) return [];

        // Convert object to array of { label, value } pairs
        const parsedData = Object.entries(dataToDisplay).map(([key, val]) => ({
            label: key,
            value: Number(val),
        }));

        // Filter out zero values and sort from highest to lowest
        return parsedData
            .filter((d) => d.value > 0)
            .sort((a, b) => b.value - a.value);
    }, [dataToDisplay]);

    // Calculate the total sum to display exact percentages
    const total = useMemo(() =>
    {
        return chartData.reduce((sum, d) => sum + d.value, 0);
    }, [chartData]);

    useEffect(() =>
    {
        if (chartData.length === 0) return;

        // 2. Dimensions and setup
        const width = 400;
        const height = 400;
        const radius = Math.min(width, height) / 2;

        // Clear previous SVG contents on data changes
        const svg = d3.select(svgRef.current);
        svg.selectAll('*').remove();

        // Create the main container group centered in the SVG
        const g = svg
            .attr('viewBox', `0 0 ${width} ${height}`)
            .append('g')
            .attr('transform', `translate(${width / 2}, ${height / 2})`);

        // 3. Color Scale
        const color = d3
            .scaleOrdinal()
            .domain(chartData.map((d) => d.label))
            .range(d3.schemeCategory10); // Standard vibrant D3 color palette

        // 4. Generate the pie and arc math
        const pie = d3
            .pie()
            .value((d) => d.value)
            .sort(null); // Keep our custom sorting order

        const arc = d3
            .arc()
            .innerRadius(0) // 0 for pie chart, increase (e.g., radius * 0.5) for a donut chart
            .outerRadius(radius - 10);

        const labelArc = d3
            .arc()
            .innerRadius(radius * 0.6)
            .outerRadius(radius - 10);

        // 5. Draw Pie Slices
        const arcs = g
            .selectAll('.arc')
            .data(pie(chartData))
            .enter()
            .append('g')
            .attr('class', 'arc');

        arcs
            .append('path')
            .attr('d', arc)
            .attr('fill', (d) => color(d.data.label))
            .attr('stroke', '#fff')
            .style('stroke-width', '2px');

        // 6. Add Percentage Labels inside Slices
        arcs
            .append('text')
            .attr('transform', (d) => `translate(${labelArc.centroid(d)})`)
            .attr('dy', '.35em')
            .style('text-anchor', 'middle')
            .style('fill', '#fff')
            .style('font-size', '12px')
            .style('font-weight', 'bold')
            .text((d) =>
            {
                const percentage = ((d.data.value / total) * 100).toFixed(1);
                // Only show text if slice is big enough to avoid overlaps
                return d.endAngle - d.startAngle > 0.25 ? `${percentage}%` : '';
            });
    }, [chartData, total]);

    return (
        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '20px', fontFamily: 'sans-serif' }}>
            {/* Chart Visual */}
            <div style={{ width: '100%', maxWidth: '325px' }}>
                <svg ref={svgRef}></svg>
            </div>

            {/* Accessible HTML Legend */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <h3 style={{ margin: '0 0 10px 0' }}>{isSector ? 'Sectors (% of Total)' : 'Industry (% of Total)'}</h3>
                {chartData.map((d) =>
                {
                    const colorScale = d3.scaleOrdinal().domain(chartData.map((x) => x.label)).range(d3.schemeCategory10);
                    const pct = ((d.value / total) * 100).toFixed(1);
                    return (
                        <div key={d.label} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px' }}>
                            <span
                                style={{
                                    width: '14px',
                                    height: '14px',
                                    backgroundColor: colorScale(d.label),
                                    borderRadius: '3px',
                                    display: 'inline-block',
                                }}
                            />
                            <strong>{pct}%</strong> — {d.label} ({d.value})
                        </div>
                    );
                })}
            </div>
        </div>
    );
};



export default SectorIndustryPieChart