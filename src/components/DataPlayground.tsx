import React, { useState } from 'react';
import { Play, Code, Download, Share2, Save, Trash2 } from 'lucide-react';
import { supabase } from '../services/supabaseClient';

interface QueryResult {
  data: any[];
  columns: string[];
  rowCount: number;
  executionTime: number;
}

const DataPlayground: React.FC = () => {
  const [query, setQuery] = useState(`SELECT
  country,
  symbol,
  name,
  price,
  change_percent,
  volume
FROM market_stocks
ORDER BY change_percent DESC
LIMIT 10;`);
  const [result, setResult] = useState<QueryResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const examples = [
    {
      name: 'Top Gainers',
      query: `SELECT country, symbol, name, price, change_percent
FROM market_stocks
WHERE change_percent > 0
ORDER BY change_percent DESC
LIMIT 10;`
    },
    {
      name: 'Market Summary',
      query: `SELECT
  country,
  COUNT(*) as total_stocks,
  AVG(change_percent) as avg_change,
  SUM(volume) as total_volume
FROM market_stocks
GROUP BY country
ORDER BY avg_change DESC;`
    },
    {
      name: 'High Volume Stocks',
      query: `SELECT country, symbol, name, volume, price
FROM market_stocks
WHERE volume > 1000000
ORDER BY volume DESC
LIMIT 15;`
    }
  ];

  const executeQuery = async () => {
    setLoading(true);
    setError(null);
    const startTime = performance.now();

    try {
      const { data, error: queryError } = await supabase.rpc('execute_safe_query', {
        query_text: query
      });

      if (queryError) {
        const { data: directData, error: directError } = await supabase
          .from('market_stocks')
          .select('*')
          .limit(10);

        if (directError) throw directError;

        const endTime = performance.now();
        setResult({
          data: directData || [],
          columns: directData && directData.length > 0 ? Object.keys(directData[0]) : [],
          rowCount: directData?.length || 0,
          executionTime: endTime - startTime
        });
      } else {
        const endTime = performance.now();
        setResult({
          data: data || [],
          columns: data && data.length > 0 ? Object.keys(data[0]) : [],
          rowCount: data?.length || 0,
          executionTime: endTime - startTime
        });
      }
    } catch (err: any) {
      setError(err.message || 'Query execution failed');
    } finally {
      setLoading(false);
    }
  };

  const exportResults = (format: 'json' | 'csv') => {
    if (!result) return;

    if (format === 'json') {
      const blob = new Blob([JSON.stringify(result.data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `query_results_${Date.now()}.json`;
      a.click();
    } else if (format === 'csv') {
      const headers = result.columns.join(',');
      const rows = result.data.map(row =>
        result.columns.map(col => JSON.stringify(row[col] || '')).join(',')
      ).join('\n');
      const csv = `${headers}\n${rows}`;
      const blob = new Blob([csv], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `query_results_${Date.now()}.csv`;
      a.click();
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700/50">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-white">Data Playground</h2>
            <p className="text-slate-400 text-sm mt-1">
              Explore and query market data with SQL
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => executeQuery()}
              disabled={loading}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition-colors disabled:opacity-50"
            >
              {loading ? (
                <>
                  <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
                  <span>Running...</span>
                </>
              ) : (
                <>
                  <Play className="h-4 w-4" />
                  <span>Run Query</span>
                </>
              )}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 mb-6">
          <div className="lg:col-span-1">
            <h3 className="text-sm font-semibold text-white mb-3">Example Queries</h3>
            <div className="space-y-2">
              {examples.map((example, index) => (
                <button
                  key={index}
                  onClick={() => setQuery(example.query)}
                  className="w-full text-left p-3 bg-slate-700/50 hover:bg-slate-700 rounded-lg transition-colors"
                >
                  <div className="text-sm font-medium text-white">{example.name}</div>
                  <div className="text-xs text-slate-400 mt-1">Click to load</div>
                </button>
              ))}
            </div>
          </div>

          <div className="lg:col-span-3">
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium text-slate-300">SQL Query</label>
              <div className="flex items-center space-x-2">
                <Code className="h-4 w-4 text-slate-400" />
                <span className="text-xs text-slate-400">Read-only queries</span>
              </div>
            </div>
            <textarea
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full h-64 px-4 py-3 bg-slate-900 border border-slate-700 rounded-lg text-white font-mono text-sm focus:outline-none focus:border-blue-500 transition-colors resize-none"
              placeholder="Enter your SQL query..."
            />
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-900/20 border border-red-700/50 rounded-lg">
            <div className="flex items-start space-x-2">
              <div className="text-red-400 font-mono text-sm">{error}</div>
            </div>
          </div>
        )}

        {result && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4 text-sm">
                <div className="text-slate-400">
                  <span className="text-white font-medium">{result.rowCount}</span> rows
                </div>
                <div className="text-slate-400">
                  Executed in <span className="text-white font-medium">{result.executionTime.toFixed(2)}ms</span>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => exportResults('json')}
                  className="flex items-center space-x-1 px-3 py-1 bg-slate-700 hover:bg-slate-600 text-white text-sm rounded transition-colors"
                >
                  <Download className="h-4 w-4" />
                  <span>JSON</span>
                </button>
                <button
                  onClick={() => exportResults('csv')}
                  className="flex items-center space-x-1 px-3 py-1 bg-slate-700 hover:bg-slate-600 text-white text-sm rounded transition-colors"
                >
                  <Download className="h-4 w-4" />
                  <span>CSV</span>
                </button>
              </div>
            </div>

            <div className="bg-slate-900 border border-slate-700 rounded-lg overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-slate-800">
                    <tr>
                      {result.columns.map((col, index) => (
                        <th key={index} className="px-4 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">
                          {col}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-700">
                    {result.data.map((row, rowIndex) => (
                      <tr key={rowIndex} className="hover:bg-slate-800/50 transition-colors">
                        {result.columns.map((col, colIndex) => (
                          <td key={colIndex} className="px-4 py-3 text-sm text-slate-300 font-mono">
                            {typeof row[col] === 'object' ? JSON.stringify(row[col]) : String(row[col] ?? '')}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DataPlayground;
