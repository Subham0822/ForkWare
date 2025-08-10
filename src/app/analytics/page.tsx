"use client";
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Utensils,
  Truck,
  HeartHandshake,
  Loader2,
  TrendingUp,
  Users,
  Globe,
  Award,
  AlertTriangle,
} from "lucide-react";
import {
  Bar,
  BarChart,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts";
import {
  ChartContainer,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import {
  calculateAnalyticsWithGemini,
  type AnalyticsData,
} from "@/lib/gemini-analytics";
import { getFoodListings } from "@/lib/database";

const chartConfig = {
  saved: {
    label: "Food Saved (kg)",
    color: "hsl(var(--primary))",
  },
};

export default function AnalyticsPage() {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAnalyticsData = async () => {
    try {
      setLoading(true);
      setError(null);

      console.log("Fetching food listings from database...");
      // Fetch food listings from database
      const foodListings = await getFoodListings();
      console.log("Food listings fetched:", foodListings.length, "items");

      console.log("Calculating analytics with Gemini AI...");
      // Calculate analytics using Gemini AI
      const analytics = await calculateAnalyticsWithGemini(foodListings);
      console.log("Analytics calculated:", analytics);
      setAnalyticsData(analytics);
    } catch (err) {
      console.error("Error fetching analytics:", err);
      const errorMessage =
        err instanceof Error ? err.message : "Unknown error occurred";
      setError(
        `Failed to load analytics data: ${errorMessage}. Please try again later.`
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalyticsData();
  }, []);

  // Mock data for demonstration
  const mockStats = [
    {
      label: "Total Food Saved",
      value: "2,847 kg",
      icon: TrendingUp,
      color: "text-green-500",
      change: "+12%",
    },
    {
      label: "Active Volunteers",
      value: "156",
      icon: Users,
      color: "text-blue-500",
      change: "+8%",
    },
    {
      label: "Partner Canteens",
      value: "34",
      icon: Utensils,
      color: "text-purple-500",
      change: "+5%",
    },
    {
      label: "Cities Covered",
      value: "18",
      icon: Globe,
      color: "text-orange-500",
      change: "+3%",
    },
  ];

  if (loading) {
    return (
      <div className="container mx-auto py-10 px-4 md:px-6">
        {/* Header */}
        <div className="flex justify-between items-center mb-12 animate-fade-in-down">
          <div>
            <h1 className="text-4xl md:text-5xl font-headline font-bold gradient-text">
              Platform Analytics
            </h1>
            <p className="text-xl text-muted-foreground mt-2">
              AI-powered insights into food waste reduction and community impact
            </p>
          </div>
          <button
            onClick={() => {
              setLoading(true);
              setError(null);
              fetchAnalyticsData();
            }}
            className="px-6 py-3 bg-gradient-primary text-white rounded-xl hover:shadow-glow-lg transition-all duration-300 flex items-center space-x-2 group hover:scale-105"
            disabled={loading}
          >
            <Loader2 className={`h-5 w-5 ${loading ? "animate-spin" : ""}`} />
            <span className="group-hover:translate-x-0.5 transition-transform duration-200">
              Refresh Data
            </span>
          </button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12">
          {mockStats.map((stat, index) => (
            <div
              key={stat.label}
              className="glass-card text-center group hover:scale-105 transition-all duration-300 animate-fade-in-up"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div
                className={`mx-auto w-16 h-16 bg-gradient-primary rounded-full flex items-center justify-center mb-4 shadow-lg group-hover:shadow-xl transition-all duration-300`}
              >
                <stat.icon className={`h-8 w-8 text-white`} />
              </div>
              <div className="text-2xl font-bold font-headline mb-2">
                {stat.value}
              </div>
              <div className="text-sm text-muted-foreground mb-1">
                {stat.label}
              </div>
              <div className="text-xs text-green-500 font-medium">
                {stat.change}
              </div>
            </div>
          ))}
        </div>

        {/* Loading State */}
        <div className="flex items-center justify-center h-64">
          <div className="flex flex-col items-center space-y-6">
            <div className="relative">
              <div className="w-16 h-16 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
              <div
                className="absolute inset-0 w-16 h-16 border-4 border-transparent border-t-secondary rounded-full animate-spin"
                style={{
                  animationDirection: "reverse",
                  animationDuration: "2s",
                }}
              ></div>
            </div>
            <div className="text-center space-y-2">
              <p className="text-lg font-medium text-muted-foreground">
                Calculating analytics with AI...
              </p>
              <p className="text-sm text-muted-foreground">
                This may take a few moments
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto py-10 px-4 md:px-6">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-headline font-bold">
            Platform Analytics
          </h1>
          <button
            onClick={() => {
              setLoading(true);
              setError(null);
              fetchAnalyticsData();
            }}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 flex items-center space-x-2"
          >
            <Loader2 className="h-4 w-4" />
            <span>Retry</span>
          </button>
        </div>
        <div className="glass-card text-center py-16">
          <div className="w-24 h-24 bg-gradient-accent rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
            <AlertTriangle className="h-12 w-12 text-white" />
          </div>
          <h3 className="text-2xl font-headline font-semibold mb-4">
            Error Loading Analytics
          </h3>
          <p className="text-muted-foreground max-w-md mx-auto mb-6">{error}</p>
          <button
            onClick={() => {
              setLoading(true);
              setError(null);
              fetchAnalyticsData();
            }}
            className="px-6 py-3 bg-gradient-primary text-white rounded-xl hover:shadow-glow-lg transition-all duration-300 hover:scale-105"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-10 px-4 md:px-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-12 animate-fade-in-down">
        <div>
          <h1 className="text-4xl md:text-5xl font-headline font-bold gradient-text">
            Platform Analytics
          </h1>
          <p className="text-xl text-muted-foreground mt-2">
            AI-powered insights into food waste reduction and community impact
          </p>
        </div>
        <button
          onClick={() => {
            setLoading(true);
            setError(null);
            fetchAnalyticsData();
          }}
          className="px-6 py-3 bg-gradient-primary text-white rounded-xl hover:shadow-glow-lg transition-all duration-300 flex items-center space-x-2 group hover:scale-105"
        >
          <Loader2 className="h-5 w-5" />
          <span className="group-hover:translate-x-0.5 transition-transform duration-200">
            Refresh Data
          </span>
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12">
        {mockStats.map((stat, index) => (
          <div
            key={stat.label}
            className="glass-card text-center group hover:scale-105 transition-all duration-300 animate-fade-in-up"
            style={{ animationDelay: `${index * 0.1}s` }}
          >
            <div
              className={`mx-auto w-16 h-16 bg-gradient-primary rounded-full flex items-center justify-center mb-4 shadow-lg group-hover:shadow-xl transition-all duration-300`}
            >
              <stat.icon className={`h-8 w-8 text-white`} />
            </div>
            <div className="text-2xl font-bold font-headline mb-2">
              {stat.value}
            </div>
            <div className="text-sm text-muted-foreground mb-1">
              {stat.label}
            </div>
            <div className="text-xs text-green-500 font-medium">
              {stat.change}
            </div>
          </div>
        ))}
      </div>

      {/* Analytics Content */}
      {analyticsData && (
        <div className="space-y-8 animate-fade-in-up">
          {/* Charts and other analytics content would go here */}
          <div className="glass-card">
            <h3 className="text-2xl font-headline font-semibold mb-6">
              Analytics Data Loaded
            </h3>
            <p className="text-muted-foreground">
              Analytics data has been successfully loaded and processed by AI.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
