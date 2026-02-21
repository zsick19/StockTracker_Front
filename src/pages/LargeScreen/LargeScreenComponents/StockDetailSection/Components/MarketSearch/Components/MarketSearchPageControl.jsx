import { useEffect, useState } from 'react'
import PaginationFirstLast from '../../../../../../../components/Pagination/PaginationFirstLast'
import { useGetUsersMarketSearchProgressMutation, useSetMarketSearchFilterAndPageProgressMutation } from '../../../../../../../features/MarketSearch/MarketSearchSliceApi'

function MarketSearchPageControl({ paginationInfo, setCurrentPage, marketSearchFilter, setMarketSearchFilter })
{
    const [setMarketSearchFilterAndPageProgress, { isLoading }] = useSetMarketSearchFilterAndPageProgressMutation()
    const [getUsersMarketSearchProgress, { isLoading: isProgressLoading }] = useGetUsersMarketSearchProgressMutation()
    const [showSavedProgressMessage, setShowSavedProgressMessage] = useState(false)

    async function revertToPageAndFilterFromLocalStorage()
    {
        try
        {
            const results = await getUsersMarketSearchProgress()
            setCurrentPage(results.data.marketSearchProgress.mostRecentPage)
            setMarketSearchFilter(results.data.marketSearchProgress.filterParams)
        } catch (error)
        {
            console.log(error)
        }
    }

    async function saveFilterAndPage()
    {
        try
        {
            const results = await setMarketSearchFilterAndPageProgress({ currentPage: paginationInfo.currentPage, searchFilter: marketSearchFilter, resultsPerPage: 9 })
            setShowSavedProgressMessage(true)
            setTimeout(() =>
            {
                setShowSavedProgressMessage(false)
            }, [1000])
        } catch (error)
        {
            console.log(error)
        }
    }

    return (<div id='LHS-MarketSearchPageControl'>
        <PaginationFirstLast paginationInfo={paginationInfo} onPageChange={setCurrentPage} />
        <button onClick={() => revertToPageAndFilterFromLocalStorage()} disabled={isProgressLoading}>Revert To Previous</button>
        <button onClick={() => saveFilterAndPage()} disabled={isLoading}>
            {showSavedProgressMessage ? 'Progress Saved' : 'Save Page and Filter'}
        </button>
        <p>Total Results: {paginationInfo?.totalResults || undefined}</p>
    </div>
    )
}

export default MarketSearchPageControl