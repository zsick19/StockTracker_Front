import { enterBufferSelectors, enterExitPlannedSelectors, stopLossHitSelectors } from "../features/EnterExitPlans/EnterExitApiSlice";

export function provideEnterExitPlanSelector(data, id)
{
    let entityToReturn = enterBufferSelectors.selectById(data.enterBufferHit, id)
    if (!entityToReturn) entityToReturn = stopLossHitSelectors.selectById(data.stopLossHit, id)
    if (!entityToReturn) entityToReturn = enterExitPlannedSelectors.selectById(data.plannedTickers, id)
    return entityToReturn
}