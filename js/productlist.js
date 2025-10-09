const recipesContainer = document.getElementById("recipes");
const searchInput = document.getElementById("searchInput");

let allRecipes = []; 

async function fetchAllRecipes() {
  const alphabet = "abcdefghijklmnopqrstuvwxyz".split("");
  let all = [];

  for (const letter of alphabet) {
    const url = `https://www.themealdb.com/api/json/v1/1/search.php?f=${letter}`;
    const response = await fetch(url);
    const data = await response.json();

    if (data.meals) {
      all = all.concat(data.meals);
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
      window.location.href = `recipe.html?id=${meal.idMeal}`;
    });

    recipesContainer.appendChild(card);
  });
}

// SØGEFUNKTIONEN 
searchInput.addEventListener("input", () => {
  const value = searchInput.value.trim().toLowerCase();
  const filtered = allRecipes.filter(meal =>
    meal.strMeal.toLowerCase().includes(value)
  );
  displayRecipes(filtered);
});

// HENT ALT VED LOAD
fetchAllRecipes();