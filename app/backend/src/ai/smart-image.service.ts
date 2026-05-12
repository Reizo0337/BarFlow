import { Injectable } from '@nestjs/common';
import axios from 'axios';

@Injectable()
export class SmartImageService {
    private readonly cocktailApi = 'https://www.thecocktaildb.com/api/json/v1/1/search.php?s=';
    private readonly mealApi = 'https://www.themealdb.com/api/json/v1/1/search.php?s=';

    async findImage(query: string): Promise<string | null> {
        try {
            // Try CocktailDB first
            const cocktailRes = await axios.get(`${this.cocktailApi}${encodeURIComponent(query)}`);
            if (cocktailRes.data.drinks && cocktailRes.data.drinks[0]) {
                return cocktailRes.data.drinks[0].strDrinkThumb;
            }

            // Try MealDB
            const mealRes = await axios.get(`${this.mealApi}${encodeURIComponent(query)}`);
            if (mealRes.data.meals && mealRes.data.meals[0]) {
                return mealRes.data.meals[0].strMealThumb;
            }

            // Fallback: Curated Unsplash Search
            return `https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?auto=format&fit=crop&q=80&w=800&keyword=${encodeURIComponent(query)}`;
        } catch (error) {
            console.error('SmartImageService error:', error.message);
            return null;
        }
    }
}
