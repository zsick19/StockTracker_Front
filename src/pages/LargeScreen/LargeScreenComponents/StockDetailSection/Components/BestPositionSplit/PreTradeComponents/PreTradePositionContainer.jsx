import React, { useState } from 'react'
import PreTradePositionVisualizationWrapper from './PreTradePositionVisualizationWrapper'
import PreTradePositionController from './PreTradePositionController'

function PreTradePositionContainer()
{
    const [whatPreTradesToDisplay, setWhatPreTradesToDisplay] = useState('allPositionVisuals')




    return (
        <div id='PreTradePositionSplitContainer'>
            <PreTradePositionVisualizationWrapper whatPreTradeToDisplay={whatPreTradesToDisplay} />
            <PreTradePositionController whatPreTradeToDisplay={whatPreTradesToDisplay} setWhatPreTradesToDisplay={setWhatPreTradesToDisplay} />
        </div>
    )
}

export default PreTradePositionContainer