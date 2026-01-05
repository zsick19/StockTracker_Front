import React, { useEffect, useState } from 'react'
import './MarketSearch.css'
import MarketSearchFilterBar from './Components/MarketSearchFilterBar'
import MarketSearchPageControl from './Components/MarketSearchPageControl'
import MarketSearchResults from './Components/MarketSearchResults'
import { useGetMarketSearchStockDataQuery } from '../../../../../../features/MarketSearch/MarketSearchSliceApi'
import { PaginationInfo } from '../../../../../../components/Pagination/PaginationInfo'

function MarketSearch()
{
    const [currentPage, setCurrentPage] = useState(1)
    const [resultsPerPage, setResultsPerPage] = useState(9)
    const [searchFilter, setSearchFilter] = useState({ AvgVolume: undefined, Sector: undefined, Industry: undefined, MarketCap: undefined, ATR: undefined, Volume: undefined, Country: undefined })
    const [paginationInfo, setPaginationInfo] = useState(null)

    const { data, isSuccess, isLoading, isError, error, refetch } = useGetMarketSearchStockDataQuery({ currentPage, resultsPerPage, searchFilter })

    let searchResults

    if (isSuccess && data.results?.length > 0) { searchResults = <MarketSearchResults searchResults={data.results} /> }
    else if (isSuccess) { searchResults = <div><p>No results for this filter</p></div> }
    else if (isLoading) { searchResults = <div id='LHS-MarketSearchResultLoading'>Loading...</div> }
    else if (isError)
    {
        searchResults = <div id='LHS-MarketSearchResultError'>
            <p>{error.data}</p>
            <p>{error.error}</p>
            <p>Error Loading</p>
            <button onClick={() => refetch()}>Refetch</button>
        </div>
    }

    useEffect(() =>
    {
        if (isSuccess) { setPaginationInfo(new PaginationInfo(currentPage, data.totalResults, resultsPerPage)) }
    }, [data])




    return (
        <div id='LHS-MarketSearchContainer'>
            <MarketSearchFilterBar searchFilter={searchFilter} setSearchFilter={setSearchFilter} setResultsPerPage={setResultsPerPage} />
            <div id='LHS-MarketSearchResultContainer'>
                <button onClick={() => setCurrentPage(prev => prev - 1)} disabled={!paginationInfo?.hasPrevious}>Prev</button>
                {searchResults}
                <button onClick={() => setCurrentPage(prev => prev + 1)} disabled={!paginationInfo?.hasNext}>Next</button>

            </div>
            <MarketSearchPageControl currentPage={currentPage} paginationInfo={paginationInfo} setCurrentPage={setCurrentPage} />
        </div>
    )
}

export default MarketSearch