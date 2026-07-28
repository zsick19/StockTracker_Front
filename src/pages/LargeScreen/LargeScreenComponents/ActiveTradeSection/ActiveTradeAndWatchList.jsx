import './ActiveTradeAndWatchList.css'
// import PreTradeWatchList from './WatchList/PreTradeWatchList'
import CurrentTradePositionContainer from './Components/TradeBlockContainer/CurrentTradePositionContainer'
import DiscountAndReview from '../MacroControlSection/Components/DeepDiscountControlVisual/DiscountAndReview'

function ActiveTradeAndWatchList()
{
    return (
        <div id='LSH-ActiveTradeLarger'>
            <DiscountAndReview />
            <CurrentTradePositionContainer />
        </div >
    )
}

export default ActiveTradeAndWatchList