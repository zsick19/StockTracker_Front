import React, { useMemo } from 'react'
import { useSelector } from 'react-redux'
import { makeSelectNewsRunnerRTPRDetailsById, selectNewsRunnerById } from '../../../../../../../features/NewsRunnerEngine/NewsRunnerLocalSlice'
import { Link } from 'react-router-dom'
import PriceAndChangeReadOut from './PriceAndChangeReadOut'

function NewsDetail({ ticker })
{
    const newsRunnerDetails = useSelector((state) => makeSelectNewsRunnerRTPRDetailsById(state, ticker))

    // console.log(currentNewsRunner.article_url)
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
        <div id='NewsRunnerArticleDetail'>
            {newsRunnerDetails.impactDirection === 'bullish' ? <div id='BullishNewsRunner'>
                <div>
                    <p>Direction: {newsRunnerDetails?.impactDirection}</p>
                    <p>Event Type: {newsRunnerDetails?.eventType}</p>
                </div>
                <div>
                    <p>Impact Score: {newsRunnerDetails?.impactScore}</p>
                    <p>Impact Tier: {newsRunnerDetails?.impactTier}</p>
                </div>
                <p>Historical Accuracy: {newsRunnerDetails?.bandHitRate}</p>
            </div> : <div id='NoImpactNewsRunner'>
                <p>No Impact Information from Press Release</p>
                <PriceAndChangeReadOut ticker={ticker} />
            </div>}

            <div>
                <Link to={newsRunnerDetails.articleURL} target="_blank" rel="noopener noreferrer" >
                    <button type="button" style={{ width: '100%', height: '100%', borderRadius: '10px' }}>
                        Press Release
                    </button>
                </Link>
            </div>

        </div >
    )
}

export default NewsDetail