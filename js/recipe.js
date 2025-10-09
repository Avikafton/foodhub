const recipeDetail = document.getElementById("recipeDetail");

const urlParams = new URLSearchParams(window.location.search);
const mealId = urlParams.get('id');
const sourceParam = urlParams.get('source');
const source = sourceParam ? sourceParam.toLowerCase() : null; // no default, enables auto-detect

console.log('[recipe] id:', mealId, 'source:', source);

async function fetchRecipeById(id) {
  recipeDetail.innerHTML = '<p>Loading recipe…</p>';

  if (!id) {
    recipeDetail.innerHTML = '<p>No recipe ID provided.</p>';
    return;
  }

  async function fetchDummy(id) {
    const res = await fetch(`https://dummyjson.com/recipes/${id}`);
    if (!res.ok) throw new Error('DummyJSON failed');
    const r = await res.json();
    const totalTime = (Number(r.prepTimeMinutes||0) + Number(r.cookTimeMinutes||0)) || '';
    const ingredients = (r.ingredients || []).map(i => `<li>${i}</li>`).join('');
    const instructions = (r.instructions || []).map(step => `<li>${step}</li>`).join('');
    recipeDetail.innerHTML = `
      <h1>${r.name}</h1>
      <div id="recipeTop">
        <img src="${r.image}" alt="${r.name}">
        <div class="ingredients">
          <h2>Ingredients</h2>
          <ul>${ingredients}</ul>
        </div>
      </div>
      <div class="recipe-meta">
        <span><strong>Category:</strong> ${r.cuisine || 'N/A'}</span>
        ${totalTime ? `<span><strong>Cook time:</strong> ${totalTime} min</span>` : ''}
        ${r.difficulty ? `<span><strong>Difficulty:</strong> ${r.difficulty}</span>` : ''}
        ${r.rating != null ? `<span><strong>Rating:</strong> ${r.rating}</span>` : ''}
      </div>
      ${instructions ? `<div class="instructions"><h2>Instructions</h2><ol>${instructions}</ol></div>` : ''}
    `;
  }

  async function fetchMealDB(id) {
    const response = await fetch(`https://www.themealdb.com/api/json/v1/1/lookup.php?i=${id}`);
    const data = await response.json();
    if (!data.meals || data.meals.length === 0) throw new Error('MealDB not found');
    const meal = data.meals[0];
    const ingredients = [];
    for (let i = 1; i <= 20; i++) {
      const ingredient = meal[`strIngredient${i}`]?.trim();
      const measure = meal[`strMeasure${i}`]?.trim();
      if (ingredient) ingredients.push(measure ? `${ingredient} - ${measure}` : ingredient);
    }
    const cookTime = meal.strTags?.includes('Quick') ? '15' : '30';
    const difficulty = cookTime <= 20 ? 'Easy' : 'Medium';
    const cuisine = meal.strArea || 'Unknown';
    recipeDetail.innerHTML = `
      <h1>${meal.strMeal}</h1>
      <div id="recipeTop">
        <img src="${meal.strMealThumb}" alt="${meal.strMeal}">
        <div class="ingredients">
          <h2>Ingredients</h2>
          <ul>${ingredients.map(i => `<li>${i}</li>`).join('')}</ul>
        </div>
      </div>
      <div class="recipe-meta">
        <span><strong>Category:</strong> ${meal.strCategory || 'N/A'}</span>
        <span><strong>Cuisine:</strong> ${cuisine}</span>
        <span><strong>Cook time:</strong> ${cookTime} min</span>
        <span><strong>Difficulty:</strong> ${difficulty}</span>
      </div>
      <div class="instructions">
        <h2>Instructions</h2>
        <ol>
          ${meal.strInstructions
            .split('\n')
            .filter(line => line.trim() !== '')
            .map(line => `<li>${line}</li>`)
            .join('')}
        </ol>
      </div>
      ${meal.strYoutube ? `<p><a href="${meal.strYoutube}" target="_blank" class="youtube-link">▶ Watch on YouTube</a></p>` : ''}
    `;
  }

  try {
    if (source === 'dummy') {
      await fetchDummy(id);
      return;
    }
    if (source === 'mealdb') {
      await fetchMealDB(id);
      return;
    }
    // Auto-detect: try DummyJSON first, then MealDB
    try {
      await fetchDummy(id);
    } catch (e1) {
      console.warn('[recipe] DummyJSON failed, trying MealDB…', e1);
      await fetchMealDB(id);
    }
  } catch (error) {
    console.error('Error fetching recipe:', error);
    recipeDetail.innerHTML = '<p>Could not load recipe.</p>';
  }
}

// KØR FUNKTION 
fetchRecipeById(mealId);