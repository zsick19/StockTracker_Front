import React from 'react'

function PreTradePositionController({ whatPreTradeToDisplay, setWhatPreTradesToDisplay, diagramToDisplay, setDiagramToDisplay })
{
    return (
        <div className='PreTradePositionListController'>
            <div className='PreTradePositionList'>
                <fieldset onChange={(e) => setWhatPreTradesToDisplay(e.target.value)}>
                    <input type="radio" id='allPositionVisuals' name='preTradePositionVisual' value='allPositionVisuals' />
                    <label htmlFor="allPositionVisuals">All</label>
                    <input type="radio" id='highImportancePositionVisuals' name='preTradePositionVisual' value='highImportancePositionVisuals' />
                    <label htmlFor="highImportancePositionVisuals">High Importance</label>
                    <input type="radio" id='enterBufferPositionVisuals' name='preTradePositionVisual' value='enterBufferPositionVisuals' />
                    <label htmlFor="enterBufferPositionVisuals">Enter Buffer</label>
                    <input type="radio" id='stopLossPositionVisuals' name='preTradePositionVisual' value='stopLossPositionVisuals' />
                    <label htmlFor="stopLossPositionVisuals">StopLoss</label>
                    <input type="radio" id='plannedPositionVisuals' name='preTradePositionVisual' value='plannedPositionVisuals' />
                    <label htmlFor="plannedPositionVisuals">Planned</label>
                </fieldset>
                List of Pretrades and interactions
            </div>
            <p>{whatPreTradeToDisplay}</p>

        </div>
    )
}

export default PreTradePositionController