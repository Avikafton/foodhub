const recipesContainer = document.getElementById("recipes");
const searchInput = document.getElementById("searchInput");

let allRecipes = []; 

async function fetchAllRecipes() {
  const alphabet = "abcdefghijklmnopqrstuvwxyz".split("");
  let all = [];

  let totalLimit = 102;
  for (const letter of alphabet) {
    if (all.length >= totalLimit) break;
    const url = `https://www.themealdb.com/api/json/v1/1/search.php?f=${letter}`;
    const response = await fetch(url);
    const data = await response.json();

    if (data.meals) {
      const remaining = totalLimit - all.length;
      all = all.concat(data.meals.slice(0, remaining));
    }
  }

  allRecipes = all;
  displayRecipes(allRecipes);
}

function displayRecipes(recipes) {
  recipesContainer.innerHTML = "";

  if (!recipes || recipes.length === 0) {
    recipesContainer.innerHTML = "<p>No recipes found.</p>";
    return;
  }

  recipes.slice(0, 400).forEach(meal => {
    const card = document.createElement("div");
    card.classList.add("recipe");

    card.innerHTML = `
      <img src="${meal.strMealThumb}" alt="${meal.strMeal}">
      <h2>${meal.strMeal}</h2>
      <p>${meal.strCategory || ""}</p>
    `;

    card.addEventListener("click", () => {
      window.location.href = `recipe.html?id=${meal.idMeal}&source=mealdb`;
    });

    recipesContainer.appendChild(card);
  });
}

// SØGEFUNKTIONEN
if (searchInput) {
  searchInput.addEventListener("input", () => {
    const value = searchInput.value.trim().toLowerCase();
    const filtered = allRecipes.filter(meal =>
      meal.strMeal.toLowerCase().includes(value)
    );
    displayRecipes(filtered);
  });
} else {
  console.warn('[productlist] #searchInput not found');
}

// HENT ALT VED LOAD
fetchAllRecipes();