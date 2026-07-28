import React, { useRef, useState } from 'react'
import SelectedMacroEM from './Components/SelectedMacroEM'
import './ExpectedMoves.css'

function ExpectedMoves()
{
    const [selectedMacroEM, setSelectedMacroEM] = useState('SPY')

    const directSelectTicker = useRef()
    function handleDirectSelectTicker()
    {
        if (directSelectTicker.current.value !== '') setSelectedMacroEM(directSelectTicker.current.value)
    }

    return (
        <div id='LHS-ExpectMovesMessageCenter'>
            <div id='LHS-EMMacroSelect'>
                <button onClick={() => setSelectedMacroEM('SPY')}>SPY</button>
                <button onClick={() => setSelectedMacroEM('DIA')}>DIA</button>
                <button onClick={() => setSelectedMacroEM('QQQ')}>QQQ</button>
                <button onClick={() => setSelectedMacroEM('IWM')}>IWM</button>
                <form onSubmit={(e) => { e.preventDefault(); handleDirectSelectTicker() }}>
                    <input type="text" ref={directSelectTicker} />
                </form>
                <br />
                <button>EMs</button>
            </div>

            <SelectedMacroEM />
        </div>
    )
}

export default ExpectedMoves