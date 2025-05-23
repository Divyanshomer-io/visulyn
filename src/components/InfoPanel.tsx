
import React from "react";
import { InfoPanelProps } from "@/utils/types";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { CheckCircle, Info, Code } from "lucide-react";

const InfoPanel: React.FC<InfoPanelProps> = ({ state, params }) => {
  const formatDistance = (distance: number | undefined) => {
    if (distance === undefined) return "N/A";
    return distance.toFixed(2);
  };
  
  const percentImprovement = () => {
    if (state.distances.length <= 1 || !state.bestDistance) return 0;
    const initialDistance = state.distances[0];
    return ((initialDistance - state.bestDistance) / initialDistance * 100).toFixed(1);
  };
  
  const completionPercent = () => {
    if (state.totalIterations === 0) return 0;
    return (state.iteration / state.totalIterations * 100).toFixed(0);
  };
  
  return (
    <div className="glass-panel rounded-xl p-6 space-y-5">
      <h2 className="text-lg font-medium mb-2">Simulated Annealing Progress</h2>
      
      <div className="grid grid-cols-2 gap-4">
        <div className="glass-panel rounded-lg p-3">
          <h3 className="text-xs uppercase opacity-70 mb-1">Current Distance</h3>
          <p className="text-xl font-light">{formatDistance(state.currentDistance)}</p>
        </div>
        
        <div className="glass-panel rounded-lg p-3">
          <h3 className="text-xs uppercase opacity-70 mb-1">Best Distance</h3>
          <p className="text-xl font-light text-tsp-best">{formatDistance(state.bestDistance)}</p>
        </div>
        
        <div className="glass-panel rounded-lg p-3">
          <h3 className="text-xs uppercase opacity-70 mb-1">Temperature</h3>
          <p className="text-xl font-light">{state.temperature.toFixed(1)}</p>
        </div>
        
        <div className="glass-panel rounded-lg p-3">
          <h3 className="text-xs uppercase opacity-70 mb-1">Improvement</h3>
          <p className="text-xl font-light">{percentImprovement()}%</p>
        </div>
      </div>
      
      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span>Progress</span>
          <span>
            {state.iteration} / {state.totalIterations} iterations
          </span>
        </div>
        <div className="w-full h-2 bg-secondary/30 rounded-full overflow-hidden">
          <div 
            className="h-full bg-accent transition-all duration-300"
            style={{ width: `${completionPercent()}%` }}
          ></div>
        </div>
      </div>
      
      <Accordion type="single" collapsible className="w-full">
        <AccordionItem value="algorithm" className="border-white/10">
          <AccordionTrigger className="py-3 hover:no-underline text-sm font-medium">
            About Simulated Annealing
          </AccordionTrigger>
          <AccordionContent className="text-sm opacity-90 space-y-2">
            <p>
              Simulated Annealing is a probabilistic optimization algorithm inspired by the annealing process in metallurgy, 
              where metals are heated and then slowly cooled to minimize energy states and reduce defects.
            </p>
            
            <div className="mt-3 pt-2 border-t border-white/10">
              <h4 className="font-medium flex items-center gap-1.5">
                <Code size={14} className="text-primary" />
                Technical Parameters:
              </h4>
              
              <div className="mt-2 glass-panel rounded-lg p-3 space-y-2">
                <div>
                  <h5 className="font-medium text-tsp-current">Initial Temperature (T₀)</h5>
                  <p className="mt-1">
                    Controls the initial probability of accepting worse solutions. In SA, the temperature parameter represents the system&apos;s energy.
                  </p>
                  <ul className="list-disc list-inside mt-1 pl-2 text-xs opacity-90">
                    <li><strong>Higher values (1000-5000):</strong> Wider exploration early in the search, higher chance of escaping local optima</li>
                    <li><strong>Lower values (100-500):</strong> More focused search, faster convergence but higher risk of local optima</li>
                    <li><strong>Formula impact:</strong> Higher T means P(accept) approaches 1 for any solution quality</li>
                  </ul>
                </div>
                
                <div className="mt-2">
                  <h5 className="font-medium text-tsp-current">Cooling Rate (α)</h5>
                  <p className="mt-1">
                    Determines how rapidly the temperature decreases: T<sub>new</sub> = α × T<sub>current</sub>
                  </p>
                  <ul className="list-disc list-inside mt-1 pl-2 text-xs opacity-90">
                    <li><strong>Values close to 1 (0.99-0.999):</strong> Very slow cooling, thorough exploration, more likely to find global optimum</li>
                    <li><strong>Lower values (0.8-0.95):</strong> Rapid cooling, quick convergence, may get trapped in local optima</li>
                    <li><strong>Theoretical impact:</strong> Logarithmic cooling schedules proven to converge to global optimum given infinite time</li>
                  </ul>
                </div>
                
                <div className="mt-2">
                  <h5 className="font-medium text-tsp-current">Total Iterations</h5>
                  <p className="mt-1">
                    Maximum number of solution evaluations before termination.
                  </p>
                  <ul className="list-disc list-inside mt-1 pl-2 text-xs opacity-90">
                    <li><strong>Complexity relation:</strong> Problem complexity typically requires O(n²) iterations where n is the number of cities</li>
                    <li><strong>Recommended values:</strong> 1000 iterations for small problems (10-20 cities), 5000+ for larger problems</li>
                  </ul>
                </div>
              </div>
            </div>
            
            <div className="mt-3 pt-2 border-t border-white/10">
              <h4 className="font-medium flex items-center gap-1.5">
                <Info size={14} className="text-primary" />
                Mathematical Foundation:
              </h4>
              
              <div className="mt-2 glass-panel rounded-lg p-3">
                <p>
                  The probability of accepting a worse solution is calculated by the Metropolis criterion:
                </p>
                <div className="bg-secondary/70 px-3 py-2 rounded-lg my-2 font-mono text-xs overflow-x-auto">
                  P(accept) = exp(-(cost_new - cost_current) / temperature)
                </div>
                <p className="text-xs opacity-90">
                  This is derived from the Boltzmann distribution in statistical mechanics. As T approaches 0, 
                  the algorithm transitions from exploration (accepting worse solutions) to exploitation (accepting only better solutions).
                </p>
                <p className="mt-2 text-xs">
                  <strong>Convergence guarantees:</strong> With proper cooling schedule (α very close to 1), simulated annealing 
                  can be mathematically proven to converge to the global optimum with probability 1, given sufficient time.
                </p>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>
        
        <AccordionItem value="tsp" className="border-white/10">
          <AccordionTrigger className="py-3 hover:no-underline text-sm font-medium">
            About the TSP Problem
          </AccordionTrigger>
          <AccordionContent className="text-sm opacity-90 space-y-2">
            <p>
              The Traveling Salesman Problem (TSP) is a classic combinatorial optimization problem where a 
              salesman must visit a set of cities and return to the starting city, finding the 
              shortest possible route.
            </p>
            <p>
              This is an NP-hard problem, meaning there&apos;s no known polynomial-time algorithm to find the 
              exact solution for large instances. For n cities, there are (n-1)!/2 possible tours.
            </p>
            <div className="mt-3 space-y-1.5">
              <div className="flex items-start gap-2">
                <CheckCircle size={16} className="min-w-4 mt-0.5 text-tsp-start" />
                <p>The blue dot represents the starting city (fixed).</p>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle size={16} className="min-w-4 mt-0.5 text-tsp-current" />
                <p>The orange line shows the current path being evaluated by the algorithm.</p>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle size={16} className="min-w-4 mt-0.5 text-tsp-best" />
                <p>The green line shows the best path found so far in the search process.</p>
              </div>
            </div>
            <div className="mt-3 pt-2 border-t border-white/10">
              <h4 className="font-medium">Algorithm Implementation Details:</h4>
              <p className="mt-1.5">
                In this implementation, we use a standard 2-opt move strategy for generating neighboring solutions:
              </p>
              <div className="bg-secondary/70 px-3 py-2 rounded-lg my-2 font-mono text-xs overflow-x-auto">
                // Select two random positions in the tour
                i = random(0, n-1)
                j = random(0, n-1)
                
                // Swap the cities at those positions
                swap(tour[i], tour[j])
                
                // Evaluate the new tour length
                newDistance = calculatePathDistance(cities, newTour)
                
                // Apply Metropolis criterion
                if (newDistance &lt; currentDistance || 
                    random(0,1) &lt; exp((currentDistance - newDistance) / T)) {"{"}
                  accept the new tour
                {"}"}
              </div>
              <p className="mt-1.5">
                The algorithm complexity is O(n²) per iteration for n cities, with:
              </p>
              <ul className="list-disc list-inside mt-1.5 space-y-1 pl-2">
                <li>Best parameter settings depend on problem size and structure</li>
                <li>Empirical performance typically reaches within 5-10% of optimal for medium-sized problems</li>
                <li>Edge cases: For certain city configurations (e.g., cities in a circle), cooling rate should be adjusted higher (0.99+)</li>
              </ul>
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
};

export default InfoPanel;
