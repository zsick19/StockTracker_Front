import './ActiveTradeSection.css'
import ActiveTradeAndWatchList from './Components/ActiveTradeAndWatchList/ActiveTradeAndWatchList';

function ActiveTradeSection()
{
  return <section id="LSH-ActiveTradeSection">

    <div id='NewsAndMessageSection'>
      <div id='NewsDisplaySection'>
        News
        <p>          //0 FourWay        </p>
        <p>  //1 MarketSearch        </p>
        <p>  //2 Confirm Market Search        </p>
        <p>  //3 Confirmed Status Page        </p>
        <p>  //4 Plan Viability        </p>
        <p>  //5 Chart Single Graph        </p>
        <p>  //6 PreWatch many        </p>
      </div>
      <div id='MessageCenterSection'>
        Message Center
      </div>
    </div>

    <ActiveTradeAndWatchList />
  </section>;
}

export default ActiveTradeSection;
