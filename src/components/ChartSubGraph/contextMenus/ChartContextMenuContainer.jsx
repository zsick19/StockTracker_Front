import { Binoculars, Check, ChevronLeft, ChevronRight, Info, Key, KeyRound, Newspaper, Plane, Save, Siren, Trash, Trash2, Undo2, X } from 'lucide-react'

import './ContextMenuStyles.css'
import { ChartingToolEdits, ChartingTools } from '../../../Utilities/ChartingTools'
import { setTool } from '../../../features/Charting/ChartingTool'
import { useDispatch, useSelector } from 'react-redux'
import { defaultTimeFrames } from '../../../Utilities/TimeFrames'
import { useMemo, useState } from 'react'
import { setChartEditMode } from '../../../features/Charting/EditChartSelection'
import { useUpdateEnterExitPlanMutation } from '../../../features/EnterExitPlans/EnterExitApiSlice'
import { useRemoveChartableStockMutation, useUpdateChartingDataMutation } from '../../../features/Charting/ChartingSliceApi'
import { selectSPYIdFromUser } from '../../../features/Initializations/InitializationSliceApi'
import { setSingleChartTickerTimeFrameAndChartingId } from '../../../features/SelectedStocks/SelectedStockSlice'
import { selectConfirmedUnChartedTrio, setConfirmedUnChartedNavIndex } from '../../../features/SelectedStocks/PreviousNextStockSlice'
import { makeSelectChartAlteredByTicker } from '../../../features/Charting/chartingElements'
import { makeSelectEnterExitPlanAltered } from '../../../features/EnterExitPlans/EnterExitGraphElement'
import { setFocusStartFinishDate } from '../../../features/Charting/GraphMarketHourElement'

function ChartContextMenuContainer({ ticker, chartId, showContextMenu, setShowContextMenu, timeFrame, setTimeFrame, setChartInfoDisplay, uuid })
{
  const dispatch = useDispatch()
  const [showConfirmRemove, setShowConfirmRemove] = useState(false)
  const [serverResponse, setServerResponse] = useState(undefined)
  const userSpyId = useSelector(selectSPYIdFromUser)

  const [updateEnterExitPlan, { isLoading: isEnterExitLoading }] = useUpdateEnterExitPlanMutation()
  const [updateChartingData] = useUpdateChartingDataMutation()
  const [removeChartableStock] = useRemoveChartableStockMutation()
  const currentUnChartedTicker = useSelector(selectConfirmedUnChartedTrio)


  function handleTimeFrameChange(e)
  {
    let timeFrameSelection
    if (e.target.name === 'timeFrameIntra')
    {
      switch (e.target.id)
      {
        case '1m': timeFrameSelection = defaultTimeFrames.threeDayOneMin; break;
        case '2m': timeFrameSelection = defaultTimeFrames.threeDayTwoMin; break;
        case '5m': timeFrameSelection = defaultTimeFrames.threeDayFiveMin; break;
        case '15m': timeFrameSelection = defaultTimeFrames.threeDayFifteenMin; break;
        case '30m': timeFrameSelection = defaultTimeFrames.threeDayThirtyMin; break;
      }
    }
    else if (e.target.name === 'timeFrameHour') { timeFrameSelection = defaultTimeFrames.threeDayOneHour }
    else if (e.target.name === 'timeFrameDay') { timeFrameSelection = defaultTimeFrames.dailyOneYear }
    else if (e.target.name === 'timeFrameWeek') { timeFrameSelection = defaultTimeFrames.weeklyOneYear }
    setShowContextMenu({ display: false, style: undefined })
    setTimeFrame(timeFrameSelection)
  }

  function closeContextMenu() { setShowContextMenu({ display: false, style: undefined }) }

  async function attemptSavingCharting()
  {
    try
    {
      await updateChartingData({ ticker, chartId })
      setServerResponse("positive")
      setTimeout(() =>
      {
        setServerResponse(undefined)
      }, 2000);
    } catch (error)
    {
      console.log(error)
      setServerResponse("error")
      setTimeout(() =>
      {
        setServerResponse(undefined)
      }, 2000);

    }
  }

  async function attemptInitiatingPlanTracking()
  {
    try
    {
      await updateEnterExitPlan({ ticker, chartId }).unwrap()
      setServerResponse("positive")
      setTimeout(() =>
      {
        setServerResponse(undefined)
      }, 2000);
    } catch (error)
    {
      console.log(error)
      setServerResponse("error")
      setTimeout(() =>
      {
        setServerResponse(undefined)
      }, 2000);
    }

  }

  async function attemptRemoveOfConfirmedStock()
  {
    if (!chartId || chartId === userSpyId) return
    try
    {
      const results = await removeChartableStock({ chartId }).unwrap()


      if (currentUnChartedTicker.next) { dispatch(setSingleChartTickerTimeFrameAndChartingId({ ticker: currentUnChartedTicker.next.ticker, chartId: currentUnChartedTicker.next.chartId })) }
      else if (currentUnChartedTicker.previous) { dispatch(setSingleChartTickerTimeFrameAndChartingId({ ticker: currentUnChartedTicker.previous.ticker, chartId: currentUnChartedTicker.previous.chartId })) }
      else { dispatch(setSingleChartTickerTimeFrameAndChartingId({ ticker: 'SPY', chartId: userSpyId })) }
    } catch (error)
    {
      console.log(error)
    }
  }

  const selectedChartingMemo = useMemo(makeSelectChartAlteredByTicker, [])
  const chartingAltered = useSelector(state => selectedChartingMemo(state, ticker))

  const selectedEnterExitPlanAlteredMemo = useMemo(makeSelectEnterExitPlanAltered, [])
  const enterExitAltered = useSelector(state => selectedEnterExitPlanAlteredMemo(state, ticker))





  function handleNavigatingToNextUnChartedStock(nextDirection)
  {
    if (nextDirection)
    {
      if (currentUnChartedTicker.current.ticker === ticker)
      {
        if (currentUnChartedTicker.next)
        {
          dispatch(setSingleChartTickerTimeFrameAndChartingId({ ticker: currentUnChartedTicker.next.ticker, chartId: currentUnChartedTicker.next.chartId }))
          dispatch(setConfirmedUnChartedNavIndex({ next: nextDirection }))
        }
      } else { dispatch(setSingleChartTickerTimeFrameAndChartingId({ ticker: currentUnChartedTicker.current.ticker, chartId: currentUnChartedTicker.current.chartId })) }
    } else
    {
      if (currentUnChartedTicker.current.ticker === ticker)
      {
        if (currentUnChartedTicker.previous)
        {
          dispatch(setSingleChartTickerTimeFrameAndChartingId({ ticker: currentUnChartedTicker.previous.ticker, chartId: currentUnChartedTicker.previous.chartId }))
          dispatch(setConfirmedUnChartedNavIndex({ next: nextDirection }))
        }
      } else { dispatch(setSingleChartTickerTimeFrameAndChartingId({ ticker: currentUnChartedTicker.current.ticker, chartId: currentUnChartedTicker.current.chartId })) }
    }
  }






  return (
    <>
      <div id='ChartContextMenuOverlay' onContextMenu={(e) => e.preventDefault()} onClick={(e) => closeContextMenu()}></div>
      <div id='ChartContextMenuContainer' onContextMenu={(e) => e.preventDefault()} style={showContextMenu.style} onClick={(e) => e.stopPropagation()}>
        <div className='contextTimeFrameNavigation'>

          <fieldset onChange={(e) => { dispatch(setFocusStartFinishDate({ uuid, focusDates: e.target.value })); closeContextMenu() }}>
            <input type="radio" name="focusPeriod" id="OMHO" value='OMHO' className='hiddenInput' />
            <label htmlFor="OMHO" className='contextTimeFocusLabel marketHours'>MH</label>

            <input type="radio" name="focusPeriod" id="PMPM" value='PMPM' className='hiddenInput' />
            <label htmlFor="PMPM" className='contextTimeFocusLabel marketHours'>P/P</label>
            <br />
            <input type="radio" name="focusPeriod" id="P2D" value='P2D' className='hiddenInput' />
            <label htmlFor="P2D" className='contextTimeFocusLabel marketDays'>2D</label>

            <input type="radio" name="focusPeriod" id="P3D" value='P3D' className='hiddenInput' />
            <label htmlFor="P3D" className='contextTimeFocusLabel marketDays'>3D</label>

            <input type="radio" name="focusPeriod" id="P5D" value='P5D' className='hiddenInput' />
            <label htmlFor="P5D" className='contextTimeFocusLabel marketDays'>5D</label>
            <br />
            <input type="radio" name="focusPeriod" id="P2W" value='P2W' className='hiddenInput' />
            <label htmlFor="P2W" className='contextTimeFocusLabel marketWeeks'>2W</label>

            <input type="radio" name="focusPeriod" id="P3w" value='P3W' className='hiddenInput' />
            <label htmlFor="P3w" className='contextTimeFocusLabel marketWeeks'>3W</label>

            <input type="radio" name="focusPeriod" id="PM" value='PM' className='hiddenInput' />
            <label htmlFor="PM" className='contextTimeFocusLabel marketWeeks'>PM</label>

            <input type="radio" name="focusPeriod" id="PQ" value='PQ' className='hiddenInput' />
            <label htmlFor="PQ" className='contextTimeFocusLabel marketWeeks'>PQ</label>

            <input type="radio" name="focusPeriod" id="PHY" value='PHY' className='hiddenInput' />
            <label htmlFor="PHY" className='contextTimeFocusLabel marketWeeks'>HY</label>

            <input type="radio" name="focusPeriod" id="PY" value='PY' className='hiddenInput' />
            <label htmlFor="PY" className='contextTimeFocusLabel marketWeeks'>PY</label>
          </fieldset>

        </div>
        <div className='contextNavigation'>
          <button className='outsideNav' onClick={() => { handleNavigatingToNextUnChartedStock(false); closeContextMenu() }}><ChevronLeft /></button>

          {showConfirmRemove ?
            <>
              <div></div>
              <div className='flex'>
                <button className='iconButton centerNav' onClick={() => { attemptRemoveOfConfirmedStock(); setShowConfirmRemove(false) }}><Trash2 color='red' /></button>
                <button className='iconButton centerNav' onClick={() => setShowConfirmRemove(false)}><Undo2 color='white' /></button>
              </div>
              <div></div>
            </>
            : <>
              {serverResponse === 'error' ? <>
                <div></div>
                <button className='iconButton centerNav' disabled><X color='red' /></button>
                <div></div>
              </> :
                serverResponse === 'positive' ?
                  <>
                    <div></div>
                    <button className='iconButton centerNav' disabled><Check color='green' /></button>
                    <div></div>
                  </>
                  :
                  <>
                    <button className='iconButton centerNav' onClick={() => { attemptSavingCharting() }}><Save color='white' /></button>

                    {(chartId && (chartId !== userSpyId)) ? <button className='iconButton centerNav' onClick={() => setShowConfirmRemove(true)}><Trash2 color='white' /></button> : <div></div>}

                    {((chartingAltered.hasPlanCharted && !enterExitAltered) || enterExitAltered) ?
                      <button title='Initiate Tracking' disabled={isEnterExitLoading} className='iconButton centerNav' onClick={() => { attemptInitiatingPlanTracking(); }}>
                        <Binoculars className='blinkingRed' size={20} color={isEnterExitLoading ? 'gray' : 'red'} />
                      </button> :
                      <button className='iconButton centerNav' disabled><Binoculars color='gray' /></button>}
                  </>
              }
            </>
          }

          <button className='outsideNav' onClick={() => { handleNavigatingToNextUnChartedStock(true); closeContextMenu() }}><ChevronRight /></button>
        </div>

        <br />
        <div>

          <div className='flex'>
            <div className='contextMenuTools'>
              {ChartingTools.map((tool, index) =>
              {
                return <button className='buttonIcon' title={tool.tool}
                  onClick={() => { dispatch(setTool(ChartingTools[index].tool)); closeContextMenu() }} >
                  {ChartingTools[index].icon}
                </button>
              })}
            </div>
          </div>
          <br />
          <div className='flex'>
            <p>Edit</p>
            <div>{ChartingToolEdits.map((edit, index) => <button className='buttonIcon' onClick={() => { dispatch(setChartEditMode(edit.editTool)); closeContextMenu() }}>{edit.icon}</button>)}</div>
            <div className='flex'>
              <p>Display</p>
              <button className='iconButton' onClick={() => { setChartInfoDisplay(1); closeContextMenu() }}><Plane /></button>
              <button className='iconButton' onClick={() => { setChartInfoDisplay(2); closeContextMenu() }}><KeyRound /></button>
              <button className='iconButton' onClick={() => { setChartInfoDisplay(3); closeContextMenu() }}><Siren /></button>
              <button className='iconButton' onClick={() => { setChartInfoDisplay(4); closeContextMenu() }}><Newspaper /></button>
              <button className='iconButton' onClick={() => { setChartInfoDisplay(0); closeContextMenu() }}><Info /></button>
            </div>
          </div>
        </div>
        <br />

        <div className='flex'>
          <fieldset className='LSH-ContextMenuTimeFrame' onChange={(e) => handleTimeFrameChange(e)}>
            <div>
              <input type="radio" name="timeFrameIntra" id="1m" value={1} />
              <label htmlFor="1m">1M</label>
            </div>
            <div>
              <input type="radio" name="timeFrameIntra" id="2m" value={2} />
              <label htmlFor="2m">2M</label>
            </div>
            <div>
              <input type="radio" name="timeFrameIntra" id="5m" value={5} />
              <label htmlFor="5m">5M</label>
            </div>
            <div>
              <input type="radio" name="timeFrameIntra" id="15m" value={15} />
              <label htmlFor="15m">15M</label>
            </div>
            <div>
              <input type="radio" name="timeFrameIntra" id="30m" value={30} />
              <label htmlFor="30m">30M</label>
            </div>
            <div>
              <input type="radio" name="timeFrameHour" id="1H" value={1} />
              <label htmlFor="1H">1H</label>
            </div>
          </fieldset>
          <fieldset className='LSH-ContextMenuTimeFrame' onChange={(e) => handleTimeFrameChange(e)}>
            <div>
              <input type="radio" name="timeFrameDay" id="1d" value={1} />
              <label htmlFor="1d">1D</label>
            </div>
            <div>
              <input type="radio" name="timeFrameWeek" id="1w" value={1} />
              <label htmlFor="1w">1W</label>
            </div>
          </fieldset>
        </div>



      </div>
    </>
  )
}

export default ChartContextMenuContainer