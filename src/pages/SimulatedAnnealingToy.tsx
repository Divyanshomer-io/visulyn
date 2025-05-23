import React, { useCallback, useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { Home, Info, RotateCcw, Play, Pause, ChevronDown, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from "@/components/ui/tooltip";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { 
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger 
} from "@/components/ui/accordion";
import { toast } from "sonner";
import ToyVisualizationPanel from "@/components/ToyVisualizationPanel";
import { 
  SimulatedAnnealingToyState, 
  ToySimulationParams, 
  runToySimulation,
  getInitialToyState,
  initializeToySimulation,
  runSingleIteration
} from "@/utils/simulatedAnnealingToy";

const SimulatedAnnealingToy = () => {
  // FIXED: Enhanced state management for pause/resume
  const [state, setState] = useState<SimulatedAnnealingToyState>(getInitialToyState());
  const [params, setParams] = useState<ToySimulationParams>({
    r: 5,
    maxIterations: 100,
    initialTemperature: 5.0,
    coolingRate: 0.99,
    neighborType: 'Single Bit Flip',
    coolingSchedule: 'Geometric',
    coefficients: [1, -2, 3, -1, 2, -1]
  });
  
  // Animation control
  const [isRunning, setIsRunning] = useState(false);
  const [currentIteration, setCurrentIteration] = useState(0);
  const animationRef = useRef<number | null>(null);
  const lastFrameTimeRef = useRef<number>(0);
  
  // Collapsible sections state
  const [isPolynomialOpen, setIsPolynomialOpen] = useState(false);
  const [isAlgorithmOpen, setIsAlgorithmOpen] = useState(true);
  const [isOptionsOpen, setIsOptionsOpen] = useState(true);
  
  // FIXED: Run complete simulation (for reset/parameter changes)
  const runCompleteSimulation = useCallback(() => {
    const result = runToySimulation(params);
    setState(result);
  }, [params]);
  
  // FIXED: Initialize simulation state
  const initializeSimulation = useCallback(() => {
    const initialState = initializeToySimulation(params);
    setState(initialState);
  }, [params]);
  
  // Handle parameter changes
  const handleParamChange = useCallback((key: keyof ToySimulationParams, value: any) => {
    setParams(prev => ({ ...prev, [key]: value }));
    setIsRunning(false); // Stop animation when parameters change
  }, []);
  
  // Handle coefficient changes
  const handleCoefficientChange = useCallback((index: number, value: number) => {
    setParams(prev => ({
      ...prev,
      coefficients: prev.coefficients.map((coef, i) => i === index ? value : coef)
    }));
    setIsRunning(false);
  }, []);
  
  // Handle polynomial degree change
  const handleDegreeChange = useCallback((newDegree: number) => {
    setParams(prev => {
      const newCoefficients = Array(newDegree + 1).fill(0);
      for (let i = 0; i < Math.min(prev.coefficients.length, newDegree + 1); i++) {
        newCoefficients[i] = prev.coefficients[i];
      }
      return { ...prev, coefficients: newCoefficients };
    });
    setIsRunning(false);
  }, []);
  
  // Reset to defaults and reinitialize
  const handleReset = useCallback(() => {
    setParams({
      r: 5,
      maxIterations: 100,
      initialTemperature: 5.0,
      coolingRate: 0.99,
      neighborType: 'Single Bit Flip',
      coolingSchedule: 'Geometric',
      coefficients: [1, -2, 3, -1, 2, -1]
    });
    setIsRunning(false);
    toast.success("Parameters reset to defaults");
  }, []);
  
  // Toggle animation with pause/resume capability
  const toggleAnimation = useCallback(() => {
    setIsRunning(prev => !prev);
  }, []);
  
  // FIXED: Animation loop that supports pause/resume
  useEffect(() => {
    if (!isRunning) {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
        animationRef.current = null;
      }
      return;
    }
    
    const animate = (timestamp: number) => {
      const elapsed = timestamp - lastFrameTimeRef.current;
      
      if (elapsed > 300) { // Update every 300ms for better visibility
        lastFrameTimeRef.current = timestamp;
        
        // FIXED: Run single iteration instead of complete simulation
        setState(prevState => {
          const newState = runSingleIteration(prevState, params);
          
          // Stop animation when reaching max iterations
          if (newState.isComplete) {
            setIsRunning(false);
            toast.success(`Simulation completed after ${params.maxIterations} iterations`);
          }
          
          return newState;
        });
      }
      
      if (isRunning) {
        animationRef.current = requestAnimationFrame(animate);
      }
    };
    
    animationRef.current = requestAnimationFrame(animate);
    
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isRunning, params]);
  
  // FIXED: Initialize simulation when parameters change
  useEffect(() => {
    initializeSimulation();
  }, [initializeSimulation]);
  
  return (
    <TooltipProvider>
      <div className="min-h-screen bg-background text-foreground antialiased overflow-x-hidden">
        {/* Header */}
        <header className="w-full glass-panel border-b border-white/5 mb-8">
          <div className="container py-6 px-4 md:px-8 flex justify-between items-center">
            <div>
              <h1 className="text-2xl md:text-3xl font-light tracking-tight">
                Simulated Annealing
                <span className="text-sm ml-3 opacity-70 font-normal">
                  Toy Example
                </span>
              </h1>
              <p className="text-sm opacity-70">Interactive Polynomial Optimization</p>
            </div>
            <Link to="/" className="control-btn flex items-center gap-2 text-sm">
              <Home className="h-4 w-4" />
              Back to Visualizations
            </Link>
          </div>
        </header>
        
        {/* Main content with side-by-side layout */}
        <main className="container px-4 md:px-8 pb-16">
          <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
            {/* Left side - Visualizations (3/4 width) */}
            <div className="xl:col-span-3 space-y-6">
              <ToyVisualizationPanel state={state} params={params} />
              
              {/* FIXED: Statistics with real-time current iteration */}
              <Card className="glass-panel border-white/10">
                <CardHeader>
                  <CardTitle>Real-time Statistics</CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div className="text-center">
                    <div className="text-2xl font-mono text-primary">{state.bestValue.toFixed(2)}</div>
                    <div className="text-xs opacity-70">Best Value</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-mono text-accent">{state.bestState}</div>
                    <div className="text-xs opacity-70">Best State</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-mono text-destructive">{state.acceptedWorse}</div>
                    <div className="text-xs opacity-70">Accepted Worse</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-mono">{state.currentIteration} / {params.maxIterations}</div>
                    <div className="text-xs opacity-70">Progress</div>
                  </div>
                </CardContent>
              </Card>
            </div>
            
            {/* Right side - Controls (1/4 width) */}
            <div className="xl:col-span-1 space-y-4">
              {/* Animation Controls */}
              <Card className="glass-panel border-white/10">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">Controls</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex flex-col gap-2">
                    <Button 
                      onClick={toggleAnimation}
                      className={`w-full ${isRunning ? "control-btn-secondary" : "control-btn-primary"}`}
                      size="sm"
                    >
                      {isRunning ? <Pause className="h-4 w-4 mr-2" /> : <Play className="h-4 w-4 mr-2" />}
                      {isRunning ? "Pause" : "Run Simulation"}
                    </Button>
                    <Button onClick={handleReset} variant="outline" size="sm" className="w-full">
                      <RotateCcw className="h-4 w-4 mr-2" />
                      Reset All
                    </Button>
                  </div>
                </CardContent>
              </Card>
              
              {/* Algorithm Parameters - Always visible */}
              <Card className="glass-panel border-white/10">
                <Collapsible open={isAlgorithmOpen} onOpenChange={setIsAlgorithmOpen}>
                  <CardHeader className="pb-3">
                    <CollapsibleTrigger className="flex items-center justify-between w-full text-left">
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Tooltip>
                          <TooltipTrigger>
                            <Info className="h-4 w-4 opacity-70" />
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Core parameters that control the optimization behavior</p>
                          </TooltipContent>
                        </Tooltip>
                        Algorithm Parameters
                      </CardTitle>
                      {isAlgorithmOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                    </CollapsibleTrigger>
                  </CardHeader>
                  <CollapsibleContent>
                    <CardContent className="space-y-4">
                      {/* Bits (r) */}
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <Label className="text-sm">Bits (r): {params.r}</Label>
                          <Tooltip>
                            <TooltipTrigger>
                              <Info className="h-3 w-3 opacity-50" />
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Number of bits in the solution representation</p>
                            </TooltipContent>
                          </Tooltip>
                        </div>
                        <Slider
                          value={[params.r]}
                          onValueChange={([value]) => handleParamChange('r', value)}
                          min={1}
                          max={10}
                          step={1}
                          className="w-full"
                        />
                      </div>
                      
                      {/* Max Iterations */}
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <Label className="text-sm">Max Iterations: {params.maxIterations}</Label>
                          <Tooltip>
                            <TooltipTrigger>
                              <Info className="h-3 w-3 opacity-50" />
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Maximum number of iterations to run</p>
                            </TooltipContent>
                          </Tooltip>
                        </div>
                        <Slider
                          value={[params.maxIterations]}
                          onValueChange={([value]) => handleParamChange('maxIterations', value)}
                          min={10}
                          max={500}
                          step={10}
                          className="w-full"
                        />
                      </div>
                      
                      {/* Initial Temperature */}
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <Label className="text-sm">Initial Temp: {params.initialTemperature.toFixed(1)}</Label>
                          <Tooltip>
                            <TooltipTrigger>
                              <Info className="h-3 w-3 opacity-50" />
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Starting temperature for exploration</p>
                            </TooltipContent>
                          </Tooltip>
                        </div>
                        <Slider
                          value={[params.initialTemperature]}
                          onValueChange={([value]) => handleParamChange('initialTemperature', value)}
                          min={0.1}
                          max={10.0}
                          step={0.1}
                          className="w-full"
                        />
                      </div>
                      
                      {/* Cooling Rate */}
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <Label className="text-sm">Cooling Rate: {params.coolingRate.toFixed(2)}</Label>
                          <Tooltip>
                            <TooltipTrigger>
                              <Info className="h-3 w-3 opacity-50" />
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Rate at which temperature decreases</p>
                            </TooltipContent>
                          </Tooltip>
                        </div>
                        <Slider
                          value={[params.coolingRate]}
                          onValueChange={([value]) => handleParamChange('coolingRate', value)}
                          min={0.5}
                          max={0.99}
                          step={0.01}
                          className="w-full"
                        />
                      </div>
                    </CardContent>
                  </CollapsibleContent>
                </Collapsible>
              </Card>
              
              {/* Algorithm Options */}
              <Card className="glass-panel border-white/10">
                <Collapsible open={isOptionsOpen} onOpenChange={setIsOptionsOpen}>
                  <CardHeader className="pb-3">
                    <CollapsibleTrigger className="flex items-center justify-between w-full text-left">
                      <CardTitle className="text-lg">Algorithm Options</CardTitle>
                      {isOptionsOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                    </CollapsibleTrigger>
                  </CardHeader>
                  <CollapsibleContent>
                    <CardContent className="space-y-4">
                      {/* Neighbor Type */}
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <Label className="text-sm">Neighbor Type</Label>
                          <Tooltip>
                            <TooltipTrigger>
                              <Info className="h-3 w-3 opacity-50" />
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>How neighboring solutions are generated</p>
                            </TooltipContent>
                          </Tooltip>
                        </div>
                        <RadioGroup
                          value={params.neighborType}
                          onValueChange={(value) => handleParamChange('neighborType', value)}
                          className="space-y-1"
                        >
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="Single Bit Flip" id="single" />
                            <Label htmlFor="single" className="text-xs">Single Bit Flip</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="Two Bit Flip" id="double" />
                            <Label htmlFor="double" className="text-xs">Two Bit Flip</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="Random Walk" id="random" />
                            <Label htmlFor="random" className="text-xs">Random Walk</Label>
                          </div>
                        </RadioGroup>
                      </div>
                      
                      {/* Cooling Schedule */}
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <Label className="text-sm">Cooling Schedule</Label>
                          <Tooltip>
                            <TooltipTrigger>
                              <Info className="h-3 w-3 opacity-50" />
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>How temperature decreases over time</p>
                            </TooltipContent>
                          </Tooltip>
                        </div>
                        <RadioGroup
                          value={params.coolingSchedule}
                          onValueChange={(value) => handleParamChange('coolingSchedule', value)}
                          className="space-y-1"
                        >
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="Geometric" id="geometric" />
                            <Label htmlFor="geometric" className="text-xs">Geometric</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="Linear" id="linear" />
                            <Label htmlFor="linear" className="text-xs">Linear</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="Logarithmic" id="logarithmic" />
                            <Label htmlFor="logarithmic" className="text-xs">Logarithmic</Label>
                          </div>
                        </RadioGroup>
                      </div>
                    </CardContent>
                  </CollapsibleContent>
                </Collapsible>
              </Card>
              
              {/* Polynomial Function - Collapsible */}
              <Card className="glass-panel border-white/10">
                <Collapsible open={isPolynomialOpen} onOpenChange={setIsPolynomialOpen}>
                  <CardHeader className="pb-3">
                    <CollapsibleTrigger className="flex items-center justify-between w-full text-left">
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Tooltip>
                          <TooltipTrigger>
                            <Info className="h-4 w-4 opacity-70" />
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Configure the polynomial function to optimize</p>
                          </TooltipContent>
                        </Tooltip>
                        Polynomial Function
                      </CardTitle>
                      {isPolynomialOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                    </CollapsibleTrigger>
                    <CardDescription className="text-xs mt-1">
                      f(n) = Σ aᵢ × nᵢ
                    </CardDescription>
                  </CardHeader>
                  <CollapsibleContent>
                    <CardContent className="space-y-3">
                      {/* Polynomial Degree */}
                      <div className="space-y-2">
                        <Label className="text-sm">Degree: {params.coefficients.length - 1}</Label>
                        <Slider
                          value={[params.coefficients.length - 1]}
                          onValueChange={([value]) => handleDegreeChange(value)}
                          min={0}
                          max={8}
                          step={1}
                          className="w-full"
                        />
                      </div>
                      
                      {/* Coefficient Sliders */}
                      <div className="space-y-2 max-h-40 overflow-y-auto">
                        {params.coefficients.map((coef, index) => (
                          <div key={index} className="space-y-1">
                            <Label className="text-xs">a{index}: {coef}</Label>
                            <Slider
                              value={[coef]}
                              onValueChange={([value]) => handleCoefficientChange(index, value)}
                              min={-5}
                              max={5}
                              step={1}
                              className="w-full"
                            />
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </CollapsibleContent>
                </Collapsible>
              </Card>
            </div>
          </div>
          
          {/* FIXED: Educational Content with added spacing */}
          <div className="max-w-4xl mx-auto mt-16">
            <Accordion type="single" collapsible className="glass-panel rounded-xl border-white/10">
              <AccordionItem value="overview">
                <AccordionTrigger className="px-6 text-lg font-medium">
                  Understanding Simulated Annealing: Toy Example
                </AccordionTrigger>
                <AccordionContent className="px-6 pb-6 space-y-4">
                  <p className="opacity-80 leading-relaxed">
                    Imagine you're searching for the tallest hill in a foggy landscape. Simulated annealing is your smart hiker—it explores carefully, sometimes going downhill to avoid missing the highest peak. Let's see how this works in our example!
                  </p>
                  
                  <div className="space-y-4">
                    <h4 className="font-medium text-lg">What Are We Solving?</h4>
                    <div className="space-y-2">
                      <p className="opacity-80"><strong>Your Goal:</strong></p>
                      <p className="opacity-80">Find the best 5-bit binary number (like 10101) that gives the highest score for this math formula:</p>
                      <p className="font-mono bg-secondary/30 p-2 rounded">f(n) = 1 - 2n + 3n² - n³ + 2n⁴ - n⁵</p>
                    </div>
                    
                    <div className="space-y-2">
                      <p className="opacity-80"><strong>Example:</strong></p>
                      <div className="bg-secondary/20 p-3 rounded space-y-1">
                        <p className="font-mono">n = 3 (binary 00011):</p>
                        <p className="font-mono">Score = 1 - 6 + 27 - 27 + 162 - 243 = -143</p>
                        <p className="font-mono">n = 1 (binary 00001):</p>
                        <p className="font-mono">Score = 1 - 2 + 3 - 1 + 2 - 1 = 2</p>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <p className="opacity-80"><strong>Why This Example?</strong></p>
                      <ul className="space-y-1 text-sm opacity-80 ml-4">
                        <li>• Simple enough to see all 32 possible solutions (with 5 bits).</li>
                        <li>• Shows how the algorithm balances exploring new areas and exploiting good finds.</li>
                      </ul>
                    </div>
                  </div>
                  
                  <div className="space-y-4 mt-6">
                    <h4 className="font-medium text-lg">How It Works</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-3">
                        <div>
                          <p className="font-medium">Step 1: Start Random</p>
                          <p className="text-sm opacity-80">The algorithm begins with a random guess, like 01011 (decimal 11).</p>
                        </div>
                        <div>
                          <p className="font-medium">Step 2: Flip a Bit</p>
                          <p className="text-sm opacity-80">It tweaks the solution slightly—flipping one bit (e.g., 01011 → 01010).</p>
                        </div>
                        <div>
                          <p className="font-medium">Step 3: Evaluate</p>
                          <p className="text-sm opacity-80">It calculates the score for both the old and new solutions.</p>
                        </div>
                      </div>
                      <div className="space-y-3">
                        <div>
                          <p className="font-medium">Step 4: Decide</p>
                          <ul className="text-sm opacity-80 ml-4">
                            <li>• If the new score is better, it keeps the new solution.</li>
                            <li>• If it's worse, it might still accept it (based on temperature).</li>
                          </ul>
                        </div>
                        <div>
                          <p className="font-medium">Step 5: Repeat</p>
                          <p className="text-sm opacity-80">This process repeats until the max iterations are reached.</p>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-4 mt-6">
                    <h4 className="font-medium text-lg">Key Concepts in Action</h4>
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b">
                            <th className="text-left p-2">Concept</th>
                            <th className="text-left p-2">What It Means</th>
                            <th className="text-left p-2">Visualization Connection</th>
                          </tr>
                        </thead>
                        <tbody className="opacity-80">
                          <tr className="border-b">
                            <td className="p-2 font-medium">Exploration</td>
                            <td className="p-2">Trying new solutions, even if they're worse early on.</td>
                            <td className="p-2">Red spikes in Acceptance Probability</td>
                          </tr>
                          <tr className="border-b">
                            <td className="p-2 font-medium">Exploitation</td>
                            <td className="p-2">Focusing on the best-known solutions as the algorithm "cools down."</td>
                            <td className="p-2">Stable bits in Binary State Heatmap</td>
                          </tr>
                          <tr>
                            <td className="p-2 font-medium">Temperature</td>
                            <td className="p-2">Starts high (adventurous) and cools over time (cautious).</td>
                            <td className="p-2">Sloping line in Acceptance Probability</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                  
                  <div className="space-y-4 mt-6">
                    <h4 className="font-medium text-lg">Why This Matters for You</h4>
                    <ul className="space-y-2 opacity-80">
                      <li><strong>See All Possibilities:</strong> With only 32 solutions, you can literally watch the algorithm explore every option.</li>
                      <li><strong>Learn by Doing:</strong> Adjust parameters and instantly see how the graphs change.</li>
                      <li><strong>Build Intuition:</strong> Understand how simulated annealing works before applying it to complex problems.</li>
                    </ul>
                    
                    <div className="bg-accent/10 p-4 rounded mt-4">
                      <h5 className="font-medium mb-2">Try This!</h5>
                      <ul className="space-y-1 text-sm opacity-80">
                        <li>1. Click Reset to start fresh.</li>
                        <li>2. Watch how the algorithm flips bits in the Binary State Heatmap.</li>
                        <li>3. Notice when the Acceptance Probability spikes (exploration) vs. drops (exploitation).</li>
                        <li><strong>Tip:</strong> Hover over graphs for instant tooltips! 🎯</li>
                      </ul>
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>
              
              <AccordionItem value="parameters">
                <AccordionTrigger className="px-6 text-lg font-medium">
                  Parameter Guide
                </AccordionTrigger>
                <AccordionContent className="px-6 pb-6 space-y-4">
                  <p className="opacity-80">Welcome! Here's a quick guide to the controls you see on this page. Adjusting these sliders and options will change how Simulated Annealing explores the search space.</p>
                  
                  <div className="space-y-6">
                    <div>
                      <h4 className="font-medium text-lg mb-3">Algorithm Parameters</h4>
                      <div className="space-y-4">
                        <div>
                          <p className="font-medium">Bits (r):</p>
                          <p className="text-sm opacity-80">Sets the problem size (number of binary digits)</p>
                          <p className="text-sm opacity-80">More bits = a bigger search space (for example, 5 bits means 32 possible solutions).</p>
                          <p className="text-sm text-accent"><strong>Beginner tip:</strong> Start with 5-8 bits to see clear patterns and fast results.</p>
                        </div>
                        
                        <div>
                          <p className="font-medium">Max Iterations:</p>
                          <p className="text-sm opacity-80">How many steps the algorithm takes</p>
                          <p className="text-sm opacity-80">More iterations = more chances to find the best solution.</p>
                          <p className="text-sm text-accent"><strong>Beginner tip:</strong> For small problems, 50-200 iterations is usually enough.</p>
                        </div>
                        
                        <div>
                          <p className="font-medium">Initial Temp:</p>
                          <p className="text-sm opacity-80">Controls how much the algorithm explores at the start</p>
                          <p className="text-sm opacity-80">Higher temperature = more risk-taking early on (the algorithm will try more "bad" moves).</p>
                          <p className="text-sm text-accent"><strong>Beginner tip:</strong> Try 1.0 for a careful search, or 10.0 for a bold, adventurous search.</p>
                        </div>
                        
                        <div>
                          <p className="font-medium">Cooling Rate:</p>
                          <p className="text-sm opacity-80">How quickly the algorithm becomes more selective</p>
                          <p className="text-sm opacity-80">0.99 = slow cooling (keeps exploring longer), 0.9 = fast cooling (settles down quickly).</p>
                          <p className="text-sm text-accent"><strong>Beginner tip:</strong> A slower cooling rate (0.95–0.99) usually finds better solutions.</p>
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="font-medium text-lg mb-3">Algorithm Options</h4>
                      <div className="space-y-4">
                        <div>
                          <p className="font-medium">Neighbor Type:</p>
                          <ul className="text-sm opacity-80 ml-4 space-y-1">
                            <li><strong>Single Bit Flip:</strong> Change just one bit at a time (small steps).</li>
                            <li><strong>Two Bit Flip:</strong> Change two bits at once (bigger jumps).</li>
                            <li><strong>Random Walk:</strong> Jump to a completely random solution (wild exploration).</li>
                          </ul>
                        </div>
                        
                        <div>
                          <p className="font-medium">Cooling Schedule:</p>
                          <ul className="text-sm opacity-80 ml-4 space-y-1">
                            <li><strong>Geometric:</strong> Temperature is multiplied by the cooling rate each step (default).</li>
                            <li><strong>Linear:</strong> Temperature drops by the same amount each time.</li>
                            <li><strong>Logarithmic:</strong> Temperature drops slowly at first, then faster.</li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>
              
              <AccordionItem value="visualization">
                <AccordionTrigger className="px-6 text-lg font-medium">
                  Understanding the Visualizations
                </AccordionTrigger>
                <AccordionContent className="px-6 pb-6 space-y-6">
                  <p className="opacity-80">Here's what each graph and statistic means as you run the simulation:</p>
                  
                  <div className="space-y-6">
                    <div>
                      <h4 className="font-medium text-lg">Function Value Evolution (Top Left)</h4>
                      <p className="text-sm opacity-80 mb-2"><strong>What you see:</strong> A line graph showing how good the current solution is at each step.</p>
                      <div className="space-y-1 text-sm opacity-80">
                        <p><strong>How to read it:</strong></p>
                        <ul className="ml-4 space-y-1">
                          <li>• Big jumps = the algorithm found a much better solution.</li>
                          <li>• Flat line = it's sticking with the current solution.</li>
                        </ul>
                        <p><strong>In your run:</strong> You might see a quick jump from a low value (like -330,000) to 0, then the line stays flat—meaning it found a good solution fast.</p>
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="font-medium text-lg">Binary State Representation (Top Right)</h4>
                      <p className="text-sm opacity-80 mb-2"><strong>What you see:</strong> A heatmap showing which bits are ON (blue) or OFF (empty) at each step.</p>
                      <div className="space-y-1 text-sm opacity-80">
                        <p><strong>How to read it:</strong></p>
                        <ul className="ml-4 space-y-1">
                          <li>• Each row is one iteration (time moves down).</li>
                          <li>• Each column is a bit (from left to right).</li>
                          <li>• If a column stays blue, that bit is important for a good solution!</li>
                        </ul>
                        <p><strong>In your run:</strong> The rightmost bit often stays ON, showing it's crucial for the best answer.</p>
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="font-medium text-lg">Acceptance Probability (Bottom Left)</h4>
                      <p className="text-sm opacity-80 mb-2"><strong>What you see:</strong> Red spikes showing how likely the algorithm is to accept a "worse" move at each step.</p>
                      <div className="space-y-1 text-sm opacity-80">
                        <p><strong>How to read it:</strong></p>
                        <ul className="ml-4 space-y-1">
                          <li>• High spikes = the algorithm is still exploring (taking risks).</li>
                          <li>• Near zero = it's only accepting better moves (being careful).</li>
                        </ul>
                        <p><strong>In your run:</strong> You'll see more spikes early on, then the line drops as the algorithm settles down.</p>
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="font-medium text-lg">State Space Exploration (Bottom Right)</h4>
                      <p className="text-sm opacity-80 mb-2"><strong>What you see:</strong> A scatter plot of all the solutions the algorithm has tried.</p>
                      <div className="space-y-1 text-sm opacity-80">
                        <p><strong>How to read it:</strong></p>
                        <ul className="ml-4 space-y-1">
                          <li>• X-axis: Solution as a decimal number (0–31 for 5 bits).</li>
                          <li>• Y-axis: How good that solution is.</li>
                          <li>• Blue dots = early tries, gray dots = later tries.</li>
                          <li>• Dots spread out = wide exploration; dots clustered = focusing on good areas.</li>
                        </ul>
                        <p><strong>In your run:</strong> The algorithm explores widely at first, then focuses on the best region.</p>
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="font-medium text-lg">Real-Time Statistics (Bottom Bar)</h4>
                      <ul className="space-y-1 text-sm opacity-80 ml-4">
                        <li><strong>Best Value:</strong> The highest score found so far.</li>
                        <li><strong>Best State:</strong> The binary solution that achieved the best value (for example, 00001).</li>
                        <li><strong>Accepted Worse:</strong> How many times the algorithm took a risk and accepted a worse solution.</li>
                        <li><strong>Progress:</strong> How many steps have been completed out of the total (e.g., 100/100).</li>
                      </ul>
                    </div>
                    
                    <div>
                      <h4 className="font-medium text-lg">How to Read the Results Together</h4>
                      <ul className="space-y-1 text-sm opacity-80 ml-4">
                        <li><strong>Quick convergence:</strong> If you see a sharp jump in the top-left graph, the algorithm found a great solution fast.</li>
                        <li><strong>Moderate exploration:</strong> If the "Accepted Worse" count is more than zero, the algorithm explored before settling.</li>
                        <li><strong>Final stabilization:</strong> The graphs flatten out, and the best solution stays the same—congratulations, you've optimized!</li>
                      </ul>
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
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
    </TooltipProvider>
  );
};

export default SimulatedAnnealingToy;
