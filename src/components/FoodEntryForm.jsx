'use client';

import { useState, useEffect } from 'react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { searchFood, getFoodInfo } from '@/lib/spoonacular';
import { toast } from 'react-hot-toast';
import { Loader2, Search } from 'lucide-react';

export default function FoodEntryForm({ onFoodAdded }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [selectedFood, setSelectedFood] = useState(null);
  const [quantity, setQuantity] = useState(100);
  const [isSearching, setIsSearching] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    
    setIsSearching(true);
    try {
      const results = await searchFood(searchQuery);
      setSearchResults(results);
    } catch (error) {
      toast.error('Failed to search for food');
      console.error('Search error:', error);
    } finally {
      setIsSearching(false);
    }
  };

  const handleFoodSelect = async (foodId) => {
    try {
      const foodInfo = await getFoodInfo(foodId);
      setSelectedFood(foodInfo);
      setSearchResults([]);
    } catch (error) {
      toast.error('Failed to get food information');
      console.error('Food info error:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedFood) return;

    setIsSubmitting(true);
    try {
      const response = await fetch('/api/fitness/food', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: selectedFood.name,
          servingSize: quantity,
          calories: Math.round((selectedFood.calories * quantity) / 100),
          protein: (selectedFood.protein * quantity) / 100,
          carbs: (selectedFood.carbs * quantity) / 100,
          fat: (selectedFood.fat * quantity) / 100,
          spoonacularId: selectedFood.id
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to save food entry');
      }

      toast.success('Food entry added successfully');
      onFoodAdded?.();
      setSelectedFood(null);
      setSearchQuery('');
      setQuantity(100);
    } catch (error) {
      toast.error('Failed to save food entry');
      console.error('Submit error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="search">Search Food</Label>
        <div className="flex gap-2">
          <Input
            id="search"
            type="text"
            placeholder="Enter food name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1"
          />
          <Button
            type="button"
            onClick={handleSearch}
            disabled={isSearching}
            className="bg-gray-800/30 border border-zinc-800 hover:bg-zinc-700 text-white"
          >
            {isSearching ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Search className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>

      {searchResults.length > 0 && (
        <div className="space-y-2">
          <Label>Search Results</Label>
          <div className="max-h-48 overflow-y-auto space-y-2">
            {searchResults.map((food) => (
              <button
                key={food.id}
                type="button"
                onClick={() => handleFoodSelect(food.id)}
                className="w-full text-left p-2 rounded hover:bg-gray-800/30 border border-zinc-800"
              >
                {food.name}
              </button>
            ))}
          </div>
        </div>
      )}

      {selectedFood && (
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Selected Food</Label>
            <div className="p-4 rounded bg-gray-800/30 border border-zinc-800">
              <h3 className="font-semibold">{selectedFood.name}</h3>
              <div className="mt-2 space-y-1 text-sm text-gray-400">
                <p>Calories: {selectedFood.calories} kcal per 100g</p>
                <p>Protein: {selectedFood.protein}g</p>
                <p>Carbs: {selectedFood.carbs}g</p>
                <p>Fat: {selectedFood.fat}g</p>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="quantity">Quantity (g)</Label>
            <Input
              id="quantity"
              type="number"
              min="1"
              value={quantity}
              onChange={(e) => setQuantity(Number(e.target.value))}
            />
          </div>

          <div className="p-4 rounded bg-gray-800/30 border border-zinc-800">
            <h4 className="font-semibold">Total Nutrition</h4>
            <div className="mt-2 space-y-1 text-sm text-gray-400">
              <p>Calories: {Math.round((selectedFood.calories * quantity) / 100)} kcal</p>
              <p>Protein: {((selectedFood.protein * quantity) / 100).toFixed(1)}g</p>
              <p>Carbs: {((selectedFood.carbs * quantity) / 100).toFixed(1)}g</p>
              <p>Fat: {((selectedFood.fat * quantity) / 100).toFixed(1)}g</p>
            </div>
          </div>

          <Button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-gray-800/30 border border-zinc-800 hover:bg-zinc-700 text-white"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Adding...
              </>
            ) : (
              'Add Food Entry'
            )}
          </Button>
        </div>
      )}
    </form>
  );
} 