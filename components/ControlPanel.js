import { Settings, Power } from 'lucide-react';

export default function ControlPanel({ 
  mode, 
  pumpState, 
  onModeChange, 
  onPumpToggle, 
  onTankHeightChange,
  onDebugToggle,
  tankHeight,
  debug,
  disabled 
}) {
  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
        <Settings className="text-purple-500" />
        Control Panel
      </h3>
      
      <div className="space-y-4">
        {/* Mode Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Operation Mode
          </label>
          <div className="flex gap-2">
            <button
              onClick={() => onModeChange('AUTO')}
              disabled={disabled}
              className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors ${
                mode === 'AUTO'
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              AUTO
            </button>
            <button
              onClick={() => onModeChange('MANUAL')}
              disabled={disabled}
              className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors ${
                mode === 'MANUAL'
                  ? 'bg-orange-500 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              MANUAL
            </button>
          </div>
        </div>

        {/* Pump Control */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Pump Control
          </label>
          <button
            onClick={onPumpToggle}
            disabled={disabled || mode === 'AUTO'}
            className={`w-full py-3 px-4 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 ${
              pumpState
                ? 'bg-green-500 text-white hover:bg-green-600'
                : 'bg-red-500 text-white hover:bg-red-600'
            } ${(disabled || mode === 'AUTO') ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            <Power size={20} />
            {pumpState ? 'Turn OFF' : 'Turn ON'}
          </button>
          {mode === 'AUTO' && (
            <p className="text-xs text-gray-500 mt-2 text-center">
              Pump control is disabled in AUTO mode
            </p>
          )}
        </div>

        {/* Tank Height Setting */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Tank Height (cm)
          </label>
          <input
            type="number"
            min="1"
            max="100"
            value={tankHeight}
            onChange={(e) => onTankHeightChange(e.target.value)}
            disabled={disabled}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Debug Mode */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Debug Mode
          </label>
          <div className="flex gap-2">
            <button
              onClick={() => onDebugToggle('ON')}
              disabled={disabled}
              className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors ${
                debug === 'ON'
                  ? 'bg-green-500 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              ON
            </button>
            <button
              onClick={() => onDebugToggle('OFF')}
              disabled={disabled}
              className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors ${
                debug === 'OFF'
                  ? 'bg-gray-500 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              OFF
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}