"use client";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Thermometer, 
  AlertTriangle, 
  Shield, 
  Clock, 
  Snowflake,
  Flame,
  CheckCircle,
  XCircle
} from "lucide-react";

interface FoodSafetyTagsProps {
  temperature?: string;
  allergens?: string[];
  preparationMethod?: string;
  safetyRating?: number;
  storageConditions?: string;
  lastInspection?: string;
  showDetails?: boolean;
  hideSafetyRating?: boolean;
}

export function FoodSafetyTags({
  temperature,
  allergens = [],
  preparationMethod,
  safetyRating,
  storageConditions,
  lastInspection,
  showDetails = false,
  hideSafetyRating = false,
}: FoodSafetyTagsProps) {
  const getSafetyRatingColor = (rating: number) => {
    if (rating >= 4) return "bg-green-100 text-green-800 border-green-200";
    if (rating >= 3) return "bg-yellow-100 text-yellow-800 border-yellow-200";
    if (rating >= 2) return "bg-orange-100 text-orange-800 border-orange-200";
    return "bg-red-100 text-red-800 border-red-200";
  };

  const getSafetyRatingIcon = (rating: number) => {
    if (rating >= 4) return <CheckCircle className="h-4 w-4" />;
    if (rating >= 3) return <Shield className="h-4 w-4" />;
    if (rating >= 2) return <AlertTriangle className="h-4 w-4" />;
    return <XCircle className="h-4 w-4" />;
  };

  const getTemperatureIcon = (temp?: string) => {
    if (!temp) return <Thermometer className="h-4 w-4" />;
    const tempNum = parseFloat(temp);
    if (tempNum > 60) return <Flame className="h-4 w-4 text-red-500" />;
    if (tempNum < 5) return <Snowflake className="h-4 w-4 text-blue-500" />;
    return <Thermometer className="h-4 w-4 text-green-500" />;
  };

  const getTemperatureColor = (temp?: string) => {
    if (!temp) return "bg-gray-100 text-gray-800 border-gray-200";
    const tempNum = parseFloat(temp);
    if (tempNum > 60) return "bg-red-100 text-red-800 border-red-200";
    if (tempNum < 5) return "bg-blue-100 text-blue-800 border-blue-200";
    return "bg-green-100 text-green-800 border-green-200";
  };

  return (
    <div className="space-y-3">
      {/* Safety Rating */}
      {safetyRating && !hideSafetyRating && (
        <div className="flex items-center gap-2">
          <Badge 
            variant="outline" 
            className={`${getSafetyRatingColor(safetyRating)} flex items-center gap-1`}
          >
            {getSafetyRatingIcon(safetyRating)}
            Safety: {safetyRating}/5
          </Badge>
        </div>
      )}

      {/* Temperature */}
      {temperature && (
        <div className="flex items-center gap-2">
          <Badge 
            variant="outline" 
            className={`${getTemperatureColor(temperature)} flex items-center gap-1`}
          >
            {getTemperatureIcon(temperature)}
            {temperature}°C
          </Badge>
        </div>
      )}

      {/* Allergens */}
      {allergens && allergens.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {allergens.map((allergen, index) => (
            <Badge 
              key={index} 
              variant="outline" 
              className="bg-orange-100 text-orange-800 border-orange-200 flex items-center gap-1"
            >
              <AlertTriangle className="h-3 w-3" />
              {allergen}
            </Badge>
          ))}
        </div>
      )}

      {/* Detailed Safety Information */}
      {showDetails && (
        <Card className="mt-4">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Shield className="h-4 w-4" />
              Safety Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            {preparationMethod && (
              <div>
                <span className="font-medium">Preparation:</span> {preparationMethod}
              </div>
            )}
            {storageConditions && (
              <div>
                <span className="font-medium">Storage:</span> {storageConditions}
              </div>
            )}
            {lastInspection && (
              <div className="flex items-center gap-2">
                <Clock className="h-3 w-3" />
                <span className="font-medium">Last Inspection:</span> {lastInspection}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
