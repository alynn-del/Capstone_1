import type { Recipe } from '../Dashboard/Dashboard';  
import tokenService from '../../utils/tokenService';               

const BASE_URL = '/api/recipes'; 

type RecipeFromApi = Omit<Recipe, 'id'> & { _id: string };

// Mongo returns _id; the frontend Recipe type uses id. Normalize every record.
function normalize(record: RecipeFromApi): Recipe {
  const { _id, ...rest } = record;
  return { ...rest, id: _id };
}

function authHeaders(): Record<string, string> {
  const token = tokenService.getToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

function toPayload(recipe: Recipe) {
  const { id, ...rest } = recipe;  
  return rest;
}

async function index(): Promise<Recipe[]> {
  const res = await fetch(BASE_URL);
  const data: RecipeFromApi[] = await res.json();
  return data.map(normalize);
}

async function create(recipe: Recipe): Promise<Recipe> {
  const res = await fetch(BASE_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...authHeaders() },
    body: JSON.stringify(toPayload(recipe)),
  });
  if (!res.ok) throw new Error('Failed to create recipe');
  return normalize(await res.json());
}

async function update(recipe: Recipe): Promise<Recipe> {
  const res = await fetch(`${BASE_URL}/${recipe.id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', ...authHeaders() },
    body: JSON.stringify(toPayload(recipe)),
  });
  if (!res.ok) throw new Error('Failed to update recipe');
  return normalize(await res.json());
}

async function deleteOne(id: string): Promise<void> {
  const res = await fetch(`${BASE_URL}/${id}`, {
    method: 'DELETE',
    headers: { ...authHeaders() },
  });
  if (!res.ok) throw new Error('Failed to delete recipe');
}

export default { index, create, update, deleteOne };