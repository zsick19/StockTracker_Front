import { useEffect, useState } from 'react'
import PaginationFirstLast from '../../../../../../../components/Pagination/PaginationFirstLast'

function MarketSearchPageControl({ paginationInfo, setCurrentPage, marketSearchFilter, setMarketSearchFilter })
{
    function revertToPageAndFilterFromLocalStorage()
    {
        let currentpage = localStorage.getItem('currentMarketSearchPage')
        let filter = JSON.parse(localStorage.getItem('currentMarketSearchFilter'))
        if (currentpage && filter)
        {
            setCurrentPage(currentpage)
            setMarketSearchFilter(prev => ({ ...prev, ...filter }))
        }
    }

    function saveFilterAndPage()
    {
        localStorage.setItem('currentMarketSearchPage', JSON.stringify(paginationInfo?.currentPage))
        localStorage.setItem('currentMarketSearchFilter', JSON.stringify(marketSearchFilter))
    }

    return (<div id='LHS-MarketSearchPageControl'>
        <PaginationFirstLast paginationInfo={paginationInfo} onPageChange={setCurrentPage} />
        <button onClick={() => revertToPageAndFilterFromLocalStorage()}>Revert To Previous</button>
        <button onClick={() => saveFilterAndPage()}>Save Page and Filter</button>
        <p>Total Results: {paginationInfo?.totalResults || undefined}</p>
    </div>
    )
}

export default MarketSearchPageControl