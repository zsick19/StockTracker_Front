import React, { useRef, useState } from 'react'
import './AccountPLVisual.css'
import { Check, Landmark, RotateCcw, X } from 'lucide-react'
import { useGetUsersAccountBalanceQuery, useUpdateAccountRiskThresholdMutation } from '../../../../../../../features/AccountBalance/AccountBalanceApiSlice'

function AccountPLVisual({ refetch })
{
    const [inputSelection, setInputSelection] = useState(0)

    const [updateAccountRiskThreshold] = useUpdateAccountRiskThresholdMutation()
    const { data, isLoading, isSuccess, isError, error } = useGetUsersAccountBalanceQuery()

    let riskTH
    let positionRisk
    let maxLossDollar
    let maxLossPercent
    if (isSuccess)
    {
        riskTH = data.accountDeposit * (data.riskThreshold / 100)
        positionRisk = data.currentPositionRisk
        maxLossDollar = data.maxLossPerTradeDollar
        maxLossPercent = data.maxLossPerTradePercent
    }

    const [rotateOnFetch, setRotateOnFetch] = useState(false)
    function refetchAndRotate()
    {
        setRotateOnFetch(true)
        refetch()
        setTimeout(() => { setRotateOnFetch(false) }, [1000])
    }

    const thresholdInputRef = useRef()
    async function attemptUpdateOfThreshold()
    {
        try
        {
            await updateAccountRiskThreshold({ risk: thresholdInputRef.current.value })
            setInputSelection(0)
        } catch (error)
        {
            console.log(error)
        }
    }
    const maxPercentLossRef = useRef()
    async function attemptUpdateOfMaxPercent()
    {
        try
        {
            await updateAccountRiskThreshold({ maxLossPercent: maxPercentLossRef.current.value })
            setInputSelection(0)
        } catch (error)
        {
            console.log(error)
        }
    }
    const maxDollarLossRef = useRef()
    async function attemptUpdateOfMaxDollar()
    {
        try
        {
            await updateAccountRiskThreshold({ maxLossDollar: maxDollarLossRef.current.value })
            setInputSelection(0)
        } catch (error)
        {
            console.log(error)
        }
    }
    const accountDepositRef = useRef()
    async function attemptUpdateOfAccountDeposit()
    {
        try
        {
            await updateAccountRiskThreshold({ deposit: accountDepositRef.current.value })
            setInputSelection(0)
        } catch (error)
        {
            console.log(error)
        }
    }


    function provideInputSelection()
    {
        switch (inputSelection)
        {
            case 1: return (<div>
                <p>Max Dollar Loss Per Trade</p>
                <input type="number" placeholder={maxLossDollar} ref={maxDollarLossRef} />
                <button className='buttonIcon' onClick={attemptUpdateOfMaxDollar}><Check color='green' /></button>
                <button className='buttonIcon' onClick={() => setInputSelection(0)}><X color='red' /></button>
            </div>)

            case 2: return (<div>
                <p>Max Percent Loss Allowed Per Trade</p>
                <input type="number" placeholder={maxLossPercent} ref={maxPercentLossRef} />
                <button className='buttonIcon' onClick={attemptUpdateOfMaxPercent}><Check color='green' /></button>
                <button className='buttonIcon' onClick={() => setInputSelection(0)}><X color='red' /></button>
            </div>)

            case 3: return (<div className='accountThresholdInput'>
                <p>Total Account Percent Risk</p>
                <input type="number" placeholder={data?.riskThreshold} ref={thresholdInputRef} />
                <button className='buttonIcon' onClick={attemptUpdateOfThreshold}><Check color='green' /></button>
                <button className='buttonIcon' onClick={() => setInputSelection(0)}><X color='red' /></button>
            </div>)
            case 4: return (<div className='accountThresholdInput'>
                <p>Account Deposit Amount</p>
                <input type="number" placeholder={data?.accountDeposit} ref={accountDepositRef} />
                <button className='buttonIcon' onClick={attemptUpdateOfAccountDeposit}><Check color='green' /></button>
                <button className='buttonIcon' onClick={() => setInputSelection(0)}><X color='red' /></button>
            </div>)
        }
    }

    
    return (
        <div id='LHS-AccountPLVisual'>
            {inputSelection > 0 ? provideInputSelection() :
                <>
                    <p onClick={() => setInputSelection(1)}>Max Loss Per Trade: ${maxLossDollar}</p>
                    <p onClick={() => setInputSelection(2)}>Max Percent Loss Per Trade: {maxLossPercent}%</p>
                    <p onClick={() => setInputSelection(3)}>Portfolio Risk: ${positionRisk?.toFixed(2)} / ${riskTH?.toFixed(2)}</p>
                </>
            }

            <div className='flex'>
                <button onClick={() => setInputSelection(4)} className={`buttonIcon`}><Landmark color='white' /></button>
                <button onClick={refetchAndRotate} className={`buttonIcon ${rotateOnFetch ? 'rotateOnFetch' : 'hoverRotateOnFetch'}`}><RotateCcw color='white' /></button>
            </div>
        </div >
    )
}

export default AccountPLVisual