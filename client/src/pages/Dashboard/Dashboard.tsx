
import { useState, useEffect, type MouseEvent, type ReactNode } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import './Dashboard.css';

export type Recipe = {
  id: string;
  title: string;
  ingredients: string;
  instructions: string;
  tags: string[];
  image: string;
  createdAt: string;
};

type DashboardProps = {
  recipes: Recipe[];
  isLoggedIn: boolean;
  onCreate: () => void;
  onEdit: (recipe: Recipe) => void;
  onBrowse: () => void;
  onDeleteRecipe: (recipeId: string) => void;
};

type ModalProps = {
  children: ReactNode;
  onClose: () => void;
};

function formatDate(date: string) {
  return new Intl.DateTimeFormat('en-US').format(new Date(date));
}

function Modal({ children, onClose }: ModalProps) {
  function handleBackdropClick(event: MouseEvent<HTMLDivElement>) {
    if (event.target === event.currentTarget) onClose();
  }

  return (
    <div className="modal-backdrop" onMouseDown={handleBackdropClick} role="presentation">
      <div className="modal-card">{children}</div>
    </div>
  );
}

type RecipeCardProps = {
  recipe: Recipe;
  isLoggedIn: boolean;
  onEdit: (recipe: Recipe) => void;
  onDelete: (recipe: Recipe) => void;
};

function RecipeCard({ recipe, isLoggedIn, onEdit, onDelete }: RecipeCardProps) {
  return (
    <article className="recipe-card">
      <img className="recipe-image" src={recipe.image} alt={recipe.title} />

      <div className="recipe-card-content">
        <h2>{recipe.title}</h2>
        <p className="recipe-date">Created on {formatDate(recipe.createdAt)}</p>

        <div className="recipe-tags">
          {recipe.tags.map((tag) => (
            <span className="recipe-tag" key={tag}>
              {tag}
            </span>
          ))}
        </div>

        {isLoggedIn && (
          <div className="recipe-actions">
            <button
              aria-label={`Delete ${recipe.title}`}
              className="icon-button"
              onClick={() => onDelete(recipe)}
              type="button"
            >
              🗑
            </button>

            <button
              aria-label={`Edit ${recipe.title}`}
              className="icon-button"
              onClick={() => onEdit(recipe)}
              type="button"
            >
              ✎
            </button>
          </div>
        )}
      </div>
    </article>
  );
}

export default function Dashboard({
  recipes,
  isLoggedIn,
  onCreate,
  onEdit,
  onBrowse,
  onDeleteRecipe,
}: DashboardProps) {
  const [deleteTarget, setDeleteTarget] = useState<Recipe | null>(null);
  const [flash, setFlash] = useState('');

  const location = useLocation();
  const navigate = useNavigate();

  // show the "created" message passed in via navigation from RecipeFormPage
  useEffect(() => {
    const message = (location.state as { flash?: string } | null)?.flash;
    if (message) {
      setFlash(message);
      navigate(location.pathname, { replace: true, state: null }); // clear so it won't reshow on refresh
    }
  }, [location, navigate]);

  // auto-hide any flash after 4s
  useEffect(() => {
    if (!flash) return;
    const timer = setTimeout(() => setFlash(''), 4000);
    return () => clearTimeout(timer);
  }, [flash]);

  function confirmDelete() {
    if (!deleteTarget) return;

    onDeleteRecipe(deleteTarget.id);
    setDeleteTarget(null);
    setFlash('Your recipe was successfully deleted.'); // delete is inline, set directly
  }

  return (
    <main className="dashboard-page">
      <section className="dashboard-content">
        {flash && (
          <div className="flash-message" role="status">
            {flash}
          </div>
        )}

        <p className="welcome-message">
          {isLoggedIn ? 'Welcome back! Manage your recipes or add a new one.' : ''}
        </p>

        <h1>{isLoggedIn ? 'Your Recipes' : 'Recipes'}</h1>

        <div className="recipe-strip">
          {recipes.map((recipe) => (
            <RecipeCard
              isLoggedIn={isLoggedIn}
              key={recipe.id}
              onDelete={setDeleteTarget}
              onEdit={onEdit}
              recipe={recipe}
            />
          ))}
        </div>

        {recipes.length === 0 && (
          <p className="empty-message">Your recipes will show up here.</p>
        )}

        <div className="dashboard-buttons">
          {isLoggedIn && (
            <button
              className="primary-button create-button"
              onClick={onCreate}
              type="button"
            >
              Create Recipe
            </button>
          )}

          <button
            className="secondary-button browse-button"
            onClick={onBrowse}
            type="button"
          >
            Browse Recipes
          </button>
        </div>
      </section>

      {deleteTarget && (
        <Modal onClose={() => setDeleteTarget(null)}>
          <h2>Delete recipe?</h2>
          <p>
            Do you want to delete this recipe?
            <br />
            This action cannot be undone.
          </p>

          <button className="primary-button" onClick={confirmDelete} type="button">
            Yes, Delete Recipe
          </button>

          <button
            className="secondary-button"
            onClick={() => setDeleteTarget(null)}
            type="button"
          >
            Nevermind
          </button>
        </Modal>
      )}
    </main>
  );
}
