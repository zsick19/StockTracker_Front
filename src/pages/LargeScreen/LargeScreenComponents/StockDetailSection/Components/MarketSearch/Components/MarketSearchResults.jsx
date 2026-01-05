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
                        <p>{search.Symbol}</p>
                        <p>{search.Sector}</p>
                        <p>{search.AvgVolume}</p>
                    </div>

                </div>
            })}
        </div>
    )
}

export default MarketSearchResults