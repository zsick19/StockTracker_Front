import React, { useRef, useState } from 'react'
import { useCreateMacroCalendarEventMutation } from '../../../../../../../../../features/MacroCalendarEvents/MacroCalendarApiSlice'

function MacroEventForm({ setShowCreateForm })
{
    const inputRef = useRef()
    const [eventForSubmit, setEventForSubmit] = useState({ category: 'INTEREST_RATE', text: undefined })
    const [updateComplete, setUpdateComplete] = useState(undefined)
    const [createMacroCalendarEvent] = useCreateMacroCalendarEventMutation()
    async function attemptCreateMacroCalendarEvent()
    {
        try
        {
            console.log(eventForSubmit)
            const result = await createMacroCalendarEvent({ macroEvent: eventForSubmit }).unwrap()
            console.log(result)
            setUpdateComplete(result.length)
            inputRef.current.value = ''
            setTimeout(() => { setUpdateComplete(undefined) }, 4000);
        } catch (error)
        {
            console.log(error)
        }
    }

    function handleFormChange(e)
    {

    }

    const economicDataTypes = [
        'INTEREST_RATE',
        'PRICES_&_INFLATION',
        'LABOUR_MARKET',
        'GDP_GROWTH',
        'FOREIGN_TRADE',
        'GOVERNMENT',
        'BUSINESS_CONFIDENCE',
        'CONSUMER_SENTIMENT',
        'HOUSING_MARKET',
        'BOND_AUCTIONS',
        'ENERGY'
    ]

    function formatSnakeToTitle(str)
    {
        if (!str) return '';
        if (str === 'GDP_GROWTH') return 'GDP Growth'
        return str
            .toLowerCase()
            .split('_')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ');
    }



    return (
        <div>

            <div style={{ fontSize: "small" }}>
                {economicDataTypes.map((t, i) => <button onClick={() => setEventForSubmit({ category: t, text: undefined })}>{formatSnakeToTitle(t)}</button>)}
            </div>
            <div>
                <label htmlFor="economicCalendarInput">{formatSnakeToTitle(eventForSubmit.category)}</label>
                <input ref={inputRef} type="text" id='economicCalendarInput' onInput={(e) => setEventForSubmit(prev => { return { ...prev, text: e.target.value } })} />
                <button onClick={() => attemptCreateMacroCalendarEvent()}>Submit</button>
            </div>

            {updateComplete ? <p>Created {updateComplete} Events</p> : ''}
            <br />
            <button onClick={() => setShowCreateForm(false)}>Cancel</button>
        </div>
    )
}

export default MacroEventForm