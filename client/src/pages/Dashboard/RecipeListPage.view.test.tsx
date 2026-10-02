import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';
import RecipeListPage from './RecipeListPage';
import type { Recipe } from './Dashboard';
import { describe, it, expect } from 'vitest';

const recipes = [
  { id: '1', title: 'Chickpea Stew', image: '', tags: ['Vegan'] },
] as Recipe[];

describe('RecipeListPage view action', () => {
  it('passes the clicked recipe to onViewRecipe', async () => {
    const onViewRecipe = vi.fn();
    render(
      <RecipeListPage recipes={recipes} onHome={() => {}} onViewRecipe={onViewRecipe} />,
    );

    await userEvent.click(screen.getByRole('button', { name: 'View Recipe' }));

    // confirm it was called with the whole recipe object, not just an id
    expect(onViewRecipe).toHaveBeenCalledWith(recipes[0]);
  });
});