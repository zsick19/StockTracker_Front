import React, { useState } from 'react'
import '../AccountPLStyles.css'
import { Landmark, NotebookPen } from 'lucide-react'
import { useDispatch } from 'react-redux'
import { setStockDetailState } from '../../../../../../../../features/SelectedStocks/StockDetailControlSlice'

function AccountPLVisual()
{
    const dispatch = useDispatch()
    const [showAccountActions, setShowAccountActions] = useState(false)
    return (
        <div id='LHS-AccountPLVisual'>
            <div >
                <div>
                    <h3>$18,334.32</h3>
                    <p>Net Account Balance</p>
                </div>
                <p>Day's P/L: +34.34 +0.33%</p>
            </div>
            {showAccountActions ? <div>
                <input type="double" />
                <button>Deposit</button>
                <button>Withdraw</button>
                <button onClick={() => setShowAccountActions(false)}>Cancel</button>
            </div> :
                <>
                    <p>Open P/L: +34.34 +0.33%</p>
                    <p>Market Value: $1456.23</p>
                    <div className='flex'>
                        <button className='buttonIcon' onClick={() => setShowAccountActions(true)}><Landmark color='white' /></button>
                        <button className='buttonIcon' onClick={() => dispatch(setStockDetailState(9))}><NotebookPen color='white' /></button>
                    </div>
                </>
            }
        </div>
    )
}

export default AccountPLVisual