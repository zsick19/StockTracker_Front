import { GitCommitHorizontal, icons, PanelTopBottomDashed, PenTool, PiggyBank, Plane, RulerDimensionLine, Siren } from "lucide-react";

export const ChartingTools = [
    { tool: 'Trace', icon: <RulerDimensionLine size={20} /> },
    { tool: 'TrendLine', icon: <PenTool size={20} /> },
    { tool: 'Horizontal Line', icon: <GitCommitHorizontal size={20} /> },
    { tool: 'High Volume Zone', icon: <PanelTopBottomDashed size={20} /> },
    { tool: 'Enter Exit', icon: <PiggyBank size={20} /> }]


export const PlanningTools = [{ tool: 'EnterExit', icon: <PiggyBank size={20} /> }]
export const KeyLevelTools = []


export const AlertTools = [{ tool: 'PriceAlert', icon: <Siren size={20} /> }]