import { select } from "d3"
export function lineHover(selection)
{
    selection.transition().attr('stroke-width', 10).attr('stroke', 'blue')
}
export function lineNoHover(e)
{
    select(this).transition().attr('stroke-width', 2).attr('stroke', 'black')
}
export function lowVolNoHover(e)
{
    select(this).transition().attr('stroke', 'purple').attr('stroke-width', 5)
}
export function highVolNoHover(e)
{
    select(this).transition().attr('stroke', 'orange').attr('stroke-width', 5)
}
export function edgeHover(selection)
{
    selection.transition().attr('r', 50)
}
export function edgeNoHover(e, d)
{
    select(this).transition().attr('r', 4)
}

export function srZoneHover(selection)
{
    selection.transition().attr('opacity', 0.75)
}
export function srZoneNoHover(e)
{
    select(this).transition().attr('opacity', 0.5)
}




