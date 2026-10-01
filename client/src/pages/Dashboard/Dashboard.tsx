

import { useState, type MouseEvent, type ReactNode } from 'react';
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

function RecipeCard({
  recipe,
  isLoggedIn,
  onEdit,
  onDelete,
}: RecipeCardProps) {
  return (
    <article className="recipe-card">
      <img
        className="recipe-image"
        src={recipe.image}
        alt={recipe.title}
      />

      <div className="recipe-card-content">
        <h2>{recipe.title}</h2>
        <p className="recipe-date">
          Created on {formatDate(recipe.createdAt)}
        </p>

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
  onDeleteRecipe,
}: DashboardProps) {
  const [deleteTarget, setDeleteTarget] = useState<Recipe | null>(null);

  function confirmDelete() {
    if (!deleteTarget) return;

    onDeleteRecipe(deleteTarget.id);
    setDeleteTarget(null);
  }

  return (
    <main className="dashboard-page">
      <section className="dashboard-content">
        <p className="welcome-message">
          {isLoggedIn
            ? 'Welcome back! Manage your recipes or add a new one.':""}
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
          <p className="empty-message">No recipes available yet.</p>
        )}

        {isLoggedIn && (
          <button className="primary-button create-button" onClick={onCreate} type="button">
            Create Recipe
          </button>
        )}
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
