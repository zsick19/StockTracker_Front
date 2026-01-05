import React from 'react'

function MarketSearchResults({ searchResults })
{

    return (
        <div id='LHS-MarketSearchResultBlocks'>
            {searchResults.map((search) =>
            {
                return <div className='LHS-MarketSearchResultGraphWrapper'>
                    <div className='ChartGraphWrapper'>
                        <p>Chart will go here</p>
                    </div>

                    <div className='MarketSearchResultInfoBar'>
                        <p>{search.ticker}</p>
                        <p>{search.sector}</p>
                        <p>{search.avgVol}</p>
                    </div>

                </div>
            })}
        </div>
    )
}

export default MarketSearchResults