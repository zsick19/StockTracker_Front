import { useState } from 'react'
import PaginationFirstLast from '../../../../../../../components/Pagination/PaginationFirstLast'

function MarketSearchPageControl({ paginationInfo, setCurrentPage })
{
 
    
    return (<div id='LHS-MarketSearchPageControl'>
        <PaginationFirstLast paginationInfo={paginationInfo} onPageChange={setCurrentPage} />
        <p>Total Results: {paginationInfo?.totalResults || undefined}</p>
    </div>
    )
}

export default MarketSearchPageControl