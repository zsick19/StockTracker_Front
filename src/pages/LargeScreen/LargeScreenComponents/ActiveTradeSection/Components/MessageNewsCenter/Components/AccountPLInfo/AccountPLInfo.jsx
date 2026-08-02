import React, { useState } from 'react'
import { useDispatch } from 'react-redux'
import { setStockDetailState } from '../../../../../../../../features/SelectedStocks/StockDetailControlSlice'
import PLSummary from './Components/PLSummary'
import './AccountPLInfo.css'

function AccountPLInfo()
{
    const dispatch = useDispatch()

    const userNetAccount = 7516.77

    const [showPositionExposure, setShowPositionExposure] = useState(false)
    const [currentSubSection, setCurrentSubSection] = useState(0)

    function provideSubSection()
    {
        switch (currentSubSection)
        {
            case 0: return <PLSummary />
            case 1: return <div> <button onClick={() => setCurrentSubSection(0)}>hide</button></div>
            case 2: return <div>Account Adjust <button onClick={() => setCurrentSubSection(0)}>hide</button></div>

        }
    }

    return (
        <div id='AccountPLInfo'>
            <div>
                <div>
                    <p>Net Account Value</p>
                    <p>${userNetAccount}</p>
                    <p>Day's P&L <span>{0.00} {0.00}%</span></p>
                </div>
                <div>
                    <p>Open P&L</p>
                    <p>-108.21 -3.96%</p>
                </div>


                <button onClick={() => setCurrentSubSection(1)}>Position Exposure</button>
                <button onClick={() => dispatch(setStockDetailState(26))}>Plan Exposure</button>
                <button onClick={() => setCurrentSubSection(2)}>Account Adjust</button>
            </div>
            {provideSubSection()}
        </div>

    )
}

export default AccountPLInfo