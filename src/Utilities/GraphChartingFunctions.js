import { select } from "d3";
import { differenceInBusinessDays } from 'date-fns';

const initiateCaptureHideTemp = (stockSVG, setCaptureComplete, setEnableZoom) =>
{
    setCaptureComplete(false)
    setEnableZoom(false)
    stockSVG.select('.traceLine').remove()
    stockSVG.select('.crossHairs').selectAll('line').attr('visibility', 'hidden')
    stockSVG.select('.crossHairs').selectAll('text').attr('visibility', 'hidden')
}
const infoTrace = (e, setEnableZoom, svg, pixelSet, setCaptureComplete, xScale, yScale) =>
{
    const stockSVG = select(svg)
    if (pixelSet.current.firstClick)
    {
        initiateCaptureHideTemp(stockSVG, setCaptureComplete, setEnableZoom)
        pixelSet.current = { ...pixelSet.current, X1: e.offsetX, Y1: e.offsetY, firstClick: false }
        const initialValues = { date: xScale({ pixelToDate: e.offsetX }), price: yScale({ pixelToPrice: e.offsetY }) }

        //draw trace line at first click position with computed pixel price
        stockSVG.select('.temp').append('line').attr('class', 'traceLine traceLineSolid')
            .attr('x1', e.offsetX).attr('y1', e.offsetY).attr('x2', e.offsetX).attr('y2', e.offsetY).attr('stroke', 'black').attr('stroke-width', 1)
        stockSVG.select('.temp').append('text').attr('class', 'traceLine tLInitialInfo')
            .text(`$${initialValues.price.toString()}`).attr("x", e.offsetX).attr("y", e.offsetY);

        //draw mouse point two info to screen with dx/dy computation
        stockSVG.select('.temp').append('text').attr('class', 'traceLine tLInfo1')
            .text(initialValues.price.toString()).attr("x", e.offsetX - 5).attr("y", e.offsetY - 5);
        stockSVG.select('.temp').append('text').attr('class', 'traceLine tLInfo2')
            .text(initialValues.price.toString()).attr("x", e.offsetX - 5).attr("y", e.offsetY - 21);
        stockSVG.select('.temp').append('text').attr('class', 'traceLine tLInfo3')
            .text('dx:').attr("x", e.offsetX - 5).attr("y", e.offsetY - 42);

        //set up svg event listener for mouse movement that follows the mouse to redraw the line and trace info
        stockSVG.on('mousemove', (e) => traceMouseInfo(e, xScale, yScale, initialValues))
    } else { setCaptureComplete(true) }

    const traceMouseInfo = (e, xScale, yScale, initialValues) =>
    {
        let traceValues = { date: xScale({ pixelToDate: e.offsetX }), price: yScale({ pixelToPrice: e.offsetY }) }
        let traceTextResults = calculateTextValues(initialValues, traceValues)

        stockSVG.select('.traceLineSolid').attr('x2', e.offsetX - 2).attr('y2', e.offsetY - 2)
        stockSVG.select('.tLInfo1').attr('x', e.offsetX - 5).attr('y', e.offsetY - 5).text(traceTextResults[0])
        stockSVG.select('.tLInfo2').attr('x', e.offsetX - 5).attr('y', e.offsetY - 21).text(traceTextResults[2])
        stockSVG.select('.tLInfo3').attr('x', e.offsetX - 5).attr('y', e.offsetY - 42).text(traceTextResults[1])
    }

    const calculateTextValues = (initial, trace) =>
    {
        let dx = differenceInBusinessDays(initial.date, trace.date)
        let dy = Math.round(((trace.price - initial.price) / initial.price) * 100)
        return [`$ ${trace.price.toString()}`, `dx: ${Math.abs(dx)}d`, `dy: ${dy}%`]
    }
}
const freeLineTrace = (e, setEnableZoom, svg, pixelSet, setCaptureComplete) =>
{
    const stockSVG = select(svg)

    if (pixelSet.current.firstClick)
    {
        initiateCaptureHideTemp(stockSVG, setCaptureComplete, setEnableZoom)
        pixelSet.current = { ...pixelSet.current, X1: e.offsetX, Y1: e.offsetY, firstClick: false }
        stockSVG.select('.temp').append('line').attr('class', 'traceLine').attr('x1', e.offsetX).attr('y1', e.offsetY).attr('x2', e.offsetX).attr('y2', e.offsetY).attr('stroke', 'black').attr('stroke-width', 1)
        stockSVG.on('mousemove', (e) => traceMouse(e))
    } else
    {
        pixelSet.current = { ...pixelSet.current, X2: e.offsetX, Y2: e.offsetY, firstClick: true }
        stockSVG.select('.traceLine').attr('x2', e.offsetX).attr('y2', e.offsetY)
        setCaptureComplete(true)
    }
    const traceMouse = (e) =>
    {
        const stockSVG = select(svg)
        stockSVG.select('.traceLine').attr('x2', e.offsetX - 2).attr('y2', e.offsetY - 2)
    }
}


const trendLineTrace = (e, setEnableZoom, svg, pixelSet, setCaptureComplete) =>
{
    const stockSVG = select(svg)

    if (pixelSet.current.firstClick)
    {
        pixelSet.current = { ...pixelSet.current, X1: e.offsetX, Y1: e.offsetY, firstClick: false, secondClick: true }
        initiateCaptureHideTemp(stockSVG, setCaptureComplete, setEnableZoom)
        stockSVG.select('.temp').append('line').attr('class', 'traceLine traceLine1')
            .attr('x1', e.offsetX).attr('y1', e.offsetY).attr('x2', e.offsetX).attr('y2', e.offsetY)
            .attr('stroke', 'white').attr('stroke-width', 1)

        stockSVG.on('mousemove', (e) => traceTrendMouse(e))
    } else if (pixelSet.current.secondClick)
    {
        let diff = e.offsetY - pixelSet.current.Y1
        pixelSet.current = { ...pixelSet.current, X2: e.offsetX, Y2: e.offsetY, yDifference: diff, secondClick: false, thirdClick: false }
        stockSVG.select('.traceLine1').attr('x2', e.offsetX).attr('y2', e.offsetY)

        stockSVG.select('.temp').append('line')
            .attr('class', 'traceLine traceLine2').attr('x1', pixelSet.current.X1).attr('y1', pixelSet.current.Y1).attr('x2', e.offsetX).attr('y2', e.offsetY)
            .attr('stroke', 'white').attr('stroke-width', 0.25).style("stroke-dasharray", ("3, 3"))

        stockSVG.on('mousemove', (e) => traceTrendMouse2(e, diff))
    }
    else
    {
        pixelSet.current = { ...pixelSet.current, X4: pixelSet.current.X2, Y4: e.offsetY, firstClick: true }
        stockSVG.select('.traceLine2').attr('y1', e.offsetY - pixelSet.current.yDifference).attr('y2', e.offsetY)
        stockSVG.on('mousemove', null)
        setCaptureComplete(true)
    }

    const traceTrendMouse = (e) =>
    {
        const stockSVG = select(svg)
        stockSVG.select('.temp').select('.traceLine1').attr('x2', e.offsetX - 2).attr('y2', e.offsetY - 2)
    }

    const traceTrendMouse2 = (e, diff) =>
    {
        const stockSVG = select(svg)
        stockSVG.select('.temp').select('.traceLine2').attr('y1', e.offsetY - diff - 2).attr('y2', e.offsetY - 2)
    }
}
const horizontalLineTrace = (e, setEnableZoom, svg, pixelSet, setCaptureComplete, xScale, yScale) =>
{
    const stockSVG = select(svg)
    if (pixelSet.current.firstClick)
    {
        pixelSet.current = { ...pixelSet.current, X1: e.offsetX, Y1: e.offsetY, firstClick: false, secondClick: true }
        initiateCaptureHideTemp(stockSVG, setCaptureComplete, setEnableZoom)

        let initialPrice = yScale({ pixelToPrice: e.offsetY })

        stockSVG.select('.temp').append('line').attr('class', 'traceLine traceLineR')
            .attr('x1', e.offsetX).attr('y1', e.offsetY).attr('x2', 5000).attr('y2', e.offsetY)
            .attr('stroke', 'green').attr('stroke-width', 2)

        stockSVG.select('.temp').append('line').attr('class', 'traceLine traceLineL')
            .attr('x1', 0).attr('y1', e.offsetY).attr('x2', e.offsetX).attr('y2', e.offsetY)
            .attr('stroke', 'white').attr('stroke-width', 0.5)

        stockSVG.select('.temp').append('text').attr('class', 'traceLine priceInfo').text(initialPrice.toString()).attr("x", e.offsetX - 5).attr("y", e.offsetY - 5);

        stockSVG.on('mousemove', (e) => traceHorizontalMouse(e, yScale))
    } else
    {
        pixelSet.current = { ...pixelSet.current, X1: e.offsetX, Y1: e.offsetY }
        stockSVG.select('.traceLineR').attr('y1', e.offsetY).attr('y2', e.offsetY).attr('x1', e.offsetX)
        stockSVG.select('.traceLineL').attr('y1', e.offsetY).attr('y2', e.offsetY).attr('x2', e.offsetX)
        stockSVG.select('.priceInfo').attr('x', e.offsetX).attr('y', e.offsetY)
        setCaptureComplete(true)
    }

    const traceHorizontalMouse = (e, yScale) =>
    {
        const stockSVG = select(svg)
        let updatePrice = yScale({ pixelToPrice: e.offsetY })
        stockSVG.select('.temp').select('.traceLineR').attr('x1', e.offsetX).attr('y1', e.offsetY).attr('y2', e.offsetY)
        stockSVG.select('.temp').select('.traceLineL').attr('x2', e.offsetX).attr('y1', e.offsetY).attr('y2', e.offsetY)
        stockSVG.select('.temp').select('.priceInfo').attr('x', e.offsetX).attr('y', e.offsetY).text(updatePrice.toString())
    }
}






const traceClassName = 'traceLine'

const enterExitTrace = (e, setEnableZoom, svg, pixelSet, setCaptureComplete, xScale, yScale) =>
{
    const stockSVG = select(svg)
    const temp = select(svg).select('.temp')
    const XOffset = 10
    const leftSideText = 100
    const mouseMoveXYOffset = 2

    const svgPriceLineStyles = {
        enter: { stroke: 'green', text: 'Enter Price', dxText: 20, dyText: 20, dxPrice: 150, dyPrice: 20 }
    }


    if (pixelSet.current.firstClick)
    {
        initiateCaptureHideTemp(stockSVG, setCaptureComplete, setEnableZoom)
        pixelSet.current = { ...pixelSet.current, firstClick: false, secondClick: true }
        temp.append('line').attr('class', `enterLine ${traceClassName}`).attr('x1', 0).attr('y1', e.offsetY).attr('x2', 5000).attr('y2', e.offsetY).attr('stroke', svgPriceLineStyles.enter.stroke).attr('stroke-width', 1)
        temp.append('text').attr('class', `enterInfo ${traceClassName}`).text(svgPriceLineStyles.enter.text).attr("x", e.offsetX).attr("y", e.offsetY).attr('dy', `${svgPriceLineStyles.enter.dyText}px`).attr('dx', `${svgPriceLineStyles.enter.dxText}px`)
        temp.append('text').attr('class', `enterPrice ${traceClassName}`).text(`$${yScale({ pixelToPrice: e.offsetY })}`)
            .attr("y", e.offsetY).attr("x", leftSideText)
            .attr('dy', `${svgPriceLineStyles.enter.dyPrice}px`)
        // .attr('dx', `${svgPriceLineStyles.enter.dxPrice}px`)
        stockSVG.on('mousemove', (e) =>
        {
            temp.select('.enterLine').attr('y1', e.offsetY - mouseMoveXYOffset).attr('y2', e.offsetY - mouseMoveXYOffset)
            temp.select('.enterInfo').attr('x', e.offsetX).attr('y', e.offsetY - mouseMoveXYOffset)
            temp.select('.enterPrice').attr('x', leftSideText).attr('y', e.offsetY - mouseMoveXYOffset).text((`$${yScale({ pixelToPrice: e.offsetY })}`))
        })

    } else if (pixelSet.current.secondClick)//capture enter price
    {
        pixelSet.current = { ...pixelSet.current, X1: e.offsetX, X1Offset: e.offsetX + XOffset, Y1: e.offsetY, Y1Price: yScale({ pixelToPrice: e.offsetY }), secondClick: false, thirdClick: true }
        temp.append('text').attr('class', 'enterPercentage traceLine')
            .attr("x", leftSideText).attr("y", e.offsetY).attr('dx', '250px')
        setPricePositionRemoveInfoText('enter', pixelSet.current.X1Offset, e.offsetY, 'enterBuffer', 'Enter Buffer')
        recordPriorAddNextWithTrace('.enterLine', e.offsetY, 'enterBufferLine', 'yellow', 'enterBuffer', pixelSet.current.Y1)
    } else if (pixelSet.current.thirdClick && e.offsetY < pixelSet.current.Y1) //capture enter buffer price
    {
        const percentage = temp.select('.enterPercentage').text()
        pixelSet.current = { ...pixelSet.current, Y2: e.offsetY, P1: parseFloat(percentage.slice(0, -12)), thirdClick: false, fourthClick: true }
        setPricePositionRemoveInfoText('enterBuffer', pixelSet.current.X1Offset, e.offsetY, 'stopLoss', 'Stop Loss')
        recordPriorAddNextWithTrace('.enterBufferLine', e.offsetY, 'stopLossLine', 'red', 'stopLoss', pixelSet.current.Y1)
    } else if (pixelSet.current.fourthClick && e.offsetY > pixelSet.current.Y1)//capture stopLoss
    {
        const percentage = temp.select('.enterPercentage').text()
        pixelSet.current = { ...pixelSet.current, Y3: e.offsetY, P2: parseFloat(percentage.slice(0, -12)), fourthClick: false, fifthClick: true }
        setPricePositionRemoveInfoText('stopLoss', pixelSet.current.X1Offset, e.offsetY, 'exit', 'Exit Price')
        recordPriorAddNextWithTrace('.stopLossLine', e.offsetY, 'exitLine', 'green', 'exit', pixelSet.current.Y2)
    } else if (pixelSet.current.fifthClick && e.offsetY < pixelSet.current.Y3)//capture exit
    {
        const percentage = temp.select('.enterPercentage').text()
        pixelSet.current = { ...pixelSet.current, Y4: e.offsetY, P3: parseFloat(percentage.slice(0, -12)), fifthClick: false, sixthClick: true }
        setPricePositionRemoveInfoText('exit', pixelSet.current.X1Offset, e.offsetY, 'exitBuffer', 'Exit Buffer')
        recordPriorAddNextWithTrace('.exitLine', e.offsetY, 'exitBufferLine', 'yellow', 'exitBuffer', pixelSet.current.Y4)
    } else if (pixelSet.current.sixthClick && e.offsetY > pixelSet.current.Y4) //capture exit buffer
    {
        const percentage = temp.select('.enterPercentage').text()
        pixelSet.current = { ...pixelSet.current, Y5: e.offsetY, P4: parseFloat(percentage.slice(0, -12)), sixthClick: false, seventhClick: true }
        setPricePositionRemoveInfoText('exitBuffer', pixelSet.current.X1Offset, e.offsetY, 'moon', 'Moon Price')
        recordPriorAddNextWithTrace('.exitBufferLine', e.offsetY, 'moonLine', 'black', 'moon', pixelSet.current.Y4)
    } else if (pixelSet.current.seventhClick && e.offsetY < pixelSet.current.Y4) //capture moon
    {
        const percentage = temp.select('.enterPercentage').text()
        pixelSet.current = { ...pixelSet.current, Y6: e.offsetY, P5: parseFloat(percentage.slice(0, -12)) }
        setPricePositionRemoveInfoText('moon', pixelSet.current.X1Offset, e.offsetY)
        temp.select('.moonLine').attr('y1', e.offsetY).attr('y2', e.offsetY)
        stockSVG.on('mousemove', null)
        setCaptureComplete(true)
    }

    function setPricePositionRemoveInfoText(infoClassNamePrior, xPosition, yPosition, infoClassNameNext, textNext)
    {
        temp.select(`.${infoClassNamePrior}Price`).attr('y', yPosition)
        temp.select(`.${infoClassNamePrior}Info`).remove()

        temp.append('text').attr('class', `${infoClassNameNext}Info traceLine`).text(textNext).attr("x", xPosition).attr("y", yPosition).attr('dy', '20px').attr('dx', '20px')
        temp.append('text').attr('class', `${infoClassNameNext}Price traceLine`).text(`$${yScale({ pixelToPrice: yPosition })}`)
            .attr("x", leftSideText).attr("y", yPosition)
            .attr('dy', '20px')
        // .attr('dx', '150px')
    }

    function recordPriorAddNextWithTrace(priorClassName, yOffset, className, color, infoPriceClassName, pixelStop) 
    {
        temp.select(priorClassName).attr('y1', yOffset).attr('y2', yOffset)
        temp.append('line').attr('class', `${className} traceLine`).attr('x1', 0).attr('y1', e.offsetY).attr('x2', 5000).attr('y2', e.offsetY).attr('stroke', color).attr('stroke-width', 1)

        stockSVG.on('mousemove', (e) =>
        {
            if (priorClassName === '.enterLine' && e.offsetY > pixelStop) return
            if (priorClassName === '.enterBufferLine' && e.offsetY < pixelStop) return
            if (priorClassName === '.stopLossLine' && e.offsetY > pixelStop) return
            if (priorClassName === '.exitLine' && e.offsetY < pixelStop) return
            if (priorClassName === '.exitBufferLine' && e.offsetY > pixelStop) return

            temp.select(`.${className}`).attr('y1', e.offsetY - 2).attr('y2', e.offsetY - 2)
            temp.select(`.${infoPriceClassName}Info`).attr('y', e.offsetY - 2)
            temp.select(`.${infoPriceClassName}Price`).attr('y', e.offsetY - 2).text((`$${yScale({ pixelToPrice: e.offsetY })}`))
            let percentageOfEnterPrice = Math.abs((pixelSet.current.Y1Price - yScale({ pixelToPrice: e.offsetY })) / pixelSet.current.Y1Price * 100).toFixed(2)
            temp.select('.enterPercentage').text(`${percentageOfEnterPrice}% From Enter`).attr('y', e.offsetY - 2).attr('dy', '20px')
        })
    }
}






const keyPriceTrace = (e, setEnableZoom, svg, pixelSet, setCaptureComplete, xScale, yScale) =>
{
    const stockSVG = select(svg)

    if (pixelSet.current.firstClick)
    {
        initiateCaptureHideTemp(stockSVG, setCaptureComplete, setEnableZoom)
        pixelSet.current = { ...pixelSet.current, firstClick: false, secondClick: true }

        stockSVG.select('.temp').append('line').attr('class', 'traceLine traceLine1').attr('x1', 0).attr('y1', e.offsetY).attr('x2', 5000).attr('y2', e.offsetY).attr('stroke', 'white').attr('stroke-width', 1)
        stockSVG.on('mousemove', (e) => traceHorizontalChannelMouse1(e))
    } else if (pixelSet.current.secondClick)
    {
        pixelSet.current = { ...pixelSet.current, Y1: e.offsetY, secondClick: false, thirdClick: true }

        stockSVG.select('.temp').append('line')
            .attr('class', 'traceLine traceLine2').attr('x1', 0).attr('y1', e.offsetY).attr('x2', 5000).attr('y2', e.offsetY)
            .attr('stroke', 'white').attr('stroke-width', 0.25).style("stroke-dasharray", ("3, 3"))

        stockSVG.on('mousemove', (e) => traceHorizontalChannelMouse2(e))
    } else if (pixelSet.current.thirdClick)
    {
        pixelSet.current = { ...pixelSet.current, Y2: e.offsetY, thirdClick: false, fourthClick: true }
        stockSVG.select('.traceLine2').attr('y1', e.offsetY).attr('y2', e.offsetY)

        stockSVG.select('.temp').append('line')
            .attr('class', 'traceLine traceLine3').attr('x1', 0).attr('y1', e.offsetY).attr('x2', 5000).attr('y2', e.offsetY)
            .attr('stroke', 'white').attr('stroke-width', 1)
        stockSVG.on('mousemove', (e) => traceHorizontalChannelMouse3(e))
    } else if (pixelSet.current.fourthClick)
    {
        pixelSet.current = { ...pixelSet.current, Y3: e.offsetY, fourthClick: false, fifthClick: true }
        stockSVG.select('.traceLine3').attr('y1', e.offsetY).attr('y2', e.offsetY)


        stockSVG.select('.temp').append('line')
            .attr('class', 'traceLine traceLine4').attr('x1', 0).attr('y1', e.offsetY).attr('x2', 5000).attr('y2', e.offsetY)
            .attr('stroke', 'white').attr('stroke-width', 0.25).style("stroke-dasharray", ("3, 3"))

        stockSVG.on('mousemove', (e) => traceHorizontalChannelMouse4(e))
    } else
    {
        pixelSet.current = { ...pixelSet.current, Y4: e.offsetY, firstClick: true }
        stockSVG.select('.traceLine4').attr('y1', e.offsetY).attr('y2', e.offsetY)
        stockSVG.on('mousemove', null)
        setCaptureComplete(true)
    }


    const traceHorizontalChannelMouse1 = (e) =>
    {
        const stockSVG = select(svg)
        stockSVG.select('.temp').select('.traceLine1').attr('y1', e.offsetY).attr('y2', e.offsetY)
    }
    const traceHorizontalChannelMouse2 = (e) =>
    {
        const stockSVG = select(svg)
        stockSVG.select('.temp').select('.traceLine2').attr('y1', e.offsetY - 2).attr('y2', e.offsetY - 2)

    }
    const traceHorizontalChannelMouse3 = (e) =>
    {
        const stockSVG = select(svg)
        stockSVG.select('.temp').select('.traceLine3').attr('y1', e.offsetY - 2).attr('y2', e.offsetY - 2)
    }
    const traceHorizontalChannelMouse4 = (e) =>
    {
        const stockSVG = select(svg)
        stockSVG.select('.temp').select('.traceLine4').attr('y1', e.offsetY - 2).attr('y2', e.offsetY - 2)
    }
}



export const channelLineTrace = (e, setEnableZoom, svg, pixelSet, setCaptureComplete, xScale, yScale) =>
{
    const stockSVG = select(svg)
    if (pixelSet.current.firstClick)
    {
        pixelSet.current = { ...pixelSet.current, X1: e.offsetX, Y1: e.offsetY, firstClick: false, secondClick: true }
        initiateCaptureHideTemp(stockSVG, setCaptureComplete, setEnableZoom)

        stockSVG.select('.temp').append('line').attr('class', 'traceLine traceLine1')
            .attr('x1', e.offsetX).attr('y1', e.offsetY).attr('x2', e.offsetX).attr('y2', e.offsetY)
            .attr('stroke', 'white').attr('stroke-width', 1)

        stockSVG.on('mousemove', (e) => traceTrendMouse(e))
    } else if (pixelSet.current.secondClick)
    {
        let diff = e.offsetY - pixelSet.current.Y1
        pixelSet.current = { ...pixelSet.current, X2: e.offsetX, Y2: e.offsetY, dy: e.offsetY - pixelSet.current.Y1, secondClick: false, thirdClick: true }
        stockSVG.select('.traceLine1').attr('x2', e.offsetX).attr('y2', e.offsetY)

        stockSVG.select('.temp').append('line')
            .attr('class', 'traceLine traceLine2').attr('x1', pixelSet.current.X1).attr('y1', pixelSet.current.Y1).attr('x2', e.offsetX).attr('y2', e.offsetY)
            .attr('stroke', 'white').attr('stroke-width', 0.25).style("stroke-dasharray", ("3, 3"))

        stockSVG.on('mousemove', (e) => traceTrendMouse2(e, diff))
    } else if (pixelSet.current.thirdClick)
    {
        pixelSet.current = { ...pixelSet.current, X3: pixelSet.current.X1, Y3: e.offsetY - pixelSet.current.dy, X4: pixelSet.current.X2, Y4: e.offsetY, thirdClick: false, fourthClick: true }
        stockSVG.select('.traceLine2').attr('y1', e.offsetY - pixelSet.current.dy).attr('y2', e.offsetY)


        stockSVG.select('.temp').append('line')
            .attr('class', 'traceLine traceLine3').attr('x1', pixelSet.current.X1).attr('y1', e.offsetY - pixelSet.current.dy).attr('x2', pixelSet.current.X2).attr('y2', e.offsetY)
            .attr('stroke', 'white').attr('stroke-width', 1)
        stockSVG.on('mousemove', (e) => traceTrendMouse3(e, pixelSet.current.dy))
    } else if (pixelSet.current.fourthClick)
    {
        pixelSet.current = { ...pixelSet.current, X5: pixelSet.current.X1, Y5: e.offsetY - pixelSet.current.dy, X6: pixelSet.current.X2, Y6: e.offsetY, fourthClick: false, fifthClick: true }
        stockSVG.select('.traceLine3').attr('y1', e.offsetY - pixelSet.current.dy).attr('y2', e.offsetY)


        stockSVG.select('.temp').append('line')
            .attr('class', 'traceLine traceLine4').attr('x1', pixelSet.current.X1).attr('y1', e.offsetY - pixelSet.current.dy).attr('x2', pixelSet.current.X2).attr('y2', e.offsetY)
            .attr('stroke', 'white').attr('stroke-width', 0.25).style("stroke-dasharray", ("3, 3"))

        stockSVG.on('mousemove', (e) => traceTrendMouse4(e, pixelSet.current.dy))
    } else
    {
        pixelSet.current = { ...pixelSet.current, X7: pixelSet.current.X5, Y7: e.offsetY - pixelSet.current.dy, X8: pixelSet.current.X6, Y8: e.offsetY, firstClick: true }
        stockSVG.select('.traceLine4').attr('y1', e.offsetY - pixelSet.current.dy).attr('y2', e.offsetY)
        stockSVG.on('mousemove', null)
        setCaptureComplete(true)
    }

    const traceTrendMouse = (e) =>
    {
        const stockSVG = select(svg)
        stockSVG.select('.temp').select('.traceLine1').attr('x2', e.offsetX - 2).attr('y2', e.offsetY - 2)
    }
    const traceTrendMouse2 = (e, diff) =>
    {
        const stockSVG = select(svg)
        stockSVG.select('.temp').select('.traceLine2').attr('y1', e.offsetY - diff - 2).attr('y2', e.offsetY - 2)
    }
    const traceTrendMouse3 = (e, diff) =>
    {
        const stockSVG = select(svg)
        stockSVG.select('.temp').select('.traceLine3').attr('y1', e.offsetY - diff - 2).attr('y2', e.offsetY - 2)
    }
    const traceTrendMouse4 = (e, diff) =>
    {
        const stockSVG = select(svg)
        stockSVG.select('.temp').select('.traceLine4').attr('y1', e.offsetY - diff - 2).attr('y2', e.offsetY - 2)
    }
}

export const channelHorizontalLineTrace = (e, setEnableZoom, svg, pixelSet, setCaptureComplete, xScale, yScale) =>
{
    const stockSVG = select(svg)

    if (pixelSet.current.firstClick)
    {
        initiateCaptureHideTemp(stockSVG, setCaptureComplete, setEnableZoom)
        pixelSet.current = { ...pixelSet.current, X1: e.offsetX, Y1: e.offsetY, Y2: e.offsetY, firstClick: false, secondClick: true }

        stockSVG.select('.temp').append('line').attr('class', 'traceLine traceLine1').attr('x1', e.offsetX).attr('y1', e.offsetY).attr('x2', e.offsetX).attr('y2', e.offsetY).attr('stroke', 'white').attr('stroke-width', 1)
        stockSVG.on('mousemove', (e) => traceHorizontalChannelMouse1(e))
    } else if (pixelSet.current.secondClick)
    {
        pixelSet.current = { ...pixelSet.current, X2: e.offsetX, secondClick: false, thirdClick: true }
        stockSVG.select('.traceLine1').attr('x2', e.offsetX)

        stockSVG.select('.temp').append('line')
            .attr('class', 'traceLine traceLine2').attr('x1', pixelSet.current.X1).attr('y1', e.offsetY).attr('x2', e.offsetX).attr('y2', e.offsetY)
            .attr('stroke', 'white').attr('stroke-width', 0.25).style("stroke-dasharray", ("3, 3"))

        stockSVG.on('mousemove', (e) => traceHorizontalChannelMouse2(e))
    } else if (pixelSet.current.thirdClick)
    {
        pixelSet.current = { ...pixelSet.current, X3: pixelSet.current.X1, Y3: e.offsetY, X4: pixelSet.current.X2, Y4: e.offsetY, thirdClick: false, fourthClick: true }
        stockSVG.select('.traceLine2').attr('y1', e.offsetY).attr('y2', e.offsetY)

        stockSVG.select('.temp').append('line')
            .attr('class', 'traceLine traceLine3').attr('x1', pixelSet.current.X1).attr('y1', e.offsetY).attr('x2', pixelSet.current.X2).attr('y2', e.offsetY)
            .attr('stroke', 'white').attr('stroke-width', 1)
        stockSVG.on('mousemove', (e) => traceHorizontalChannelMouse3(e))
    } else if (pixelSet.current.fourthClick)
    {
        pixelSet.current = { ...pixelSet.current, X5: pixelSet.current.X1, Y5: e.offsetY, X6: pixelSet.current.X2, Y6: e.offsetY, fourthClick: false, fifthClick: true }
        stockSVG.select('.traceLine3').attr('y1', e.offsetY).attr('y2', e.offsetY)


        stockSVG.select('.temp').append('line')
            .attr('class', 'traceLine traceLine4').attr('x1', pixelSet.current.X1).attr('y1', e.offsetY).attr('x2', pixelSet.current.X2).attr('y2', e.offsetY)
            .attr('stroke', 'white').attr('stroke-width', 0.25).style("stroke-dasharray", ("3, 3"))

        stockSVG.on('mousemove', (e) => traceHorizontalChannelMouse4(e))
    } else
    {
        pixelSet.current = { ...pixelSet.current, X7: pixelSet.current.X5, Y7: e.offsetY, X8: pixelSet.current.X6, Y8: e.offsetY, firstClick: true }
        stockSVG.select('.traceLine4').attr('y1', e.offsetY).attr('y2', e.offsetY)
        stockSVG.on('mousemove', null)
        setCaptureComplete(true)
    }


    const traceHorizontalChannelMouse1 = (e) =>
    {
        const stockSVG = select(svg)
        stockSVG.select('.temp').select('.traceLine1').attr('x2', e.offsetX - 2)
    }
    const traceHorizontalChannelMouse2 = (e) =>
    {
        const stockSVG = select(svg)
        stockSVG.select('.temp').select('.traceLine2').attr('y1', e.offsetY - 2).attr('y2', e.offsetY - 2)

    }
    const traceHorizontalChannelMouse3 = (e) =>
    {
        const stockSVG = select(svg)
        stockSVG.select('.temp').select('.traceLine3').attr('y1', e.offsetY - 2).attr('y2', e.offsetY - 2)
    }
    const traceHorizontalChannelMouse4 = (e) =>
    {
        const stockSVG = select(svg)
        stockSVG.select('.temp').select('.traceLine4').attr('y1', e.offsetY - 2).attr('y2', e.offsetY - 2)
    }
}

export const wedgeLineTrace = (e, setEnableZoom, svg, pixelSet, setCaptureComplete, xScale, yScale) =>
{
    const stockSVG = select(svg)
    if (pixelSet.current.firstClick)
    {
        initiateCaptureHideTemp(stockSVG, setCaptureComplete, setEnableZoom)
        pixelSet.current = { ...pixelSet.current, X1: e.offsetX, Y1: e.offsetY, firstClick: false, secondClick: true }

        stockSVG.select('.temp').append('line').attr('class', 'traceLine traceLine1').attr('x1', e.offsetX).attr('y1', e.offsetY).attr('x2', e.offsetX).attr('y2', e.offsetY).attr('stroke', 'white').attr('stroke-width', 1)
        stockSVG.on('mousemove', (e) => traceWedgeLine(e, '.traceLine1'))
    } else if (pixelSet.current.secondClick)
    {
        let diff = e.offsetY - pixelSet.current.Y1
        pixelSet.current = { ...pixelSet.current, X2: e.offsetX, Y2: e.offsetY, dy: e.offsetY - pixelSet.current.Y1, secondClick: false, thirdClick: true }

        stockSVG.select('.traceLine1').attr('x2', e.offsetX).attr('y2', e.offsetY)

        stockSVG.select('.temp').append('line')
            .attr('class', 'traceLine traceLine2').attr('x1', pixelSet.current.X1).attr('y1', pixelSet.current.Y1).attr('x2', e.offsetX).attr('y2', e.offsetY)
            .attr('stroke', 'white').attr('stroke-width', 0.25).style("stroke-dasharray", ("3, 3"))

        stockSVG.on('mousemove', (e) => traceMarginWedgeLine(e, '.traceLine2', diff))
    } else if (pixelSet.current.thirdClick)
    {
        pixelSet.current = { ...pixelSet.current, X3: pixelSet.current.X1, Y3: e.offsetY - pixelSet.current.dy, X4: pixelSet.current.X2, Y4: e.offsetY, thirdClick: false, fourthClick: true }
        stockSVG.select('.traceLine2').attr('y1', e.offsetY - pixelSet.current.dy).attr('y2', e.offsetY)

        stockSVG.select('.temp').append('line')
            .attr('class', 'traceLine traceLine3 guideLine').attr('x1', 0).attr('y1', e.offsetY).attr('x2', 5000).attr('y2', e.offsetY)
            .attr('stroke', 'white').attr('stroke-width', 0.25).style("stroke-dasharray", ("3, 3"))

        stockSVG.on('mousemove', (e) => traceGuideWedgeLine(e, '.guideLine'))
    } else if (pixelSet.current.fourthClick)
    {
        pixelSet.current = { ...pixelSet.current, X5: pixelSet.current.X1, Y5: e.offsetY, fourthClick: false, fifthClick: true }
        stockSVG.select('.guideLine').attr('x1', pixelSet.current.X1).attr('y1', e.offsetY).attr('stroke', 'white').attr('stroke-width', 1).style('stroke-dasharray', 'none')

        stockSVG.on('mousemove', (e) => traceWedgeLine(e, '.traceLine3'))
    } else if (pixelSet.current.fifthClick)
    {
        let diff2 = e.offsetY - pixelSet.current.Y5
        pixelSet.current = { ...pixelSet.current, X6: pixelSet.current.X2, Y6: e.offsetY, dy2: diff2, fifthClick: false, sixthClick: true }

        stockSVG.select('.traceLine3').attr('x2', pixelSet.current.X2).attr('y2', e.offsetY)

        stockSVG.select('.temp').append('line')
            .attr('class', 'traceLine traceLine4').attr('x1', pixelSet.current.X1).attr('y1', pixelSet.current.Y5).attr('x2', pixelSet.current.X2).attr('y2', e.offsetY)
            .attr('stroke', 'white').attr('stroke-width', 0.25).style("stroke-dasharray", ("3, 3"))

        stockSVG.on('mousemove', (e) => traceMarginWedgeLine(e, '.traceLine4', diff2))
    } else
    {
        pixelSet.current = { ...pixelSet.current, X7: pixelSet.current.X1, Y7: e.offsetY - pixelSet.current.dy2, X8: pixelSet.current.X2, Y8: e.offsetY, firstClick: true }
        stockSVG.select('.traceLine4').attr('y1', e.offsetY - pixelSet.current.dy2).attr('y2', e.offsetY)
        stockSVG.on('mousemove', null)
        setCaptureComplete(true)
    }

    const traceWedgeLine = (e, lineName) =>
    {
        const stockSVG = select(svg)
        stockSVG.select('.temp').select(lineName).attr('x2', e.offsetX).attr('y2', e.offsetY)
    }
    const traceMarginWedgeLine = (e, lineName, diff) =>
    {
        const stockSVG = select(svg)
        stockSVG.select('.temp').select(lineName).attr('y1', e.offsetY - diff).attr('y2', e.offsetY)
    }
    const traceGuideWedgeLine = (e, lineName) =>
    {
        const stockSVG = select(svg)
        stockSVG.select('.temp').select(lineName).attr('y1', e.offsetY).attr('y2', e.offsetY)
    }
}

export const wedgeHorizontalLineTrace = (e, setEnableZoom, svg, pixelSet, setCaptureComplete, xScale, yScale) =>
{
    const stockSVG = select(svg)
    if (pixelSet.current.firstClick)
    {
        initiateCaptureHideTemp(stockSVG, setCaptureComplete, setEnableZoom)
        pixelSet.current = { ...pixelSet.current, firstClick: false, secondClick: true }

        stockSVG.select('.temp').append('line').attr('class', 'traceLine guideLine1').attr('x1', 0).attr('y1', e.offsetY).attr('x2', 5000).attr('y2', e.offsetY)
            .attr('stroke', 'white').attr('stroke-width', 0.25).style("stroke-dasharray", ("3, 3"))
        stockSVG.on('mousemove', (e) => traceHWedgeLine1(e, '.guideLine1'))
    } else if (pixelSet.current.secondClick)
    {
        pixelSet.current = { ...pixelSet.current, X1: e.offsetX, hGuideLine: e.offsetY, secondClick: false, thirdClick: true }
        stockSVG.select('.guideLine1').attr('y1', e.offsetY).attr('y2', e.offsetY).attr('x1', e.offsetX)

        stockSVG.on('mousemove', (e) => traceHWedgeLine2(e, '.guideLine1'))
    } else if (pixelSet.current.thirdClick)
    {
        pixelSet.current = { ...pixelSet.current, X2: e.offsetX, thirdClick: false, fourthClick: true }
        stockSVG.select('.guideLine1').attr('x2', e.offsetX)

        stockSVG.select('.temp').append('line')
            .attr('class', 'traceLine guideLine2').attr('x1', 0).attr('y1', e.offsetY).attr('x2', 5000).attr('y2', e.offsetY)
            .attr('stroke', 'white').attr('stroke-width', 0.25).style("stroke-dasharray", ("3, 3"))

        stockSVG.on('mousemove', (e) => traceHWedgeLine1(e, '.guideLine2'))
    } else if (pixelSet.current.fourthClick)
    {
        pixelSet.current = { ...pixelSet.current, Y1: e.offsetY, Y5: pixelSet.current.hGuideLine - e.offsetY + pixelSet.current.hGuideLine, fourthClick: false, fifthClick: true }

        stockSVG.select('.guideLine2').remove()

        stockSVG.select('.temp').append('line').attr('class', 'traceLine traceLine1').attr('x1', pixelSet.current.X1).attr('y1', e.offsetY).attr('x2', pixelSet.current.X2).attr('y2', e.offsetY)
            .attr('stroke', 'white').attr('stroke-width', 1)

        let flippedY1 = e.offsetY - pixelSet.current.hGuideLine

        stockSVG.select('.temp').append('line').attr('class', 'traceLine traceLine2').attr('x1', pixelSet.current.X1).attr('y1', pixelSet.current.hGuideLine - flippedY1).attr('x2', pixelSet.current.X2).attr('y2', pixelSet.current.hGuideLine - flippedY1)
            .attr('stroke', 'white').attr('stroke-width', 1)

        stockSVG.on('mousemove', (e) => traceHWedgeLine3(e, '.traceLine1', '.traceLine2'))
    } else if (pixelSet.current.fifthClick)
    {
        pixelSet.current = { ...pixelSet.current, Y2: e.offsetY, Y6: pixelSet.current.hGuideLine - e.offsetY + pixelSet.current.hGuideLine, fifthClick: false, sixthClick: true }

        stockSVG.select('.traceLine1').attr('y2', e.offsetY)
        stockSVG.select('.traceLine2').attr('y2', pixelSet.current.hGuideLine - e.offsetY + pixelSet.current.hGuideLine)

        stockSVG.select('.temp').append('line')
            .attr('class', 'traceLine traceLine3').attr('x1', pixelSet.current.X1).attr('y1', pixelSet.current.Y1).attr('x2', pixelSet.current.X2).attr('y2', pixelSet.current.Y2)
            .attr('stroke', 'white').attr('stroke-width', 0.25).style("stroke-dasharray", ("3, 3"))

        stockSVG.on('mousemove', (e) => traceHWedgeLine4(e, '.traceLine3'))

    } else if (pixelSet.current.sixthClick)
    {
        pixelSet.current = { ...pixelSet.current, Y3: pixelSet.current.Y1 - (pixelSet.current.Y2 - e.offsetY), Y4: e.offsetY, sixthClick: false, seventhClick: true }

        let flippedY1 = e.offsetY - pixelSet.current.hGuideLine
        stockSVG.select('.temp').append('line').attr('class', 'traceLine traceLine4').attr('x1', pixelSet.current.X1).attr('y1', pixelSet.current.hGuideLine - flippedY1).attr('x2', pixelSet.current.X2).attr('y2', pixelSet.current.hGuideLine - flippedY1)
            .attr('stroke', 'white').attr('stroke-width', 1).attr('stroke-width', 0.25).style("stroke-dasharray", ("3, 3"))

        stockSVG.on('mousemove', (e) => traceHWedgeLine5(e, '.traceLine4'))
    } else
    {
        pixelSet.current = { ...pixelSet.current, Y7: pixelSet.current.Y5 + (e.offsetY - pixelSet.current.Y6), Y8: e.offsetY, firstClick: true }
        stockSVG.select('.traceLine4').attr('y1', pixelSet.current.Y7).attr('y2', e.offsetY)
        stockSVG.on('mousemove', null)
        setCaptureComplete(true)
    }

    const traceHWedgeLine1 = (e, lineName) =>
    {
        const stockSVG = select(svg)
        stockSVG.select('.temp').select(lineName).attr('y1', e.offsetY).attr('y2', e.offsetY)
    }
    const traceHWedgeLine2 = (e, lineName) =>
    {
        const stockSVG = select(svg)
        stockSVG.select('.temp').select(lineName).attr('x2', e.offsetX)
    }
    const traceHWedgeLine3 = (e, lineName1, lineName2) =>
    {
        const stockSVG = select(svg)
        stockSVG.select('.temp').select(lineName2).attr('y2', pixelSet.current.hGuideLine - e.offsetY + pixelSet.current.hGuideLine)
        stockSVG.select('.temp').select(lineName1).attr('y2', e.offsetY)

    }
    const traceHWedgeLine4 = (e, lineName1) =>
    {
        const stockSVG = select(svg)
        stockSVG.select('.temp').select(lineName1).attr('y1', pixelSet.current.Y1 + e.offsetY - pixelSet.current.Y2).attr('y2', e.offsetY)
    }
    const traceHWedgeLine5 = (e, lineName1) =>
    {
        const stockSVG = select(svg)
        let diff = e.offsetY - pixelSet.current.Y6
        stockSVG.select('.temp').select(lineName1).attr('y1', pixelSet.current.Y5 + diff).attr('y2', e.offsetY)
    }

}

export const triangleLineTrace = (e, setEnableZoom, svg, pixelSet, setCaptureComplete, xScale, yScale) =>
{
    const stockSVG = select(svg)
    if (pixelSet.current.firstClick)
    {
        initiateCaptureHideTemp(stockSVG, setCaptureComplete, setEnableZoom)
        pixelSet.current = { ...pixelSet.current, X1: e.offsetX, Y1: e.offsetY, Y2: e.offsetY, firstClick: false, secondClick: true }

        stockSVG.select('.temp').append('line')
            .attr('class', 'traceLine traceLine1').attr('x1', e.offsetX).attr('y1', e.offsetY).attr('x2', e.offsetX).attr('y2', e.offsetY)
            .attr('stroke', 'white').attr('stroke-width', 1)

        stockSVG.on('mousemove', (e) => traceHorizontalChannelMouse1(e))
    } else if (pixelSet.current.secondClick)
    {
        pixelSet.current = { ...pixelSet.current, X2: e.offsetX, secondClick: false, thirdClick: true }
        stockSVG.select('.traceLine1').attr('x2', e.offsetX)

        stockSVG.select('.temp').append('line')
            .attr('class', 'traceLine traceLine2').attr('x1', pixelSet.current.X1).attr('y1', e.offsetY).attr('x2', e.offsetX).attr('y2', e.offsetY)
            .attr('stroke', 'white').attr('stroke-width', 0.25).style("stroke-dasharray", ("3, 3"))

        stockSVG.on('mousemove', (e) => traceHorizontalChannelMouse2(e))
    } else if (pixelSet.current.thirdClick)
    {
        pixelSet.current = { ...pixelSet.current, X3: pixelSet.current.X1, Y3: e.offsetY, X4: pixelSet.current.X2, Y4: e.offsetY, thirdClick: false, fourthClick: true }
        stockSVG.select('.traceLine2').attr('y1', e.offsetY).attr('y2', e.offsetY)

        stockSVG.select('.temp').append('line')
            .attr('class', 'traceLine guildLine3').attr('x1', 0).attr('y1', e.offsetY).attr('x2', 5000).attr('y2', e.offsetY)
            .attr('stroke', 'white').attr('stroke-width', 0.25).style('stroke-dasharray', ("3,3"))
        stockSVG.on('mousemove', (e) => traceHorizontalChannelMouse3(e))
    } else if (pixelSet.current.fourthClick)
    {
        pixelSet.current = { ...pixelSet.current, X5: pixelSet.current.X1, Y5: e.offsetY, X6: pixelSet.current.X2, fourthClick: false, fifthClick: true }
        stockSVG.select('.guildLine3').remove()
        stockSVG.select('.temp').append('line').attr('class', 'traceLine traceLine3').attr('x1', pixelSet.current.X1).attr('y1', e.offsetY).attr('x2', pixelSet.current.X2).attr('y2', e.offsetY).attr('stroke', 'white')
        stockSVG.on('mousemove', (e) => traceHorizontalChannelMouse4(e))
    } else if (pixelSet.current.fifthClick)
    {
        pixelSet.current = { ...pixelSet.current, Y6: e.offsetY, fifthClick: false, sixthClick: true }
        stockSVG.select('.traceLine3').attr('y2', e.offsetY)

        stockSVG.select('.temp').append('line').attr('class', 'traceLine traceLine4').attr('x1', pixelSet.current.X1).attr('y1', pixelSet.current.Y5).attr('x2', pixelSet.current.X2).attr('y2', e.offsetY)
            .attr('stroke', 'white').attr('stroke-width', 0.25).style("stroke-dasharray", ("3, 3"))

        stockSVG.on('mousemove', (e) => traceHorizontalChannelMouse5(e, pixelSet.current.Y5, pixelSet.current.Y6))
    } else
    {
        pixelSet.current = { ...pixelSet.current, X7: pixelSet.current.X5, Y7: pixelSet.current.Y5 - (pixelSet.current.Y6 - e.offsetY), X8: pixelSet.current.X6, Y8: e.offsetY, firstClick: true }
        stockSVG.on('mousemove', null)
        setCaptureComplete(true)
    }


    const traceHorizontalChannelMouse1 = (e) =>
    {
        const stockSVG = select(svg)
        stockSVG.select('.temp').select('.traceLine1').attr('x2', e.offsetX - 2)
    }
    const traceHorizontalChannelMouse2 = (e) =>
    {
        const stockSVG = select(svg)
        stockSVG.select('.temp').select('.traceLine2').attr('y1', e.offsetY - 2).attr('y2', e.offsetY - 2)
    }
    const traceHorizontalChannelMouse3 = (e) =>
    {
        const stockSVG = select(svg)
        stockSVG.select('.temp').select('.guildLine3').attr('y1', e.offsetY - 2).attr('y2', e.offsetY - 2)
    }
    const traceHorizontalChannelMouse4 = (e) =>
    {
        const stockSVG = select(svg)
        stockSVG.select('.temp').select('.traceLine3').attr('y2', e.offsetY - 2)
    }
    const traceHorizontalChannelMouse5 = (e, point5Y, point6Y) =>
    {
        const stockSVG = select(svg)
        stockSVG.select('.temp').select('.traceLine4').attr('y1', point5Y - (point6Y - e.offsetY) - 2).attr('y2', e.offsetY - 2)
    }
}




export const toolFunctionExports = [infoTrace, freeLineTrace, trendLineTrace, horizontalLineTrace, horizontalLineTrace, horizontalLineTrace, enterExitTrace]






