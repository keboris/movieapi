const favoritesContainer = document.getElementById("favorites-container");
const emptyMessage = document.getElementById("empty-message");

document.addEventListener("DOMContentLoaded", () => {
  const favorites = JSON.parse(localStorage.getItem("favorites")) ?? [];

  if (favorites.length === 0) {
    emptyMessage.classList.remove("hidden");
  } else {
    emptyMessage.classList.add("hidden");

    favorites.forEach((movie) => {
      const html = `
      <div data-movie-id="${movie.id}" class="bg-gray-800 rounded-2xl shadow-lg overflow-hidden hover:scale-105 hover:shadow-xl transition transform">
        <img src="https://image.tmdb.org/t/p/w500/${movie.poster}" alt="${movie.title}" class="w-full h-64 object-cover" />
        <div class="p-4">
          <h3 class="text-lg font-bold">${movie.title}</h3>
          <div class="flex justify-between items-center mt-2 mb-3">
          <span class="inline-block bg-gray-700 text-gray-200 text-xs px-2 py-1 rounded-full">
            📅 ${movie.releaseDate}
          </span>
          <span class="bg-yellow-400 text-gray-900 px-3 py-1 rounded-full text-xs font-semibold">
            ⭐ ${movie.voteAverage}
          </span>
        </div>
        <p class="text-gray-400 text-sm mt-2">${movie.overview}</p>
          <button class="favoriteBtn mt-2 bg-red-500 text-white px-3 py-2 rounded text-xs font-semibold hover:bg-red-600 transition cursor-pointer">
            ❌ Remove from favorites
          </button>
        </div>
      </div>
      `;

      favoritesContainer.insertAdjacentHTML("afterbegin", html);

      const favoriteBox = favoritesContainer.querySelector(
        `[data-movie-id='${movie.id}']`
      );
      const btn = favoritesContainer.querySelector(
        `[data-movie-id='${movie.id}'] .favoriteBtn`
      );

      btn.addEventListener("click", () => {
        removeFromFavorites(movie.id);
        favoriteBox.remove();
      });
    });
  }
});

// Funktion zum Entfernen eines Favoriten
function removeFromFavorites(id) {
  const favorites = JSON.parse(localStorage.getItem("favorites")) ?? [];
  const updateFavorites = favorites.filter((movie) => movie.id !== id);
  localStorage.setItem("favorites", JSON.stringify(updateFavorites));

  // Zeige Nachricht, falls keine Favoriten mehr vorhanden
  if (updateFavorites.length === 0) {
    emptyMessage.classList.remove("hidden");
  }
}
