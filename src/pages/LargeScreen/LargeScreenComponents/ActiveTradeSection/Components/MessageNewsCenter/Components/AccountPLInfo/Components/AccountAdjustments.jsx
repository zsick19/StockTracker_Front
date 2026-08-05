import React, { useRef, useState } from 'react'
import { useUpdateAccountBalanceMutation } from '../../../../../../../../../features/AccountBalance/AccountBalanceApiSlice'

function AccountAdjustments({ setCurrentSubSection })
{
    const [serverMessage, setServerMessage] = useState({ status: undefined, accountBalance: undefined })
    const [updateAccountBalance] = useUpdateAccountBalanceMutation()
    async function attemptUpdateAccountBalance()
    {

        if (!amountToChange || isNaN(amountToChange) || amountToChange <= 0) return
        try
        {
            const results = await updateAccountBalance({ updateAmount: amountToChange, action: showConfirm }).unwrap()
            setServerMessage({ status: 'Success', accountBalance: results.accountDeposit })
            console.log(results)
        } catch (error)
        {
            console.log(error)
        }
    }


    const [showConfirm, setShowConfirm] = useState(undefined)
    const [amountToChange, setAmountToChange] = useState(0)
    function handleAmountToChange(e)
    {
        let amount = parseFloat(e.target.value)

        if (isNaN(amount))
        {
            e.target.value = ''
            return
        }
        if (amount > 0)
        {
            e.target.value = Math.abs(e.target.value)
        }
        setAmountToChange(amount)
    }
    return (
        <div>
            {serverMessage.status === 'Success' ? <div>
                <p>Successful {showConfirm}</p>
                <p>Account Balance: {serverMessage.accountBalance}</p>
                <button onClick={() => setCurrentSubSection(1)}>Clear</button>
                <button onClick={() => { setShowConfirm(undefined); setServerMessage({ status: undefined }); setAmountToChange(0) }}>Another Transaction</button>

            </div> :
                showConfirm ? <div>
                    <p>{showConfirm}</p>
                    <p>Amount: {amountToChange}</p>

                    <button onClick={() => attemptUpdateAccountBalance()}>Confirm</button>
                    <button onClick={() => setShowConfirm(undefined)}>Cancel</button>
                </div> :
                    <>
                        <label htmlFor="">Account Adjustments</label>
                        <input type="text" onChange={(e) => handleAmountToChange(e)} />

                        <button onClick={() => setShowConfirm('Deposit')}>Deposit</button>
                        <button onClick={() => setShowConfirm('Withdraw')}>Withdraw</button>

                    </>
            }
            <div>

            </div>
            <button onClick={() => setCurrentSubSection(1)}>hide</button>
        </div>
    )
}

export default AccountAdjustments