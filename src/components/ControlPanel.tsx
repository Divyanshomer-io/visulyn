
import React, { useState } from "react";
import { ControlPanelProps } from "@/utils/types";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";
import { Play, Pause, RefreshCw, Trash2, Plus, ChevronDown, ChevronUp } from "lucide-react";

const ControlPanel: React.FC<ControlPanelProps> = ({
  state,
  params,
  onParamsChange,
  onClearCities,
  onReset,
  onRandomizeCities,
  onStartStop,
  onSpeedChange,
}) => {
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [cityCount, setCityCount] = useState(10);
  const [tempParams, setTempParams] = useState(params);
  
  const handleParamChange = (key: keyof typeof tempParams, value: number) => {
    const updatedParams = { ...tempParams, [key]: value };
    setTempParams(updatedParams);
    onParamsChange(updatedParams);
  };
  
  const handleCityCountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const count = parseInt(e.target.value) || 5;
    setCityCount(Math.max(3, Math.min(50, count)));
  };
  
  return (
    <div className="glass-panel rounded-xl p-6 space-y-6">
      <div className="flex flex-col space-y-2">
        <h2 className="text-lg font-medium mb-2">Simulation Controls</h2>
        
        <div className="flex flex-wrap gap-3">
          <Button
            onClick={onStartStop}
            className={`flex items-center gap-2 ${state.isRunning ? 'bg-amber-600 hover:bg-amber-700' : 'bg-blue-600 hover:bg-blue-700'}`}
            disabled={state.cities.length < 3}
          >
            {state.isRunning ? (
              <>
                <Pause size={18} /> Pause
              </>
            ) : (
              <>
                <Play size={18} /> Run
              </>
            )}
          </Button>
          
          <Button
            onClick={onReset}
            className="bg-purple-600 hover:bg-purple-700 text-white flex items-center gap-2"
            disabled={state.isRunning}
          >
            <RefreshCw size={18} /> Reset
          </Button>
          
          <Button
            onClick={onClearCities}
            className="bg-rose-600 hover:bg-rose-700 flex items-center gap-2"
            disabled={state.isRunning || state.cities.length === 0}
          >
            <Trash2 size={18} /> Clear
          </Button>
        </div>
      </div>
      
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <div className="flex-1">
            <label className="text-sm opacity-80 mb-1 block">Random Cities</label>
            <div className="flex items-center gap-2">
              <Input
                type="number"
                value={cityCount}
                onChange={handleCityCountChange}
                min={3}
                max={50}
                className="w-16 text-center bg-secondary/50"
                disabled={state.isRunning}
              />
              <Button
                onClick={() => onRandomizeCities(cityCount)}
                className="bg-teal-600 hover:bg-teal-700 text-white flex items-center gap-2"
                disabled={state.isRunning}
              >
                <Plus size={18} /> Generate
              </Button>
            </div>
          </div>
          
          <div className="flex-1">
            <label className="text-sm opacity-80 mb-1 block">Animation Speed</label>
            <Slider
              value={[state.animationSpeed]}
              min={0.5}
              max={5}
              step={0.5}
              onValueChange={([value]) => onSpeedChange(value)}
              className="py-2"
            />
            <div className="flex justify-between text-xs opacity-60 mt-1">
              <span>Slow</span>
              <span>Fast</span>
            </div>
          </div>
        </div>
        
        <div className="pt-2">
          <button
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="flex items-center text-sm text-accent hover:text-accent/80 transition-colors font-medium"
          >
            {showAdvanced ? (
              <>
                <ChevronUp size={16} className="mr-1" /> Hide Advanced Options
              </>
            ) : (
              <>
                <ChevronDown size={16} className="mr-1" /> Show Advanced Options
              </>
            )}
          </button>
          
          {showAdvanced && (
            <div className="mt-4 space-y-4 animate-slide-up">
              <div>
                <label className="text-sm opacity-80 mb-1 block">Initial Temperature: {tempParams.initialTemperature}</label>
                <Slider
                  value={[tempParams.initialTemperature]}
                  min={100}
                  max={5000}
                  step={100}
                  onValueChange={([value]) => handleParamChange("initialTemperature", value)}
                  disabled={state.isRunning}
                  className="py-2"
                />
                <div className="flex justify-between text-xs opacity-60 mt-1">
                  <span>Lower (100)</span>
                  <span>Higher (5000)</span>
                </div>
              </div>
              
              <div>
                <label className="text-sm opacity-80 mb-1 block">Cooling Rate: {tempParams.coolingRate.toFixed(4)}</label>
                <Slider
                  value={[tempParams.coolingRate * 1000]}
                  min={800}
                  max={999}
                  step={1}
                  onValueChange={([value]) => handleParamChange("coolingRate", value / 1000)}
                  disabled={state.isRunning}
                  className="py-2"
                />
                <div className="flex justify-between text-xs opacity-60 mt-1">
                  <span>Faster cooling (0.8)</span>
                  <span>Slower cooling (0.999)</span>
                </div>
              </div>
              
              <div>
                <label className="text-sm opacity-80 mb-1 block">Total Iterations: {tempParams.totalIterations}</label>
                <Slider
                  value={[tempParams.totalIterations]}
                  min={100}
                  max={10000}
                  step={100}
                  onValueChange={([value]) => handleParamChange("totalIterations", value)}
                  disabled={state.isRunning}
                  className="py-2"
                />
                <div className="flex justify-between text-xs opacity-60 mt-1">
                  <span>Fewer (100)</span>
                  <span>More (10000)</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ControlPanel;
