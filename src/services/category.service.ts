import * as httpClient from '../lib/http-client';
import { CategoryResponseList } from "@/types";

export const getAllCategories = async () => {
  return httpClient.get<CategoryResponseList>('/category/all');
};