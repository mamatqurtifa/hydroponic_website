export default function MetricCard({ icon: Icon, label, value, unit, status }) {
  return (
    <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2 text-gray-600 mb-2">
            <Icon size={20} />
            <span className="text-sm font-medium">{label}</span>
          </div>
          <div className="text-3xl font-bold text-gray-900">
            {value}
            <span className="text-lg text-gray-500 ml-1">{unit}</span>
          </div>
        </div>
        {status && (
          <span className={`px-2 py-1 text-xs rounded-full ${
            status === 'good' ? 'bg-green-100 text-green-800' :
            status === 'warning' ? 'bg-yellow-100 text-yellow-800' :
            'bg-red-100 text-red-800'
          }`}>
            {status}
          </span>
        )}
      </div>
    </div>
  );
}