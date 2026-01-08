import React, { useEffect, useState } from 'react'
import { useGetUsersConfirmedSummaryQuery } from '../../../../../../features/MarketSearch/ConfirmedStatusSliceApi'
import { useDispatch } from 'react-redux'
import { ArrowBigRight } from 'lucide-react'
import { setStockDetailState } from '../../../../../../features/SelectedStocks/StockDetailControlSlice'
import { setSingleChartTickerTimeFrameAndChartingId } from '../../../../../../features/SelectedStocks/SelectedStockSlice'
import { confirmedStatuses } from '../../../../../../Utilities/ConfirmedStatuses'
import { subDays } from 'date-fns'
import './ConfirmedStatus.css'

function ConfirmedStatus()
{
    const dispatch = useDispatch()
    const { data, isSuccess, isError, isLoading, error, refetch } = useGetUsersConfirmedSummaryQuery()
    const [filteredResults, setFilteredResults] = useState([])
    const [tableFilters, setTableFilters] = useState({ status: 0, addedWithin: 0 })

    let dataTableBody
    if (isSuccess)
    {
        dataTableBody = filteredResults.map((confirmed) =>
        {
            return <tr>
                <td>{confirmed.tickerSymbol}</td>
                <td>{confirmed.status >= 0 ? confirmedStatuses[confirmed.status] : 'Quick Add'}</td>
                <td><ArrowBigRight onClick={() => jumpToChart(confirmed)} /></td>
                <td>{new Date(confirmed.dateAdded).toLocaleDateString()}</td>
            </tr>
        })
    }
    else if (isLoading) { dataTableBody = <div>Loading...</div> }
    else if (isError) { dataTableBody = <div>Error Loading Confirmed Summaries</div> }

    function jumpToChart(confirmed)
    {
        dispatch(setSingleChartTickerTimeFrameAndChartingId({ ticker: confirmed.tickerSymbol, chartingId: confirmed._id }))
        dispatch(setStockDetailState(5))
    }


    useEffect(() =>
    {
        if (isSuccess) { setFilteredResults(data) }
    }, [data])

    useEffect(() =>
    {
        if (!isSuccess) return
        let filteredResultsForDisplay = data

        //status filter
        if (tableFilters.status !== 0) { filteredResultsForDisplay = filteredResultsForDisplay.filter(t => t.status + 1 === tableFilters.status) }

        //date created filter
        if (tableFilters.addedWithin === -1)
        {
            let today = new Date().setHours(0, 0, 0, 0)
            filteredResultsForDisplay = filteredResultsForDisplay.filter(t => new Date(t.dateAdded).setHours(0, 0, 0, 0) === today)
        } else if (tableFilters.addedWithin !== 0)
        {
            let lastDate = subDays(new Date(), tableFilters.addedWithin).setHours(0, 0, 0, 0)
            filteredResultsForDisplay = filteredResultsForDisplay.filter(t => new Date(t.dateAdded).setHours(0, 0, 0, 0) >= lastDate)
        }




        setFilteredResults(filteredResultsForDisplay)

    }, [tableFilters])



    return (
        <div id='LHS-ConfirmedStockStatusContainer'>

            <div id='LHS-StatusTableControl'>
                <h1>Confirmed Status</h1>
                <p>Stats</p>

                <form onSubmit={(e) => e.preventDefault()}>
                    <input type="text" placeholder='Ticker Search' />
                    <button>Search</button>
                </form>


                <fieldset className='ShowOnlySelectedStatus' onChange={(e) => setTableFilters(prev => ({ ...prev, status: parseInt(e.target.value) }))}>
                    <legend>Confirmed Status</legend>
                    <div className='ShowOnlyRadioBtn'>
                        <input type="radio" name="showOnlyStatus" id="all" className='visually-hidden' defaultChecked value={0} />
                        <label htmlFor="all">All</label>
                    </div>
                    {confirmedStatuses.map((status, i) =>
                    {
                        return <div className='ShowOnlyRadioBtn' key={status}>
                            <input type="radio" name="showOnlyStatus" id={status} className='visually-hidden' value={i + 1} />
                            <label htmlFor={status}>{status}</label>
                        </div>
                    })}
                </fieldset>

                <fieldset className='ShowOnlyAddedWithin' onChange={(e) => setTableFilters(prev => ({ ...prev, addedWithin: parseInt(e.target.value) }))}>
                    <legend>Add Within</legend>
                    <div className='ShowOnlyRadioBtn'>
                        <input type="radio" name='addedWithin' id='any' className='visually-hidden' defaultChecked value={0} />
                        <label htmlFor="any">Any</label>
                    </div>
                    <div className='ShowOnlyRadioBtn'>
                        <input type="radio" name='addedWithin' id='today' className='visually-hidden' value={-1} />
                        <label htmlFor="today">Today</label>
                    </div>
                    <div className='ShowOnlyRadioBtn'>
                        <input type="radio" name='addedWithin' id='oneDay' className='visually-hidden' value={1} />
                        <label htmlFor="oneDay">Yesterday</label>
                    </div>
                    <div className='ShowOnlyRadioBtn'>
                        <input type="radio" name='addedWithin' id='twoDay' className='visually-hidden' value={2} />
                        <label htmlFor="twoDay">2 Day</label>
                    </div>
                    <div className='ShowOnlyRadioBtn'>
                        <input type="radio" name='addedWithin' id='week' className='visually-hidden' value={7} />
                        <label htmlFor="week">Week</label>
                    </div>
                    <div className='ShowOnlyRadioBtn'>
                        <input type="radio" name='addedWithin' id='twoWeek' className='visually-hidden' value={14} />
                        <label htmlFor="twoWeek">2 Weeks</label>
                    </div>
                    <div className='ShowOnlyRadioBtn'>
                        <input type="radio" name='addedWithin' id='month' className='visually-hidden' value={30} />
                        <label htmlFor="month">Month</label>
                    </div>

                </fieldset>


            </div>


            <div id='LHS-ConfirmedStatusTable'>
                <table>
                    <thead>
                        <tr>
                            <th>Ticker</th>
                            <th>Status</th>
                            <th>Chart</th>
                            <th>Date Added</th>
                            <th>Enter Hit & Tracking</th>
                            <th>Stoploss Hit & Tracking</th>
                            <th>Plan</th>
                        </tr>
                    </thead>
                    <tbody>
                        {dataTableBody}
                    </tbody>
                </table>

            </div>
        </div>
    )
}

export default ConfirmedStatus