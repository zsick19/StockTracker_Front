import './ActiveTradeSection.css'
import ActiveTradeAndWatchList from './Components/ActiveTradeAndWatchList/ActiveTradeAndWatchList';

function ActiveTradeSection()
{
  return <section id="LSH-ActiveTradeSection">

    <div id='NewsAndMessageSection'>
      <div id='NewsDisplaySection'>
        News
      </div>
      <div id='MessageCenterSection'>
        Message Center
      </div>
    </div>

    <ActiveTradeAndWatchList />
  </section>;
}

export default ActiveTradeSection;
