const recipesContainer = document.getElementById("recipes");
const searchInput = document.getElementById("searchInput");
const activeFiltersContainer = document.createElement("div");
activeFiltersContainer.classList.add("active-filters");
document.querySelector(".filter-bar").after(activeFiltersContainer);

let allRecipes = []; 
let filteredRecipes = [];

// Hent opskrifter fra API
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

  allRecipes = all.map(meal => {
    const cooktime = Math.floor(Math.random() * 90) + 10; // 10-100 min
    let difficulty = "Medium";
    if (cooktime <= 30) difficulty = "Easy";
    else if (cooktime >= 60) difficulty = "Hard";

    return {
      idMeal: meal.idMeal,
      strMeal: meal.strMeal,
      strCategory: meal.strCategory ? meal.strCategory.trim() : "Unknown",
      strArea: meal.strArea ? meal.strArea.trim() : "Unknown",
      cooktime,
      difficulty,
      strMealThumb: meal.strMealThumb
    };
  });

  filteredRecipes = [...allRecipes];
  populateDropdowns();
  applyFilters();
  updateTags();
}

// Vis opskrifter
function displayRecipes(recipes) {
  recipesContainer.innerHTML = "";
  if (!recipes || recipes.length === 0) {
    recipesContainer.innerHTML = "<p>No recipes found.</p>";
    return;
  }

  recipes.forEach(meal => {
    const card = document.createElement("div");
    card.classList.add("recipe");
    card.innerHTML = `
      <img src="${meal.strMealThumb}" alt="${meal.strMeal}">
      <h2>${meal.strMeal}</h2>
      <p>${meal.strCategory} | ${meal.strArea} | ${meal.cooktime} min | ${meal.difficulty}</p>
    `;
    card.addEventListener("click", () => {
      window.location.href = `recipe.html?id=${meal.idMeal}&source=mealdb`;
    });
    recipesContainer.appendChild(card);
  });
}

// Dropdown references
const filterCategory = document.getElementById("filterCategory");
const filterCuisine = document.getElementById("filterCuisine");
const filterCookTime = document.getElementById("filterCookTime");
const filterDifficulty = document.getElementById("filterDifficulty");

// Populate dropdowns
function populateDropdowns() {
  if (!allRecipes.length) return;

  const categories = ["All Categories", ...new Set(allRecipes.map(r => r.strCategory))];
  const cuisines = ["All Cuisines", ...new Set(allRecipes.map(r => r.strArea))];
  const difficulties = ["Any Difficulty", "Easy", "Medium", "Hard"];

  filterCategory.innerHTML = categories.map(c => `<option value="${c === "All Categories" ? "all" : c}">${c}</option>`).join("");
  filterCuisine.innerHTML = cuisines.map(c => `<option value="${c === "All Cuisines" ? "all" : c}">${c}</option>`).join("");
  filterDifficulty.innerHTML = difficulties.map(d => `<option value="${d === "Any Difficulty" ? "all" : d}">${d}</option>`).join("");

  filterCookTime.innerHTML = `
    <option value="all" data-min="0" data-max="9999">Any Cook Time</option>
    <option value="under30" data-min="0" data-max="30">Under 30 min</option>
    <option value="30to60" data-min="30" data-max="60">30-60 min</option>
    <option value="over60" data-min="60" data-max="9999">Over 60 min</option>
  `;
}

// Filtrering
function applyFilters() {
  const searchValue = searchInput ? searchInput.value.trim().toLowerCase() : "";

  const selectedCookTimeOption = filterCookTime.options[filterCookTime.selectedIndex];
  const minTime = parseInt(selectedCookTimeOption.dataset.min);
  const maxTime = parseInt(selectedCookTimeOption.dataset.max);

  filteredRecipes = allRecipes.filter(r => {
    const matchesSearch = r.strMeal.toLowerCase().includes(searchValue);
    const matchesCategory = filterCategory.value === "all" || r.strCategory === filterCategory.value;
    const matchesCuisine = filterCuisine.value === "all" || r.strArea === filterCuisine.value;
    const matchesCookTime = filterCookTime.value === "all" || (r.cooktime >= minTime && r.cooktime <= maxTime);
    const matchesDifficulty = filterDifficulty.value === "all" || r.difficulty === filterDifficulty.value;

    return matchesSearch && matchesCategory && matchesCuisine && matchesCookTime && matchesDifficulty;
  });

  displayRecipes(filteredRecipes);
  updateTags();
}

// Tags til aktive filtre
function updateTags() {
  activeFiltersContainer.innerHTML = "";

  const filters = [
    { el: filterCategory, label: "Category" },
    { el: filterCuisine, label: "Cuisine" },
    { el: filterCookTime, label: "Cook Time" },
    { el: filterDifficulty, label: "Difficulty" }
  ];

  filters.forEach(f => {
    if (f.el.value !== "all") {
      const tag = document.createElement("div");
      tag.classList.add("filter-tag");
      tag.innerHTML = `${f.label}: ${f.el.options[f.el.selectedIndex].text} <button>&times;</button>`;
      tag.querySelector("button").addEventListener("click", () => {
        f.el.value = "all";
        applyFilters();
        updateTags();
      });
      activeFiltersContainer.appendChild(tag);
    }
  });
}

// Event listeners
if (searchInput) searchInput.addEventListener("input", applyFilters);
[filterCategory, filterCuisine, filterCookTime, filterDifficulty].forEach(el => el.addEventListener("change", () => {
  applyFilters();
  updateTags();
}));

// Initial load
fetchAllRecipes();