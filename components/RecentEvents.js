import { Bell } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

export default function RecentEvents({ events }) {
  const getEventColor = (eventType) => {
    switch (eventType) {
      case 'PUMP_STATE_CHANGE':
        return 'border-blue-500';
      case 'MODE_CHANGE':
        return 'border-purple-500';
      case 'SENSOR_ERROR':
        return 'border-red-500';
      case 'CONFIG_CHANGE':
        return 'border-green-500';
      case 'MQTT_CONNECTED':
        return 'border-green-500';
      case 'INVALID_COMMAND':
        return 'border-yellow-500';
      default:
        return 'border-gray-500';
    }
  };

  const formatEventDetails = (event) => {
    const { event_type, mode, pump_state, event_data } = event;
    
    if (event_type === 'PUMP_STATE_CHANGE') {
      if (event_data?.waterLevel) {
        return `Pump ${pump_state} - Water level: ${event_data.waterLevel} cm (threshold: ${event_data.threshold} cm)`;
      }
      return `Pump ${pump_state} in ${mode} mode`;
    }
    
    if (event_type === 'MODE_CHANGE') {
      return `Mode changed to ${mode}`;
    }
    
    if (event_type === 'SENSOR_ERROR') {
      return `${event_data?.sensor || 'Sensor'} error: ${event_data?.reason || 'Unknown'}`;
    }
    
    if (event_type === 'CONFIG_CHANGE') {
      const changes = [];
      if (event_data?.tankHeight) changes.push(`Tank height: ${event_data.tankHeight} cm`);
      if (event_data?.debug) changes.push(`Debug: ${event_data.debug}`);
      return changes.join(', ') || 'Configuration updated';
    }
    
    if (event_type === 'MQTT_CONNECTED') {
      return 'MQTT connection established';
    }
    
    if (event_type === 'INVALID_COMMAND') {
      return `Invalid command: ${event_data?.reason || 'Unknown reason'}`;
    }
    
    return event_type;
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
        <Bell className="text-yellow-500" />
        Recent Events
      </h3>
      <div className="space-y-2 max-h-96 overflow-y-auto">
        {events.length === 0 ? (
          <p className="text-gray-500 text-sm text-center py-4">No recent events</p>
        ) : (
          events.map((event, index) => (
            <div 
              key={index} 
              className={`p-3 bg-gray-50 rounded-lg border-l-4 ${getEventColor(event.event_type)}`}
            >
              <div className="flex justify-between items-start">
                <span className="font-medium text-sm text-gray-900">
                  {event.event_type.replace(/_/g, ' ')}
                </span>
                <span className="text-xs text-gray-500">
                  {formatDistanceToNow(new Date(event.created_at), { addSuffix: true })}
                </span>
              </div>
              <p className="text-xs text-gray-600 mt-1">
                {formatEventDetails(event)}
              </p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}