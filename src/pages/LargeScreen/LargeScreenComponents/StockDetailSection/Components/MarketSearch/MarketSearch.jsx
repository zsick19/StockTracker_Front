import React, { useEffect, useState } from 'react'
import './MarketSearch.css'
import MarketSearchFilterBar from './Components/MarketSearchFilterBar'
import MarketSearchPageControl from './Components/MarketSearchPageControl'
import MarketSearchResults from './Components/MarketSearchResults'
import { useGetMarketSearchStockDataQuery } from '../../../../../../features/MarketSearch/MarketSearchSliceApi'
import { PaginationInfo } from '../../../../../../components/Pagination/PaginationInfo'

function MarketSearch({ currentMarketSearchPage, setCurrentMarketSearchPage, marketSearchFilter, setMarketSearchFilter })
{
    const [resultsPerPage, setResultsPerPage] = useState(9)
    const [paginationInfo, setPaginationInfo] = useState(null)

    const { data, isSuccess, isLoading, isError, error, refetch } = useGetMarketSearchStockDataQuery({ currentPage: currentMarketSearchPage, resultsPerPage, searchFilter: marketSearchFilter })

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
        if (isSuccess) { setPaginationInfo(new PaginationInfo(currentMarketSearchPage, data.totalResults, resultsPerPage)) }
    }, [data])




    return (
        <div id='LHS-MarketSearchContainer'>
            <MarketSearchFilterBar searchFilter={marketSearchFilter} setSearchFilter={setMarketSearchFilter} setResultsPerPage={setResultsPerPage} />
            <div id='LHS-MarketSearchResultContainer'>
                <button onClick={() => setCurrentMarketSearchPage(prev => prev - 1)} disabled={!paginationInfo?.hasPrevious}>Prev</button>
                {searchResults}
                <button onClick={() => setCurrentMarketSearchPage(prev => prev + 1)} disabled={!paginationInfo?.hasNext}>Next</button>

            </div>
            <MarketSearchPageControl currentPage={currentMarketSearchPage} paginationInfo={paginationInfo} setCurrentPage={setCurrentMarketSearchPage} />
        </div>
    )
}

export default MarketSearch