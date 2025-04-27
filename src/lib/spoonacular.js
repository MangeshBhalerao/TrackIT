const SPOONACULAR_API_KEY = process.env.NEXT_PUBLIC_SPOONACULAR_API_KEY;
const SPOONACULAR_BASE_URL = 'https://api.spoonacular.com/food';

export async function searchFood(query) {
  try {
    const response = await fetch(
      `${SPOONACULAR_BASE_URL}/ingredients/search?apiKey=${SPOONACULAR_API_KEY}&query=${query}&number=10`
    );
    
    if (!response.ok) {
      throw new Error('Failed to search food');
    }

    const data = await response.json();
    return data.results;
  } catch (error) {
    console.error('Error searching food:', error);
    throw error;
  }
}

export async function getFoodInfo(id) {
  try {
    const response = await fetch(
      `${SPOONACULAR_BASE_URL}/ingredients/${id}/information?apiKey=${SPOONACULAR_API_KEY}&amount=100&unit=g`
    );
    
    if (!response.ok) {
      throw new Error('Failed to get food information');
    }

    const data = await response.json();
    return {
      id: data.id,
      name: data.name,
      calories: data.nutrition.nutrients.find(n => n.name === 'Calories')?.amount || 0,
      protein: data.nutrition.nutrients.find(n => n.name === 'Protein')?.amount || 0,
      carbs: data.nutrition.nutrients.find(n => n.name === 'Carbohydrates')?.amount || 0,
      fat: data.nutrition.nutrients.find(n => n.name === 'Fat')?.amount || 0,
      servingSize: 100, // Default to 100g
      unit: 'g'
    };
  } catch (error) {
    console.error('Error getting food information:', error);
    throw error;
  }
}

export async function parseFoodText(text) {
  try {
    const response = await fetch(
      `${SPOONACULAR_BASE_URL}/ingredients/parse?apiKey=${SPOONACULAR_API_KEY}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ ingredientList: text }),
      }
    );
    
    if (!response.ok) {
      throw new Error('Failed to parse food text');
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error parsing food text:', error);
    throw error;
  }
} 