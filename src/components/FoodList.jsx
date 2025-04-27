'use client';

import { useState, useEffect } from 'react';
import { Trash2 } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { toast } from 'react-hot-toast';

export default function FoodList() {
  const [foodEntries, setFoodEntries] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchFoodEntries();
  }, []);

  const fetchFoodEntries = async () => {
    try {
      const response = await fetch('/api/fitness/food?userId=1'); // TODO: Get actual user ID
      if (!response.ok) {
        throw new Error('Failed to fetch food entries');
      }
      const data = await response.json();
      setFoodEntries(data);
    } catch (error) {
      console.error('Error fetching food entries:', error);
      toast.error('Failed to fetch food entries');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      const response = await fetch(`/api/fitness/food/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete food entry');
      }

      setFoodEntries(foodEntries.filter(entry => entry.id !== id));
      toast.success('Food entry deleted successfully');
    } catch (error) {
      console.error('Error deleting food entry:', error);
      toast.error('Failed to delete food entry');
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-32">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
      </div>
    );
  }

  if (foodEntries.length === 0) {
    return (
      <div className="text-center py-8 text-gray-400">
        No food entries yet. Add your first food entry!
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {foodEntries.map(entry => (
        <div
          key={entry.id}
          className="flex justify-between items-center p-4 bg-white/5 border border-white/10 rounded-lg"
        >
          <div>
            <h3 className="text-lg font-semibold text-white">{entry.name}</h3>
            <div className="mt-1 space-y-1 text-sm text-gray-400">
              <p>Serving Size: {entry.serving_size}g</p>
              <p>Calories: {entry.calories} kcal</p>
              <p>Protein: {entry.protein}g | Carbs: {entry.carbs}g | Fat: {entry.fat}g</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-400">
              {new Date(entry.date).toLocaleDateString()}
            </span>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => handleDelete(entry.id)}
              className="text-gray-400 hover:text-red-500"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
} 