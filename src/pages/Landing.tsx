
import React from "react";
import { Link } from "react-router-dom";
import { MoveRight, Compass, Atom, ChartLine, Code, Dices, Settings } from "lucide-react";

const Landing = () => {
  const visualizations = [
    {
      id: "simulated-annealing",
      title: "Simulated Annealing",
      description: "Interactive exploration of the Traveling Salesman Problem using simulated annealing optimization.",
      path: "/simulator",
      icon: <Compass className="h-6 w-6" />,
      tags: ["Optimization", "Metaheuristics", "Combinatorial"]
    },
    {
      id: "simulated-annealing-toy",
      title: "Simulated Annealing: Toy Example",
      description: "Learn simulated annealing concepts through polynomial optimization with binary-encoded solutions.",
      path: "/simulated-annealing-toy",
      icon: <Settings className="h-6 w-6" />,
      tags: ["Optimization", "Educational", "Binary Encoding"]
    },
    {
      id: "alias-method",
      title: "Alias Method",
      description: "Visualize how to efficiently sample from discrete probability distributions with the Alias Method.",
      path: "/alias-method",
      icon: <Dices className="h-6 w-6" />,
      tags: ["Probability", "Sampling", "Algorithm"]
    },
    // More visualizations will be added later
  ];

  return (
    <div className="min-h-screen bg-background text-foreground antialiased overflow-x-hidden">
      {/* Header */}
      <header className="w-full glass-panel border-b border-white/5">
        <div className="container py-6 px-4 md:px-8">
          <h1 className="text-2xl md:text-3xl font-light tracking-tight">
            Applied Statistical Mathematics
            <span className="text-sm ml-3 opacity-70 font-normal">
              Interactive Visualizations
            </span>
          </h1>
        </div>
      </header>
      
      {/* Hero section */}
      <section className="container px-4 md:px-8 py-16 md:py-24">
        <div className="max-w-4xl mx-auto space-y-8">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-gradient-primary">
            Explore Mathematics Through Interactive Visualizations
          </h1>
          
          <p className="text-xl opacity-80 max-w-3xl">
            Discover and understand complex statistical concepts and algorithms through 
            hands-on, interactive simulations and visualizations.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 pt-4">
            <a href="#visualizations" className="control-btn-primary flex items-center justify-center gap-2">
              Explore Visualizations
              <MoveRight className="h-4 w-4" />
            </a>
            
            <Link to="/about" className="control-btn flex items-center justify-center gap-2">
              About Project
              <Atom className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>
      
      {/* Visualizations section */}
      <section id="visualizations" className="container px-4 md:px-8 py-16">
        <div className="max-w-5xl mx-auto space-y-12">
          <div className="text-center space-y-4">
            <h2 className="text-3xl font-semibold">Available Visualizations</h2>
            <p className="opacity-70 max-w-2xl mx-auto">
              Select any of the interactive modules below to explore different ASM concepts and algorithms through hands-on simulations.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {visualizations.map((visualization) => (
              <Link 
                key={visualization.id}
                to={visualization.path}
                className="glass-panel p-6 rounded-xl transition-all hover:border-primary/40 hover:bg-secondary/30 group"
              >
                <div className="w-12 h-12 bg-accent/30 rounded-lg flex items-center justify-center mb-4 group-hover:bg-accent/50 transition-colors">
                  {visualization.icon}
                </div>
                
                <h3 className="text-xl font-medium mb-2 group-hover:text-primary transition-colors">{visualization.title}</h3>
                <p className="opacity-70 mb-4 text-sm">{visualization.description}</p>
                
                <div className="flex flex-wrap gap-2 mt-4">
                  {visualization.tags.map((tag) => (
                    <span key={tag} className="bg-secondary/50 px-2 py-1 rounded-md text-xs">
                      {tag}
                    </span>
                  ))}
                </div>
                
                <div className="flex justify-end mt-6">
                  <span className="text-sm flex items-center gap-1 text-primary group-hover:gap-2 transition-all">
                    Explore <MoveRight className="h-3 w-3" />
                  </span>
                </div>
              </Link>
            ))}

            {/* Placeholder for upcoming visualizations */}
            <div className="glass-panel p-6 rounded-xl border border-dashed border-white/20 flex flex-col items-center justify-center text-center space-y-3 min-h-[250px]">
              <ChartLine className="h-8 w-8 opacity-40" />
              <h3 className="text-xl font-medium opacity-70">More Visualizations Coming Soon</h3>
              <p className="text-sm opacity-50">
                Additional ASM concepts and algorithms will be added here
              </p>
            </div>
          </div>
        </div>
      </section>
      
      {/* Features section */}
      <section className="container px-4 md:px-8 py-16 bg-secondary/20 rounded-3xl my-8">
        <div className="max-w-4xl mx-auto space-y-12">
          <h2 className="text-3xl font-semibold text-center">Key Features</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="glass-panel p-6 rounded-xl space-y-4">
              <div className="w-12 h-12 bg-accent/30 rounded-lg flex items-center justify-center">
                <Code className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-medium">Interactive Learning</h3>
              <p className="opacity-70">Hands-on experience with mathematical concepts through adjustable parameters and real-time visualization.</p>
            </div>
            
            <div className="glass-panel p-6 rounded-xl space-y-4">
              <div className="w-12 h-12 bg-accent/30 rounded-lg flex items-center justify-center">
                <Compass className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-medium">Algorithm Exploration</h3>
              <p className="opacity-70">Visualize how complex algorithms work with step-by-step processes and intuitive interfaces.</p>
            </div>
            
            <div className="glass-panel p-6 rounded-xl space-y-4">
              <div className="w-12 h-12 bg-accent/30 rounded-lg flex items-center justify-center">
                <ChartLine className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-medium">Data Visualization</h3>
              <p className="opacity-70">See mathematical concepts come to life with dynamic charts and visual representations of complex data.</p>
            </div>
          </div>
        </div>
      </section>
      
      {/* Project info */}
      <section className="container px-4 md:px-8 py-8">
        <div className="max-w-4xl mx-auto glass-panel p-6 rounded-xl">
          <p className="text-center">
            <span className="opacity-70">Created by </span>
            <span className="font-medium">Divyanshu Lila</span>
            <span className="text-sm opacity-50 ml-2">2022A3PS1056G</span>
          </p>
        </div>
      </section>
      
      {/* Footer */}
      <footer className="w-full glass-panel border-t border-white/5 mt-16">
        <div className="container py-4 px-4 md:px-8 text-center opacity-70">
          <p className="text-sm">
            ASM Project • Visualizing Algorithms • BITS Pilani, K.K. Birla Goa Campus
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
