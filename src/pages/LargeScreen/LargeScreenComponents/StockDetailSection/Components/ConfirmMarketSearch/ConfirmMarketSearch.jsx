import React, { useEffect, useState } from 'react'
import './ConfirmMarketSearch.css'
import { useGetUsersUnconfirmedPatternsQuery, useSubmitConfirmedPatternsMutation } from '../../../../../../features/MarketSearch/ConfirmationSliceApi'
import UnconfirmedPatternWrapper from './Components/UnconfirmedPatternWrapper'
import { useDispatch } from 'react-redux'
import { setStockDetailState } from '../../../../../../features/SelectedStocks/StockDetailControlSlice'

function ConfirmMarketSearch()
{
    const { data, isSuccess, isLoading, isError, error, refetch } = useGetUsersUnconfirmedPatternsQuery(undefined, { refetchOnMountOrArgChange: true })
    const [submitConfirmedPatterns] = useSubmitConfirmedPatternsMutation()

    const [currentPage, setCurrentPage] = useState(1)
    const [keepTheseTickers, setKeepTheseTickers] = useState({ keep: [], remove: [], total: 0 })
    const [showSubmit, setShowSubmit] = useState(false)
    const [totalPages, setTotalPages] = useState(1)
    const [submitServerResponse, setSubmitServerResponse] = useState(undefined)
    const patternsPerPage = 4
    let canContinue = keepTheseTickers.total == (patternsPerPage * currentPage)

    let confirmVisual
    if (isSuccess && data.length > 0) { confirmVisual = <UnconfirmedPatternWrapper unconfirmedPatterns={data} currentPage={currentPage} keepTheseTickers={keepTheseTickers} setKeepTheseTickers={setKeepTheseTickers} /> }
    else if (isSuccess) { confirmVisual = <div>No more patterns to confirm.</div> }
    else if (isLoading) { confirmVisual = <div>Loading...</div> }
    else if (isError) { confirmVisual = <div>Error</div> }

    useEffect(() =>
    {
        if (isSuccess) { setTotalPages(Math.ceil(data.length / patternsPerPage)) }
    }, [data])

    const dispatch = useDispatch()
    async function attemptSubmittingConfirmations()
    {
        try
        {
            await submitConfirmedPatterns({ confirmed: keepTheseTickers.keep, remove: keepTheseTickers.remove }).unwrap()
            setSubmitServerResponse('Patterns Confirmed!')
            setTimeout(() => { dispatch(setStockDetailState(3)) }, [2000])
        } catch (error)
        {
            console.log(error)
            setSubmitServerResponse("Error submitting confirmed stocks.")
        }
    }

    return (
        <div id='LHS-ConfirmMarketSearchContainer'>
            <button disabled={currentPage === 1} onClick={() => setCurrentPage(prev => prev - 1)}>Prev</button>
            <div id='LHS-UserUnconfirmedPatternResults'>
                <div>
                    <button onClick={() => setShowSubmit(true)} disabled={isSuccess && data.length === 0}>Submit Progress</button>
                    {showSubmit &&
                        <div id='SubmitWindow'>
                            <div>
                                <h4>Keep</h4>
                                {keepTheseTickers.keep.map((keep) => { return <p>{keep}</p> })}
                            </div>
                            <div>
                                <h4>Remove</h4>
                                {keepTheseTickers.remove.map((remove) => { return <p>{remove}</p> })}
                            </div>
                            {submitServerResponse && <div>
                                {submitServerResponse}
                            </div>}
                            <button disabled={keepTheseTickers.total === 0} onClick={attemptSubmittingConfirmations}>Submit</button>
                            <button onClick={() => setShowSubmit(false)}>Close</button>
                        </div>}
                </div>
                {confirmVisual}
            </div>
            <button disabled={(totalPages >= currentPage) || canContinue} onClick={() => setCurrentPage(prev => prev + 1)}>Next</button>
        </div>
    )
}

export default ConfirmMarketSearch