document.addEventListener("DOMContentLoaded", () => {
  const favoritesContainer = document.getElementById("favorites-container");
  const emptyMessage = document.getElementById("empty-message");

  let favorites = JSON.parse(localStorage.getItem("favorites")) || [];

  if (favorites.length === 0) {
    emptyMessage.classList.remove("hidden");
  } else {
    emptyMessage.classList.add("hidden");

    favorites.forEach((movie) => {
      const genres = checkGenre(movie.genre_ids || []);

      const movieEl = document.createElement("div");
      movieEl.className =
        "bg-gray-800 rounded-2xl shadow-lg overflow-hidden hover:scale-105 hover:shadow-xl transition transform";

      movieEl.innerHTML = `
        <img src="https://image.tmdb.org/t/p/w500/${movie.poster}" alt="${movie.title}" class="w-full h-64 object-cover" />
        <div class="p-4">
          <h3 class="text-lg font-bold">${movie.title}</h3>
          <p class="text-gray-400 text-sm">📅 ${movie.releaseDate}</p>
          <p class="text-gray-300 text-xs my-2">🎬 <span class="italic font-bold">${genres}</span></p>
          <p class="text-gray-400 text-sm mt-2">${movie.overview}</p>
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

//Genre checken
function checkGenre(genreIds) {
  const genresArray = [
    { id: 28, name: "Action" },
    { id: 12, name: "Adventure" },
    { id: 16, name: "Animation" },
    { id: 35, name: "Comedy" },
    { id: 80, name: "Crime" },
    { id: 99, name: "Documentary" },
    { id: 18, name: "Drama" },
    { id: 10751, name: "Family" },
    { id: 14, name: "Fantasy" },
    { id: 36, name: "History" },
    { id: 27, name: "Horror" },
    { id: 10402, name: "Music" },
    { id: 9648, name: "Mystery" },
    { id: 10749, name: "Romance" },
    { id: 878, name: "Science Fiction" },
    { id: 10770, name: "TV Movie" },
    { id: 53, name: "Thriller" },
    { id: 10752, name: "War" },
    { id: 37, name: "Western" },
  ];

  const names = genresArray
    .filter((genre) => genreIds.includes(genre.id))
    .map((genre) => genre.name);
  return names.join(", ");
}
