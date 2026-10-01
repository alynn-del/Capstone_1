import type { Recipe } from './Dashboard';
import './Dashboard.css';

type RecipeDetailPageProps = {
  recipe: Recipe;
  onHome: () => void;
  onBackToList: () => void;
};

// ingredients are stored as a single string; turn them into list items.
// split on new lines if present, otherwise fall back to commas.
function toItems(text: string): string[] {
  const raw = text.includes('\n') ? text.split('\n') : text.split(',');
  return raw.map((item) => item.trim()).filter(Boolean);
}

export default function RecipeDetailPage({
  recipe,
  onHome,
  onBackToList,
}: RecipeDetailPageProps) {
  const ingredients = toItems(recipe.ingredients);

  return (
    <main className="recipe-detail-page">
      <nav className="breadcrumb">
        <button className="breadcrumb-link" onClick={onHome} type="button">
          Home
        </button>
        <span className="breadcrumb-sep"> &gt; </span>
        <button className="breadcrumb-link" onClick={onBackToList} type="button">
          Recipe List
        </button>
        <span className="breadcrumb-sep"> &gt; </span>
        <span className="breadcrumb-current">{recipe.title}</span>
      </nav>

      {recipe.image && (
        <img
          alt={recipe.title}
          className="recipe-detail-image"
          src={recipe.image}
        />
      )}

      <h1>{recipe.title}</h1>

      <h2>Ingredients</h2>
      <ul className="ingredient-list">
        {ingredients.map((item, index) => (
          <li key={index}>{item}</li>
        ))}
      </ul>

      <h2>Instructions</h2>
      <p className="instructions-text">{recipe.instructions}</p>

      {recipe.tags.length > 0 && (
        <>
          <h2>Tags</h2>
          <div className="tag-row">
            {recipe.tags.map((tag) => (
              <span className="tag" key={tag}>
                {tag}
              </span>
            ))}
          </div>
        </>
      )}
    </main>
  );
}