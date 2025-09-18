document.addEventListener("DOMContentLoaded", () => {
  const favoritesContainer = document.getElementById("favorites-container");
  const emptyMessage = document.getElementById("empty-message");

  let favorites = JSON.parse(localStorage.getItem("favorites")) || [];

  // Zeige oder verstecke die Nachricht, wenn keine Favoriten vorhanden sind
  if (favorites.length === 0) {
    emptyMessage.classList.remove("hidden");
  } else {
    emptyMessage.classList.add("hidden");
    favorites.forEach((movie) => {
      const movieEl = document.createElement("div");
      movieEl.className =
        "bg-gray-800 rounded-2xl shadow-lg overflow-hidden hover:scale-105 hover:shadow-xl transition transform";

      movieEl.innerHTML = `
        <img src="https://image.tmdb.org/t/p/w500/${movie.poster}" alt="${movie.title}" class="w-full h-64 object-cover" />
        <div class="p-4">
          <h3 class="text-lg font-bold">${movie.title}</h3>
          <p class="text-gray-400 text-sm">📅 ${movie.releaseDate}</p>
          <button class="mt-2 bg-red-500 text-white px-3 py-1 rounded text-xs font-semibold hover:bg-red-600 transition"
            onclick="removeFromFavorites(${movie.id})">
            ❌ Aus Favoriten entfernen
          </button>
        </div>
      `;

      favoritesContainer.appendChild(movieEl);
    });
  }
});

// Funktion zum Entfernen eines Favoriten
function removeFromFavorites(id) {
  let favorites = JSON.parse(localStorage.getItem("favorites")) || [];
  favorites = favorites.filter((movie) => movie.id !== id);
  localStorage.setItem("favorites", JSON.stringify(favorites));

  // Entferne alle Elemente mit diesem movieId aus dem DOM
  const favoritesContainer = document.getElementById("favorites-container");
  const movieElements = favoritesContainer.querySelectorAll("div");
  movieElements.forEach((el) => {
    const button = el.querySelector("button");
    if (
      button &&
      button.getAttribute("onclick")?.includes(`removeFromFavorites(${id}`)
    ) {
      el.remove();
    }
  });

  // Zeige Nachricht, falls keine Favoriten mehr vorhanden
  if (favorites.length === 0) {
    document.getElementById("empty-message").classList.remove("hidden");
  }
}
