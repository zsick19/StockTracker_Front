import React, { useRef, useState } from 'react'
import './AccountPLVisual.css'
import { Check, Landmark, NotebookPen, RotateCcw, X } from 'lucide-react'
import { useDispatch } from 'react-redux'
import { setStockDetailState } from '../../../../../../../features/SelectedStocks/StockDetailControlSlice'
import { useGetUsersAccountBalanceQuery, useUpdateAccountRiskThresholdMutation } from '../../../../../../../features/AccountBalance/AccountBalanceApiSlice'

function AccountPLVisual({ refetch })
{
    const dispatch = useDispatch()
    const [showAccountActions, setShowAccountActions] = useState(false)
    const [rotateOnFetch, setRotateOnFetch] = useState(false)

    const { data, isLoading, isSuccess, isError, error } = useGetUsersAccountBalanceQuery()
    // console.log(data)

    let riskTH
    let positionRisk
    let cashBalance
    if (isSuccess)
    {
        riskTH = data.accountDeposit * (data.riskThreshold / 100)
        positionRisk = data.currentPositionRisk
        cashBalance = data.accountDeposit
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

    const [updateAccountRiskThreshold] = useUpdateAccountRiskThresholdMutation()
    const [showThresholdInput, setShowThresholdInput] = useState(false)
    const thresholdInputRef = useRef()
    async function attemptUpdateOfThreshold()
    {

        try
        {
            await updateAccountRiskThreshold({ risk: thresholdInputRef.current.value })
            setShowThresholdInput(false)
        } catch (error)
        {
            console.log(error)
        }
    }

    return (
        <div id='LHS-AccountPLVisual'>
            <div >
                <div>
                    <h3>${data?.accountDeposit.toFixed(2)}</h3>
                    <p>Net Account Balance</p>
                </div>
                <p>Day's P/L: +34.34 +0.33%</p>
            </div>
            {showAccountActions ? <div id='AccountDepositWithdrawForm'>
                <input type="double" />
                <button>Deposit</button>
                <button>Withdraw</button>
                <button onClick={() => setShowAccountActions(false)}>Cancel</button>
            </div> :
                <>
                    {/* <p>Open P/L: +34.34 +0.33%</p> */}

                    {showThresholdInput ?
                        <div className='accountThresholdInput'>
                            <input type="number" placeholder={data?.riskThreshold} ref={thresholdInputRef} />
                            <button className='buttonIcon' onClick={attemptUpdateOfThreshold}><Check color='green' /></button>
                            <button className='buttonIcon' onClick={() => setShowThresholdInput(false)}><X color='red' /></button>
                        </div> :
                        <p onClick={() => setShowThresholdInput(true)}>Portfolio Risk: ${positionRisk?.toFixed(2)} / ${riskTH?.toFixed(2)}</p>
                    }


                    <div className='flex'>
                        <button className='buttonIcon' onClick={() => setShowAccountActions(true)}><Landmark color='white' /></button>
                        <button className='buttonIcon' onClick={() => dispatch(setStockDetailState(9))}><NotebookPen color='white' /></button>
                        <button onClick={refetchAndRotate} className={`buttonIcon ${rotateOnFetch ? 'rotateOnFetch' : 'hoverRotateOnFetch'}`}><RotateCcw color='white' /></button>
                    </div>
                </>
            }
        </div>
    )
}

export default AccountPLVisual