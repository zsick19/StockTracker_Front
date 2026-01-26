import React from 'react'
import { useSelector } from 'react-redux'
import { selectStockInfo } from '../../../../../../../../features/StockData/StockInfoElement'

function InfoPanel()
{
  const stockInfo = useSelector(selectStockInfo)

  return (
    <div id='StockInfoPanel'>
      <p>{stockInfo.Symbol}</p>
      <p>{stockInfo.CompanyName}</p>
      <p>{stockInfo.Sector}</p>
      <p>{stockInfo.Industry}</p>
      <p>{stockInfo.Country}</p>
      <p>{stockInfo.AvgVolume}</p>
      <p>{stockInfo.MarketCap}</p>
      <p>{stockInfo.ATR}</p>
    </div>
  )
}

export default InfoPanel