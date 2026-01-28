import React from 'react'
import { activeTradeSelectors, useGetUsersActiveTradesQuery } from '../../../../../../../../../features/Trades/TradeSliceApi'
import SelectedTradeChartBlock from './SelectedTradeChartBlock'

function SelectedTradeListBlock({ id })
{
  const { activeTrade } = useGetUsersActiveTradesQuery(undefined, { selectFromResult: ({ data }) => ({ activeTrade: data ? activeTradeSelectors.selectById(data, id) : undefined }) })


  return (
    <div id='LSH-ActiveTradeListSelectedTrade'>
      <SelectedTradeChartBlock ticker={id} trade={activeTrade} />
      <div>
        <h1>{id}</h1>
        <p>List out all other active trade info here</p>
      </div>
    </div>
  )
}

export default SelectedTradeListBlock