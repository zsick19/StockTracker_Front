import React from 'react'
import MiniFiveMinChart from './MiniFiveMinChart'
import { useFetchUsersMacroWatchListQuery } from '../../../../../../../features/WatchList/WatchListStreamingSliceApi'

function SingleMacroTinyPreWatch({ candleData, tickerId })
{
    const { item } = useFetchUsersMacroWatchListQuery(undefined, { selectFromResult: ({ data }) => ({ item: data?.tickerState.entities[tickerId] }), });

    let direction = item ? item.mostRecentPrice > item.dailyOpenPrice ? true : false : false
    return (
        <div className='SingleMacroTiny'>
            <h2>{tickerId}</h2>
            <MiniFiveMinChart candleData={candleData} openPrice={item.dailyOpenPrice} direction={direction} />
            <div className={`SingleMacroTinyPriceDisplay ${direction ? 'positiveDay' : 'negativeDay'}`}>
                <h3>{item.mostRecentPrice.toFixed(2)}</h3>
                <div>
                    <p>{(item.mostRecentPrice - item.dailyOpenPrice).toFixed(2)}</p>
                    <p>{item.currentDayPercentGain.toFixed(2)}%</p>
                </div>
            </div>
        </div>
    )
}

export default SingleMacroTinyPreWatch