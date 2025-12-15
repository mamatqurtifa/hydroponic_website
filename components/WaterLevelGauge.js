import { Droplets } from 'lucide-react';

export default function WaterLevelGauge({ height, tankHeight }) {
  const percentage = (height / tankHeight) * 100;
  
  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
        <Droplets className="text-blue-500" />
        Water Level
      </h3>
      <div className="relative h-64 bg-gray-100 rounded-lg overflow-hidden">
        {/* Water fill */}
        <div 
          className="absolute bottom-0 w-full bg-linear-to-t from-blue-500 to-blue-300 transition-all duration-1000"
          style={{ height: `${Math.min(percentage, 100)}%` }}
        >
          <div className="absolute inset-0 opacity-20 animate-pulse bg-white"></div>
        </div>
        
        {/* Center display */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center bg-white bg-opacity-90 px-6 py-3 rounded-lg shadow">
            <div className="text-4xl font-bold text-gray-900">{percentage.toFixed(0)}%</div>
            <div className="text-sm text-gray-600 mt-1">
              {height.toFixed(1)} / {tankHeight} cm
            </div>
          </div>
        </div>
        
        {/* Threshold indicators */}
        <div className="absolute right-0 h-full w-2 border-l-2 border-dashed border-gray-400">
          <div className="absolute right-2 top-[20%]">
            <span className="text-xs text-gray-600 bg-white px-1 rounded">80%</span>
          </div>
          <div className="absolute right-2 top-[70%]">
            <span className="text-xs text-gray-600 bg-white px-1 rounded">30%</span>
          </div>
        </div>
      </div>
    </div>
  );
}