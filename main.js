const urlPopular =
  "https://api.themoviedb.org/3/movie/popular?language=en-US&page=1";
const urlGenre = "https://api.themoviedb.org/3/genre/movie/list?language=en";

const options = {
  method: "GET",
  headers: {
    accept: "application/json",
    Authorization:
      "Bearer eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiIwMDdlZjc4NjQ5YTg5NDFjNTdiY2UxYmI5NjQ4MzQxZCIsIm5iZiI6MTc1Nzk2NjU3Ni41MjgsInN1YiI6IjY4Yzg3MGYwNmUxYjM5NDFlZGUzMDc4ZSIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.ggZrgF2EHUv4sjnLQzREz9CxC-htfnyjK2oco9qFb8w",
  },
};

// =========================
// AUSWAHL DER DOM-ELEMENTE
// =========================

// Abruf der benötigten HTML-Elemente
const search = document.getElementById("search-container");
const searchModal = document.getElementById("searchModal");
const searchModalContainer = document.getElementById("searchModalContainer");

const popularContainer = document.getElementById("movies-container");

const searchResults = document.getElementById("searchResults");

const movieModal = document.getElementById("movieModal");
const movieModalContainer = document.getElementById("movieModal-container");
const modalContent = document.getElementById("modalContent");

const infoModal = document.getElementById("infoModal");
const infoModalContainer = document.getElementById("infoModal-container");
const closeInfoModal = document.getElementById("close-infoModal");
const textInfoModal = document.getElementById("text-infoModal");

// Favoriten aus dem localStorage laden oder leeres Array verwenden
const favorites = JSON.parse(localStorage.getItem("favorites")) ?? [];

// Genres aus der API abrufen und in genresArray speichern
let genresArray = [];

fetch(urlGenre, options)
  .then((res) => res.json())
  .then((json) => {
    genresArray = json.genres;
  })
  .catch((err) => console.error(err));

// Beliebte Filme abrufen und renderPopular-Funktion aufrufen
fetch(urlPopular, options)
  .then((res) => res.json())
  .then((json) => renderPopular(json))
  .catch((err) => console.error(err));

// Wenn man auf die Suchleiste klickt, wird das Suchmodal geöffnet
search.addEventListener("focus", () => {
  searchModal.classList.remove("hidden");
  searchModalContainer.value = "";
  searchModalContainer.focus();
  searchResults.innerHTML = "";
});

// Suchmodal schließen, wenn man außerhalb klickt
searchModal.addEventListener("click", (e) => {
  if (e.target === searchModal) {
    searchModal.classList.add("hidden");
  }
});

// Lauschen der Eingabe in der Suche -> Ergebnisse abrufen
searchModalContainer.addEventListener("input", (e) => {
  const inputText = e.target.value;

  const searchUrl = `https://api.themoviedb.org/3/search/movie?query=${inputText}&include_adult=false&language=en-US&page=1`;
  fetch(searchUrl, options)
    .then((res) => res.json())
    .then((json) => renderSearch(json))
    .catch((err) => console.error(err));
});

// Funktion zum Anzeigen jedes beliebten Films als Karte
const renderMovie = (data) => {
  const genres = checkGenre(data.genre_ids);

  // Verwaltung der Favoriten-Buttons (hinzufügen/entfernen)
  let btnClass = "font-semibold bg-green-400 hover:bg-green-300 cursor-pointer";
  let btnFav = "➕ Favorites";
  let hiddenBtn = "hidden";

  const favorites = JSON.parse(localStorage.getItem("favorites")) ?? [];
  const isFavorite = favorites.find((fav) => fav.id === data.id);

  if (isFavorite) {
    btnClass = "font-bold bg-gray-500";
    btnFav = "⭐ Favorited";
    hiddenBtn = "";
  }

  // Erstellung der HTML-Karte des Films
  const html = `
    <div data-movie-id="${
      data.id
    }" class="bg-gray-800 rounded-2xl shadow-lg overflow-hidden hover:scale-105 hover:shadow-xl transition transform">
      <img
        src="https://image.tmdb.org/t/p/w500/${data.poster_path}"
        alt="${data.title}"
        class="w-full h-64 object-cover cursor-pointer"
      />
      <div class="p-4">
        <h3 class="text-lg font-bold cursor-pointer">${data.title}</h3>
        <div class="flex justify-between items-center mt-2 mb-3">
          <span class="inline-block bg-gray-700 text-gray-200 text-xs px-2 py-1 rounded-full">
            📅 ${data.release_date}
          </span>
          <span class="bg-yellow-400 text-gray-900 px-3 py-1 rounded-full text-xs font-semibold">
            ⭐ ${data.vote_average.toFixed(1)}
          </span>
        </div>
            
        <p class="text-gray-400 text-sm">${truncate(data.overview, 120)}</p>
        <p class="text-gray-300 text-xs my-2">🎬 <span class="italic font-bold">${genres}</span></p>
        <div class="flex justify-start items-center mt-4 gap-2">  
          <button class="bg-yellow-400 text-gray-900 px-3 py-1 rounded-full text-xs font-semibold hover:bg-yellow-300 transition cursor-pointer hidden">
            Show More
          </button>
          <button class="favoriteBtn text-gray-900 px-3 py-1 rounded-full text-xs ${btnClass} transition">
            ${btnFav}
          </button>
          <button class="deleteFavorite text-white-900 font-bold px-3 py-1 rounded-full text-xs bg-red-500 hover:bg-red-300 hover:text-black transition cursor-pointer ${hiddenBtn}">
            ❌ Unfavorite
          </button>
        </div>
      </div>
    </div>`;

  popularContainer.insertAdjacentHTML("beforeend", html);

  // Event Listener auf Bild und Titel hinzufügen, um Details zu öffnen
  const cardMovie = document.querySelector(`div[data-movie-id='${data.id}']`);
  const clickEl = cardMovie.querySelectorAll("img, h3");

  clickEl.forEach((el) => {
    el.addEventListener("click", () => {
      showMovieDetails(data.id);
    });
  });

  // Buttons zum Hinzufügen/Entfernen von Favoriten
  const btn = popularContainer.querySelector(
    `[data-movie-id='${data.id}'] .favoriteBtn`
  );

  const delBtn = popularContainer.querySelector(
    `[data-movie-id='${data.id}'] .deleteFavorite`
  );

  btn.addEventListener("click", () => {
    if (delBtn) {
      delBtn.classList.remove("hidden");
    }

    addToFavorites(
      data.id,
      data.title,
      data.poster_path,
      data.vote_average.toFixed(1),
      data.release_date,
      data.overview,
      genres,
      btn
    );
  });

  delBtn.addEventListener("click", () => {
    unfavoriteMovie(data.id, data.title, btn, delBtn);
  });
};

// Zeigt die Liste der beliebten Filme an
const renderPopular = (data) => {
  const movies = data.results;
  movies.forEach((movie) => renderMovie(movie));
  console.log("Result : ", movies);
};

// Zeigt ein einzelnes Suchergebnis an
const renderSearchResult = (data) => {
  const genres = checkGenre(data.genre_ids);

  // Bestimmt das zu verwendende Bild (Poster, sonst Backdrop, sonst Standardbild)
  const imgMovie =
    data.poster_path === null
      ? data.backdrop_path === null
        ? "src/tmdb.jpeg"
        : "https://image.tmdb.org/t/p/w500/" + data.backdrop_path
      : "https://image.tmdb.org/t/p/w500/" + data.poster_path;

  // Erstellt das HTML für einen Film in den Suchergebnissen
  const html = `
  <li data-movie-id="${
    data.id
  }" class="group flex justify-between py-2 rounded-lg bg-gray-700 hover:bg-yellow-500 hover:text-black cursor-pointer transition">
    <div class="ml-4">
      <p class="font-semibold group-hover:font-bold mr-4">
        ${truncate(data.title, 120)} 
        <span class="text-gray-400 text-sm group-hover:text-green-900">(${
          data.release_date ? data.release_date.slice(0, 4) : "N/A"
        })
        </span>
      </p>
      <p class="text-gray-300 text-sm group-hover:text-green-900 group-hover:font-bold">🎬 <span class="italic">${genres}</span></p>
    </div>
    <img
      src="${imgMovie}"
      alt="${data.title}"
      class="w-12 h-12 rounded mr-4 object-cover" />
  </li>
  `;
  searchResults.insertAdjacentHTML("beforeend", html);

  // Holt das gerade hinzugefügte <li>-Element
  const liMovEl = searchResults.querySelector(`li[data-movie-id='${data.id}']`);

  // Fügt ein Klick-Event hinzu, um die Filmdetails anzuzeigen
  liMovEl.addEventListener("click", () => {
    console.log("cliqué");
    searchModal.classList.add("hidden");
    showMovieDetails(data.id);
  });
};

// Verarbeitet die gesamte Liste der Suchergebnisse
const renderSearch = (data) => {
  const movieList = data.results;

  searchResults.innerHTML = ""; // Löscht die vorherigen Suchergebnisse

  // Wenn keine Ergebnisse vorhanden sind, Nachricht anzeigen
  if (movieList.length === 0) {
    const html = `
      <li class="flex justify-center py-2 rounded-lg bg-gray-700">
        <p class="ml-4 font-semibold">
          No movies were found according to your search
        </p>
      </li>
      `;
    searchResults.insertAdjacentHTML("beforeend", html);
    return;
  }

  movieList.forEach((movie) => renderSearchResult(movie));
};

// Funktion zum Abrufen der Filmdetails und Videos
const renderMovieDetails = (movieId) => {
  const urlMovie = `https://api.themoviedb.org/3/movie/${movieId}?language=en-US`;
  const urlVideos = `https://api.themoviedb.org/3/movie/${movieId}/videos?language=en-US`;

  // Holt die Filminformationen und Videos gleichzeitig ab
  Promise.all([
    fetch(urlMovie, options).then((res) => res.json()),
    fetch(urlVideos, options).then((res) => res.json()),
  ])
    .then(([movieData, videosData]) => {
      renderShowMovieDetails(movieData, videosData);
    })
    .catch((err) => console.error(err));
};

// Zeigt die Filmdetails im Modal an
const renderShowMovieDetails = (mData, vData) => {
  let youTube = "";
  let trailerShow = "";
  let movieGenreHtml = "";

  // Sucht den offiziellen Trailer auf YouTube
  const trailer = vData.results.find(
    (video) =>
      video.site === "YouTube" && video.type === "Trailer" && video.official
  );
  //console.log("mData : ", mData, "vData", vData);

  // Wenn ein Trailer existiert, wird das YouTube-iframe vorbereitet
  if (trailer) {
    youTube = `https://www.youtube.com/embed/${trailer.key}?autoplay=0&mute=0&controls=0`;
    trailerShow = `
    <div class="w-full bg-dark rounded-xl px-6 pt-2 mt-2 sm:pt-6 sm:mt-6 shadow-lg text-white">
        <h2 class="text-2xl text-center font-bold mb-2">Trailer</h2>
      </div>

      <iframe class="w-auto h-[200px] md:h-[300px] lg:h-[400px] rounded-lg shadow-lg" src="${youTube}"
        title="${mData.title} trailer"
        frameborder="0"
        allow="autoplay; encrypted-media"
        allowfullscreen
      ></iframe>`;
  }

  let btnDetailClass =
    "font-semibold bg-green-400 hover:bg-green-300 cursor-pointer";
  let btnDetailFav = "➕ Favorites";
  let hiddenDetailBtn = "hidden";

  // Überprüft, ob dieser Film bereits in den Favoriten ist
  const favorites = JSON.parse(localStorage.getItem("favorites")) ?? [];
  const isFavorite = favorites.find((fav) => fav.id === mData.id);

  if (isFavorite) {
    // Ändert Stil und Text der Schaltfläche, wenn der Film bereits Favorit ist
    btnDetailClass = "font-bold bg-gray-500";
    btnDetailFav = "⭐ Favorited";
    hiddenDetailBtn = "";
  }

  // Erstellt die Liste der Genres für die Anzeige
  const movieGenre = checkGenreDetail(mData.genres);
  if (movieGenre) {
    movieGenreHtml = `
    <p class="text-gray-300 text-sm mb-2">
      🎬 <span class="italic font-bold">${movieGenre}</span>
    </p>`;
  }

  // Bestimmt das anzuzeigende Bild
  const imgMovie =
    mData.poster_path === null
      ? mData.backdrop_path === null
        ? "src/tmdb.jpeg"
        : "https://image.tmdb.org/t/p/w500/" + mData.backdrop_path
      : "https://image.tmdb.org/t/p/w500/" + mData.poster_path;

  // Zeigt eine Zusammenfassung an, falls vorhanden
  const overview = mData.overview
    ? `
      <p class="text-sm mb-2">
        <strong>Overview :</strong> ${mData.overview}
      </p>`
    : "";

  // Erstellt das Haupt-HTML für die Filmdetails
  const html = `
    <div class="hidden sm:block w-1/3 h-full">
      <img
        src="${imgMovie}"
        alt=""
        class="w-full h-full object-cover"
      />
    </div>

    <div class="w-[90%] sm:w-2/3 flex justify-center flex-col p-4">
      ${trailerShow}
      
      <div class="w-full bg-dark rounded-xl px-6 py-2 mt-2 shadow-lg text-white">
        <h2 class="text-2xl font-bold text-yellow-400 mb-2">
          ${mData.title}
        </h2>

        ${movieGenreHtml}
        
        <p class="text-sm mb-2">📅 ${mData.release_date}</p>
        
        ${overview}

        <div class="flex justify-start items-center gap-2"> 
        <button class="favoriteBtn mt-4 px-4 py-2 text-gray-900 px-3 py-3 rounded text-xs ${btnDetailClass} transition cursor-pointer">
            ${btnDetailFav}
          </button>
          <button class="deleteFavorite mt-4 px-4 py-2 text-white-900 font-bold px-3 py-3 rounded text-xs bg-red-500 hover:bg-red-300 hover:text-black transition cursor-pointer ${hiddenDetailBtn}">
            ❌ Unfavorite
          </button>
        </div>
      </div>
    </div>`;

  movieModalContainer.insertAdjacentHTML("beforeend", html);

  movieModal.classList.remove("hidden");

  // Holt die Schaltflächen und fügt Events hinzu, um die Favoriten zu verwalten
  const btnDetail = movieModalContainer.querySelector(".favoriteBtn");
  const delBtnDetail = movieModalContainer.querySelector(".deleteFavorite");

  const favBtn = popularContainer.querySelector(
    `[data-movie-id='${mData.id}'] .favoriteBtn`
  );
  const unfavBtn = popularContainer.querySelector(
    `[data-movie-id='${mData.id}'] .deleteFavorite`
  );

  btnDetail.addEventListener("click", () => {
    if (delBtnDetail) {
      delBtnDetail.classList.remove("hidden");
    }

    addToFavorites(
      mData.id,
      mData.title,
      mData.poster_path,
      mData.vote_average.toFixed(1),
      mData.release_date,
      mData.overview,
      movieGenre,
      btnDetail
    );

    updateFavoriteBtn(true, favBtn, unfavBtn);
  });

  delBtnDetail.addEventListener("click", () => {
    unfavoriteMovie(mData.id, mData.title, btnDetail, delBtnDetail);
    updateFavoriteBtn(false, favBtn, unfavBtn);
  });
};

// Schließt das Modal, wenn man außerhalb des Inhalts klickt
movieModal.addEventListener("click", (e) => {
  if (e.target === movieModal) {
    closeMovieModal();
  }
});

// Fügt einen Schließen-Button im Modal hinzu
const renderCloseModal = (id) => {
  const modalClose = document.createElement("button");
  modalClose.className =
    "absolute top-3 right-3 text-white text-3xl cursor-pointer font-bold hover:text-red-500 transition";
  modalClose.innerHTML = "&times;";

  modalClose.addEventListener("click", () => {
    closeMovieModal();
  });
  movieModalContainer.appendChild(modalClose);
};

// Schließt das Info-Modal, wenn man außerhalb klickt
infoModal.addEventListener("click", (e) => {
  if (e.target === infoModal) {
    infoModal.classList.add("hidden");
  }
});

// Ermöglicht das Schließen des Info-Modals mit Enter oder Space
document.addEventListener("keydown", (e) => {
  if (!infoModal.classList.contains("hidden")) {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      infoModal.classList.add("hidden");
    }
  }
});

// Schließt das Info-Modal, wenn man auf den Button klickt
closeInfoModal.addEventListener("click", () => {
  infoModal.classList.add("hidden");
});

// =========================
// FUNCTIONS
// =========================

// Kürzt einen zu langen Text (fügt "..." hinzu)
function truncate(text, maxLength) {
  if (!text) return;
  return text.length > maxLength ? text.substring(0, maxLength) + "..." : text;
}

// Überprüft die Filmgenres und gibt die Namen zurück
function checkGenre(GenreIds) {
  const names = genresArray
    .filter((genre) => GenreIds.includes(genre.id))
    .map((genre) => genre.name);
  return names.join(", ");
}

// Holt die Genres aus den Filmdetails
function checkGenreDetail(genres) {
  const names = genres.map((genre) => genre.name);
  return names.join(", ");
}

// Fügt einen Film zu den Favoriten hinzu und aktualisiert den Button
function addToFavorites(
  id,
  title,
  poster,
  voteAverage,
  releaseDate,
  overview,
  genres,
  button
) {
  const favorites = JSON.parse(localStorage.getItem("favorites")) ?? [];

  // Prüft, ob der Film schon in den Favoriten ist
  if (!favorites.find((f) => f.id === id)) {
    favorites.push({
      id,
      title,
      poster,
      voteAverage,
      releaseDate,
      overview,
      genres,
    });
    localStorage.setItem("favorites", JSON.stringify(favorites));

    // Aktualisiert den Button-Stil, um zu zeigen, dass es favorisiert ist
    if (button) {
      button.textContent = "⭐ Favorited";
      button.disabled = true;
      button.classList.remove(
        "bg-green-400",
        "hover:bg-green-300",
        "cursor-pointer"
      );
      button.classList.add("font-bold", "bg-gray-500");
    }

    // Zeigt eine Bestätigungsmeldung
    infoModalContainer.classList.remove("bg-orange-200");
    infoModalContainer.classList.add("bg-green-800");
    textInfoModal.classList.remove("text-black");
    textInfoModal.classList.add("text-white");

    textInfoModal.innerHTML = `🎉 <span class="font-bold">${title}</span> has been added to your favorites!`;
    infoModal.classList.remove("hidden");
  }
}

// Entfernt einen Film aus den Favoriten
function removeFromFavorites(id) {
  const favorites = JSON.parse(localStorage.getItem("favorites")) ?? [];
  const updateFavorites = favorites.filter((movie) => movie.id !== id);
  localStorage.setItem("favorites", JSON.stringify(updateFavorites));
}

// Zeigt die Details eines Films
function showMovieDetails(movieId) {
  renderCloseModal(movieId);
  renderMovieDetails(movieId);
}

// 🔒 Schließt das Modal und leert seinen Inhalt
function closeMovieModal() {
  movieModalContainer.innerHTML = "";
  movieModal.classList.add("hidden");
}

// Entfernt einen Film aus den Favoriten und setzt den Button zurück
function unfavoriteMovie(movieId, movieTitle, favBtn, unfavBtn) {
  removeFromFavorites(movieId);
  unfavBtn.classList.add("hidden");

  favBtn.textContent = "➕ Favorites";
  favBtn.classList.remove("font-bold", "bg-gray-500");
  favBtn.classList.add("bg-green-400", "hover:bg-green-300", "cursor-pointer");
  favBtn.disabled = false;

  infoModalContainer.classList.remove("bg-green-800");
  infoModalContainer.classList.add("bg-orange-200");
  textInfoModal.classList.remove("text-white");
  textInfoModal.classList.add("text-black");
  textInfoModal.innerHTML = `⚠️ <span class="font-bold">${movieTitle}</span> has been removed from your favorites!`;
  infoModal.classList.remove("hidden");
}

// Aktualisiert den Favoriten-Button-Stil je nach Status
function updateFavoriteBtn(isFavorite, favBtn, unfavBtn) {
  if (!favBtn) return;

  if (isFavorite) {
    favBtn.textContent = "⭐ Favorited";
    favBtn.classList.remove(
      "font-semibold",
      "bg-green-400",
      "hover:bg-green-300",
      "cursor-pointer"
    );
    favBtn.classList.add("font-bold", "bg-gray-500");

    unfavBtn.classList.remove("hidden");
  } else {
    favBtn.textContent = "➕ Favorites";
    favBtn.classList.remove("font-bold", "bg-gray-500");
    favBtn.classList.add(
      "font-semibold",
      "bg-green-400",
      "hover:bg-green-300",
      "cursor-pointer"
    );

    unfavBtn.classList.add("hidden");
  }
}
