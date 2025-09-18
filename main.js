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
const search = document.getElementById("search-container");
const searchModal = document.getElementById("searchModal");
const searchModalContainer = document.getElementById("searchModalContainer");

const popularContainer = document.getElementById("movies-container");

const searchResults = document.getElementById("searchResults");

const movieModal = document.getElementById("movieModal");
const movieModalContainer = document.getElementById("movieModal-container");
const modalContent = document.getElementById("modalContent");

// Fetch Movies Genre
let genresArray = [];

fetch(urlGenre, options)
  .then((res) => res.json())
  .then((json) => {
    genresArray = json.genres;
  })
  .catch((err) => console.error(err));

// Fetch Popular Movies
fetch(urlPopular, options)
  .then((res) => res.json())
  .then((json) => renderPopular(json))
  .catch((err) => console.error(err));

search.addEventListener("focus", () => {
  searchModal.classList.remove("hidden");
  searchModalContainer.value = "";
  searchModalContainer.focus();
  searchResults.innerHTML = "";
});

searchModal.addEventListener("click", (e) => {
  if (e.target === searchModal) {
    searchModal.classList.add("hidden");
  }
});

searchModalContainer.addEventListener("input", (e) => {
  const inputText = e.target.value;

  const searchUrl = `https://api.themoviedb.org/3/search/movie?query=${inputText}&include_adult=false&language=en-US&page=1`;
  fetch(searchUrl, options)
    .then((res) => res.json())
    .then((json) => renderSearch(json))
    .catch((err) => console.error(err));
});

popularContainer.addEventListener("click", (e) => {
  if (e.target.tagName === "BUTTON" || e.target.tagName === "P") return;
  const card = e.target.closest("[data-movie-id]");
  if (!card) return;
  const movieId = card.dataset.movieId;
  renderCloseModal();
  renderMovieDetails(movieId);
});

const renderMovie = (data) => {
  const genres = checkGenre(data.genre_ids);

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
        <div class="flex justify-between items-center mt-4">  
          <button class="bg-yellow-400 text-gray-900 px-3 py-1 rounded-full text-xs font-semibold hover:bg-yellow-300 transition cursor-pointer hidden">
            Show More
          </button>

          <button onclick="addToFavorites(${data.id}, '${data.title}', '${
    data.poster_path
  }', '${data.release_date}')"
            class="bg-green-400 text-gray-900 px-3 py-1 rounded-full text-xs font-semibold hover:bg-green-300 transition cursor-pointer"
          >
            ➕ Favorites
          </button>
        </div>
      </div>
    </div>`;

  popularContainer.insertAdjacentHTML("beforeend", html);
};

const renderPopular = (data) => {
  const movies = data.results;
  movies.forEach((movie) => renderMovie(movie));
  console.log("Result : ", movies);
};

const renderSearchResult = (data) => {
  const genres = checkGenre(data.genre_ids);

  const imgMovie =
    data.poster_path === null
      ? data.backdrop_path === null
        ? "src/tmdb.jpeg"
        : "https://image.tmdb.org/t/p/w500/" + data.backdrop_path
      : "https://image.tmdb.org/t/p/w500/" + data.poster_path;

  const html = `
  <li data-movie-id="${
    data.id
  }" class="group flex justify-between py-2 rounded-lg bg-gray-700 hover:bg-yellow-500 hover:text-black cursor-pointer transition">
    <div class="ml-4">
      <p class="font-semibold group-hover:font-bold">
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
};

const renderSearch = (data) => {
  const movieList = data.results;

  searchResults.innerHTML = "";

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

/*const renderSearch = (data, word) => {
  const movieList = data.results;

  searchResults.innerHTML = "";

  if (!word) return;
  const lowerWord = word.toLowerCase();

  const filterMovie = movieList.filter((mv) =>
    mv.title.toLowerCase().includes(lowerWord)
  );
  if (filterMovie.length === 0) {
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

  filterMovie.forEach((movie) => renderSearchResult(movie));
};
*/
const renderMovieDetails = (movieId) => {
  console.log("je suis ici");
  const urlMovie = `https://api.themoviedb.org/3/movie/${movieId}?language=en-US`;
  const urlVideos = `https://api.themoviedb.org/3/movie/${movieId}/videos?language=en-US`;

  Promise.all([
    fetch(urlMovie, options).then((res) => res.json()),
    fetch(urlVideos, options).then((res) => res.json()),
  ])
    .then(([movieData, videosData]) => {
      renderShowMovieDetails(movieData, videosData);
      console.log("mData", movieData, "vData", videosData);
    })
    .catch((err) => console.error(err));
};

const renderShowMovieDetails = (mData, vData) => {
  let youTube = "";
  const trailer = vData.results.find(
    (video) =>
      video.site === "YouTube" && video.type === "Trailer" && video.official
  );

  if (trailer) {
    youTube = `https://www.youtube.com/embed/${trailer.key}?autoplay=0&mute=0&controls=0`;
    console.log("Youtube : ", youTube);
  }

  const movieGenre = checkGenreDetail(mData.genres);
  console.log("Genres : ", movieGenre);
  const html = `
    <div class="hidden sm:block w-1/3 h-full">
      <img
        src="https://image.tmdb.org/t/p/w500/${mData.poster_path}"
        alt=""
        class="w-full h-full object-cover"
      />
    </div>

    <div class="w-[90%] sm:w-2/3 flex justify-center flex-col p-4">
      <div class="w-full bg-dark rounded-xl px-6 pt-2 mt-2 sm:pt-6 sm:mt-6 shadow-lg text-white">
        <h2 class="text-2xl text-center font-bold mb-2">Thriller</h2>
      </div>

      <iframe class="w-auto h-[200px] md:h-[300px] lg:h-[400px] rounded-lg shadow-lg" src="${youTube}"
        title="${mData.title} trailer"
        frameborder="0"
        allow="autoplay; encrypted-media"
        allowfullscreen
      ></iframe>

      <div class="w-full bg-dark rounded-xl px-6 py-2 mt-2 shadow-lg text-white">
        <h2 class="text-2xl font-bold text-yellow-400 mb-2">
          ${mData.title}
        </h2>
        <p class="text-gray-300 text-sm mb-2">
          🎬 <span class="italic font-bold">${movieGenre}</span>
        </p>
        <p class="text-sm mb-2">📅 ${mData.release_date}</p>
        <p class="text-sm mb-2">
          <strong>Overview :</strong> ${mData.overview}
        </p>
        <button class="mt-4 px-4 py-2 hover:bg-red-700 bg-green-400 text-gray-900 px-3 py-3 rounded text-xs font-semibold hover:bg-green-300 transition cursor-pointer"
        >
          ➕ Favorites
        </button>
      </div>
    </div>`;

  console.log(html);
  movieModalContainer.insertAdjacentHTML("beforeend", html);
  movieModal.classList.remove("hidden");
};

const renderCloseModal = () => {
  const modalClose = document.createElement("button");
  modalClose.className =
    "absolute top-3 right-3 text-white text-3xl cursor-pointer font-bold hover:text-red-500 transition";
  modalClose.innerHTML = "&times;";

  modalClose.addEventListener("click", () => {
    movieModalContainer.innerHTML = "";
    movieModal.classList.add("hidden");
  });
  movieModalContainer.appendChild(modalClose);
};

const truncate = (text, maxLength) => {
  if (!text) return;
  return text.length > maxLength ? text.substring(0, maxLength) + "..." : text;
};

function checkGenre(GenreIds) {
  const names = genresArray
    .filter((genre) => GenreIds.includes(genre.id))
    .map((genre) => genre.name);
  return names.join(", ");
}

function checkGenreDetail(genres) {
  const names = genres.map((genre) => genre.name);
  return names.join(", ");
}

//NEU
// Fügt einen Film zu Favoriten hinzu
function addToFavorites(id, title, poster, releaseDate, button) {
  let favorites = JSON.parse(localStorage.getItem("favorites")) || [];

  const isAlreadyFavorite = favorites.find((f) => f.id === id);

  if (!isAlreadyFavorite) {
    favorites.push({ id, title, poster, releaseDate });
    localStorage.setItem("favorites", JSON.stringify(favorites));

    if (button) {
      button.textContent = "⭐ Favorit";
      button.disabled = true;
      button.classList.remove("bg-green-400", "hover:bg-green-300");
      button.classList.add("bg-gray-500", "cursor-not-allowed");
    }

    alert(`${title} wurde zu deinen Favoriten hinzugefügt!`);
  } else {
    if (button) {
      button.textContent = "⭐ Favorit";
      button.disabled = true;
      button.classList.remove("bg-green-400", "hover:bg-green-300");
      button.classList.add("bg-gray-500", "cursor-not-allowed");
    }
    alert(`${title} ist bereits in deinen Favoriten.`);
  }
}
// Funktionen für die Suche
// Abschnitt für die Suchfunktion
// Eine globale click Aktion für die modale Liste
/*const searchResultContainer = document.getElementById("searchResult");
searchResultContainer.addEventListener("click", (e) => {
  console.log(e.target);
  console.log("@@@: " + e.target.getAttribute("id"));
});

const renderSearchResult = (data) => {
  const html = `
  <li class="bg- text-gray-400 text-sm" id="${data.id}">Title: ${truncate(
    data.title,
    120
  )} release: ${data.release_date}"></li>
  `;
  searchResultContainer.insertAdjacentHTML("beforeend", html);
};

/*const renderSearch = (data) => {
  const movieList = data.results;
  movieList.forEach((movie) => renderSearchResult(movie));
};

const movieSearch = async (urlSearch) => {
  try {
    const movieResultList = document.getElementById("searchModalContainer");
    searchResultContainer.innerHTML = "";
    const res = await fetch(urlSearch, options);
    if (!res.ok) throw new Error("Daten konnten nicht geladen werden!");
    const data = await res.json();
    renderSearch(data);
    document.getElementById("searchModalContainer").style = "";
  } catch (e) {
    console.error(e);
  }
};

const searchInput = document.querySelector(
  "body > header > div.max-w-7xl.mx-auto.flex.justify-between.items-center.p-4 > div > input"
);

if (searchInput) {
  searchInput.addEventListener("keypress", (e) => {
    if (e.key === "Enter") {
      const searchString = searchInput.value;
      const urlSearch = `https://api.themoviedb.org/3/search/movie?query=${searchString}&include_adult=false&language=en-US&page=1`;
      movieSearch(urlSearch);
    }
  });
}

const firstButton = document.querySelector("footer button");
firstButton.addEventListener("click", () => {
  document.getElementById("searchModalContainer").style = "display: none";
});

const secondButton = document.getElementById("btnDone");
secondButton.addEventListener("click", () => {
  document.getElementById("searchModalContainer").style = "display: none";
  searchInput.value = "";
});*/
