import React, { useState } from 'react'
import PreTradePositionVisualizationWrapper from './PreTradePositionVisualizationWrapper'
import PreTradePositionController from './PreTradePositionController'

function PreTradePositionContainer({ diagramToDisplay, setDiagramToDisplay })
{
    const [whatPreTradesToDisplay, setWhatPreTradesToDisplay] = useState('allPositionVisuals')


    return (
        <div className='PreTradePositionSplitContainer'>
            <PreTradePositionVisualizationWrapper whatPreTradeToDisplay={whatPreTradesToDisplay} setDiagramToDisplay={setDiagramToDisplay} diagramToDisplay={diagramToDisplay} />
            <PreTradePositionController whatPreTradeToDisplay={whatPreTradesToDisplay} setWhatPreTradesToDisplay={setWhatPreTradesToDisplay} setDiagramToDisplay={setDiagramToDisplay} diagramToDisplay={diagramToDisplay} />
        </div>
    )
}

export default PreTradePositionContainer