import './ActiveTradeAndWatchList.css'
import PreTradeWatchList from './WatchList/PreTradeWatchList'
import CurrentTradePositionContainer from './TradeBlockContainer/CurrentTradePositionContainer'

function ActiveTradeAndWatchList()
{
    return (
        <div id='LSH-ActiveTradeLarger'>
            <PreTradeWatchList />
            <CurrentTradePositionContainer />
        </div >
    )
}

export default ActiveTradeAndWatchList