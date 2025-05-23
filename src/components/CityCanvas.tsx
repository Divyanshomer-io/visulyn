import React, { useRef, useEffect, useState } from "react";
import { CityCanvasProps } from "@/utils/types";

const CityCanvas: React.FC<CityCanvasProps> = ({ state, onAddCity }) => {
  const canvasRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const [canvasSize, setCanvasSize] = useState({ width: 0, height: 0 });
  
  useEffect(() => {
    const updateCanvasSize = () => {
      if (canvasRef.current) {
        const { width, height } = canvasRef.current.getBoundingClientRect();
        setCanvasSize({ width, height });
      }
    };
    
    updateCanvasSize();
    window.addEventListener("resize", updateCanvasSize);
    return () => window.removeEventListener("resize", updateCanvasSize);
  }, []);
  
  const handleCanvasClick = (e: React.MouseEvent) => {
    if (canvasRef.current && !state.isRunning) {
      const rect = canvasRef.current.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width;
      const y = (e.clientY - rect.top) / rect.height;
      onAddCity(x, y);
    }
  };
  
  const toPixels = (coord: number, dimension: 'width' | 'height') => {
    return coord * canvasSize[dimension];
  };
  
  const renderGrid = () => {
    const gridLines = [];
    const spacing = 0.1; // 10% of canvas
    
    for (let x = 0; x <= 1; x += spacing) {
      gridLines.push(
        <line
          key={`vline-${x}`}
          x1={toPixels(x, 'width')}
          y1={0}
          x2={toPixels(x, 'width')}
          y2={canvasSize.height}
          className="grid-lines opacity-30"
        />
      );
    }
    
    for (let y = 0; y <= 1; y += spacing) {
      gridLines.push(
        <line
          key={`hline-${y}`}
          x1={0}
          y1={toPixels(y, 'height')}
          x2={canvasSize.width}
          y2={toPixels(y, 'height')}
          className="grid-lines opacity-30"
        />
      );
    }
    
    return gridLines;
  };

  const renderPaths = () => {
    if (state.cities.length < 2) return null;
    
    let currentPathData = "";
    if (state.currentPath.length > 0) {
      const startX = toPixels(state.cities[0].x, 'width');
      const startY = toPixels(state.cities[0].y, 'height');
      currentPathData = `M ${startX} ${startY}`;
      
      for (const cityIndex of state.currentPath) {
        const city = state.cities[cityIndex];
        const x = toPixels(city.x, 'width');
        const y = toPixels(city.y, 'height');
        currentPathData += ` L ${x} ${y}`;
      }
      
      currentPathData += ` L ${startX} ${startY}`;
    }
    
    let bestPathData = "";
    if (state.bestPath.length > 0) {
      const startX = toPixels(state.cities[0].x, 'width');
      const startY = toPixels(state.cities[0].y, 'height');
      bestPathData = `M ${startX} ${startY}`;
      
      for (const cityIndex of state.bestPath) {
        const city = state.cities[cityIndex];
        const x = toPixels(city.x, 'width');
        const y = toPixels(city.y, 'height');
        bestPathData += ` L ${x} ${y}`;
      }
      
      bestPathData += ` L ${startX} ${startY}`;
    }
    
    return (
      <>
        <path 
          d={currentPathData} 
          className="path-current opacity-100"
          strokeDasharray="none"
        />
        
        <path 
          d={bestPathData} 
          className="path-best"
          strokeDasharray={state.isRunning ? "1" : "none"}
          strokeDashoffset={state.isRunning ? "1" : "0"}
        />
      </>
    );
  };
  
  const renderCities = () => {
    return state.cities.map((city, index) => {
      const x = toPixels(city.x, 'width');
      const y = toPixels(city.y, 'height');
      
      return (
        <g key={`city-${city.id}`} className="animate-fade-in" style={{ 
          animationDelay: `${index * 30}ms` 
        }}>
          <circle 
            cx={x} 
            cy={y} 
            r={5} 
            className={index === 0 ? "fill-tsp-start" : "fill-tsp-city"}
          />
          
          <text 
            x={x} 
            y={y - 10} 
            className="fill-white text-xs font-medium" 
            textAnchor="middle"
          >
            {index === 0 ? "Start" : index}
          </text>
          
          {index === 0 && (
            <circle 
              cx={x} 
              cy={y} 
              r={10} 
              className="fill-transparent stroke-tsp-start opacity-30 animate-pulse-subtle" 
              strokeWidth={2}
            />
          )}
        </g>
      );
    });
  };
  
  return (
    <div 
      ref={canvasRef}
      className="w-full h-[500px] glass-panel rounded-xl overflow-hidden canvas-container relative cursor-crosshair"
      onClick={handleCanvasClick}
    >
      {state.cities.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center opacity-70 animate-pulse-subtle">
            <p className="text-xl font-light">Click to add cities</p>
            <p className="text-sm mt-1">The first city will be the starting point</p>
          </div>
        </div>
      )}
      
      <svg
        ref={svgRef}
        width={canvasSize.width}
        height={canvasSize.height}
        className="w-full h-full"
      >
        {renderGrid()}
        
        {renderPaths()}
        
        {renderCities()}
      </svg>
      
      {state.isRunning && (
        <div className="absolute bottom-4 right-4 glass-panel px-3 py-1 rounded-lg text-sm animate-fade-in">
          <span className="inline-block w-2 h-2 bg-tsp-best rounded-full mr-2 animate-pulse-subtle"></span>
          Optimizing path...
        </div>
      )}
    </div>
  );
};

export default CityCanvas;
