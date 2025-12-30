import { useEffect, useState } from "react";



export function useResizeObserver(svgDiv)
{
    const [dimensions, setDimensions] = useState(null)

    useEffect(() =>
    {
        const observeTarget = svgDiv.current
        if (svgDiv.current === undefined || svgDiv.current === null) return

        const resizeObserver = new ResizeObserver(entries =>
        {
            entries.forEach(entry =>
            {
                setDimensions(entry.contentRect)
            })
        })

        resizeObserver.observe(observeTarget)

        return () =>
        {
            resizeObserver.unobserve(observeTarget)
        }
    }, [svgDiv])

    return dimensions
}
