import * as httpClient from '../lib/http-client';
import { IngredientResponse, PaginatedIngredients } from '../types';

export const getAllIngredients = async () => {
  return httpClient.get<PaginatedIngredients[]>('/ingredients');
};

export const searchIngredients = async (query: string) => {
  return httpClient.get<IngredientResponse[]>(`/ingredients/search?query=${encodeURIComponent(query)}`);
};