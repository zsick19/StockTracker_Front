import { sub, subBusinessDays, startOfMonth, addMonths, isBefore, format, add, addDays, isSaturday, isSunday, subDays, subHours } from 'date-fns';


export const defaultTimeFrames = {
  threeDayOneMin: { increment: "1", unitOfIncrement: "M", duration: 3, unitOfDuration: "D", intraDay: true },
  threeDayTwoMin: { increment: "2", unitOfIncrement: "M", duration: 3, unitOfDuration: "D", intraDay: true },
  threeDayFiveMin: { increment: "5", unitOfIncrement: "M", duration: 3, unitOfDuration: "D", intraDay: true },
  threeDayFifteenMin: { increment: "15", unitOfIncrement: "M", duration: 3, unitOfDuration: "D", intraDay: true },
  threeDayThirtyMin: { increment: "30", unitOfIncrement: "M", duration: 3, unitOfDuration: "D", intraDay: true },
  threeDayOneHour: { increment: "1", unitOfIncrement: "H", duration: 3, unitOfDuration: "D", intraDay: true },
  fourHourOneYear: { increment: "4", unitOfIncrement: "H", duration: 1, unitOfDuration: "Y", intraDay: true },

  dailyOneYear: { increment: "1", unitOfIncrement: "D", duration: 1, unitOfDuration: "Y", intraDay: false },
  dailyQuarter: { increment: "1", unitOfIncrement: "D", duration: 90, unitOfDuration: "D", intraDay: false },
  dailyMonth: { increment: "1", unitOfIncrement: "D", duration: 30, unitOfDuration: "D", intraDay: false },
  dailyHalfYear: { increment: "1", unitOfIncrement: "D", duration: 180, unitOfDuration: "D", intraDay: false },
  weeklyOneYear: { increment: "1", unitOfIncrement: "W", duration: 1, unitOfDuration: "Y", intraDay: false },
};

export const interDayTimeFrames = [{ label: '1M', timeFrame: defaultTimeFrames.threeDayOneMin, intraDay: true },
{ label: '2M', timeFrame: defaultTimeFrames.threeDayTwoMin, intraDay: true },
{ label: '5M', timeFrame: defaultTimeFrames.threeDayFiveMin, intraDay: true },
{ label: '15M', timeFrame: defaultTimeFrames.threeDayFifteenMin, intraDay: true },
{ label: '30M', timeFrame: defaultTimeFrames.threeDayThirtyMin, intraDay: true },
{ label: '1H', timeFrame: defaultTimeFrames.threeDayOneHour, intraDay: true }
]


export function generateTradingHours(timeFrame, displayMarketHours)
{
  const timeRanges = [];
  let currentDate = subBusinessDays(new Date().setUTCHours(9, 0, 0, 0), timeFrame.duration + 9);

  let today = addDays(new Date(), 1)

  while (currentDate <= today)
  {
    if (!isSaturday(currentDate) && !isSunday(currentDate) && displayMarketHours)
    {
      const marketCloseTime = new Date(currentDate);
      marketCloseTime.setUTCHours(21, 0, 0, 0);
      const nextDayMarketOpenTime = add(marketCloseTime, { hours: 17, minutes: 30 })
      timeRanges.push([marketCloseTime.getTime(), nextDayMarketOpenTime.getTime()]);
    } else if (!isSaturday(currentDate) && !isSunday(currentDate))
    {
      const marketCloseTime = new Date(currentDate);
      marketCloseTime.setUTCHours(1, 0, 0, 0);
      const nextDayMarketOpenTime = add(marketCloseTime, { hours: 8 })
      timeRanges.push([marketCloseTime.getTime(), nextDayMarketOpenTime.getTime()]);
    }
    else if (isSaturday(currentDate))
    {
      let fridayClose = sub(new Date(currentDate), { hours: 8 })
      let saturdayClose = add(new Date(fridayClose), { days: 1 })
      timeRanges.push([fridayClose.getTime(), saturdayClose.getTime()])
    } else if (isSunday(currentDate))
    {
      let saturdayClose = sub(new Date(currentDate), { hours: 8 })
      let mondayOpen = add(new Date(saturdayClose), { days: 1 })
      timeRanges.push([saturdayClose.getTime(), mondayOpen.getTime()])
    }
    currentDate.setDate(currentDate.getDate() + 1);
  }

  return timeRanges;
}


export function getBreaksBetweenDates(startDate, endDate, breakPeriod)
{
  const timeBreaks = {
    months: [],
    preMarket: [],
    preMarketEnd: [],
    marketClose: [],
    afterMarket: []
  };

  if (breakPeriod === 'months')
  {
    let currentMonth = startOfMonth(startDate);

    while (isBefore(currentMonth, endDate) || currentMonth.getMonth() === endDate.getMonth() && currentMonth.getFullYear() === endDate.getFullYear())
    {
      timeBreaks.months.push(currentMonth);
      currentMonth = addMonths(currentMonth, 1);
    }
  } else if (breakPeriod === 'days')
  {
    let start = startDate
    while (start < endDate)
    {
      timeBreaks.months.push(start)
      start = addDays(start, 1)
    }
  } else if (breakPeriod === 'marketOpen')
  {
    let start = startDate
    while (start < endDate)
    {
      if (!isSaturday(start) && !isSunday(start))
      {
        let preMarketTime = start.setUTCHours(9, 0, 0, 0)
        timeBreaks.preMarket.push(new Date(preMarketTime))
        timeBreaks.preMarketEnd.push(new Date(start).setUTCHours(14, 30))
        timeBreaks.marketClose.push(new Date(start).setUTCHours(21, 0, 0, 0))
        timeBreaks.afterMarket.push(add(start, { days: 1 }).setUTCHours(1))
      }
      start = addDays(start, 1)

    }
  }

  return timeBreaks;
}

export function provideStartAndEndDatesForDateScale(timeFrame, focusDates)
{
  let startDate
  let futureForwardEndDate



  if (timeFrame.intraDay && focusDates === undefined)
  {
    startDate = new Date()
    if (isSaturday(startDate)) startDate = subDays(startDate, 1)
    if (isSunday(startDate)) startDate = subDays(startDate, 2)
    startDate.setHours(5, 30, 0, 0)
    futureForwardEndDate = new Date().setHours(20, 0, 0, 0)
  }
  else if (timeFrame.intraDay && focusDates)
  {
    startDate = new Date(focusDates.startDate)
    futureForwardEndDate = new Date(focusDates.endDate)
  }
  else if (timeFrame.unitOfDuration === 'Y')
  {
    startDate = subDays(new Date(), 365)
    futureForwardEndDate = addDays(new Date(), 2)
  }
  else if (timeFrame.unitOfDuration === 'D')
  {
    startDate = subDays(new Date(), 30)
    futureForwardEndDate = addDays(new Date(), 4)
  }
  return { startDate, futureForwardEndDate }
}