// FoodHub – render 8 dynamic recipe cards (DummyJSON)
const recipeGrid = document.querySelector('.recipe-grid');

async function loadRecipes() {
  try {
    const res = await fetch('https://dummyjson.com/recipes?limit=8');
    if (!res.ok) throw new Error('Network response was not ok');
    const data = await res.json();
    const recipes = data.recipes || [];

    // Render as the same .recipe-card structure, just with dynamic content
    recipeGrid.innerHTML = recipes.map(r => `
      <article class="recipe-card">
        <a href="recipe.html?id=${r.id}&source=dummy">
          <img src="${r.image}" alt="${r.name}">
          <div class="recipe-info">
            <h4>${r.name}</h4>
            <p>Category: ${r.cuisine || 'Unknown'}</p>
          </div>
        </a>
      </article>
    `).join('');
  } catch (err) {
    console.error(err);
    recipeGrid.innerHTML = '<p>Could not load recipes right now.</p>';
  }
}

loadRecipes();