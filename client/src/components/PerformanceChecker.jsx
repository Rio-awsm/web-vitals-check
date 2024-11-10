import React, { useState, useEffect } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import {
  AlertCircle,
  Globe,
  Clock,
  Database,
  ArrowRight,
  Loader2,
  BarChart2,
  Sparkles,
} from "lucide-react";

const PerformanceChecker = () => {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [reports, setReports] = useState([]);
  const [error, setError] = useState("");
  const [activeMetric, setActiveMetric] = useState("performance");

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      const response = await fetch("http://localhost:5000/api/reports");
      const data = await response.json();
      setReports(data);
    } catch (err) {
      setError("Failed to fetch reports");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await fetch("http://localhost:5000/api/check", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      });

      if (!response.ok) throw new Error("Performance check failed");

      await fetchReports();
      setUrl("");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const getScoreGradient = (score) => {
    if (score >= 90) return "from-emerald-400 to-teal-500";
    if (score >= 50) return "from-amber-400 to-orange-500";
    return "from-rose-400 to-red-500";
  };

  const getScoreTextColor = (score) => {
    if (score >= 90) return "text-emerald-500";
    if (score >= 50) return "text-amber-500";
    return "text-rose-500";
  };

  const metrics = [
    {
      key: "performance",
      label: "Performance",
      color: "#8b5cf6",
      icon: Sparkles,
    },
    {
      key: "accessibility",
      label: "Accessibility",
      color: "#06b6d4",
      icon: Globe,
    },
    {
      key: "bestPractices",
      label: "Best Practices",
      color: "#3b82f6",
      icon: BarChart2,
    },
    { key: "seo", label: "SEO", color: "#6366f1", icon: Database },
  ];

  return (
    <div className="min-h-screen bg-slate-50/50">
      <div className="bg-white border-b border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-violet-500 to-purple-500">
            Web Performance Checker
          </h1>
          <p className="mt-2 text-slate-600">
            Analyze and optimize your website's performance metrics
          </p>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200/80 backdrop-blur-xl p-6 mb-8">
          <form
            onSubmit={handleSubmit}
            className="flex flex-col sm:flex-row gap-4"
          >
            <div className="relative flex-1">
              <Globe
                className="absolute left-3 top-3 text-slate-400"
                size={20}
              />
              <input
                type="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="Enter website URL (e.g., https://example.com)"
                required
                className="w-full pl-10 pr-4 py-3 bg-slate-50 border-slate-200 rounded-xl focus:ring-2 focus:ring-violet-500 focus:border-violet-500 outline-none transition-all duration-200"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center justify-center px-6 py-3 rounded-xl bg-gradient-to-r from-violet-500 to-purple-500 text-white font-medium hover:from-violet-600 hover:to-purple-600 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg shadow-violet-500/25"
            >
              {loading ? (
                <Loader2 className="animate-spin mr-2" size={20} />
              ) : (
                <ArrowRight className="mr-2" size={20} />
              )}
              {loading ? "Analyzing..." : "Analyze Website"}
            </button>
          </form>

          {error && (
            <div className="mt-4 flex items-center gap-2 text-rose-500 bg-rose-50 p-3 rounded-xl">
              <AlertCircle size={20} />
              <span>{error}</span>
            </div>
          )}
        </div>

        {reports.length > 0 && (
          <div className="space-y-8">
            {/* Latest Results Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {metrics.map(({ key, label, icon: Icon }) => (
                <div
                  key={key}
                  className="bg-white rounded-2xl shadow-sm border border-slate-200/80 p-6 hover:shadow-lg transition-all duration-300 group"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-xl bg-slate-100 text-slate-600 group-hover:bg-violet-100 group-hover:text-violet-600 transition-colors duration-300">
                        <Icon size={20} />
                      </div>
                      <h3 className="font-medium text-slate-900">{label}</h3>
                    </div>
                    <span
                      className={`text-2xl font-bold ${getScoreTextColor(
                        reports[0][key]
                      )}`}
                    >
                      {reports[0][key].toFixed(1)}%
                    </span>
                  </div>
                  <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full bg-gradient-to-r ${getScoreGradient(
                        reports[0][key]
                      )} transition-all duration-500`}
                      style={{ width: `${reports[0][key]}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>

            {/* Performance Metrics */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200/80 p-6">
              <h2 className="text-xl font-semibold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-violet-500 to-purple-500">
                Performance Metrics
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                  {
                    icon: Clock,
                    label: "Load Time",
                    value: `${(reports[0].loadTime / 1000).toFixed(2)}s`,
                  },
                  {
                    icon: Database,
                    label: "Resource Size",
                    value: `${(reports[0].resourceSize / 1024 / 1024).toFixed(
                      2
                    )} MB`,
                  },
                  {
                    icon: Globe,
                    label: "Request Count",
                    value: reports[0].requestCount,
                  },
                ].map((item, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-4 p-4 rounded-xl bg-slate-50 border border-slate-200/80"
                  >
                    <div className="p-3 rounded-xl bg-violet-100 text-violet-600">
                      <item.icon size={24} />
                    </div>
                    <div>
                      <p className="text-sm text-slate-500">{item.label}</p>
                      <p className="text-lg font-semibold text-slate-900">
                        {item.value}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Historical Performance Graph */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200/80 p-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                <h2 className="text-xl font-semibold bg-clip-text text-transparent bg-gradient-to-r from-violet-500 to-purple-500">
                  Performance History
                </h2>
                <div className="flex flex-wrap gap-2">
                  {metrics.map(({ key, label }) => (
                    <button
                      key={key}
                      onClick={() => setActiveMetric(key)}
                      className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                        activeMetric === key
                          ? "bg-violet-100 text-violet-700"
                          : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>
              <div className="h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={reports.slice().reverse()}
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis
                      dataKey="timestamp"
                      tickFormatter={(timestamp) =>
                        new Date(timestamp).toLocaleDateString()
                      }
                      stroke="#94a3b8"
                    />
                    <YAxis stroke="#94a3b8" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "white",
                        border: "none",
                        borderRadius: "12px",
                        boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                      }}
                    />
                    <Line
                      type="monotone"
                      dataKey={activeMetric}
                      stroke={
                        metrics.find((m) => m.key === activeMetric)?.color
                      }
                      strokeWidth={2}
                      dot={false}
                      activeDot={{ r: 6 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default PerformanceChecker;
