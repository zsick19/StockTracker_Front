import React, { useRef, useState } from 'react'
import { useGetUsersTradingJournalQuery } from '../../../../../../features/Trades/TradingJournalApiSlice'
import './TradingJournal.css'
import PreviousTradeJournal from './Conponents/PreviousTradeJournal'
import CurrentTradeJournal from './Conponents/CurrentTradeJournal'
import { defaultSectors } from '../../../../../../Utilities/SectorsAndIndustries'

function TradingJournal()
{
    const [currentTrades, setCurrentTrades] = useState(false)


    const [showFilter, setShowFilter] = useState(undefined)
    const [tradeFilter, setTradeFilter] = useState({ tickerSearch: undefined, tradeGains: 'allGains', closedDate: 'allClosed', sectorFilter: 'allSectors' })

    const tickerSearch = useRef()

    function handleTickerSearch()
    {
        if (tickerSearch.current.value === '') setTradeFilter(prev => ({ ...prev, tickerSearch: undefined }))
        else setTradeFilter(prev => ({ ...prev, tickerSearch: tickerSearch.current.value.toUpperCase() }))
    }



    return (
        <div id='LHS-TradeJournal'>
            <div id='LHS-TradeFilterControls'>
                <div className='flex'>
                    <h2>Trading Journal</h2>
                    <button onClick={() => setCurrentTrades(false)}>Trade History</button>
                    <button onClick={() => setCurrentTrades(true)}>Current Trades</button>
                    <form onSubmit={(e) => { e.preventDefault(); handleTickerSearch() }}>
                        <input type="text" ref={tickerSearch} />
                        <button>Search</button>
                    </form>
                </div>

                <div className='flex'>
                    <button onClick={() => setShowFilter('gains')}>Gains</button>
                    <button onClick={() => setShowFilter('closeDate')}>Close Date</button>
                    <div>

                        {showFilter === 'gains' &&
                            <fieldset className='flex' onChange={(e) => { setTradeFilter(prev => ({ ...prev, [e.target.name]: e.target.id })); setShowFilter(undefined) }}>
                                <div>
                                    <label htmlFor="negativeGains">Losses</label>
                                    <input type="radio" name="tradeGains" id="negativeGains" />
                                </div>
                                <div>
                                    <label htmlFor="positiveGains">Wins</label>
                                    <input type="radio" name="tradeGains" id="positiveGains" />
                                </div>
                                <div>
                                    <label htmlFor="allGains">All</label>
                                    <input type="radio" name="tradeGains" id="allGains" />
                                </div>
                            </fieldset>}
                        {showFilter === 'closeDate' &&
                            <fieldset className='flex' onChange={(e) => { setTradeFilter(prev => ({ ...prev, [e.target.name]: e.target.id })); setShowFilter(undefined) }}>
                                <div>
                                    <label htmlFor="closedToday">Today</label>
                                    <input type="radio" name="closeDate" id="closedToday" />
                                </div>
                                <div>
                                    <label htmlFor="closedYesterday">Yesterday</label>
                                    <input type="radio" name="closeDate" id="closedYesterday" />
                                </div>
                                <div>
                                    <label htmlFor="closedThisWeek">This Week</label>
                                    <input type="radio" name="closeDate" id="closedThisWeek" />
                                </div>
                                <div>
                                    <label htmlFor="closedLastWeek">Last Week</label>
                                    <input type="radio" name="closeDate" id="closedLastWeek" />
                                </div>
                                <div>
                                    <label htmlFor="closedThisMonth">This Month</label>
                                    <input type="radio" name="closeDate" id="closedThisMonth" />
                                </div>
                                <div>
                                    <label htmlFor="closedLastMonth">Last Month</label>
                                    <input type="radio" name="closeDate" id="closedLastMonth" />
                                </div>
                                <div>
                                    <label htmlFor="closedThisQuarter">This Quarter</label>
                                    <input type="radio" name="closeDate" id="closedThisQuarter" />
                                </div>
                                <div>
                                    <label htmlFor="closedThisYear">YTD</label>
                                    <input type="radio" name="closeDate" id="closedThisYear" />
                                </div>
                                <div>
                                    <label htmlFor="allClosed">All</label>
                                    <input type="radio" name="closeDate" id="allClosed" />
                                </div>
                            </fieldset>
                        }
                    </div>
                </div>


                <div>
                    <label htmlFor="sectorFilter">Sector Filter</label>
                    <select name="sectorFilter" id="sectorFilter" onChange={(e) => { setTradeFilter(prev => ({ ...prev, [e.target.name]: e.target.value })); }}>
                        <option value="allSectors">All Sectors</option>
                        {defaultSectors.map((sector) => <option value={sector}>{sector}</option>)}
                    </select>
                </div>

            </div>

            {currentTrades ?
                <CurrentTradeJournal /> :
                <PreviousTradeJournal tradeFilter={tradeFilter} />
            }



        </div>
    )
}

export default TradingJournal