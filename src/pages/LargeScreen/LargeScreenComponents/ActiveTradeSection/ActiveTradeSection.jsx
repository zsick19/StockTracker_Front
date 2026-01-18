import './ActiveTradeSection.css'
import ActiveTradeAndWatchList from './Components/ActiveTradeAndWatchList/ActiveTradeAndWatchList';
import MessageCenterContainer from './Components/MessageCenter/MessageCenterContainer';
import NewsCenterContainer from './Components/NewsCenter/NewsCenterContainer';

function ActiveTradeSection()
{
  return <section id="LSH-ActiveTradeSection">

    <div id='NewsAndMessageSection'>
      <NewsCenterContainer />
      <MessageCenterContainer />
    </div>

    <ActiveTradeAndWatchList />
  </section>;
}

export default ActiveTradeSection;
