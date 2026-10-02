import { useState , useEffect} from 'react';
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
import recipeService from './pages/services/recipeService';  
import Header from './pages/components/Header/Header';
import RecipeListPage from './pages/Dashboard/RecipeListPage';
import ProfilePage from './pages/Profile/ProfilePage';
import RecipeDetailPage from './pages/Dashboard/RecipeDetailPage';
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
    return <Navigate to="/recipes" replace />;
  }

  return (
    <RecipeFormPage
      initialRecipe={recipe}
      onCancel={() => navigate('/dashboard')}
      onSave={(updatedRecipe) => {
        onSave(updatedRecipe);
          navigate('/dashboard', { state: { flash: 'Your recipe was successfully updated.' } });
      }}
    />
  );
}
function ViewRecipeRoute({ recipes }: { recipes: Recipe[] }) {
  const navigate = useNavigate();
  const { recipeId } = useParams();
  const recipe = recipes.find((item) => item.id === recipeId);

  if (!recipe) {
    return <Navigate to="/recipes" replace />;
  }

  return (
    <RecipeDetailPage
      recipe={recipe}
      onHome={() => navigate('/dashboard')}
      onBackToList={() => navigate('/recipes')}
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
  
    useEffect(() => {
    recipeService.index().then(setRecipes).catch(() => setRecipes([]));
  }, []);


  function continueAsGuest() {
    setIsGuest(true);
    navigate('/recipes');
  }

    async function saveRecipe(recipe: Recipe) {
    const isExisting = recipes.some((item) => item.id === recipe.id);
    const saved = isExisting
      ? await recipeService.update(recipe)
      : await recipeService.create(recipe);

    setRecipes((currentRecipes) => {
      const exists = currentRecipes.some((item) => item.id === saved.id);

      return exists
        ? currentRecipes.map((item) => (item.id === saved.id ? saved : item))
        : [...currentRecipes, saved];
    });
  }

  async function deleteRecipe(recipeId: string) {
    await recipeService.deleteOne(recipeId);
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
        path="/profile"
        element={user ? <ProfilePage /> : <Navigate to="/login" replace />}
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
              onBrowse={() => navigate('/recipes')}
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
                navigate('/dashboard', { state: { flash: 'Your recipe was successfully created.' } });
              }}
            />
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />

      {/* Public: anyone (incl. guests) can browse all recipes */}
      <Route
        path="/recipes"
        element={
          canEnter ? (
            <RecipeListPage
              recipes={recipes}
              onHome={() => navigate('/dashboard')}
              onViewRecipe={(recipe) => navigate(`/recipes/${recipe.id}`)}
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

      {/* Public: view a single recipe's full contents */}
      <Route
        path="/recipes/:recipeId"
        element={
          canEnter ? (
            <ViewRecipeRoute recipes={recipes} />
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
