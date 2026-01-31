import React from 'react'
import { useSelector } from 'react-redux'
import { selectStockInfo } from '../../../../../../../../features/StockData/StockInfoElement'
import { abbreviateNumber } from '../../../../../../../../Utilities/UtilityHelperFunctions'

function InfoPanel()
{
  const stockInfo = useSelector(selectStockInfo)

  return (
    <div id='StockInfoPanel'>
      <div>
        <h2>{stockInfo.Symbol}-{stockInfo.CompanyName}</h2>
        <p>{stockInfo.Sector} - {stockInfo.Industry}</p>
        <p>{stockInfo.Country}</p>

      </div>
      <div>
        <p>Average Volume: {abbreviateNumber(stockInfo.AvgVolume)}</p>
        <p>Market Cap: {abbreviateNumber(stockInfo.MarketCap)}</p>
        <p>Average True Range: ${stockInfo.ATR}</p>
      </div>
    </div>
  )
}

export default InfoPanel