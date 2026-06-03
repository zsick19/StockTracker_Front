import React, { useState } from 'react'
import { useSelector } from 'react-redux'
import { selectTradeChartStock } from '../../../../../../features/SelectedStocks/SelectedStockSlice'
import VolDistributionCheck from './Components/VolDistributionCheck/VolDistributionCheck'
import './FinalPreTradeCheck.css'

function FinalPreTradeCheck()
{

    const plannedTicker = useSelector(state => selectTradeChartStock(state))
    console.log(plannedTicker)
    const [preTradeDisplay, setPreTradeDisplay] = useState(1)

    function providePreTradeDisplay()
    {
        switch (preTradeDisplay)
        {
            case 1: return <VolDistributionCheck ticker={plannedTicker.tickerSymbol} />

                break;

            default:
                break;
        }
    }


    return (
        <div>
            <fieldset>
                <input type="radio" />
                <label htmlFor="">Daily</label>
                <input type="radio" />
                <label htmlFor="">Volume Distribution</label>
                <input type="radio" />
                <label htmlFor="">Daily</label>
            </fieldset>

            {providePreTradeDisplay()}
        </div>
    )
}

export default FinalPreTradeCheck