export default function StatusIndicator({ label, status, icon: Icon }) {
  return (
    <div className="flex items-center gap-2">
      <div className={`w-3 h-3 rounded-full ${
        status ? 'bg-green-500 animate-pulse' : 'bg-red-500'
      }`}></div>
      <Icon size={16} className="text-gray-600" />
      <span className="text-sm text-gray-700">{label}</span>
      <span className={`text-sm font-medium ${status ? 'text-green-600' : 'text-red-600'}`}>
        {status ? 'Connected' : 'Disconnected'}
      </span>
    </div>
  );
}