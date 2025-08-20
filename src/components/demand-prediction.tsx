"use client";

import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  Legend,
} from "recharts";
import {
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Clock,
  RefreshCw,
  Brain,
  Target,
  BarChart3,
  PieChart as PieChartIcon,
  Activity,
  Loader2,
} from "lucide-react";
import { DemandPrediction } from "@/lib/demand-prediction";

interface DemandPredictionProps {
  eventId?: string;
  onPredictionGenerated?: (prediction: DemandPrediction) => void;
}

const COLORS = {
  veg: "#22c55e",
  nonVeg: "#ef4444",
  desserts: "#f59e0b",
  beverages: "#3b82f6",
  low: "#22c55e",
  medium: "#f59e0b",
  high: "#ef4444",
};

export function DemandPredictionComponent({
  eventId,
  onPredictionGenerated,
}: DemandPredictionProps) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [predictions, setPredictions] = useState<DemandPrediction[]>([]);
  const [loadingPredictions, setLoadingPredictions] = useState(false);
  const [selectedEventId, setSelectedEventId] = useState<string>(eventId || "");
  const [availableEvents, setAvailableEvents] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState("overview");

  useEffect(() => {
    if (eventId) {
      setSelectedEventId(eventId);
    }
    loadAvailableEvents();
    loadPredictions();
  }, [eventId]);

  const loadAvailableEvents = async () => {
    try {
      console.log("🔄 Loading available events...");
      const response = await fetch("/api/events");
      if (response.ok) {
        const data = await response.json();
        console.log("📊 Events API response:", data);
        // The API returns events directly, not wrapped in an events property
        const events = Array.isArray(data) ? data : [];
        // Filter to only show upcoming events for predictions
        const upcomingEvents = events.filter(
          (event) => event.status === "upcoming"
        );
        console.log("🎯 Upcoming events for predictions:", upcomingEvents);
        setAvailableEvents(upcomingEvents);
      } else {
        console.error(
          "❌ Events API error:",
          response.status,
          response.statusText
        );
      }
    } catch (error) {
      console.error("❌ Error loading events:", error);
    }
  };

  const loadPredictions = async () => {
    setLoadingPredictions(true);
    try {
      console.log("🔄 Loading existing demand predictions...");
      const response = await fetch("/api/ai/demand-prediction");
      if (response.ok) {
        const data = await response.json();
        console.log("📊 Predictions API response:", data);

        if (data.success && data.predictions) {
          setPredictions(data.predictions);
          console.log(
            `✅ Loaded ${data.predictions.length} existing predictions`
          );
        } else {
          console.log(
            "⚠️ No predictions found or API response format unexpected"
          );
          setPredictions([]);
        }
      } else {
        console.error(
          "❌ Predictions API error:",
          response.status,
          response.statusText
        );
        setPredictions([]);
      }
    } catch (error) {
      console.error("❌ Error loading predictions:", error);
      setPredictions([]);
    } finally {
      setLoadingPredictions(false);
    }
  };

  const generatePrediction = async () => {
    if (!selectedEventId) {
      toast({
        title: "No Event Selected",
        description: "Please select an event to generate a prediction.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      console.log("🚀 Generating AI prediction for event:", selectedEventId);
      const response = await fetch("/api/ai/demand-prediction", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ eventId: selectedEventId }),
      });

      if (response.ok) {
        const data = await response.json();
        console.log("📊 Prediction API response:", data);

        if (data.success && data.prediction) {
          const newPrediction = data.prediction;
          console.log("✅ New prediction generated:", newPrediction);

          // Add to local state
          setPredictions((prev) => [newPrediction, ...prev]);

          // Call callback if provided
          if (onPredictionGenerated) {
            onPredictionGenerated(newPrediction);
          }

          toast({
            title: "Prediction Generated",
            description: `AI has predicted ${newPrediction.predictedSurplus.totalKg.toFixed(
              1
            )}kg of surplus food for ${newPrediction.eventName}`,
          });

          // Reload predictions to ensure we have the latest data
          setTimeout(() => {
            loadPredictions();
          }, 1000);
        } else {
          throw new Error("Invalid prediction response format");
        }
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to generate prediction");
      }
    } catch (error) {
      console.error("❌ Error generating prediction:", error);
      toast({
        title: "Prediction Failed",
        description:
          error instanceof Error
            ? error.message
            : "Failed to generate AI prediction. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const updatePrediction = async (predictionEventId: string) => {
    setLoading(true);
    try {
      const response = await fetch("/api/ai/demand-prediction", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          eventId: predictionEventId,
          action: "update",
        }),
      });

      if (response.ok) {
        const data = await response.json();
        const updatedPrediction = data.prediction;

        setPredictions((prev) =>
          prev.map((p) =>
            p.eventId === predictionEventId ? updatedPrediction : p
          )
        );

        toast({
          title: "Prediction Updated",
          description: "AI prediction has been refreshed with latest data.",
        });
      } else {
        throw new Error("Failed to update prediction");
      }
    } catch (error) {
      console.error("Error updating prediction:", error);
      toast({
        title: "Update Failed",
        description: "Failed to update prediction. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getRiskColor = (riskLevel: string) => {
    return COLORS[riskLevel as keyof typeof COLORS] || COLORS.medium;
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return COLORS.low;
    if (confidence >= 0.6) return COLORS.medium;
    return COLORS.high;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const renderOverview = () => (
    <div className="space-y-6">
      {/* Prediction Generation */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5" />
            Generate AI Prediction
          </CardTitle>
          <CardDescription>
            Use AI to predict surplus food generation for upcoming events
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="eventSelect">Select Event</Label>
              <Select
                value={selectedEventId}
                onValueChange={setSelectedEventId}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Choose an event" />
                </SelectTrigger>
                <SelectContent>
                  {availableEvents
                    .filter((event) => event.status === "upcoming")
                    .map((event) => (
                      <SelectItem key={event.id} value={event.id}>
                        {event.name} - {formatDate(event.date)}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-end">
              <Button
                onClick={generatePrediction}
                disabled={loading || !selectedEventId}
                className="w-full"
              >
                {loading ? (
                  <RefreshCw className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <Brain className="h-4 w-4 mr-2" />
                )}
                Generate Prediction
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recent Predictions */}
      {loadingPredictions ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
            <p className="text-muted-foreground">
              Loading existing predictions...
            </p>
          </CardContent>
        </Card>
      ) : predictions.length > 0 ? (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              Recent Predictions
            </CardTitle>
            <CardDescription>
              AI-generated surplus predictions for upcoming events
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {predictions.slice(0, 3).map((prediction) => (
                <div
                  key={prediction.eventId}
                  className="border rounded-lg p-4 space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-semibold">{prediction.eventName}</h4>
                      <p className="text-sm text-muted-foreground">
                        {formatDate(prediction.eventDate)}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge
                        variant="outline"
                        style={{ color: getRiskColor(prediction.riskLevel) }}
                      >
                        {prediction.riskLevel.toUpperCase()} RISK
                      </Badge>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => updatePrediction(prediction.eventId)}
                        disabled={loading}
                      >
                        <RefreshCw className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-primary">
                        {prediction.predictedSurplus.totalKg.toFixed(1)}kg
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Predicted Surplus
                      </div>
                    </div>
                    <div className="text-center">
                      <div
                        className="text-2xl font-bold"
                        style={{
                          color: getConfidenceColor(
                            prediction.predictedSurplus.confidence
                          ),
                        }}
                      >
                        {(prediction.predictedSurplus.confidence * 100).toFixed(
                          0
                        )}
                        %
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Confidence
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold">
                        {prediction.factors.historicalWaste.toFixed(2)}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Historical Waste
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold">
                        {prediction.factors.attendanceVariation.toFixed(2)}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Attendance Var.
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Target className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Predictions Yet</h3>
            <p className="text-muted-foreground text-center">
              Generate your first AI prediction to see it here
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );

  const renderDetailedAnalysis = () => {
    if (predictions.length === 0) {
      return (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <BarChart3 className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Predictions Yet</h3>
            <p className="text-muted-foreground text-center">
              Generate your first AI prediction to see detailed analysis and
              charts
            </p>
          </CardContent>
        </Card>
      );
    }

    const latestPrediction = predictions[0];
    const chartData = [
      {
        name: "Veg",
        value: latestPrediction.predictedSurplus.breakdown.veg,
        color: COLORS.veg,
      },
      {
        name: "Non-Veg",
        value: latestPrediction.predictedSurplus.breakdown.nonVeg,
        color: COLORS.nonVeg,
      },
      {
        name: "Desserts",
        value: latestPrediction.predictedSurplus.breakdown.desserts,
        color: COLORS.desserts,
      },
      {
        name: "Beverages",
        value: latestPrediction.predictedSurplus.breakdown.beverages,
        color: COLORS.beverages,
      },
    ];

    const factorsData = [
      {
        name: "Historical Waste",
        value: latestPrediction.factors.historicalWaste,
      },
      {
        name: "Attendance Variation",
        value: latestPrediction.factors.attendanceVariation,
      },
      { name: "Weather Impact", value: latestPrediction.factors.weatherImpact },
      {
        name: "Event Type Factor",
        value: latestPrediction.factors.eventTypeFactor,
      },
      {
        name: "Seasonal Adjustment",
        value: latestPrediction.factors.seasonalAdjustment,
      },
    ];

    return (
      <div className="space-y-6">
        {/* Surplus Breakdown Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PieChartIcon className="h-5 w-5" />
              Surplus Breakdown by Category
            </CardTitle>
            <CardDescription>
              AI-predicted surplus distribution across food categories
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={chartData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent, value }) =>
                      value && value > 0
                        ? `${name} ${(percent * 100).toFixed(0)}%`
                        : ""
                    }
                    minAngle={5}
                    paddingAngle={2}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Legend verticalAlign="bottom" height={36} />
                  <Tooltip formatter={(value) => `${value}kg`} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Factors Analysis */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Prediction Factors Analysis
            </CardTitle>
            <CardDescription>
              Key factors influencing the AI prediction
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {factorsData.map((factor) => (
                <div key={factor.name} className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>{factor.name}</span>
                    <span className="font-medium">
                      {(factor.value * 100).toFixed(1)}%
                    </span>
                  </div>
                  <Progress value={factor.value * 100} className="h-2" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recommendations */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5" />
              AI Recommendations
            </CardTitle>
            <CardDescription>
              Actionable insights to reduce food waste
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {latestPrediction.recommendations.map((recommendation, index) => (
                <div
                  key={index}
                  className="flex items-start gap-3 p-3 bg-muted rounded-lg"
                >
                  <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <span className="text-sm">{recommendation}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  };

  const renderTrends = () => {
    if (predictions.length < 2) {
      return (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <TrendingUp className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Need More Data</h3>
            <p className="text-muted-foreground text-center">
              Generate predictions for multiple events to see trends and
              patterns
            </p>
          </CardContent>
        </Card>
      );
    }

    const trendData = predictions.slice(0, 5).map((prediction, index) => ({
      name: prediction.eventName.substring(0, 15) + "...",
      surplus: prediction.predictedSurplus.totalKg,
      confidence: prediction.predictedSurplus.confidence * 100,
      risk:
        prediction.riskLevel === "high"
          ? 3
          : prediction.riskLevel === "medium"
          ? 2
          : 1,
    }));

    return (
      <div className="space-y-6">
        {/* Surplus Trends */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Surplus Prediction Trends
            </CardTitle>
            <CardDescription>
              How predicted surplus varies across different events
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={trendData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip formatter={(value) => `${value}kg`} />
                  <Bar dataKey="surplus" fill="#3b82f6" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Confidence vs Risk Analysis */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Confidence vs Risk Analysis
            </CardTitle>
            <CardDescription>
              Relationship between prediction confidence and risk levels
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={trendData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis yAxisId="left" />
                  <YAxis yAxisId="right" orientation="right" />
                  <Tooltip />
                  <Line
                    yAxisId="left"
                    type="monotone"
                    dataKey="confidence"
                    stroke="#22c55e"
                    name="Confidence %"
                  />
                  <Line
                    yAxisId="right"
                    type="monotone"
                    dataKey="risk"
                    stroke="#ef4444"
                    name="Risk Level"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">
            AI Demand Prediction
          </h2>
          <p className="text-muted-foreground">
            Machine learning-powered surplus food forecasting for events
          </p>
        </div>
        <Badge variant="secondary" className="text-sm">
          Powered by Gemini AI
        </Badge>
      </div>

      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="space-y-6"
      >
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="analysis">Detailed Analysis</TabsTrigger>
          <TabsTrigger value="trends">Trends</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {renderOverview()}
        </TabsContent>

        <TabsContent value="analysis" className="space-y-6">
          {renderDetailedAnalysis()}
        </TabsContent>

        <TabsContent value="trends" className="space-y-6">
          {renderTrends()}
        </TabsContent>
      </Tabs>
    </div>
  );
}
