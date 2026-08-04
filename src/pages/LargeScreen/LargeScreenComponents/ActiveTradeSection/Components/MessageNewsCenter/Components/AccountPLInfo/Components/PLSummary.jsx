import React from 'react'
import { useSelector } from 'react-redux'
import { selectActiveTradeResults } from '../../../../../../../../../features/Engine/EnginePlanApiSlice'
import SinglePosition from './SinglePosition'


function PLSummary({ trades })
{

    return (
        <div style={{ fontSize: 'var(--fs-100)' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr 1fr', borderBottom: '1px solid white' }}>
                <p>Symbols</p>
                <p>Open P&L</p>
                <p>Last/AvgPrice</p>
                <p>Day's P&L</p>
                <p>Mkt Value/Qty</p>
            </div>
            <div id='PLSummaryList' className='hide-scrollbar'>
                {trades.map((t) => <SinglePosition trade={t} />)}
            </div>
        </div>
    )
}

export default PLSummary