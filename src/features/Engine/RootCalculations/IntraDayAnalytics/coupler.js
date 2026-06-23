// Inside your central master strategy router function:
const patternClassification = planEntity.patternConfig?.userSelectedPattern || planEntity.patternClassification;
let patternSpecificScore = 0;

const liveCandlesArray = planEntity.todaysCandles || []; // Today's streaming regular session cache
const livePrice = liveCandlesArray.length > 0 ? liveCandlesArray[liveCandlesArray.length - 1].ClosePrice : 0.00;

if (liveCandlesArray.length > 0)
{
    // --- THE DYNAMIC SINGLE-FRAME STRATEGY ROUTER SWITCH ---
    switch (patternClassification)
    {
        case "TOOL_1_VERTICAL_CASCADER":
            patternSpecificScore = processCascadeLiveDelta(planEntity, liveCandlesArray);
            break;

        case "TOOL_2_HORIZONTAL_CHANNEL":
            // Check your Mongoose flag to segment penny scalps from large-cap channels [INDEX]
            if (planEntity.channelPattern?.channelType === "SUB_ENGINE_PENNY_STOCK_SCALP")
            {
                patternSpecificScore = scorePennyChannelLiveDelta(planEntity, livePrice, liveCandlesArray);
            } else
            {
                patternSpecificScore = processStandardChannelLiveDelta(planEntity, liveCandlesArray);
            }
            break;

        case "TOOL_4_CONTINUATION_MOMENTUM":
            patternSpecificScore = processContinuationLiveDelta(planEntity, liveCandlesArray);
            break;

        default:
            patternSpecificScore = 0;
            break;
    }
}

// Combine your shared Base Environment score with this active Live Pattern score
const totalRawCumulativeScore = baseEnvironmentScore + patternSpecificScore;
const finalizedAlphaConvictionScore = Math.min(Math.max(totalRawCumulativeScore, 0), 100);
