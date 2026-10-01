import { useState } from 'react';
import type { Recipe } from './Dashboard';
import './Dashboard.css';

type RecipeListPageProps = {
  recipes: Recipe[];
  onHome: () => void;
  onViewRecipe: (recipe: Recipe) => void;
};

export default function RecipeListPage({
  recipes,
  onHome,
  onViewRecipe,
}: RecipeListPageProps) {
  const [search, setSearch] = useState('');

  const query = search.trim().toLowerCase();

  const filtered = recipes.filter((recipe) => {
    if (!query) return true;

    const haystack = [recipe.title, ...recipe.tags]
      .join(' ')
      .toLowerCase();

    return haystack.includes(query);
  });

  return (
    <main className="recipe-list-page">
      <nav className="breadcrumb">
        <button className="breadcrumb-link" onClick={onHome} type="button">
          Home
        </button>
        <span className="breadcrumb-sep"> &gt; </span>
        <span className="breadcrumb-current">Recipe List</span>
      </nav>

      <h1>Recipe List</h1>

      <input
        className="recipe-search"
        onChange={(event) => setSearch(event.target.value)}
        placeholder="Search recipes"
        value={search}
      />

      {filtered.length === 0 ? (
        <p className="empty-message">No recipes found.</p>
      ) : (
        <div className="recipe-list">
          {filtered.map((recipe) => (
            <article className="recipe-list-card" key={recipe.id}>
              {recipe.image && (
                <img
                  alt={recipe.title}
                  className="recipe-list-image"
                  src={recipe.image}
                />
              )}

              <div className="recipe-list-body">
                <h2>{recipe.title}</h2>

                {recipe.tags.length > 0 && (
                  <div className="tag-row">
                    {recipe.tags.map((tag) => (
                      <span className="tag" key={tag}>
                        {tag}
                      </span>
                    ))}
                  </div>
                )}

                <button
                  className="view-recipe-link"
                  onClick={() => onViewRecipe(recipe)}
                  type="button"
                >
                  View Recipe
                </button>
              </div>
            </article>
          ))}
        </div>
      )}

    </main>
  );
}