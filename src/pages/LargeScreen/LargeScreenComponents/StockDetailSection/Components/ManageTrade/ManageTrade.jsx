import React, { useMemo } from 'react'
import { shallowEqual, useDispatch, useSelector } from 'react-redux'
import { useManageTradeRecordMutation } from '../../../../../../features/Trades/TradeSliceApi'
import { selectPlanForStaticDetails } from '../../../../../../features/Engine/EnginePlanApiSlice'
import TradeSubmissionForm from './Components/TradeSubmissionForm'
import './manageTrade.css'
import { format, isToday } from 'date-fns'
import TradeRecord from './Components/TradeRecord'

function ManageTrade({ tickerSymbol })
{
    const dispatch = useDispatch()
    const selectStaticFieldsInstance = useMemo(selectPlanForStaticDetails, [])
    const selectedPlannedTicker = useSelector((state) => selectStaticFieldsInstance(state, tickerSymbol), shallowEqual);

    const tradeRecords = selectedPlannedTicker.activeTradeConfig
    const snapShotOpenPrice = (!isToday(selectedPlannedTicker?.snapShot?.DailyBar.Timestamp)) ? selectedPlannedTicker.snapShot.DailyBar.OpenPrice : undefined



    return (
        <div id='ManageTrade'>
            <div id='GraphAndTradeSubmission'>
                <div>Graph here

                    <p>{tickerSymbol}</p>
                </div>
                <TradeSubmissionForm existingTrade={selectedPlannedTicker.activeTradeConfig} planId={selectedPlannedTicker.planConfig.planId} tickerSymbol={tickerSymbol} />
            </div>
            <div>
                {tradeRecords && <TradeRecord tickerSymbol={tickerSymbol} tradeRecord={selectedPlannedTicker.activeTradeConfig} todayOpenPrice={snapShotOpenPrice} />}

            </div>
        </div>
    )
}

export default ManageTrade