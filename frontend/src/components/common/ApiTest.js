import React, { useState } from 'react';
import axios from '../../utils/api';

const ApiTest = () => {
  const [testResult, setTestResult] = useState('');
  const [loading, setLoading] = useState(false);

  const testApiConnection = async () => {
    setLoading(true);
    try {
      const response = await axios.get('/api/admin/stats/');
      setTestResult(`✅ API Connection Successful! Found ${response.data.total_users} users, ${response.data.total_courses} courses`);
    } catch (error) {
      setTestResult(`❌ API Connection Failed: ${error.message}`);
    }
    setLoading(false);
  };

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">API Connection Test</h2>
      <button
        onClick={testApiConnection}
        disabled={loading}
        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded disabled:opacity-50"
      >
        {loading ? 'Testing...' : 'Test API Connection'}
      </button>
      {testResult && (
        <div className="mt-4 p-4 bg-gray-100 rounded">
          <pre>{testResult}</pre>
        </div>
      )}
    </div>
  );
};

export default ApiTest; 