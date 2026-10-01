// filename: App.tsx
import { useState } from 'react';
import {
  BrowserRouter,
  Navigate,
  Route,
  Routes,
  useNavigate,
  useLocation,
  useParams,
} from 'react-router-dom';

import AIAssistant from './pages/AIAssistant/AIAssistant';
import SignUpPage from './pages/SignupPage/SignupPage';
import LoginPage from './pages/LoginPage/LoginPage';
import Dashboard, { type Recipe } from './pages/Dashboard/Dashboard';
import RecipeFormPage from './pages/Dashboard/RecipeFormPage';
import Header from './pages/components/Header/Header';
import { UserProvider, useUser } from './contexts/UserContext';
import './App.css';

function EditRecipeRoute({
  recipes,
  onSave,
}: {
  recipes: Recipe[];
  onSave: (recipe: Recipe) => void;
}) {
  const navigate = useNavigate();
  const { recipeId } = useParams();
  const recipe = recipes.find((item) => item.id === recipeId);

  if (!recipe) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <RecipeFormPage
      initialRecipe={recipe}
      onCancel={() => navigate('/dashboard')}
      onSave={(updatedRecipe) => {
        onSave(updatedRecipe);
        navigate('/dashboard');
      }}
    />
  );
}

function AppRoutes() {
  const { user } = useUser();
  const navigate = useNavigate();
  const [recipes, setRecipes] = useState<Recipe[]>([]);

  // Guest = user made an explicit "continue as guest" choice on the login page.
  const [isGuest, setIsGuest] = useState(false);

  // Dashboard is reachable only after a real login OR an explicit guest choice.
  const canEnter = Boolean(user) || isGuest;

  function continueAsGuest() {
    setIsGuest(true);
    navigate('/dashboard');
  }

  function saveRecipe(recipe: Recipe) {
    setRecipes((currentRecipes) => {
      const exists = currentRecipes.some((item) => item.id === recipe.id);

      return exists
        ? currentRecipes.map((item) => (item.id === recipe.id ? recipe : item))
        : [...currentRecipes, recipe];
    });
  }

  function deleteRecipe(recipeId: string) {
    setRecipes((currentRecipes) =>
      currentRecipes.filter((recipe) => recipe.id !== recipeId),
    );
  }

  return (
    <Routes>
      <Route
        path="/"
        element={<Navigate to={canEnter ? '/dashboard' : '/login'} replace />}
      />

      <Route
        path="/login"
        element={
          user ? (
            <Navigate to="/dashboard" replace />
          ) : (
            <LoginPage onContinueAsGuest={continueAsGuest} />
          )
        }
      />

      <Route
        path="/signup"
        element={user ? <Navigate to="/dashboard" replace /> : <SignUpPage />}
      />

      {/* Gated: requires a logged-in user OR an explicit guest choice */}
      <Route
        path="/dashboard"
        element={
          canEnter ? (
            <Dashboard
              isLoggedIn={Boolean(user)}
              onCreate={() => navigate('/recipes/create')}
              onDeleteRecipe={deleteRecipe}
              onEdit={(recipe) => navigate(`/recipes/${recipe.id}/edit`)}
              recipes={recipes}
            />
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />

      {/* Protected: only logged-in users can create recipes */}
      <Route
        path="/recipes/create"
        element={
          user ? (
            <RecipeFormPage
              onCancel={() => navigate('/dashboard')}
              onSave={(recipe) => {
                saveRecipe(recipe);
                navigate('/dashboard');
              }}
            />
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />

      {/* Protected: only logged-in users can edit recipes */}
      <Route
        path="/recipes/:recipeId/edit"
        element={
          user ? (
            <EditRecipeRoute recipes={recipes} onSave={saveRecipe} />
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />

      <Route
        path="/ai-assistant"
        element={<AIAssistant />} 
      />

      <Route
        path="*"
        element={<Navigate to={canEnter ? '/dashboard' : '/login'} replace />}
      />
    </Routes>
  );
}

function AppLayout() {
  const location = useLocation();

  const hideHeader =
    location.pathname === '/login' ||
    location.pathname === '/signup';

  return (
    <>
      {!hideHeader && <Header />}

      <main>
        <AppRoutes />
      </main>
    </>
  );
}

function App() {
  return (
    <BrowserRouter>
      <UserProvider>
        <AppLayout />
      </UserProvider>
    </BrowserRouter>
  );
}

export default App;
