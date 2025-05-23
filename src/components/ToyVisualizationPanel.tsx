
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer, ScatterChart, Scatter } from "recharts";
import { Info } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { SimulatedAnnealingToyState, ToySimulationParams } from "@/utils/simulatedAnnealingToy";

interface ToyVisualizationPanelProps {
  state: SimulatedAnnealingToyState;
  params: ToySimulationParams;
}

const ToyVisualizationPanel: React.FC<ToyVisualizationPanelProps> = ({ state, params }) => {
  // Prepare data for charts
  const functionValueData = state.history.map(entry => ({
    iteration: entry.iteration,
    currentValue: entry.value,
    bestValue: entry.bestValue
  }));
  
  // FIXED: Proper acceptance probability calculation from actual history
  const acceptanceProbData = state.history.slice(1).map(entry => ({
    iteration: entry.iteration,
    probability: entry.acceptanceProbability
  }));
  
  const stateSpaceData = state.history.map(entry => ({
    state: entry.state,
    value: entry.value,
    iteration: entry.iteration
  }));
  
  // FIXED: Binary representation heatmap data - transposed for proper visualization
  const binaryHeatmapData = state.history.length > 0 && params.r > 0 ? 
    Array.from({ length: params.r }, (_, bitIndex) => ({
      bitIndex,
      data: state.history.map((entry, iterIndex) => ({
        iteration: iterIndex,
        value: entry.binaryRepresentation[bitIndex] || 0
      }))
    })) : [];
  
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Function Value Evolution */}
      <Card className="glass-panel border-white/10">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Tooltip>
              <TooltipTrigger>
                <Info className="h-4 w-4 opacity-70" />
              </TooltipTrigger>
              <TooltipContent>
                <p>Tracks the optimization progress. Blue line shows current value, dashed line shows best value found.</p>
              </TooltipContent>
            </Tooltip>
            Function Value Evolution
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ChartContainer
            config={{
              currentValue: {
                label: "Current Value",
                color: "hsl(var(--primary))",
              },
              bestValue: {
                label: "Best Value",
                color: "hsl(var(--accent))",
              },
            }}
            className="h-[250px] w-full"
          >
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={functionValueData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis 
                  dataKey="iteration" 
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={12}
                  fontFamily="Inter, system-ui, sans-serif"
                />
                <YAxis 
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={12}
                  fontFamily="Inter, system-ui, sans-serif"
                />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Line 
                  type="monotone" 
                  dataKey="currentValue" 
                  stroke="hsl(var(--primary))" 
                  strokeWidth={2}
                  dot={false}
                />
                <Line 
                  type="monotone" 
                  dataKey="bestValue" 
                  stroke="hsl(var(--accent))" 
                  strokeWidth={2}
                  strokeDasharray="5 5"
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>
      
      {/* FIXED: Binary State Representation */}
      <Card className="glass-panel border-white/10">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Tooltip>
              <TooltipTrigger>
                <Info className="h-4 w-4 opacity-70" />
              </TooltipTrigger>
              <TooltipContent>
                <p>Visualizes how each bit in the solution changes over time. Dark = 0, Light = 1.</p>
              </TooltipContent>
            </Tooltip>
            Binary State Representation
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[250px] w-full">
            {binaryHeatmapData.length > 0 ? (
              <div className="relative h-full w-full bg-secondary/20 rounded border border-white/10">
                <svg viewBox={`0 0 ${Math.max(state.history.length, 1)} ${params.r}`} className="w-full h-full">
                  {binaryHeatmapData.map((bit, bitIndex) => 
                    bit.data.map((point, iterIndex) => (
                      <rect
                        key={`${bitIndex}-${iterIndex}`}
                        x={iterIndex}
                        y={bitIndex}
                        width={1}
                        height={1}
                        fill={point.value === 1 ? "hsl(var(--accent))" : "hsl(var(--secondary))"}
                        opacity={0.8}
                      />
                    ))
                  )}
                </svg>
                {/* Axes labels with improved font */}
                <div className="absolute bottom-0 left-0 text-xs opacity-70 transform -translate-y-1 font-mono">
                  Iteration →
                </div>
                <div className="absolute top-0 left-0 text-xs opacity-70 transform -rotate-90 origin-left translate-y-4 font-mono">
                  Bit Index →
                </div>
              </div>
            ) : (
              <div className="h-full flex items-center justify-center text-muted-foreground font-mono">
                No data to display
              </div>
            )}
          </div>
        </CardContent>
      </Card>
      
      {/* FIXED: Acceptance Probability */}
      <Card className="glass-panel border-white/10">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Tooltip>
              <TooltipTrigger>
                <Info className="h-4 w-4 opacity-70" />
              </TooltipTrigger>
              <TooltipContent>
                <p>Shows how likely the algorithm is to accept a worse solution. Decreases as temperature cools.</p>
              </TooltipContent>
            </Tooltip>
            Acceptance Probability
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ChartContainer
            config={{
              probability: {
                label: "Acceptance Probability",
                color: "hsl(var(--destructive))",
              },
            }}
            className="h-[250px] w-full"
          >
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={acceptanceProbData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis 
                  dataKey="iteration" 
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={12}
                  fontFamily="Inter, system-ui, sans-serif"
                />
                <YAxis 
                  domain={[0, 1]}
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={12}
                  fontFamily="Inter, system-ui, sans-serif"
                />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Line 
                  type="monotone" 
                  dataKey="probability" 
                  stroke="hsl(var(--destructive))" 
                  strokeWidth={2}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>
      
      {/* State Space Exploration */}
      <Card className="glass-panel border-white/10">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Tooltip>
              <TooltipTrigger>
                <Info className="h-4 w-4 opacity-70" />
              </TooltipTrigger>
              <TooltipContent>
                <p>Displays which solutions were explored and how the search focused over time.</p>
              </TooltipContent>
            </Tooltip>
            State Space Exploration
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ChartContainer
            config={{
              exploration: {
                label: "SA Path",
                color: "hsl(var(--accent))",
              },
              searchSpace: {
                label: "Search Space",
                color: "hsl(var(--muted-foreground))",
              },
            }}
            className="h-[250px] w-full"
          >
            <ResponsiveContainer width="100%" height="100%">
              <ScatterChart>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis 
                  type="number"
                  dataKey="state"
                  name="State"
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={12}
                  fontFamily="Inter, system-ui, sans-serif"
                />
                <YAxis 
                  type="number"
                  dataKey="value"
                  name="Function Value"
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={12}
                  fontFamily="Inter, system-ui, sans-serif"
                />
                <ChartTooltip content={<ChartTooltipContent />} />
                
                {/* Search space background (if small enough) */}
                {state.searchSpace.length > 0 && state.searchSpace.length <= 256 && (
                  <Scatter
                    data={state.searchSpace}
                    fill="hsl(var(--muted-foreground))"
                    fillOpacity={0.2}
                    strokeOpacity={0}
                    r={2}
                  />
                )}
                
                {/* SA exploration path */}
                <Scatter
                  data={stateSpaceData}
                  fill="hsl(var(--accent))"
                  fillOpacity={0.6}
                  strokeOpacity={0}
                  r={3}
                />
                
                {/* Best solution highlight */}
                {state.bestState !== undefined && (
                  <Scatter
                    data={[{ state: state.bestState, value: state.bestValue }]}
                    fill="hsl(var(--primary))"
                    stroke="hsl(var(--ring))"
                    strokeWidth={2}
                    r={6}
                  />
                )}
              </ScatterChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>
    </div>
  );
};

export default ToyVisualizationPanel;
