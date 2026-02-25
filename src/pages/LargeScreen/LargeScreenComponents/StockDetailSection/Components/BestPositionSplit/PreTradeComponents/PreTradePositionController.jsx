import React from 'react'

function PreTradePositionController({ whatPreTradeToDisplay, dataForVisual, setWhatPreTradesToDisplay, diagramToDisplay, setDiagramToDisplay })
{

    function provideTitle()
    {
        switch (diagramToDisplay)
        {
            case 0: return <h2>Risk v Reward</h2>
            case 1: return <h2>$1000 Position Gain/Risk</h2>
        }
    }

    function provideDiagramOptions()
    {
        switch (diagramToDisplay)
        {
            case 0: return <div> Options for RvR</div>
            case 1: return <div> Options for $1000</div>
        }
    }


    return (
        <div className='PreTradePositionListController'>
            {provideTitle()}

            <select className='PreTradePositionList' onChange={(e) => setWhatPreTradesToDisplay(e.target.value)}>
                <option value="allPositionVisuals">All Plans</option>
                <option value="enterBufferPositionVisuals">Enter Buffer</option>
                <option value="highImportancePositionVisuals">High Importance</option>
                <option value="stopLossPositionVisuals">Stop Loss Hit</option>
                <option value="plannedPositionVisuals">Other Planned</option>
            </select>

            <div className='BestPositionListTitle'>
                <p>Ticker</p>
                <p>Price</p>
                <p>% to E</p>
                <p>1k Risk</p>
                <p>1k Gain</p>
            </div>
            <div className='ListOfTickersForBestPosition hide-scrollbar'>
                {dataForVisual.map((ex) => <div className='BestPositionDataRow'>
                    <p>{ex.tickerSymbol}</p>
                    <p>${ex.mostRecentPrice.toFixed(2)}</p>
                    <p>{-ex.percentFromEnter.toFixed(2)}%</p>
                    <p>${ex.with1000DollarsCurrentRisk.toFixed(2)}</p>
                    <p>${ex.with1000DollarsCurrentGain.toFixed(2)}</p>
                </div>
                )}
            </div>

            {provideDiagramOptions()}

        </div>
    )
}

export default PreTradePositionController