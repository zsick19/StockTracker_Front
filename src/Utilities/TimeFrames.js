export const defaultTimeFrames = {
  threeDayOneMin: { increment: "1", unitOfIncrement: "M", duration: 3, unitOfDuration: "D", },
  threeDayTwoMin: { increment: "2", unitOfIncrement: "M", duration: 3, unitOfDuration: "D", },
  threeDayFiveMin: { increment: "5", unitOfIncrement: "M", duration: 3, unitOfDuration: "D", },
  threeDayFifteenMin: { increment: "15", unitOfIncrement: "M", duration: 3, unitOfDuration: "D", },
  threeDayThirtyMin: { increment: "30", unitOfIncrement: "M", duration: 3, unitOfDuration: "D", },
  threeDayOneHour: { increment: "1", unitOfIncrement: "H", duration: 3, unitOfDuration: "D", },
  dailyOneYear: { increment: "1", unitOfIncrement: "D", duration: 1, unitOfDuration: "Y", },
  dailyHalfYear: { increment: "1", unitOfIncrement: "D", duration: 180, unitOfDuration: "D", },
  weeklyOneYear: { increment: "1", unitOfIncrement: "W", duration: 1, unitOfDuration: "Y", },
  fourHourOneYear: { increment: "4", unitOfIncrement: "H", duration: 1, unitOfDuration: "Y" }
};

export const interDayTimeFrames = [{ label: '1M', timeFrame: defaultTimeFrames.threeDayOneMin },
{ label: '2M', timeFrame: defaultTimeFrames.threeDayTwoMin },
{ label: '5M', timeFrame: defaultTimeFrames.threeDayFiveMin },
{ label: '15M', timeFrame: defaultTimeFrames.threeDayFifteenMin },
{ label: '30M', timeFrame: defaultTimeFrames.threeDayThirtyMin },
{ label: '1H', timeFrame: defaultTimeFrames.threeDayOneHour }
]
