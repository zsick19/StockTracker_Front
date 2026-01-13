import { GitCommitHorizontal, icons, PanelTopBottomDashed, PenTool, PiggyBank, Plane, RulerDimensionLine, Siren, TrendingUp } from "lucide-react";

export const ChartingTools = [
    { tool: 'Trace', icon: <RulerDimensionLine size={20} /> },
    { tool: 'Free Line', icon: <PenTool size={20} /> },
    { tool: 'Trend Line', icon: <TrendingUp size={20} /> },
    { tool: 'Horizontal Line', icon: <GitCommitHorizontal size={20} /> },
    { tool: 'High Volume Zone', icon: <PanelTopBottomDashed size={20} /> },
    { tool: 'Enter Exit', icon: <PiggyBank size={20} /> }]

export const ChartingToolEdits = [{ editTool: 'EnterExit', icon: <PiggyBank size={20} /> }]

export const PlanningTools = [{ tool: 'EnterExit', icon: <PiggyBank size={20} /> }]
export const KeyLevelTools = []


export const AlertTools = [{ tool: 'PriceAlert', icon: <Siren size={20} /> }]