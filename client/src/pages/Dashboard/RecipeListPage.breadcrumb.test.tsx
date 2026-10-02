import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';
import { describe, it, expect } from 'vitest';
import RecipeListPage from './RecipeListPage';

describe('RecipeListPage breadcrumb', () => {
  it('calls onHome when the Home breadcrumb is clicked', async () => {
    const onHome = vi.fn(); // a spy — records if/when it's called
    render(<RecipeListPage recipes={[]} onHome={onHome} onViewRecipe={() => {}} />);

    await userEvent.click(screen.getByRole('button', { name: 'Home' }));

    expect(onHome).toHaveBeenCalledTimes(1);
  });
});