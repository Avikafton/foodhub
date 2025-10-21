// --- FoodHub: index.js (forside) ---

// 1) "We recommend" – hent 8 opskrifter fra DummyJSON
const recipeGrid = document.querySelector('.recipe-grid');

async function loadRecipes() {
  if (!recipeGrid) return; // guard hvis markup ændres
  try {
    const res = await fetch('https://dummyjson.com/recipes?limit=8', {
      headers: { Accept: 'application/json' }
    });
    if (!res.ok) throw new Error('Network response was not ok');
    const data = await res.json();
    const recipes = data.recipes || [];

    recipeGrid.innerHTML = recipes.map(r => `
      <article class="recipe-card">
        <a href="recipe.html?id=${encodeURIComponent(r.id)}&source=dummy" aria-label="${r.name}">
          <img src="${r.image}" alt="${r.name}" loading="lazy">
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


// 2) Header-søgning – virker på alle sider
const searchFormEl  = document.getElementById('searchForm');
const searchInputEl = document.getElementById('searchInput');

if (searchFormEl) {
  searchFormEl.addEventListener('submit', (e) => {
    e.preventDefault();
    const q = (searchInputEl?.value || '').trim();
    if (!q) return;

    // Hvis vi står på forsiden: redirect til productlist.html med ?search=
    const target = new URL('productlist.html', location.origin);
    target.searchParams.set('search', q);
    location.href = `./productlist.html?search=${encodeURIComponent(q)}`;
  });
}

// 3) (Valgfrit) Live-redirect når man taster Enter i input på mobil med "search" tast
if (searchInputEl) {
  searchInputEl.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      // submit handleren ovenfor kører allerede – dette er blot defensivt
    }
  });
}
