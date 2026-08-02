import React, { useMemo } from 'react'
import { shallowEqual, useDispatch, useSelector } from 'react-redux'
import { useManageTradeRecordMutation } from '../../../../../../features/Trades/TradeSliceApi'
import { selectPlanForStaticDetails } from '../../../../../../features/Engine/EnginePlanApiSlice'
import TradeSubmissionForm from './Components/TradeSubmissionForm'
import './manageTrade.css'
import { format } from 'date-fns'

function ManageTrade({ tickerSymbol })
{
    const dispatch = useDispatch()
    const selectStaticFieldsInstance = useMemo(selectPlanForStaticDetails, [])
    const selectedPlannedTicker = useSelector((state) => selectStaticFieldsInstance(state, tickerSymbol), shallowEqual);

    const tradeRecords = selectedPlannedTicker.activeTradeConfig


    return (
        <div id='ManageTrade'>
            <div id='GraphAndTradeSubmission'>
                <div>Graph here

                    <p>{tickerSymbol}</p>
                </div>
                <TradeSubmissionForm existingTrade={selectedPlannedTicker.activeTradeConfig} planId={selectedPlannedTicker.planConfig.planId} tickerSymbol={tickerSymbol} />
            </div>
            <div>
                other stuff

                {tradeRecords && tradeRecords.purchaseRecords.map(t => 
                {
                    if (t.sharesRemaining > 0) return (
                        <div className='flex'>
                            <p>Price: ${t.purchasePrice.toFixed(2)}</p>
                            <p>Size: {t.sharesRemaining}</p>
                            <p>Date: {format(t.purchaseDate, 'MM/dd')}</p>
                        </div>)
                }
                )}
            </div>
        </div>
    )
}

export default ManageTrade