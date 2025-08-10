"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { X, Plus } from "lucide-react";

interface FoodSafetyFormProps {
  temperature?: string;
  allergens?: string[];
  preparationMethod?: string;
  safetyRating?: number;
  storageConditions?: string;
  onSafetyChange: (safetyData: {
    temperature?: string;
    allergens?: string[];
    preparationMethod?: string;
    safetyRating?: number;
    storageConditions?: string;
  }) => void;
}

const COMMON_ALLERGENS = [
  "Peanuts", "Tree Nuts", "Milk", "Eggs", "Soy", "Wheat", "Fish", "Shellfish",
  "Gluten", "Lactose", "Sulfites", "Mustard", "Celery", "Sesame"
];

export function FoodSafetyForm({
  temperature,
  allergens = [],
  preparationMethod,
  safetyRating,
  storageConditions,
  onSafetyChange,
}: FoodSafetyFormProps) {
  const [newAllergen, setNewAllergen] = useState("");
  const [customAllergens, setCustomAllergens] = useState<string[]>([]);

  const handleAllergenAdd = (allergen: string) => {
    if (allergen && !allergens.includes(allergen)) {
      const updatedAllergens = [...allergens, allergen];
      onSafetyChange({
        temperature,
        allergens: updatedAllergens,
        preparationMethod,
        safetyRating,
        storageConditions,
      });
    }
  };

  const handleAllergenRemove = (allergenToRemove: string) => {
    const updatedAllergens = allergens.filter(a => a !== allergenToRemove);
    onSafetyChange({
      temperature,
      allergens: updatedAllergens,
      preparationMethod,
      safetyRating,
      storageConditions,
    });
  };

  const handleCustomAllergenAdd = () => {
    if (newAllergen && !allergens.includes(newAllergen)) {
      handleAllergenAdd(newAllergen);
      setNewAllergen("");
    }
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        {/* Temperature */}
        <div className="space-y-2">
          <Label htmlFor="temperature">Temperature (°C)</Label>
          <Input
            id="temperature"
            type="number"
            placeholder="e.g., 4"
            value={temperature || ""}
            onChange={(e) =>
              onSafetyChange({
                temperature: e.target.value,
                allergens,
                preparationMethod,
                safetyRating,
                storageConditions,
              })
            }
          />
          <p className="text-xs text-muted-foreground">
            Safe: 0-5°C (cold), 60°C+ (hot)
          </p>
        </div>

        {/* Safety Rating */}
        <div className="space-y-2">
          <Label htmlFor="safetyRating">Safety Rating</Label>
          <Select
            value={safetyRating?.toString() || ""}
            onValueChange={(value) =>
              onSafetyChange({
                temperature,
                allergens,
                preparationMethod,
                safetyRating: parseInt(value),
                storageConditions,
              })
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Select rating" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="5">5 - Excellent</SelectItem>
              <SelectItem value="4">4 - Good</SelectItem>
              <SelectItem value="3">3 - Fair</SelectItem>
              <SelectItem value="2">2 - Poor</SelectItem>
              <SelectItem value="1">1 - Unsafe</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Allergens */}
      <div className="space-y-2">
        <Label>Allergens</Label>
        <div className="space-y-2">
          {/* Common Allergens */}
          <div className="flex flex-wrap gap-2">
            {COMMON_ALLERGENS.map((allergen) => (
              <Button
                key={allergen}
                type="button"
                variant={allergens.includes(allergen) ? "default" : "outline"}
                size="sm"
                onClick={() => handleAllergenAdd(allergen)}
                className="text-xs"
              >
                {allergen}
              </Button>
            ))}
          </div>

          {/* Custom Allergen Input */}
          <div className="flex gap-2">
            <Input
              placeholder="Add custom allergen"
              value={newAllergen}
              onChange={(e) => setNewAllergen(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && handleCustomAllergenAdd()}
            />
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleCustomAllergenAdd}
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>

          {/* Selected Allergens */}
          {allergens.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {allergens.map((allergen) => (
                <Badge
                  key={allergen}
                  variant="secondary"
                  className="flex items-center gap-1"
                >
                  {allergen}
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-4 w-4 p-0 hover:bg-transparent"
                    onClick={() => handleAllergenRemove(allergen)}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </Badge>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Preparation Method */}
      <div className="space-y-2">
        <Label htmlFor="preparationMethod">Preparation Method</Label>
        <Select
          value={preparationMethod || ""}
          onValueChange={(value) =>
            onSafetyChange({
              temperature,
              allergens,
              preparationMethod: value,
              safetyRating,
              storageConditions,
            })
          }
        >
          <SelectTrigger>
            <SelectValue placeholder="Select preparation method" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Fresh">Fresh</SelectItem>
            <SelectItem value="Cooked">Cooked</SelectItem>
            <SelectItem value="Baked">Baked</SelectItem>
            <SelectItem value="Fried">Fried</SelectItem>
            <SelectItem value="Steamed">Steamed</SelectItem>
            <SelectItem value="Grilled">Grilled</SelectItem>
            <SelectItem value="Packaged">Packaged</SelectItem>
            <SelectItem value="Other">Other</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Storage Conditions */}
      <div className="space-y-2">
        <Label htmlFor="storageConditions">Storage Conditions</Label>
        <Textarea
          id="storageConditions"
          placeholder="e.g., Keep refrigerated, Store in cool dry place"
          value={storageConditions || ""}
          onChange={(e) =>
            onSafetyChange({
              temperature,
              allergens,
              preparationMethod,
              safetyRating,
              storageConditions: e.target.value,
            })
          }
          rows={2}
        />
      </div>
    </div>
  );
}
