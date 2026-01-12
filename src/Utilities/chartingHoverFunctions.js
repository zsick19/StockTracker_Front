import { select } from "d3"
export function lineHover(selection)
{
    selection.transition().attr('stroke-width', 10).attr('stroke', 'blue')
}
export function lineNoHover(e)
{
    select(this).transition().attr('stroke-width', 2).attr('stroke', 'black')
}
export function edgeHover(e, d)
{
    if (e.defaultPrevented) return
    select(this).transition().delay(250).attr('r', 10)
}
export function edgeNoHover(e, d)
{
    select(this).transition().attr('r', 4)
}




