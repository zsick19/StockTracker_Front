import React, { useEffect, useState } from 'react'
import './ConfirmMarketSearch.css'
import { useGetUsersUnconfirmedPatternsQuery, useSubmitConfirmedPatternsMutation } from '../../../../../../features/MarketSearch/ConfirmationSliceApi'
import UnconfirmedPatternWrapper from './Components/UnconfirmedPatternWrapper'
import { useDispatch } from 'react-redux'
import { setStockDetailState } from '../../../../../../features/SelectedStocks/StockDetailControlSlice'
import SubmitConfirmedWindow from './Components/SubmitConfirmedWindow'

function ConfirmMarketSearch()
{
    const dispatch = useDispatch()
    const { data, isSuccess, isLoading, isError, error, refetch } = useGetUsersUnconfirmedPatternsQuery(undefined, { refetchOnMountOrArgChange: true })
    const [submitConfirmedPatterns] = useSubmitConfirmedPatternsMutation()

    const [currentPage, setCurrentPage] = useState(1)
    const [keepTheseTickers, setKeepTheseTickers] = useState({ keepInfo: [], remove: [], total: 0 })
    const [showSubmit, setShowSubmit] = useState(false)
    const [totalPages, setTotalPages] = useState(1)
    const [submitServerResponse, setSubmitServerResponse] = useState(undefined)
    const patternsPerPage = 4
    let canContinue = keepTheseTickers.total == (patternsPerPage * currentPage)

    let confirmVisual
    if (isSuccess && data.length > 0)
    {
        confirmVisual = <UnconfirmedPatternWrapper unconfirmedPatterns={data}
            currentPage={currentPage} keepTheseTickers={keepTheseTickers} setKeepTheseTickers={setKeepTheseTickers} />
    }
    else if (isSuccess) { confirmVisual = <div className='CenterConfirmationMessage'><p>No more patterns to confirm.</p></div> }
    else if (isLoading) { confirmVisual = <div className='CenterConfirmationMessage'><p>Loading...</p></div> }
    else if (isError)
    {
        confirmVisual = <div className='CenterConfirmationMessage'>
            <p>Error Loading Patterns</p>
            <button onClick={() => refetch()}>Refetch</button>
        </div>
    }




    useEffect(() => { if (isSuccess) { setTotalPages(Math.ceil(data.length / patternsPerPage)) } }, [data])

    async function attemptSubmittingConfirmations()
    {
        try
        {
            await submitConfirmedPatterns({ confirmed: keepTheseTickers.keepInfo, remove: keepTheseTickers.remove }).unwrap()
            setSubmitServerResponse('Patterns Confirmed!')
            setTimeout(() => { dispatch(setStockDetailState(3)) }, [1500])
        } catch (error)
        {
            console.log(error)
            setSubmitServerResponse("Error submitting confirmed stocks.")
        }
    }

    return (
        <div id='LHS-ConfirmMarketSearchContainer'>
            <button disabled={currentPage === 1} onClick={() => setCurrentPage(prev => prev - 1)} className='ConfirmMarketNavBtns'>Prev</button>
            <div id='LHS-UserUnconfirmedPatternResults'>
                {showSubmit && <SubmitConfirmedWindow keepTheseTickers={keepTheseTickers} setShowSubmit={setShowSubmit} attemptSubmittingConfirmations={attemptSubmittingConfirmations} submitServerResponse={submitServerResponse} />}
                <div id='LHS-UnconfirmedReviewBar'>
                    <p>Stocks For Review: {data?.length || 0}</p>
                    <p>Current Page: {currentPage}</p>
                    <p>Total Pages: {totalPages}</p>

                    <button onClick={() => setShowSubmit(true)} disabled={isSuccess && data.length === 0}>Progress</button>
                    <button disabled={keepTheseTickers.total === 0} onClick={attemptSubmittingConfirmations}>Submit And Chart</button>
                </div>
                {confirmVisual}

            </div>
            <button disabled={(currentPage >= totalPages) || !canContinue} onClick={() => setCurrentPage(prev => prev + 1)} className='ConfirmMarketNavBtns'>Next</button>
        </div>
    )
}

export default ConfirmMarketSearch