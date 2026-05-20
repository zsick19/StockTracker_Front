import React from 'react'
import SingleTinyPreWatch from './SingleTinyPreWatch'

function PreWatchContainer({ preWatchIds, watchListSelection, setSelectedTickerIndex })
{

    return (
        <div id='LHS-TinySinglePreWatchContainer' className='hide-scrollbar'>
            {preWatchIds.map((id, i) => <SingleTinyPreWatch key={`${id}tiny`} id={id} watchList={watchListSelection} key={`tinyFive${id}`} index={i} setSelectedTickerIndex={setSelectedTickerIndex} />)}
        </div>)
}

export default PreWatchContainer