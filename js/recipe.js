const recipeDetail = document.getElementById("recipeDetail");

// HENT ID FRA URL
const params = new URLSearchParams(window.location.search);
const mealId = params.get("id");

async function fetchRecipeById(id) {
  if (!id) {
    recipeDetail.innerHTML = "<p>No recipe ID provided.</p>";
    return;
  }

  try {
    const response = await fetch(`https://www.themealdb.com/api/json/v1/1/lookup.php?i=${id}`);
    const data = await response.json();

    if (!data.meals || data.meals.length === 0) {
      recipeDetail.innerHTML = "<p>Recipe not found.</p>";
      return;
    }

    const meal = data.meals[0];

    // INGREDIENTSLISTE
    const ingredients = [];
    for (let i = 1; i <= 20; i++) {
      const ingredient = meal[`strIngredient${i}`]?.trim();
      const measure = meal[`strMeasure${i}`]?.trim();
      if (ingredient) {
        ingredients.push(measure ? `${ingredient} - ${measure}` : ingredient);
      }
    }

    // Ekstra felter (du kan tilpasse logikken her)
    const cookTime = meal.strTags?.includes("Quick") ? "15" : "30"; // eksempelværdi
    const difficulty = cookTime <= 20 ? "Easy" : "Medium"; // eksempelværdi
    const cuisine = meal.strArea || "Unknown"; // bruger area som kilde, men kalder det cuisine

    recipeDetail.innerHTML = `
      <h1>${meal.strMeal}</h1>

      <div id="recipeTop">
        <img src="${meal.strMealThumb}" alt="${meal.strMeal}">
        
        <div class="ingredients">
          <h2>Ingredients</h2>
          <ul>
            ${ingredients.map(i => `<li>${i}</li>`).join("")}
          </ul>
        </div>
      </div>

      <div class="recipe-meta">
        <span><strong>Category:</strong> ${meal.strCategory || "N/A"}</span>
        <span><strong>Cuisine:</strong> ${cuisine}</span>
        <span><strong>Cook time:</strong> ${cookTime} min</span>
        <span><strong>Difficulty:</strong> ${difficulty}</span>
      </div>

      <div class="instructions">
        <h2>Instructions</h2>
        <ol>
          ${meal.strInstructions
            .split("\n")
            .filter(line => line.trim() !== "")
            .map(line => `<li>${line}</li>`)
            .join("")}
        </ol>
      </div>

      ${
        meal.strYoutube
          ? `<p><a href="${meal.strYoutube}" target="_blank" class="youtube-link">▶ Watch on YouTube</a></p>`
          : ""
      }
    `;
  } catch (error) {
    console.error("Error fetching recipe:", error);
    recipeDetail.innerHTML = "<p>Could not load recipe.</p>";
  }
}

// KØR FUNKTION 
fetchRecipeById(mealId);