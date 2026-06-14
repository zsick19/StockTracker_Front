import React, { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import { selectTradeChartStock } from '../../../../../../features/SelectedStocks/SelectedStockSlice'
import VolDistributionCheck from './Components/VolDistributionCheck/VolDistributionCheck'
import './FinalPreTradeCheck.css'
import { useUpdateTradeRecordMutation } from '../../../../../../features/Trades/TradeSliceApi'
import DailyCheck from './Components/DailyCheck/DailyCheck'
import { useGetStockDataUsingTimeFrameQuery } from '../../../../../../features/StockData/StockDataSliceApi'
import { defaultTimeFrames } from '../../../../../../Utilities/TimeFrames'
import { selectPreCheckTickerActiveTradeMemo, selectPreCheckTickerMemo } from '../../../../../../features/Trades/PreTradeCheckSlice'
import RsvWinRate from './Components/RvsWinRate/RsvWinRate'

function FinalPreTradeCheck()
{
    const [updateTradeRecord] = useUpdateTradeRecordMutation()
    async function attemptUpdateTradeRecord()
    {
        try
        {
            const results = await updateTradeRecord({ tradeId: plannedTicker.chartId, update: tradeDetails }).unwrap()
        } catch (error)
        {
            console.log(error)
        }
    }

    const plannedTicker = useSelector(state => selectPreCheckTickerMemo(state))
    const activeTrade = useSelector(state => selectPreCheckTickerActiveTradeMemo(state))

    const [preTradeDisplay, setPreTradeDisplay] = useState(1)
    const [tradeDetails, setTradeDetails] = useState()

    function providePreTradeDisplay()
    {
        switch (preTradeDisplay)
        {
            case 1: return <DailyCheck plannedTicker={plannedTicker} tradeDetails={tradeDetails} setTradeDetails={setTradeDetails} />
            case 2: return <VolDistributionCheck plannedTicker={plannedTicker} activeTrade={activeTrade} setTradeDetails={setTradeDetails} />
            case 3: return <RsvWinRate plannedTicker={plannedTicker} />
        }
    }

    return (
        <div id='FinalPreTradeCheck'>
            <fieldset onChange={(e) => setPreTradeDisplay(parseInt(e.target.value))}>

                <input type="radio" name="checkForDisplay" id="dailyCheck" className='hiddenRadioInput' value={1} defaultChecked />
                <label htmlFor="dailyCheck" className='clickableLabel'>Daily</label>

                <input type="radio" name="checkForDisplay" id="volDistCheck" className='hiddenRadioInput' value={2} />
                <label htmlFor="volDistCheck" className='clickableLabel'>Volume Distribution</label>

                <input type="radio" name="checkForDisplay" id="posSizeCheck" className='hiddenRadioInput' value={3} />
                <label htmlFor="posSizeCheck" className='clickableLabel'>Position Size</label>

                <input type="radio" name="checkForDisplay" id="recordTrade" className='hiddenRadioInput' value={4} />
                <label htmlFor="recordTrade" className='clickableLabel'>Record Trade</label>
            </fieldset>

            {plannedTicker && providePreTradeDisplay()}
            {preTradeDisplay === 2 && <button onClick={attemptUpdateTradeRecord}>temp for current trades</button>}
        </div>
    )
}

export default FinalPreTradeCheck