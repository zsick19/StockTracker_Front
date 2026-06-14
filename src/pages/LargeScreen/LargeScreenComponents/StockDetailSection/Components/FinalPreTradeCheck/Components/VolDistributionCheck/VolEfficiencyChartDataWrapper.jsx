import React, { useMemo } from 'react'
import { calculateVolumeEfficiency } from '../../../../../../../../Utilities/technicalIndicatorFunctions'
import ChartWithChartingWrapper from '../../../../../../../../components/ChartSubGraph/ChartWithChartingWrapper'
import { filterRegularMarketHours } from '../../../../../../../../Utilities/TimeFrames'
import { format } from 'date-fns'

function VolEfficiencyChartDataWrapper({ candleData, ticker, chartId, timeFrame, uuid })
{

    const volEfficiencyData = useMemo(() =>
    {
        let volCalc = calculateVolumeEfficiency(candleData)
        return { candleData: filterRegularMarketHours(volCalc.candles), institutionalCandles: volCalc.institutionalCandles }

    }, [candleData])

    return (<div className='flex'>
        <ChartWithChartingWrapper ticker={ticker} candleData={volEfficiencyData}
            interactionController={{ isZoomAble: true }} uuid={uuid}
            chartId={chartId} timeFrame={timeFrame} onlyMarketHours={true}
        />
        <div id='volEfficiencyList'>
            {volEfficiencyData.institutionalCandles.map((t) => <div>
                <p>{t.ClosePrice}</p>
                <p>{format(new Date(t.Timestamp), 'MMM dd, h:mm a')}</p>
            </div>)}
        </div>
    </div>)
}

export default VolEfficiencyChartDataWrapper