import React, { useState } from 'react'
import './BestPositionSplit.css'
import PreTradePositionContainer from './PreTradeComponents/PreTradePositionContainer'
import TradePositionContainer from './TradeComponents/TradePositionContainer'

function BestPositionSplit()
{

    const [diagramToDisplay1, setDiagramToDisplay1] = useState(0)
    const [diagramToDisplay2, setDiagramToDisplay2] = useState(1)


    return (
        <div id='BestPositionSplitContainer'>
            <PreTradePositionContainer diagramToDisplay={diagramToDisplay1} setDiagramToDisplay={setDiagramToDisplay1} />
            <PreTradePositionContainer diagramToDisplay={diagramToDisplay2} setDiagramToDisplay={setDiagramToDisplay2} />
        </div>
    )
}

export default BestPositionSplit