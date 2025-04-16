export default function TestPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
      <h1 className="text-3xl font-bold text-blue-600 mb-6">Tailwind Test Page</h1>
      
      <div className="bg-white rounded-xl shadow-md p-6 w-full max-w-md">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Style Components</h2>
        
        <div className="space-y-4">
          <div className="bg-blue-50 p-4 rounded-lg">
            <p className="text-blue-700">This is a blue info box</p>
          </div>
          
          <div className="bg-green-50 p-4 rounded-lg">
            <p className="text-green-700">This is a green success box</p>
          </div>
          
          <div className="bg-red-50 p-4 rounded-lg">
            <p className="text-red-600">This is a red error box</p>
          </div>
          
          <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-all">
            Click Me
          </button>
        </div>
      </div>
    </div>
  );
} 