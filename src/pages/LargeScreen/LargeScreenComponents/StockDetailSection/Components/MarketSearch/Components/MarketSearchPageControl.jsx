import { useState } from 'react'
import PaginationFirstLast from '../../../../../../../components/Pagination/PaginationFirstLast'

function MarketSearchPageControl({ paginationInfo, setCurrentPage })
{


    const [patternSaveControl, setPatternSaveControl] = useState(false)

    return (<div id='LHS-MarketSearchPageControl'>
        <PaginationFirstLast paginationInfo={paginationInfo} onPageChange={setCurrentPage} />
        <p>Total Results: {paginationInfo?.totalResults || undefined}</p>

        <button onClick={() => setPatternSaveControl(true)}>Show Pattern Control</button>
        {patternSaveControl && <div id='MarketSearchPatternFoundPopover'>
            Pattern and Save Control
            <button onClick={() => setPatternSaveControl(false)}>Close</button>
        </div>}
    </div>
    )
}

export default MarketSearchPageControl