import './ActiveTradeSection.css'
import ActiveTradeAndWatchList from './ActiveTradeAndWatchList';
import MessageNewsCenter from './Components/MessageNewsCenter/MessageNewsCenter';


function ActiveTradeSection()
{
  return <section id="LSH-ActiveTradeSection">
    <MessageNewsCenter />
    <ActiveTradeAndWatchList />
  </section>;
}

export default ActiveTradeSection;
