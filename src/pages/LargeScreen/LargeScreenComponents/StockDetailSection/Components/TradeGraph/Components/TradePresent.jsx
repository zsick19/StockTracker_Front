import React, { useState } from 'react'
import { useAlterTradeRecordMutation } from '../../../../../../../features/Trades/TradeSliceApi'
import { useDispatch } from 'react-redux'
import TradeSuccessCompleted from './TradeSuccessCompleted'
import { AlertCircle, Banknote, CirclePlus, CircleX, Coins, HandCoins, Plane } from 'lucide-react'
import CurrentTradeStats from '../TradePresentComponents/CurrentTradeStats'
import '../TradePresentComponents/TradePresentStyles.css'
import TradePlan from '../TradePresentComponents/TradePlan'

function TradePresent({ selectedStock })
{
    const [alterTradeRecord] = useAlterTradeRecordMutation()
    const [alterTradeDetails, setAlterTradeDetails] = useState({ tradePrice: selectedStock.trade.mostRecentPrice, positionSizeOfAlter: undefined })
    const [alterTradeErrorMessage, setAlterTradeErrorMessage] = useState(undefined)
    const [tradeServerResponse, setTradeServerResponse] = useState({ status: undefined, trade: undefined })

    async function attemptToAlterTradeRecord(action)
    {
        if (!selectedStock?.trade._id) return
        if (!alterTradeDetails.tradePrice) return setAlterTradeErrorMessage('Missing Trade Price')
        if ((action === 'partialSell' || action === 'additionalBuy') && !alterTradeDetails?.positionSizeOfAlter) return setAlterTradeErrorMessage('Missing Position Size')

        try
        {
            let results
            if (action === 'closeAll')
            {
                results = await alterTradeRecord({ action, tickerSymbol: selectedStock.tickerSymbol, tradeId: selectedStock.trade._id, 
                    tradePrice: alterTradeDetails.tradePrice, positionSizeOfAlter: selectedStock.trade.availableShares })
            } else
            {
                results = await alterTradeRecord({ action, tickerSymbol: selectedStock.tickerSymbol, tradeId: selectedStock.trade._id, ...alterTradeDetails })
            }

            if (results.data.tradeComplete)
            {
                setTradeServerResponse({ status: 'tradeCompleted', tradeResult: results.data })
            } else
            {
                setTradeServerResponse({ status: 'Recorded Successfully', tradeResult: results.data })
                setTimeout(() => { setTradeServerResponse(undefined) }, [2000])
            }

        } catch (error)
        {
            console.log(error)
        }
    }
    function handleAlterTradeDetailChanges(e)
    {
        setAlterTradeDetails(prev => ({ ...prev, [e.target.id]: parseFloat(e.target.value) }))
        setAlterTradeErrorMessage(undefined)
    }


    let gainPerShare = alterTradeDetails.tradePrice - selectedStock.trade.averagePurchasePrice
    let PL = gainPerShare * selectedStock.trade.availableShares



    const [showBuyMoreOrCloseOut, setShowBuyMoreOrCloseOut] = useState(false)
    const [tradeDetailDisplay, setTradeDetailDisplay] = useState(0)

    function provideDetailDisplay()
    {
        switch (tradeDetailDisplay)
        {
            case 0: return <CurrentTradeStats trade={selectedStock.trade} />
            case 1: return <TradePlan trade={selectedStock.trade} />
            case 2: return <div>b</div>
            case 3: return <div>b</div>
            case 4: return <div>b</div>
        }
    }

    const [showConfirmTrade, setShowConfirmTrade] = useState({ display: false, action: undefined })
    return (
        <>
            {
                tradeServerResponse.status === 'tradeCompleted' ?
                    <TradeSuccessCompleted completedTrade={tradeServerResponse.trade} /> :

                    <div id='TradeDetailAndBuySellOptions'>

                        <div className='TradeMenuChoice'>
                            <button className='buttonIcon' onClick={() => setTradeDetailDisplay(0)}><AlertCircle color={tradeDetailDisplay === 0 ? 'green' : 'white'} /></button>
                            <button className='buttonIcon' onClick={() => setTradeDetailDisplay(1)}><Plane color={tradeDetailDisplay === 1 ? 'green' : 'white'} /></button>
                            {/* <button className='buttonIcon' onClick={() => setTradeDetailDisplay(2)}><Coins color={tradeDetailDisplay === 2 ? 'green' : 'white'} /></button>
                            <button className='buttonIcon' onClick={() => setTradeDetailDisplay(3)}><Banknote color={tradeDetailDisplay === 3 ? 'green' : 'white'} /></button>
                            <button className='buttonIcon' onClick={() => setTradeDetailDisplay(4)}><HandCoins color={tradeDetailDisplay === 4 ? 'green' : 'white'} /></button> */}
                        </div>

                        <div id='TradeDetailsSection'>
                            {provideDetailDisplay()}
                        </div>


                        <div className='TradeActionExecution TradeAlreadyExists'>
                            {showConfirmTrade.display ?
                                <div>
                                    <p>{alterTradeDetails.tradePrice}</p>
                                    <p>{alterTradeDetails.positionSizeOfAlter}</p>
                                    <button onClick={() => attemptToAlterTradeRecord(showConfirmTrade.action)}>Execute</button>
                                    <button onClick={() => setShowConfirmTrade({ display: false, action: undefined })}>Cancel</button>
                                </div> :
                                showBuyMoreOrCloseOut ?
                                    <form className='RecordTradeForm' onSubmit={(e) => e.preventDefault()} onChange={(e) => handleAlterTradeDetailChanges(e)}>
                                        < div >
                                            <input type="number" id='tradePrice' min={0} value={alterTradeDetails.tradePrice} />
                                            <label htmlFor="tradePrice">Price</label>
                                        </div>
                                        <div>
                                            <input type="number" min={1} id='positionSizeOfAlter' value={alterTradeDetails.positionSizeOfAlter} placeholder='1' />
                                            <label htmlFor="positionSizeOfAlter">Position Size</label>
                                        </div>
                                        <div className='flex'>
                                            <button type='button' onClick={() => setShowConfirmTrade({ display: true, action: 'additionalBuy' })}>Buy</button>
                                            <button type='button' onClick={() => setShowConfirmTrade({ display: true, action: 'partialSell' })}>Sell</button>
                                        </div>
                                    </form>
                                    :
                                    <form className='RecordTradeForm' onSubmit={(e) => e.preventDefault()} onChange={(e) => handleAlterTradeDetailChanges(e)} >
                                        <div>
                                            <input type="number" id='tradePrice' min={0} value={alterTradeDetails.tradePrice} />
                                            <label htmlFor="tradePrice">Close Out Price </label>
                                        </div>
                                        <button type='button' onClick={() => setShowConfirmTrade({ display: true, action: 'closeAll' })}>Close Position</button>
                                    </form>
                            }

                            <div className='AlterOrCloseOutBtnChoice'>
                                <button className={`${showBuyMoreOrCloseOut ? 'ActionChosen' : ''} leftBtnChoice`} onClick={() => setShowBuyMoreOrCloseOut(true)}>                                    Alter</button>
                                <button className={`${showBuyMoreOrCloseOut ? '' : 'ActionChosen'} rightBtnChoice`} onClick={() => setShowBuyMoreOrCloseOut(false)}>Close</button>
                            </div>
                        </div >


                    </div >
            }

        </>
    )
}

export default TradePresent