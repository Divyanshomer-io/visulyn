
import React from "react";
import { ChartProps } from "@/utils/types";
import { 
  Line, 
  LineChart, 
  ResponsiveContainer, 
  Tooltip, 
  XAxis, 
  YAxis,
  CartesianGrid,
  ReferenceLine
} from "recharts";

const Charts: React.FC<ChartProps> = ({ state }) => {
  // Create chart data with a fixed width for better visualization
  const chartData = state.distances.map((distance, index) => ({
    iteration: index,
    distance,
  }));
  
  // Find min and max distances for chart scaling
  const minDistance = Math.min(...state.distances.filter(Boolean));
  const maxDistance = Math.max(...state.distances.filter(Boolean));
  
  // Create y-axis domain with some padding
  const yAxisMin = Math.max(0, minDistance * 0.95);
  const yAxisMax = maxDistance * 1.05;
  
  return (
    <div className="glass-panel rounded-xl p-6">
      <h2 className="text-lg font-medium mb-4">Distance Over Iterations</h2>
      
      {state.distances.length > 1 ? (
        <div className="w-full h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart 
              data={chartData} 
              margin={{ top: 10, right: 30, left: 20, bottom: 20 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#444444" />
              <XAxis 
                dataKey="iteration" 
                stroke="#ffffff80"
                tickLine={{ stroke: '#ffffff40' }}
                axisLine={{ stroke: '#ffffff40' }}
                label={{ 
                  value: 'Iterations', 
                  position: 'insideBottom', 
                  offset: -10,
                  fill: '#ffffff80' 
                }}
              />
              <YAxis 
                stroke="#ffffff80"
                tickLine={{ stroke: '#ffffff40' }}
                axisLine={{ stroke: '#ffffff40' }}
                domain={[yAxisMin, yAxisMax]}
                label={{ 
                  value: 'Distance', 
                  angle: -90, 
                  position: 'insideLeft',
                  fill: '#ffffff80',
                  offset: -10
                }}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'rgba(22, 22, 26, 0.95)',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  borderRadius: '8px',
                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)',
                  color: 'white'
                }}
                itemStyle={{ color: 'white' }}
                labelStyle={{ color: 'rgba(255, 255, 255, 0.7)' }}
                formatter={(value: number) => [value.toFixed(2), 'Distance']}
                labelFormatter={(value) => `Iteration: ${value}`}
              />
              
              {/* Main distance line */}
              <Line 
                type="monotone" 
                dataKey="distance" 
                stroke="#9b87f5"
                strokeWidth={2.5}
                dot={false}
                activeDot={{ 
                  r: 6, 
                  stroke: '#9b87f5', 
                  strokeWidth: 2, 
                  fill: 'rgba(22, 22, 26, 0.9)' 
                }}
                animationDuration={300}
              />
              
              {/* Horizontal line for best distance */}
              {state.bestDistance > 0 && (
                <ReferenceLine 
                  y={state.bestDistance} 
                  stroke="#13df83" 
                  strokeWidth={1.5}
                  strokeDasharray="5 5"
                  label={{
                    value: `Best: ${state.bestDistance.toFixed(2)}`,
                    fill: '#13df83',
                    position: 'left'
                  }}
                />
              )}
            </LineChart>
          </ResponsiveContainer>
        </div>
      ) : (
        <div className="h-64 flex items-center justify-center opacity-60 animate-pulse-subtle">
          <p>Run the simulation to generate data</p>
        </div>
      )}
      
      {state.distances.length > 1 && (
        <div className="mt-4 flex justify-between text-xs opacity-80">
          <div>
            <span className="inline-block w-3 h-3 bg-[#9b87f5] rounded-full mr-1"></span>
            Distance over time
          </div>
          <div>
            <span className="inline-block w-3 h-3 bg-tsp-best rounded-full mr-1"></span>
            Best distance found: {state.bestDistance.toFixed(2)}
          </div>
        </div>
      )}
    </div>
  );
};

export default Charts;
