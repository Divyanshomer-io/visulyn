
import { City, SimulationParams, SimulationState } from "./types";

export function distance(city1: City, city2: City): number {
  const dx = city1.x - city2.x;
  const dy = city1.y - city2.y;
  return Math.sqrt(dx * dx + dy * dy);
}

export function calculatePathDistance(cities: City[], path: number[]): number {
  if (cities.length < 2 || path.length === 0) return 0;
  
  // Add starting city
  let totalDist = distance(cities[0], cities[path[0]]);
  
  // Add intermediate cities
  for (let i = 0; i < path.length - 1; i++) {
    totalDist += distance(cities[path[i]], cities[path[i + 1]]);
  }
  
  // Return to start
  totalDist += distance(cities[path[path.length - 1]], cities[0]);
  
  return totalDist;
}

export function getInitialState(numCities: number = 0): SimulationState {
  return {
    cities: [],
    currentPath: [],
    bestPath: [],
    distances: [],
    currentDistance: 0,
    bestDistance: 0,
    temperature: 0,
    iteration: 0,
    totalIterations: 0,
    isRunning: false,
    animationSpeed: 1
  };
}

export function createRandomCities(count: number): City[] {
  const cities: City[] = [];
  for (let i = 0; i < count; i++) {
    cities.push({
      id: i,
      x: Math.random() * 0.8 + 0.1, // 0.1 - 0.9 to keep away from edges
      y: Math.random() * 0.8 + 0.1
    });
  }
  return cities;
}

export function simulationStep(
  state: SimulationState,
  params: SimulationParams
): SimulationState {
  const { cities, currentPath, bestPath, distances, temperature, iteration, totalIterations } = state;
  
  if (cities.length < 3 || iteration >= totalIterations) {
    return { ...state, isRunning: false };
  }
  
  const numCities = cities.length - 1; // Exclude starting city
  
  // Make a copy of the current path
  const newPath = [...currentPath];
  
  // Randomly select two cities to swap
  const i = Math.floor(Math.random() * numCities);
  const j = Math.floor(Math.random() * numCities);
  
  // Skip if same index
  if (i !== j) {
    // Swap the cities
    [newPath[i], newPath[j]] = [newPath[j], newPath[i]];
    
    const currentDistance = calculatePathDistance(cities, currentPath);
    const newDistance = calculatePathDistance(cities, newPath);
    
    // Accept the new solution if it's better
    // Or accept with a probability based on temperature
    const acceptNewSolution = 
      newDistance < currentDistance || 
      Math.random() < Math.exp((currentDistance - newDistance) / temperature);
    
    if (acceptNewSolution) {
      // Update best path if this is better
      let newBestPath = bestPath;
      let newBestDistance = state.bestDistance;
      
      if (bestPath.length === 0 || newDistance < state.bestDistance) {
        newBestPath = [...newPath];
        newBestDistance = newDistance;
      }
      
      const newDistances = [...distances, newDistance];
      const newTemperature = temperature * params.coolingRate;
      
      return {
        ...state,
        currentPath: newPath,
        bestPath: newBestPath,
        distances: newDistances,
        currentDistance: newDistance,
        bestDistance: newBestDistance,
        temperature: newTemperature,
        iteration: iteration + 1
      };
    }
  }
  
  // If we don't accept the new solution, still increase iteration and log distance
  const currentDistance = calculatePathDistance(cities, currentPath);
  const newDistances = [...distances, currentDistance];
  const newTemperature = temperature * params.coolingRate;
  
  return {
    ...state,
    distances: newDistances,
    temperature: newTemperature,
    iteration: iteration + 1
  };
}

export function initializeSimulation(
  cities: City[],
  params: SimulationParams
): SimulationState {
  if (cities.length < 3) {
    return getInitialState();
  }
  
  // Create initial random path (excluding starting city)
  const pathIndices = Array.from({ length: cities.length - 1 }, (_, i) => i + 1);
  shuffleArray(pathIndices);
  
  const initialDistance = calculatePathDistance(cities, pathIndices);
  
  return {
    cities: [...cities],
    currentPath: [...pathIndices],
    bestPath: [...pathIndices],
    distances: [initialDistance],
    currentDistance: initialDistance,
    bestDistance: initialDistance,
    temperature: params.initialTemperature,
    iteration: 0,
    totalIterations: params.totalIterations,
    isRunning: true,
    animationSpeed: 1
  };
}

function shuffleArray(array: any[]): void {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
}
