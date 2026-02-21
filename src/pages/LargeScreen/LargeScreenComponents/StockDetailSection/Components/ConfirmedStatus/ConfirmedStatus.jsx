import React, { useEffect, useMemo, useRef, useState } from 'react'
import { useAddListOfTickersDirectlyToConfirmedListMutation, useAddTickerDirectlyToConfirmedListMutation, useGetUsersConfirmedSummaryQuery } from '../../../../../../features/MarketSearch/ConfirmedStatusSliceApi'
import { useDispatch, useSelector } from 'react-redux'
import { ArrowBigRight, ChevronDown, ChevronUp, Dot, RotateCcw, Trash2, X } from 'lucide-react'
import { setStockDetailState } from '../../../../../../features/SelectedStocks/StockDetailControlSlice'
import { setSingleChartTickerTimeFrameAndChartingId } from '../../../../../../features/SelectedStocks/SelectedStockSlice'
import { confirmedStatuses } from '../../../../../../Utilities/ConfirmedStatuses'
import { subDays } from 'date-fns'
import './ConfirmedStatus.css'
import { selectCurrentUnConfirmed, setConfirmedUnChartedData } from '../../../../../../features/SelectedStocks/PreviousNextStockSlice'
import { useRemoveChartableStockMutation } from '../../../../../../features/Charting/ChartingSliceApi'
import SingleConfirmedTR from './Components/SingleConfirmedTR'

function ConfirmedStatus()
{
    const dispatch = useDispatch()
    const directAddTicker = useRef()
    const pickUpUncharted = useSelector(selectCurrentUnConfirmed)
    const directSearch = useRef()
    const [directAddServerResponse, setDirectAddServerResponse] = useState(undefined)

    const { data, isSuccess, isError, isLoading, error, refetch } = useGetUsersConfirmedSummaryQuery()
    const [addTickerDirectlyToConfirmedList] = useAddTickerDirectlyToConfirmedListMutation()
    const [addListOfTickersDirectlyToConfirmedList] = useAddListOfTickersDirectlyToConfirmedListMutation()


    const [removeChartableStock] = useRemoveChartableStockMutation()



    const [tableFilters, setTableFilters] = useState({ tickerSearch: undefined, status: 0, addedWithin: 0, olderThan: 0 })
    const [tableSort, setTableSort] = useState({ sort: undefined, direction: undefined })
    const [rotateOnFetch, setRotateOnFetch] = useState(false)

    const [selectedConfirmed, setSelectedConfirmed] = useState(undefined)

    const filteredSortedResults = useMemo(() =>
    {
        if (!isSuccess) return []

        if (tableFilters.tickerSearch) { return data.filter(t => t.tickerSymbol === tableFilters.tickerSearch) }

        let filteredResultsForDisplay = [...data]
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

        //older than x amount of days
        if (!Number.isNaN(tableFilters.olderThan) && tableFilters.olderThan !== 0)
        {
            let olderThanDate = subDays(new Date(), tableFilters.olderThan).setHours(0, 0, 0, 0)
            filteredResultsForDisplay = filteredResultsForDisplay.filter(t => new Date(t.dateAdded) <= olderThanDate)
        }

        switch (tableSort.sort)
        {
            case 'ticker': filteredResultsForDisplay = filteredResultsForDisplay.sort((a, b) => { return tableSort.direction ? a.tickerSymbol.localeCompare(b.tickerSymbol) : b.tickerSymbol.localeCompare(a.tickerSymbol) }); break;
            case 'status': filteredResultsForDisplay = filteredResultsForDisplay.sort((a, b) => { return tableSort.direction ? a.status - b.status : b.status - a.status }); break;
            case 'date': filteredResultsForDisplay = filteredResultsForDisplay.sort((a, b) => { return tableSort.direction ? new Date(a.dateAdded) - new Date(b.dateAdded) : new Date(b.dateAdded) - new Date(a.dateAdded) }); break;
        }

        return filteredResultsForDisplay

    }, [data, tableFilters, tableSort])

    useEffect(() => { if (isSuccess) dispatch(setConfirmedUnChartedData(data)) }, [data])

    let dataTableBody

    if (isSuccess) { dataTableBody = filteredSortedResults.map((confirmed, i) => <SingleConfirmedTR key={confirmed.tickerSymbol} confirmed={confirmed} selectedConfirmed={selectedConfirmed} setSelectedConfirmed={setSelectedConfirmed} jumpToChart={jumpToChart} attemptRemovingConfirmed={attemptRemovingConfirmed} />) }
    else if (isLoading) { dataTableBody = <div>Loading...</div> }
    else if (isError) { dataTableBody = <div>Error Loading Confirmed Summaries</div> }

    function jumpToChart(confirmed)
    {
        dispatch(setSingleChartTickerTimeFrameAndChartingId({ ticker: confirmed.tickerSymbol, chartId: confirmed._id }))
        dispatch(setStockDetailState(5))
    }
    function handleDirectSearchChange()
    {
        if (directSearch.current.value === '') setTableFilters(prev => ({ ...prev, tickerSearch: undefined }))
    }
    function handlePickUpFromLastUncharted()
    {
        if (pickUpUncharted) { dispatch(setSingleChartTickerTimeFrameAndChartingId({ ticker: pickUpUncharted.ticker, chartingId: pickUpUncharted._id })) }
        dispatch(setStockDetailState(5))
    }




    async function attemptRemovingConfirmed(confirmedForRemoval)
    {
        try
        {
            const results = await removeChartableStock({ chartId: confirmedForRemoval._id })

            console.log(results)
        } catch (error)
        {
            console.log(error)

        }
    }


    function refetchAndRotate()
    {
        setRotateOnFetch(true)
        refetch()
        setTimeout(() =>
        {
            setRotateOnFetch(false)
        }, [1000])
    }

    async function attemptConvertDirectAddInputAndSubmit()
    {
        const result = directAddTicker.current.value.split(',').map(s => s.toUpperCase().trim()).filter(s => s !== "");

        if (result.length === 0) return
        if (result.length === 1)
        {
            try
            {
                await addTickerDirectlyToConfirmedList({ tickerToAdd: result[0] }).unwrap()
                directAddTicker.current.value = ''
            } catch (error)
            {
                setDirectAddServerResponse(error.data.message)
                setTimeout(() => { setDirectAddServerResponse(undefined) }, [1500])
            }
        } else if (result.length > 1)
        {
            try
            {
                await addListOfTickersDirectlyToConfirmedList({ listOfStocksToAdd: result }).unwrap()
                directAddTicker.current.value = ''
            } catch (error)
            {
                setDirectAddServerResponse(error.data.message)
                setTimeout(() => { setDirectAddServerResponse(undefined) }, [1500])
            }
        }
    }

    return (
        <div id='LHS-ConfirmedStockStatusContainer'>

            <div id='LHS-StatusTableControl'>
                <h3>Filter Options</h3>
                <div className='StatusControlFilter'>
                    <form onSubmit={(e) => { e.preventDefault(); setTableFilters(prev => ({ ...prev, tickerSearch: directSearch.current.value.toUpperCase() })) }}>
                        <fieldset className='DirectSearchFieldSet'>
                            <legend>Ticker Search</legend>
                            <input type="text" placeholder='Ticker Search' ref={directSearch} onChange={handleDirectSearchChange} style={{ textTransform: "uppercase" }} />
                            <div>
                                <button type='button' onClick={() => setTableFilters(prev => ({ ...prev, tickerSearch: directSearch.current.value.toUpperCase() }))}>Search</button>
                                <button type='button' onClick={() => { setTableFilters(prev => ({ ...prev, tickerSearch: undefined })); directSearch.current.value = '' }}>Clear</button>
                            </div>
                        </fieldset>
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
                </div>

                <div className='StatusControlFilter'>
                    <fieldset className='ShowOnlyAddedWithin' onChange={(e) => setTableFilters(prev => ({ ...prev, olderThan: 0, addedWithin: parseInt(e.target.value) }))}>
                        <legend>Confirmed Added</legend>
                        <div className='ShowOnlyRadioBtn'>
                            <input type="radio" name='addedWithin' id='any' className='visually-hidden' defaultChecked checked={tableFilters.addedWithin === 0} value={0} />
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
                            <label htmlFor="twoDay">2 Days</label>
                        </div>
                        <div className='ShowOnlyRadioBtn'>
                            <input type="radio" name='addedWithin' id='week' className='visually-hidden' value={7} />
                            <label htmlFor="week">1 Week</label>
                        </div>
                        <div className='ShowOnlyRadioBtn'>
                            <input type="radio" name='addedWithin' id='twoWeek' className='visually-hidden' value={14} />
                            <label htmlFor="twoWeek">2 Weeks</label>
                        </div>
                        <div className='ShowOnlyRadioBtn'>
                            <input type="radio" name='addedWithin' id='month' className='visually-hidden' value={30} />
                            <label htmlFor="month">30 Days</label>
                        </div>
                        <div className='ShowOnlyRadioBtn'>
                            <input type="radio" name='addedWithin' id='2month' className='visually-hidden' value={60} />
                            <label htmlFor="2month">60 Days</label>
                        </div>
                    </fieldset>

                    <fieldset className='ShowOnlyOlderThan' onChange={(e) => setTableFilters(prev => ({ ...prev, addedWithin: 0, olderThan: parseInt(e.target.value) }))}>
                        <legend>Confirmed Older Than</legend>
                        <div className='olderThanExact'>
                            <div>
                                <input type="number" name='olderThanExact' id='exact' value={tableFilters.olderThan} min={0} />
                                <label htmlFor="exact"> Days</label>
                            </div>
                            <button onClick={() => setTableFilters(prev => ({ ...prev, olderThan: 0 }))}>Clear</button>
                        </div>
                        <div className='flex'>
                            <div className='ShowOnlyRadioBtnNoSelect'>
                                <input type="radio" name='olderThan' id='oneWeekOlder' className='visually-hidden' value={7} />
                                <label htmlFor="oneWeekOlder">1 Week</label>
                            </div>
                            <div className='ShowOnlyRadioBtnNoSelect'>
                                <input type="radio" name='olderThan' id='twoWeekOlder' className='visually-hidden' value={14} />
                                <label htmlFor="twoWeekOlder">2 Weeks</label>
                            </div>
                            <div className='ShowOnlyRadioBtnNoSelect'>
                                <input type="radio" name='olderThan' id='threeWeekOlder' className='visually-hidden' value={21} />
                                <label htmlFor="threeWeekOlder">3 Weeks</label>
                            </div>
                        </div>

                    </fieldset>
                </div>
            </div>

            <div id='DirectAddContinueCharting'>
                {directAddServerResponse ?
                    <p>{directAddServerResponse}</p> :
                    <form onSubmit={(e) => { e.preventDefault(); attemptConvertDirectAddInputAndSubmit() }} className='flex'>
                        <input type="text" ref={directAddTicker} placeholder='Direct Add' />
                        <button>Add Tickers</button>
                    </form>}

                <div className='flex'>
                    <button onClick={refetchAndRotate} className={`buttonIcon ${rotateOnFetch ? 'rotateOnFetch' : 'hoverRotateOnFetch'}`}><RotateCcw color='white' /></button>
                    <p>Total Confirmed: {data?.length || 0}</p>
                </div>

                <button onClick={() => handlePickUpFromLastUncharted()}>Continue Charting</button>
            </div>


            <div id='LHS-ConfirmedStatusTable'>
                <table>
                    <thead>
                        <tr>
                            <th onClick={() => setTableSort(prev => ({ sort: 'ticker', direction: !prev.direction }))}>
                                <div>Ticker{tableSort.sort === 'ticker' ? tableSort.direction ? <ChevronUp size={16} /> : <ChevronDown size={16} /> : <Dot size={16} />}</div>
                            </th>
                            <th onClick={() => setTableSort(prev => ({ sort: 'sector', direction: !prev.direction }))}>
                                <div>Sector {tableSort.sort === 'sector' ? tableSort.direction ? <ChevronUp size={16} /> : <ChevronDown size={16} /> : <Dot size={16} />}</div>
                            </th>
                            <th onClick={() => setTableSort(prev => ({ sort: 'status', direction: !prev.direction }))}>
                                <div>Status {tableSort.sort === 'status' ? tableSort.direction ? <ChevronUp size={16} /> : <ChevronDown size={16} /> : <Dot size={16} />}</div>
                            </th>
                            <th onClick={() => setTableSort(prev => ({ sort: 'date', direction: !prev.direction }))}>
                                <div>Date Added{tableSort.sort === 'date' ? tableSort.direction ? <ChevronUp size={16} /> : <ChevronDown size={16} /> : <Dot size={16} />}</div>
                            </th>
                            <th>Remove</th>
                            <th>Chart</th>
                        </tr>
                    </thead>
                    <tbody>
                        {dataTableBody}
                    </tbody>
                </table>
            </div>


        </div >
    )
}

export default ConfirmedStatus