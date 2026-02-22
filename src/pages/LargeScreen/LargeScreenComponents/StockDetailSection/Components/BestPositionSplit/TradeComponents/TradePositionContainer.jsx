import React from 'react'
import TradePositionVisualizationWrapper from './TradePositionVisualizationWrapper'

function TradePositionContainer()
{
    return (
        <div id='TradePositionSplitContainer'>
            <TradePositionVisualizationWrapper />
            <div>List of trades</div>
        </div>
    )
}

export default TradePositionContainer