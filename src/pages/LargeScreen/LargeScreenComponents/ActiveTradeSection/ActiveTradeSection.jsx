import './ActiveTradeSection.css'
import ActiveTradeAndWatchList from './Components/ActiveTradeAndWatchList/ActiveTradeAndWatchList';
import MessageNewsCenter from './Components/ActiveTradeAndWatchList/MessageNewsCenter/MessageNewsCenter';


function ActiveTradeSection()
{
  return <section id="LSH-ActiveTradeSection">
    <MessageNewsCenter />

    <ActiveTradeAndWatchList />
  </section>;
}

export default ActiveTradeSection;
