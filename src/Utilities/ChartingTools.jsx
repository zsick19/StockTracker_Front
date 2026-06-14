import { AlignEndHorizontal, AlignStartHorizontal, ArrowDownToLine, ArrowUpToLine, GitCommitHorizontal, icons, Landmark, PanelTopBottomDashed, PenTool, PiggyBank, Plane, RulerDimensionLine, Siren, TrendingUp, WavesArrowDown, WavesArrowUp } from "lucide-react";

export const ChartingTools = [
    { tool: 'Trace', icon: <RulerDimensionLine size={20} /> },
    { tool: 'Free Line', icon: <PenTool size={20} /> },
    { tool: 'Trend Line', icon: <TrendingUp size={20} /> },
    { tool: 'Horizontal Line', icon: <GitCommitHorizontal size={20} /> },
    { tool: 'High Volume Zone', icon: <WavesArrowUp size={20} /> },
    { tool: 'Low Volume Zone', icon: <WavesArrowDown size={20} /> },
    { tool: 'Major Support', icon: <AlignStartHorizontal size={20} /> },
    { tool: 'Major Resistance', icon: <AlignEndHorizontal size={20} /> },
    { tool: 'Enter Exit', icon: <PiggyBank size={20} /> },
]

export const PreTradeTools = [
    { tool: 'Relevant High', icon: <ArrowUpToLine size={20} color="red" /> },
    { tool: 'Relevant Low', icon: <ArrowDownToLine size={20} color="red" /> },
    { tool: 'Institutional Price', icon: <Landmark size={20} color="white" /> }
]

export const ChartingToolEdits = [{ editTool: 'EnterExit', icon: <PiggyBank size={20} color="pink" /> }]


export const PlanningTools = [{ tool: 'EnterExit', icon: <PiggyBank size={20} /> }]
export const KeyLevelTools = []


export const AlertTools = [{ tool: 'PriceAlert', icon: <Siren size={20} /> }]