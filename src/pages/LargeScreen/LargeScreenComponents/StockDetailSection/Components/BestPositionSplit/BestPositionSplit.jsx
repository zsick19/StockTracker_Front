import React from 'react'
import './BestPositionSplit.css'
import PreTradePositionContainer from './PreTradeComponents/PreTradePositionContainer'
import TradePositionContainer from './TradeComponents/TradePositionContainer'

function BestPositionSplit()
{
    return (
        <div id='BestPositionSplitContainer'>
            <PreTradePositionContainer />
            <TradePositionContainer />
        </div>
    )
}

export default BestPositionSplit