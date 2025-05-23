
import React, { useCallback, useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import {
  calculatePathDistance,
  createRandomCities,
  getInitialState,
  initializeSimulation,
  simulationStep
} from "@/utils/simulatedAnnealing";
import { City, SimulationParams, SimulationState } from "@/utils/types";
import CityCanvas from "@/components/CityCanvas";
import ControlPanel from "@/components/ControlPanel";
import InfoPanel from "@/components/InfoPanel";
import Charts from "@/components/Charts";
import { toast } from "sonner";
import { Home } from "lucide-react";

const Simulator = () => {
  // Simulation state and parameters
  const [state, setState] = useState<SimulationState>(getInitialState());
  const [params, setParams] = useState<SimulationParams>({
    initialTemperature: 1000,
    coolingRate: 0.99,
    totalIterations: 3000
  });
  
  // Animation frame reference
  const animationRef = useRef<number | null>(null);
  const lastFrameTimeRef = useRef<number>(0);
  
  // Handle adding a new city
  const handleAddCity = useCallback((x: number, y: number) => {
    if (state.isRunning) return;
    
    setState(prevState => {
      const newCities = [...prevState.cities, { id: prevState.cities.length, x, y }];
      
      // If we now have enough cities, re-initialize the current and best paths
      if (newCities.length >= 3) {
        const pathIndices = Array.from({ length: newCities.length - 1 }, (_, i) => i + 1);
        const initialDistance = calculatePathDistance(newCities, pathIndices);
        
        return {
          ...prevState,
          cities: newCities,
          currentPath: pathIndices,
          bestPath: pathIndices,
          distances: [initialDistance],
          currentDistance: initialDistance,
          bestDistance: initialDistance,
        };
      }
      
      return {
        ...prevState,
        cities: newCities
      };
    });
    
    if (state.cities.length === 0) {
      toast.success("First city added as the starting point!");
    }
  }, [state.cities, state.isRunning]);
  
  // Handle simulation parameters change
  const handleParamsChange = useCallback((newParams: SimulationParams) => {
    setParams(newParams);
  }, []);
  
  // Clear all cities
  const handleClearCities = useCallback(() => {
    if (state.isRunning) return;
    setState(getInitialState());
    toast.info("All cities cleared");
  }, [state.isRunning]);
  
  // Reset simulation
  const handleReset = useCallback(() => {
    if (state.isRunning) return;
    if (state.cities.length < 3) {
      toast.error("Add at least 3 cities to start the simulation");
      return;
    }
    
    setState(prevState => ({
      ...initializeSimulation(prevState.cities, params),
      isRunning: false,
      animationSpeed: prevState.animationSpeed
    }));
    toast.success("Simulation reset");
  }, [state.isRunning, state.cities.length, params]);
  
  // Generate random cities
  const handleRandomizeCities = useCallback((count: number) => {
    if (state.isRunning) return;
    const newCities = createRandomCities(count);
    
    // Always set city 0 as the start point
    setState({
      ...initializeSimulation(newCities, params),
      isRunning: false,
      animationSpeed: state.animationSpeed
    });
    toast.success(`Generated ${count} random cities`);
  }, [state.isRunning, params, state.animationSpeed]);
  
  // Start or stop the simulation
  const handleStartStop = useCallback(() => {
    setState(prevState => {
      // Don't start if we don't have enough cities
      if (!prevState.isRunning && prevState.cities.length < 3) {
        toast.error("Add at least 3 cities to start the simulation");
        return prevState;
      }
      
      // If we're stopping, just update the running flag
      if (prevState.isRunning) {
        toast.info("Simulation paused");
        return { ...prevState, isRunning: false };
      }
      
      // If we're starting, initialize if needed
      let newState = prevState;
      if (prevState.currentPath.length === 0 || prevState.bestPath.length === 0) {
        newState = initializeSimulation(prevState.cities, params);
      }
      
      toast.success("Simulation started");
      return { ...newState, isRunning: true };
    });
  }, [params]);
  
  // Update animation speed
  const handleSpeedChange = useCallback((speed: number) => {
    setState(prevState => ({ ...prevState, animationSpeed: speed }));
  }, []);
  
  // Animation loop
  useEffect(() => {
    if (!state.isRunning) {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
        animationRef.current = null;
      }
      return;
    }
    
    const step = (timestamp: number) => {
      // Control frame rate based on animation speed
      const frameInterval = 30 / state.animationSpeed; // milliseconds between frames
      const elapsed = timestamp - lastFrameTimeRef.current;
      
      if (elapsed > frameInterval) {
        lastFrameTimeRef.current = timestamp;
        
        // Run the simulation step
        setState(prevState => {
          // Stop if we've reached the maximum iterations
          if (prevState.iteration >= prevState.totalIterations) {
            toast.success("Simulation completed!");
            return { ...prevState, isRunning: false };
          }
          
          // Otherwise, run the next step
          return simulationStep(prevState, params);
        });
      }
      
      animationRef.current = requestAnimationFrame(step);
    };
    
    animationRef.current = requestAnimationFrame(step);
    
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [state.isRunning, state.animationSpeed, params]);
  
  return (
    <div className="min-h-screen bg-background text-foreground antialiased overflow-x-hidden">
      {/* Header */}
      <header className="w-full glass-panel border-b border-white/5 mb-8">
        <div className="container py-6 px-4 md:px-8 flex justify-between items-center">
          <div>
            <h1 className="text-2xl md:text-3xl font-light tracking-tight">
              Simulated Annealing
              <span className="text-sm ml-3 opacity-70 font-normal">
                Visualization
              </span>
            </h1>
            <p className="text-sm opacity-70">Traveling Salesman Problem Solver</p>
          </div>
          <Link to="/" className="control-btn flex items-center gap-2 text-sm">
            <Home className="h-4 w-4" />
            Back to Visualizations
          </Link>
        </div>
      </header>
      
      {/* Main content */}
      <main className="container px-4 md:px-8 pb-16">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left column - Canvas */}
          <div className="lg:col-span-2 space-y-6">
            <CityCanvas state={state} onAddCity={handleAddCity} />
            <Charts state={state} />
          </div>
          
          {/* Right column - Controls & Info */}
          <div className="space-y-6">
            <ControlPanel
              state={state}
              params={params}
              onParamsChange={handleParamsChange}
              onClearCities={handleClearCities}
              onReset={handleReset}
              onRandomizeCities={handleRandomizeCities}
              onStartStop={handleStartStop}
              onSpeedChange={handleSpeedChange}
            />
            <InfoPanel state={state} params={params} />
          </div>
        </div>
      </main>
      
      {/* Footer */}
      <footer className="w-full glass-panel border-t border-white/5 mt-auto">
        <div className="container py-4 px-4 md:px-8 text-center">
          <p className="text-sm opacity-70">
            <span className="inline-block">Applied Statistical Mathematics • Interactive Visualizations</span>
            <span className="mx-2">•</span>
            <span className="inline-block">BITS Pilani, K.K. Birla Goa Campus</span>
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Simulator;
