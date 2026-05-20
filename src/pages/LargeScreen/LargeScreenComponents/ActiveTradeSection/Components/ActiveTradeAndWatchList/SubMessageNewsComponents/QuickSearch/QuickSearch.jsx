import React, { useState } from 'react'
import './QuickSearch.css'
import QuickSearchChartWrapper from './Components/QSChartWrapper'
import { defaultTimeFrames } from '../../../../../../../../Utilities/TimeFrames'

function QuickSearch()
{

    const [quickSearchTicker, setQuickSearchTicker] = useState('SPY')

    let dailyChart = <div></div>
    let minChart = <div></div>

    function handleTickerSearchChange(e)
    {
        if (e.target.searchThisTicker.value === '') return
        setQuickSearchTicker(e.target.searchThisTicker.value)
    }


    return (
        <div id='QuickSearchCharts'>
            <QuickSearchChartWrapper ticker={quickSearchTicker} timeFrame={defaultTimeFrames.dailyMonth} />
            <QuickSearchChartWrapper ticker={quickSearchTicker} timeFrame={defaultTimeFrames.threeDayOneMin} />
            <div>
                <form onSubmit={(e) => { e.preventDefault(); handleTickerSearchChange(e) }}>
                    <input type="text" id='searchThisTicker' />
                </form>
                <p>actions to go from here</p>
            </div>
        </div>
    )
}

export default QuickSearch