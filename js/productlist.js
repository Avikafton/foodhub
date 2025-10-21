// ====== SELECTORS & SETUP ======
const recipesContainer = document.getElementById("recipes") || document.querySelector(".recipe-grid");
const searchForm = document.getElementById("searchForm");
const searchInput = document.getElementById("searchInput");

// Disse findes kun på productlist-siden — vi guarder, så koden virker på begge sider
const filterCategory   = document.getElementById("filterCategory");
const filterCuisine    = document.getElementById("filterCuisine");
const filterCookTime   = document.getElementById("filterCookTime");
const filterDifficulty = document.getElementById("filterDifficulty");

const filterBar = document.querySelector(".filter-bar");
const activeFiltersContainer = document.createElement("div");
activeFiltersContainer.classList.add("active-filters");
if (filterBar && filterBar.after) filterBar.after(activeFiltersContainer);

let allRecipes = [];
let filteredRecipes = [];

// URL helpers
const urlParams = new URLSearchParams(window.location.search);
const isProductListPage = /productlist\.html$/i.test(location.pathname) || !!filterBar;

// Debounce helper
function debounce(fn, delay = 300) {
  let t;
  return (...args) => {
    clearTimeout(t);
    t = setTimeout(() => fn(...args), delay);
  };
}

// ====== FETCH & NORMALIZE ======
// Cacher i sessionStorage så vi ikke henter 26 gange hver navigering
const CACHE_KEY = "mealdb_seed_102";

async function fetchAllRecipes() {
  // Returner cache hvis den findes
  const cached = sessionStorage.getItem(CACHE_KEY);
  if (cached) {
    allRecipes = JSON.parse(cached);
    filteredRecipes = [...allRecipes];
    safePopulateDropdowns();
    applyFilters();
    updateTags();
    return;
  }

  const alphabet = "abcdefghijklmnopqrstuvwxyz".split("");
  const totalLimit = 102;
  let all = [];

  try {
    for (const letter of alphabet) {
      if (all.length >= totalLimit) break;
      const url = `https://www.themealdb.com/api/json/v1/1/search.php?f=${letter}`;
      const res = await fetch(url, { headers: { Accept: "application/json" } });
      if (!res.ok) continue;
      const data = await res.json();
      if (data && data.meals) {
        const remaining = totalLimit - all.length;
        all = all.concat(data.meals.slice(0, remaining));
      }
    }

    allRecipes = all.map(meal => {
      const cooktime = Math.floor(Math.random() * 90) + 10; // 10–100 min
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

    sessionStorage.setItem(CACHE_KEY, JSON.stringify(allRecipes));
    filteredRecipes = [...allRecipes];
    safePopulateDropdowns();
    applyFilters();
    updateTags();
  } catch (err) {
    console.error(err);
    showMessage("Kunne ikke hente opskrifter lige nu. Prøv at genindlæse siden.");
  }
}

// ====== RENDERING ======
function showMessage(msg) {
  if (!recipesContainer) return;
  recipesContainer.innerHTML = `<p class="empty" role="status">${msg}</p>`;
}

function displayRecipes(recipes) {
  if (!recipesContainer) return;
  recipesContainer.innerHTML = "";
  if (!recipes || recipes.length === 0) {
    showMessage("Ingen opskrifter matchede din søgning.");
    return;
  }

  // Små performance forbedringer: brug DocumentFragment
  const frag = document.createDocumentFragment();

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
    frag.appendChild(card);
  });

  recipesContainer.appendChild(frag);
}

// ====== DROPDOWNS ======
function safePopulateDropdowns() {
  if (!allRecipes.length) return;

  // Hvis dropdowns ikke findes (fx på forsiden), skip
  if (!filterCategory || !filterCuisine || !filterCookTime || !filterDifficulty) return;

  const categories  = ["All Categories", ...new Set(allRecipes.map(r => r.strCategory))];
  const cuisines    = ["All Cuisines",  ...new Set(allRecipes.map(r => r.strArea))];
  const difficulties = ["Any Difficulty", "Easy", "Medium", "Hard"];

  filterCategory.innerHTML = categories
    .map(c => `<option value="${c === "All Categories" ? "all" : c}">${c}</option>`).join("");

  filterCuisine.innerHTML = cuisines
    .map(c => `<option value="${c === "All Cuisines" ? "all" : c}">${c}</option>`).join("");

  filterDifficulty.innerHTML = difficulties
    .map(d => `<option value="${d === "Any Difficulty" ? "all" : d}">${d}</option>`).join("");

  filterCookTime.innerHTML = `
    <option value="all" data-min="0" data-max="9999">Any Cook Time</option>
    <option value="under30" data-min="0" data-max="30">Under 30 min</option>
    <option value="30to60" data-min="30" data-max="60">30–60 min</option>
    <option value="over60" data-min="60" data-max="9999">Over 60 min</option>
  `;
}

// ====== FILTERING & TAGS ======
function applyFilters() {
  const q = (searchInput?.value || "").trim().toLowerCase();

  // Tolerér manglende dropdowns
  const selectedCookTimeOption = filterCookTime?.options?.[filterCookTime.selectedIndex];
  const minTime = selectedCookTimeOption ? parseInt(selectedCookTimeOption.dataset.min) : 0;
  const maxTime = selectedCookTimeOption ? parseInt(selectedCookTimeOption.dataset.max) : 9999;

  filteredRecipes = allRecipes.filter(r => {
    const matchesSearch     = !q || r.strMeal.toLowerCase().includes(q);
    const matchesCategory   = !filterCategory || filterCategory.value === "all" || r.strCategory === filterCategory.value;
    const matchesCuisine    = !filterCuisine  || filterCuisine.value  === "all" || r.strArea     === filterCuisine.value;
    const matchesCookTime   = !filterCookTime || filterCookTime.value === "all" || (r.cooktime >= minTime && r.cooktime <= maxTime);
    const matchesDifficulty = !filterDifficulty || filterDifficulty.value === "all" || r.difficulty === filterDifficulty.value;

    return matchesSearch && matchesCategory && matchesCuisine && matchesCookTime && matchesDifficulty;
  });

  displayRecipes(filteredRecipes);
  updateTags();
}

function updateTags() {
  if (!activeFiltersContainer) return;
  activeFiltersContainer.innerHTML = "";

  const filters = [
    filterCategory && { el: filterCategory, label: "Category" },
    filterCuisine  && { el: filterCuisine,  label: "Cuisine" },
    filterCookTime && { el: filterCookTime, label: "Cook Time" },
    filterDifficulty && { el: filterDifficulty, label: "Difficulty" }
  ].filter(Boolean);

  filters.forEach(f => {
    if (f.el.value !== "all") {
      const tag = document.createElement("div");
      tag.classList.add("filter-tag");
      tag.innerHTML = `
        ${f.label}: ${f.el.options[f.el.selectedIndex].text}
        <button type="button" aria-label="Remove ${f.label} filter">&times;</button>
      `;
      tag.querySelector("button").addEventListener("click", () => {
        f.el.value = "all";
        applyFilters();
      });
      activeFiltersContainer.appendChild(tag);
    }
  });
}

// ====== EVENTS ======
// 1) Live-søgning med debounce (kun hvor input findes)
if (searchInput) {
  searchInput.addEventListener("input", debounce(() => {
    const val = searchInput.value.trim();
    // Hold URL'en opdateret på productlist
    if (isProductListPage) {
      const p = new URLSearchParams(location.search);
      if (val) p.set("search", val); else p.delete("search");
      history.replaceState({}, "", `${location.pathname}?${p.toString()}`);
    }
    applyFilters();
  }, 350));
}

// 2) Submit i header-form
if (searchForm) {
  searchForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const q = (searchInput?.value || "").trim();
    if (!q) return;

    // Hvis vi ikke er på productlist, så redirect dertil
    if (!isProductListPage) {
      const target = new URL("productlist.html", location.origin);
      target.searchParams.set("search", q);
      location.href = target.toString();
      return;
    }

    // Ellers opdater URL og filtrér
    const p = new URLSearchParams(location.search);
    p.set("search", q);
    history.replaceState({}, "", `${location.pathname}?${p.toString()}`);
    applyFilters();
  });
}

// 3) Dropdown ændringer (kun hvor de findes)
[filterCategory, filterCuisine, filterCookTime, filterDifficulty]
  .filter(Boolean)
  .forEach(el => el.addEventListener("change", applyFilters));

// ====== HYDRATION VED LOAD ======
document.addEventListener("DOMContentLoaded", () => {
  // Hent initial søgequery fra URL, så vi kan pre-fylde inputtet
  const initialQ = urlParams.get("search") || "";
  if (searchInput && initialQ) searchInput.value = initialQ;

  // Hent opskrifter og apply initial filters
  fetchAllRecipes().then(() => {
    // Hvis der var en query i URL, så filtrér ud fra den
    if (initialQ) applyFilters();
    // Hvis vi står på productlist uden query, vis alle
    if (!initialQ && isProductListPage) applyFilters();
  });
});
