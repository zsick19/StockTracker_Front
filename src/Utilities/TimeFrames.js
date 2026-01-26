import { sub, subBusinessDays, startOfMonth, addMonths, isBefore, format, add, addDays } from 'date-fns';


export const defaultTimeFrames = {
  threeDayOneMin: { increment: "1", unitOfIncrement: "M", duration: 3, unitOfDuration: "D", intraDay: true },
  threeDayTwoMin: { increment: "2", unitOfIncrement: "M", duration: 3, unitOfDuration: "D", intraDay: true },
  threeDayFiveMin: { increment: "5", unitOfIncrement: "M", duration: 3, unitOfDuration: "D", intraDay: true },
  threeDayFifteenMin: { increment: "15", unitOfIncrement: "M", duration: 3, unitOfDuration: "D", intraDay: true },
  threeDayThirtyMin: { increment: "30", unitOfIncrement: "M", duration: 3, unitOfDuration: "D", intraDay: true },
  threeDayOneHour: { increment: "1", unitOfIncrement: "H", duration: 3, unitOfDuration: "D", intraDay: true },
  fourHourOneYear: { increment: "4", unitOfIncrement: "H", duration: 1, unitOfDuration: "Y", intraDay: true },

  dailyOneYear: { increment: "1", unitOfIncrement: "D", duration: 1, unitOfDuration: "Y", intraDay: false },
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


export function generateTradingHours(timeFrame,)
{
  const timeRanges = [];
  let currentDate = subBusinessDays(new Date().setUTCHours(9, 30), timeFrame.duration + 9);

  let today = new Date()
  while (currentDate <= today)
  {
    if (currentDate.getDay() !== 0 && currentDate.getDay() !== 6)
    {
      const marketCloseTime = new Date(currentDate);
      marketCloseTime.setUTCHours(21, 0, 0, 0);

      const nextDayMarketOpenTime = add(marketCloseTime, { hours: 17, minutes: 30 })
      timeRanges.push([marketCloseTime.getTime(), nextDayMarketOpenTime.getTime()]);
    }
    currentDate.setDate(currentDate.getDate() + 1);
  }

  return timeRanges;
}


export function getBreaksBetweenDates(startDate, endDate, breakPeriod)
{
  const months = [];

  if (breakPeriod === 'months')
  {
    let currentMonth = startOfMonth(startDate);

    while (isBefore(currentMonth, endDate) || currentMonth.getMonth() === endDate.getMonth() && currentMonth.getFullYear() === endDate.getFullYear())
    {
      months.push(currentMonth);
      currentMonth = addMonths(currentMonth, 1);
    }
  } else if (breakPeriod === 'days')
  {
    console.log(startDate, endDate)
    let start = startDate
    while (start < endDate)
    {
      months.push(start)
      start = addDays(start, 1)
    }
  }

  return months;
}