import React from 'react'
import { useSelector } from 'react-redux'
import { selectNewsRunnerById } from '../../../../../../../features/NewsRunnerEngine/NewsRunnerLocalSlice'
import { Link } from 'react-router-dom'

function NewsDetail({ tickerSymbol })
{
    const currentNewsRunner = useSelector((state) => selectNewsRunnerById(state, tickerSymbol))

    console.log(currentNewsRunner.article_url)
    //   type: 'alert',
    //   alert_kind: 'high_impact',
    //   ticker: 'BOXL',
    //   impact_score: 88,
    //   impact_tier: 'high',
    //   event_type: 'merger_acquisition',
    //   impact_direction: 'bullish',
    //   article_url: 'https://rtpr.io/a/nBw3cz0wla?exp=1786571254&sig=82d228671acd4f058ab30308accc482bb250cfc7e165e6fe5773414deeaa1f26',
    //   article_published_at: '2026-08-12T21:45:00.113Z',
    //   band_hit_rate: 0.475

    return (
        <div>
            <p>Direction: {currentNewsRunner?.impact_direction}</p>
            <p>Event Type: {currentNewsRunner?.event_type}</p>
            <p>Impact Score: {currentNewsRunner?.impact_score}</p>

            {/* <a href={currentNewsRunner?.article_url}></a> */}
            {/* <Link to={currentNewsRunner?.article_url} /> */}

            <p>Impact Tier: {currentNewsRunner?.impact_tier}</p>
            <p>Historical Accuracy: {currentNewsRunner?.band_hit_rate}</p>
        </div>
    )
}

export default NewsDetail