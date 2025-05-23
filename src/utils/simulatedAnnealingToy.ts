export interface ToySimulationParams {
  r: number;
  maxIterations: number;
  initialTemperature: number;
  coolingRate: number;
  neighborType: 'Single Bit Flip' | 'Two Bit Flip' | 'Random Walk';
  coolingSchedule: 'Geometric' | 'Linear' | 'Logarithmic';
  coefficients: number[];
}

export interface IterationData {
  iteration: number;
  state: number;
  value: number;
  bestValue: number;
  temperature: number;
  acceptanceProbability: number;
  binaryRepresentation: number[];
}

export interface SimulatedAnnealingToyState {
  history: IterationData[];
  bestState: number;
  bestValue: number;
  acceptedWorse: number;
  currentIteration: number;
  searchSpace: { state: number; value: number }[];
  currentState: number;
  currentValue: number;
  isComplete: boolean;
}

// Core mathematical functions
export function evaluatePolynomial(n: number, coefficients: number[]): number {
  return coefficients.reduce((sum, coef, i) => sum + coef * Math.pow(n, i), 0);
}

export function intToBinaryArray(n: number, r: number): number[] {
  const clamped = Math.max(0, Math.min(n, Math.pow(2, r) - 1));
  if (r <= 0) return [];
  
  return n.toString(2)
    .padStart(r, '0')
    .split('')
    .map(bit => parseInt(bit));
}

export function binaryArrayToInt(binaryArray: number[]): number {
  if (binaryArray.length === 0) return 0;
  return parseInt(binaryArray.join(''), 2);
}

// Neighbor generation functions
export function singleBitFlipNeighbor(state: number, r: number): number {
  if (r <= 0) return state;
  
  const binaryArray = intToBinaryArray(state, r);
  const flipIndex = Math.floor(Math.random() * r);
  binaryArray[flipIndex] = 1 - binaryArray[flipIndex];
  
  return binaryArrayToInt(binaryArray);
}

export function twoBitFlipNeighbor(state: number, r: number): number {
  if (r < 2) return state;
  
  const binaryArray = intToBinaryArray(state, r);
  const indices = [];
  
  // Select two different random indices
  while (indices.length < 2) {
    const index = Math.floor(Math.random() * r);
    if (!indices.includes(index)) {
      indices.push(index);
    }
  }
  
  // Flip both bits
  indices.forEach(index => {
    binaryArray[index] = 1 - binaryArray[index];
  });
  
  return binaryArrayToInt(binaryArray);
}

export function randomWalkNeighbor(state: number, r: number): number {
  if (r <= 0) return 0;
  return Math.floor(Math.random() * Math.pow(2, r));
}

export function generateNeighbor(
  state: number, 
  r: number, 
  neighborType: ToySimulationParams['neighborType']
): number {
  switch (neighborType) {
    case 'Single Bit Flip':
      return singleBitFlipNeighbor(state, r);
    case 'Two Bit Flip':
      return twoBitFlipNeighbor(state, r);
    case 'Random Walk':
      return randomWalkNeighbor(state, r);
    default:
      return singleBitFlipNeighbor(state, r);
  }
}

// Temperature calculation
export function calculateTemperature(
  iteration: number,
  initialTemp: number,
  coolingRate: number,
  maxIterations: number,
  coolingSchedule: ToySimulationParams['coolingSchedule']
): number {
  switch (coolingSchedule) {
    case 'Geometric':
      return initialTemp * Math.pow(coolingRate, iteration);
    
    case 'Linear':
      const linearTemp = initialTemp - (initialTemp / maxIterations) * iteration;
      return Math.max(linearTemp, 0.001);
    
    case 'Logarithmic':
      const logTemp = initialTemp / (1 + Math.log(1 + iteration + 1));
      return Math.max(logTemp, 0.001);
    
    default:
      return initialTemp * Math.pow(coolingRate, iteration);
  }
}

// Fixed acceptance probability calculation
export function calculateAcceptanceProbability(
  currentValue: number,
  neighborValue: number,
  temperature: number
): number {
  // Delta should be neighbor - current (new - current)
  const delta = neighborValue - currentValue;
  
  if (delta >= 0) {
    return 1.0;
  }
  
  if (temperature <= 1e-6) {
    return 0.0;
  }
  
  return Math.exp(delta / temperature);
}

// Main simulation function with fixes
export function runToySimulation(params: ToySimulationParams): SimulatedAnnealingToyState {
  const { r, maxIterations, initialTemperature, coolingRate, neighborType, coolingSchedule, coefficients } = params;
  
  if (r <= 0) {
    return getInitialToyState();
  }
  
  // Initialize - CRITICAL: Best value starts at negative infinity
  let currentState = Math.floor(Math.random() * Math.pow(2, r));
  let currentValue = evaluatePolynomial(currentState, coefficients);
  
  let bestState = currentState;
  let bestValue = currentValue; // Initialize with first value, not -Infinity since we have a valid first solution
  let acceptedWorse = 0; // NEVER reset this counter during simulation
  
  const history: IterationData[] = [];
  
  // Generate full search space if feasible (for visualization)
  const searchSpace: { state: number; value: number }[] = [];
  if (r <= 8) {
    for (let state = 0; state < Math.pow(2, r); state++) {
      searchSpace.push({
        state,
        value: evaluatePolynomial(state, coefficients)
      });
    }
  }
  
  // Initial entry
  const initialTemp = calculateTemperature(0, initialTemperature, coolingRate, maxIterations, coolingSchedule);
  history.push({
    iteration: 0,
    state: currentState,
    value: currentValue,
    bestValue: bestValue,
    temperature: initialTemp,
    acceptanceProbability: 1.0,
    binaryRepresentation: intToBinaryArray(currentState, r)
  });
  
  // FIXED: Use bounded for-loop instead of while - this ensures exact iteration count
  for (let iteration = 1; iteration <= maxIterations; iteration++) {
    const temperature = calculateTemperature(iteration, initialTemperature, coolingRate, maxIterations, coolingSchedule);
    
    // Generate neighbor
    const neighborState = generateNeighbor(currentState, r, neighborType);
    const neighborValue = evaluatePolynomial(neighborState, coefficients);
    
    // FIXED: Calculate acceptance probability with correct delta
    const acceptanceProbability = calculateAcceptanceProbability(currentValue, neighborValue, temperature);
    
    // Decide whether to accept the neighbor
    const shouldAccept = Math.random() < acceptanceProbability;
    
    if (shouldAccept) {
      // Count accepted worse solutions BEFORE updating current values
      if (neighborValue < currentValue) {
        acceptedWorse++;
      }
      
      currentState = neighborState;
      currentValue = neighborValue;
    }
    
    // Update best solution
    if (currentValue > bestValue) {
      bestState = currentState;
      bestValue = currentValue;
    }
    
    // Record iteration data
    history.push({
      iteration,
      state: currentState,
      value: currentValue,
      bestValue: bestValue,
      temperature,
      acceptanceProbability,
      binaryRepresentation: intToBinaryArray(currentState, r)
    });
    
    // CRITICAL: Stop exactly at maxIterations
    if (iteration >= maxIterations) {
      break;
    }
  }
  
  return {
    history,
    bestState,
    bestValue,
    acceptedWorse,
    currentIteration: Math.min(maxIterations, history.length - 1),
    searchSpace,
    currentState,
    currentValue,
    isComplete: true
  };
}

// FIXED: New function for step-by-step simulation (for pause/resume)
export function runSingleIteration(
  currentState: SimulatedAnnealingToyState,
  params: ToySimulationParams
): SimulatedAnnealingToyState {
  if (currentState.currentIteration >= params.maxIterations || currentState.isComplete) {
    return { ...currentState, isComplete: true };
  }
  
  const nextIteration = currentState.currentIteration + 1;
  const temperature = calculateTemperature(
    nextIteration, 
    params.initialTemperature, 
    params.coolingRate, 
    params.maxIterations, 
    params.coolingSchedule
  );
  
  // Generate neighbor
  const neighborState = generateNeighbor(currentState.currentState, params.r, params.neighborType);
  const neighborValue = evaluatePolynomial(neighborState, params.coefficients);
  
  // Calculate acceptance probability
  const acceptanceProbability = calculateAcceptanceProbability(
    currentState.currentValue, 
    neighborValue, 
    temperature
  );
  
  // Decide whether to accept the neighbor
  const shouldAccept = Math.random() < acceptanceProbability;
  
  let newCurrentState = currentState.currentState;
  let newCurrentValue = currentState.currentValue;
  let newAcceptedWorse = currentState.acceptedWorse;
  
  if (shouldAccept) {
    // Count accepted worse solutions
    if (neighborValue < currentState.currentValue) {
      newAcceptedWorse++;
    }
    
    newCurrentState = neighborState;
    newCurrentValue = neighborValue;
  }
  
  // Update best solution only if strictly better
  let newBestState = currentState.bestState;
  let newBestValue = currentState.bestValue;
  
  if (newCurrentValue > currentState.bestValue) {
    newBestState = newCurrentState;
    newBestValue = newCurrentValue;
  }
  
  // Create new history entry
  const newHistoryEntry: IterationData = {
    iteration: nextIteration,
    state: newCurrentState,
    value: newCurrentValue,
    bestValue: newBestValue,
    temperature,
    acceptanceProbability,
    binaryRepresentation: intToBinaryArray(newCurrentState, params.r)
  };
  
  return {
    ...currentState,
    history: [...currentState.history, newHistoryEntry],
    bestState: newBestState,
    bestValue: newBestValue,
    acceptedWorse: newAcceptedWorse,
    currentIteration: nextIteration,
    currentState: newCurrentState,
    currentValue: newCurrentValue,
    isComplete: nextIteration >= params.maxIterations
  };
}

export function getInitialToyState(): SimulatedAnnealingToyState {
  return {
    history: [],
    bestState: 0,
    bestValue: -Infinity,
    acceptedWorse: 0,
    currentIteration: 0,
    searchSpace: [],
    currentState: 0,
    currentValue: 0,
    isComplete: false
  };
}

// FIXED: Initialize simulation state properly
export function initializeToySimulation(params: ToySimulationParams): SimulatedAnnealingToyState {
  if (params.r <= 0) {
    return getInitialToyState();
  }
  
  // Initialize with random state
  const initialState = Math.floor(Math.random() * Math.pow(2, params.r));
  const initialValue = evaluatePolynomial(initialState, params.coefficients);
  
  // Generate search space if feasible
  const searchSpace: { state: number; value: number }[] = [];
  if (params.r <= 8) {
    for (let state = 0; state < Math.pow(2, params.r); state++) {
      searchSpace.push({
        state,
        value: evaluatePolynomial(state, params.coefficients)
      });
    }
  }
  
  const initialTemp = calculateTemperature(0, params.initialTemperature, params.coolingRate, params.maxIterations, params.coolingSchedule);
  
  return {
    history: [{
      iteration: 0,
      state: initialState,
      value: initialValue,
      bestValue: initialValue,
      temperature: initialTemp,
      acceptanceProbability: 1.0,
      binaryRepresentation: intToBinaryArray(initialState, params.r)
    }],
    bestState: initialState,
    bestValue: initialValue,
    acceptedWorse: 0,
    currentIteration: 0,
    searchSpace,
    currentState: initialState,
    currentValue: initialValue,
    isComplete: false
  };
}
