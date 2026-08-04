import React, { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { setStockDetailState } from '../../../../../../../../features/SelectedStocks/StockDetailControlSlice'
import PLSummary from './Components/PLSummary'
import './AccountPLInfo.css'
import { Landmark, Scan, ScanBarcode, ScanFace, ScanSearch } from 'lucide-react'
import AccountAdjustments from './Components/AccountAdjustments'
import TradePositionBreakDown from './Components/TradePositionBreakDown'
import { selectDayPL } from '../../../../../../../../features/Engine/EnginePlanApiSlice'

function AccountPLInfo()
{
    const dispatch = useDispatch()

    const userNetAccount = 7516.77
    const pl = useSelector((state) => selectDayPL(state))

    const [showPositionExposure, setShowPositionExposure] = useState(false)
    const [currentSubSection, setCurrentSubSection] = useState(1)

    function provideSubSection()
    {
        switch (currentSubSection)
        {
            case 1: return <TradePositionBreakDown setCurrentSubSection={setCurrentSubSection} trades={pl.trades} />
            case 2: return <AccountAdjustments setCurrentSubSection={setCurrentSubSection} />

        }
    }

    return (
        <div id='AccountPLInfo'>
            <div>
                <div>
                    <p style={{ fontSize: 'var(--fs-100)', color: 'gray' }}>Net Account Value</p>
                    <p style={{ fontSize: 'var(--fs-600)' }}>${(userNetAccount + pl.openPLTotal).toFixed(2)}</p>
                    <p style={{ fontSize: 'var(--fs-100)' }}>Day's P&L <span style={{ fontSize: 'var(--fs-200)', color: `${pl.todayPLTotal > 0 ? 'green' : pl.todayPLTotal < 0 ? 'red' : 'white'}` }} >
                        ${pl.todayPLTotal.toFixed(2)}  {pl.todayOpenPercent.toFixed(2)}%</span></p>
                </div>

                <div>
                    <p style={{ fontSize: 'var(--fs-100)', color: 'gray' }}>Open P&L</p>
                    <p style={{ color: `${pl.openPLTotal > 0 ? 'green' : pl.openPLTotal < 0 ? 'red' : 'white'}` }} > ${pl.openPLTotal.toFixed(2)} {pl.openPLPercent.toFixed(2)}%</p>
                </div>

                <button onClick={() => { setCurrentSubSection(2) }}><Landmark /></button>

            </div>
            {provideSubSection()}
            <PLSummary trades={pl.trades} />
        </div >

    )
}

export default AccountPLInfo