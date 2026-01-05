import { useState } from 'react'

function MarketSearchPageControl()
{


    const [patternSaveControl, setPatternSaveControl] = useState(false)

    return (<div id='LHS-MarketSearchPageControl'>
        <div>
            <button>First</button>
            <button>1</button>
            <button>2</button>
            <button>3</button>
            <button>4</button>
            <button>Last</button>
        </div>
        <p>Total Results: 345</p>
        <button onClick={() => setPatternSaveControl(true)}>Show Pattern Control</button>

        {patternSaveControl && <div id='MarketSearchPatternFoundPopover'>
            Pattern and Save Control
            <button onClick={() => setPatternSaveControl(false)}>Close</button>
        </div>}
    </div>
    )
}

export default MarketSearchPageControl