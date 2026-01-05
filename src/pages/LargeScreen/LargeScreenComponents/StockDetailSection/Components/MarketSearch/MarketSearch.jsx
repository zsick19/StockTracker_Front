import React, { useState } from 'react'
import './MarketSearch.css'
import MarketSearchFilterBar from './Components/MarketSearchFilterBar'
import MarketSearchPageControl from './Components/MarketSearchPageControl'
import MarketSearchResults from './Components/MarketSearchResults'
import { useGetMarketSearchStockDataQuery } from '../../../../../../features/MarketSearch/MarketSearchSliceApi'

function MarketSearch()
{

    const sampleSearchResults = [
        { ticker: 'AAA', sector: 'Energy', avgVol: 300000 },
        { ticker: 'AAA', sector: 'Energy', avgVol: 300000 },
        { ticker: 'AAA', sector: 'Energy', avgVol: 300000 },
        { ticker: 'AAA', sector: 'Energy', avgVol: 300000 },
        { ticker: 'AAA', sector: 'Energy', avgVol: 300000 },
        { ticker: 'AAA', sector: 'Energy', avgVol: 300000 },
        { ticker: 'AAA', sector: 'Energy', avgVol: 300000 },
        { ticker: 'AAA', sector: 'Energy', avgVol: 300000 },
        { ticker: 'AAA', sector: 'Energy', avgVol: 300000 },
    ]

    const [currentPage, setCurrentPage] = useState(1)
    const [resultsPerPage, setResultsPerPage] = useState(9)
    const [searchFilter, setSearchFilter] = useState({ avgVol: undefined, Sector: undefined })

    const { data, isSuccess, isLoading, isError, error, refetch } = useGetMarketSearchStockDataQuery({ currentPage, resultsPerPage, searchFilter })

    let searchResults

    if (isSuccess && data.result?.length > 0)
    {
        searchResults = <MarketSearchResults searchResults={sampleSearchResults} />
    }
    else if (isSuccess)
    {
        searchResults = <div>            <p>No results for this filter</p>        </div>
    } else if (isLoading)
    {
        searchResults = <div id='LHS-MarketSearchResultLoading'>            Loading...</div>
    } else if (isError)
    {
        searchResults = <div id='LHS-MarketSearchResultError'>
            <p>{error.data}</p>
            <p>{error.error}</p>
            <p>Error Loading</p>
            <button onClick={() => refetch()}>Refetch</button>
        </div>
    }



    return (
        <div id='LHS-MarketSearchContainer'>
            <MarketSearchFilterBar searchFilter={searchFilter} setSearchFilter={setSearchFilter} setResultsPerPage={setResultsPerPage} />
            <div id='LHS-MarketSearchResultContainer'>
                <button>Prev</button>
                {searchResults}
                <button>Next</button>
            </div>
            <MarketSearchPageControl currentPage={currentPage} setCurrentPage={setCurrentPage} />
        </div>
    )
}

export default MarketSearch