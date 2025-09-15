const url = "https://api.themoviedb.org/3/movie/popular?language=en-US&page=1";
const options = {
  method: "GET",
  headers: {
    accept: "application/json",
    Authorization:
      "Bearer eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiIwMDdlZjc4NjQ5YTg5NDFjNTdiY2UxYmI5NjQ4MzQxZCIsIm5iZiI6MTc1Nzk2NjU3Ni41MjgsInN1YiI6IjY4Yzg3MGYwNmUxYjM5NDFlZGUzMDc4ZSIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.ggZrgF2EHUv4sjnLQzREz9CxC-htfnyjK2oco9qFb8w",
  },
};

fetch(url, options)
  .then((res) => res.json())
  .then((json) => renderPopular(json))
  .catch((err) => console.error(err));

const truncate = (text, maxLength) => {
  if (!text) return;
  return text.length > maxLength ? text.substring(0, maxLength) + "..." : text;
};

const popularContainer = document.getElementById("movies-container");

const renderMovie = (data) => {
  const html = `
    <div
          class="bg-gray-800 rounded-2xl shadow-lg overflow-hidden hover:scale-105 hover:shadow-xl transition transform"
        >
          <img
            src="https://image.tmdb.org/t/p/w500/${data.poster_path}"
            alt="${data.title}"
            class="w-full h-64 object-cover"
          />
          <div class="p-4">
            <h3 class="text-lg font-bold">${data.title}</h3>
            <div class="flex justify-between items-center mt-2 mb-3">
            <span class="inline-block bg-gray-700 text-gray-200 text-xs px-2 py-1 rounded-full">
        📅 ${data.release_date}
      </span>
<span class="bg-yellow-400 text-gray-900 px-3 py-1 rounded-full text-xs font-semibold">⭐ ${data.vote_average.toFixed(
    1
  )}</span>
            </div>
            
            <p class="text-gray-400 text-sm">${truncate(data.overview, 120)}</p>
            <div class="flex justify-between items-center mt-3">
              
              <button
                class="bg-yellow-400 text-gray-900 px-3 py-1 rounded-full text-xs font-semibold hover:bg-yellow-300 transition cursor-pointer"
              >
                Show More
              </button>

              <button
            onclick="addToFavorites(${data.id}, '${data.title}', '${
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
