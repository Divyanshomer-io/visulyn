
export interface City {
  id: number;
  x: number;
  y: number;
}

export interface SimulationState {
  cities: City[];
  currentPath: number[];
  bestPath: number[];
  distances: number[];
  currentDistance: number;
  bestDistance: number;
  temperature: number;
  iteration: number;
  totalIterations: number;
  isRunning: boolean;
  animationSpeed: number;
}

export interface SimulationParams {
  initialTemperature: number;
  coolingRate: number;
  totalIterations: number;
}

export interface ControlPanelProps {
  state: SimulationState;
  params: SimulationParams;
  onParamsChange: (params: SimulationParams) => void;
  onClearCities: () => void;
  onReset: () => void;
  onRandomizeCities: (count: number) => void;
  onStartStop: () => void;
  onSpeedChange: (speed: number) => void;
}

export interface CityCanvasProps {
  state: SimulationState;
  onAddCity: (x: number, y: number) => void;
}

export interface InfoPanelProps {
  state: SimulationState;
  params: SimulationParams;
}

export interface ChartProps {
  state: SimulationState;
}
