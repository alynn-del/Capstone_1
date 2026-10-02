import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import RecipeListPage from './RecipeListPage';
import type { Recipe } from './Dashboard';
import '@testing-library/jest-dom/vitest'; 
import { describe, it, expect } from 'vitest';

const recipes: Recipe[] = [
  { id: '1', title: 'Chickpea Stew', image: '', tags: ['Vegan', 'Gluten-free'] },
  { id: '2', title: 'Caesar Salad', image: '', tags: ['Salad', 'Easy'] },
] as Recipe[];

function setup() {
  render(
    <RecipeListPage recipes={recipes} onHome={() => {}} onViewRecipe={() => {}} />,
  );
}

describe('RecipeListPage search', () => {
  it('shows all recipes when the search box is empty', () => {
    setup();
    expect(screen.getByText('Chickpea Stew')).toBeInTheDocument();
    expect(screen.getByText('Caesar Salad')).toBeInTheDocument();
  });

  it('filters by a TAG, not just the title', async () => {
    setup();
    // "vegan" is a tag on Chickpea Stew, not in either title
    await userEvent.type(screen.getByPlaceholderText('Search recipes'), 'vegan');

    expect(screen.getByText('Chickpea Stew')).toBeInTheDocument();   // matches tag
    expect(screen.queryByText('Caesar Salad')).not.toBeInTheDocument(); // filtered out
  });

  it('shows the empty message when nothing matches', async () => {
    setup();
    await userEvent.type(screen.getByPlaceholderText('Search recipes'), 'pizza');
    expect(screen.getByText('No recipes found.')).toBeInTheDocument();
  });
});