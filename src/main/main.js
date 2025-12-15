const main = document.querySelector("main");
const searchInput = document.querySelector(`input[type="text"]`);
const searchButton = document.getElementById("search-button");
const loadMoreBtn = document.querySelector(".load-more-btn");
const apikey = process.env.API_KEY;
let watchlistArr = JSON.parse(localStorage.getItem("watchlistArr")) || [];
let currentMoviesRenderedInImdbIdArr = [];
let currentMoviesRenderedIn = 0;
let currentSearchTerm = "";
let pageToRender = 1;
let totalResults = 0;

//Watches for clicks
main.addEventListener("click",(e)=>{
    // If the watchlist button is clicked, add to localStorage.
    if(e.target.dataset.imdbId){
        watchlistArr.push(e.target.dataset.imdbId);
        localStorage.setItem("watchlistArr",JSON.stringify(watchlistArr));
    }
})

//Runs function when the search button is clicked
searchButton.addEventListener("click",async ()=>{
    //Reset values that track what's on the page
    currentMoviesRenderedIn = 0;
    totalResults = 0;
    currentMoviesRenderedInImdbIdArr = [];
    pageToRender=1;
    currentSearchTerm = searchInput.value;
    await handleSearch(true)
    pageToRender++
})

loadMoreBtn.addEventListener("click",async ()=>{
    if(currentMoviesRenderedIn >= totalResults){
        loadMoreBtn.classList.add("hidden");
        return
    }

    await handleSearch(false)
    pageToRender++
})

async function handleSearch(isFirstSearch){
    //Handles Fetch
    const resp = await fetch(`http://www.omdbapi.com/?apikey=a8e4ebcc&s=${currentSearchTerm}&type=movie&page=${pageToRender}`);
    const data = await resp.json();
    
    //If the response is false
    if (data.Response === "False"){
        main.innerHTML = "<p>Unable to find what you’re looking for. Please try another search.</p>"
        return
    }
    
    //Sets up the global variable for when we want to track how many movies are in the Omdb.
    totalResults = data.totalResults;
    
    let html = "";

    //Loops through the results and handles duplicates. Adds to global variables to track how many movies are rendered.
    for(let searchResultMovie of data.Search){
        let imdbId = searchResultMovie.imdbID;
        if(!currentMoviesRenderedInImdbIdArr.includes(imdbId)){
            let result = await handleFetchIndividualMovie(imdbId);
            currentMoviesRenderedInImdbIdArr.push(imdbId)
            currentMoviesRenderedIn++
            html += result;
        }
    }
    //Only renders in the loadMoreBtn if the currentMoviesRenderedIn is less than the totalResults 
    if(currentMoviesRenderedIn >= totalResults){
        isFirstSearch? main.innerHTML = html: main.innerHTML += html;
        loadMoreBtn.classList.add("hidden");
        return
    }
    loadMoreBtn.classList.remove("hidden");
    isFirstSearch? main.innerHTML = html: main.innerHTML += html;
}

async function handleFetchIndividualMovie(imdbId){
    const res = await fetch(`http://www.omdbapi.com/?apikey=a8e4ebcc&i=${imdbId}&plot=short`)
    const data = await res.json();
        let html = `
        <section class="movie" tabindex="0">
            <img src="${data.Poster}" alt="Photo of ${data.Title}"/>
            <div class="outer-movie-info">
                <div class="title-container">
                    <h3 class="title">${data.Title}</h3>
                    <div class="rating">
                        <i class="fa-solid fa-star"></i>
                        <p>${data.imdbRating}</p>
                    </div>
                </div>
                <div class="inner-movie-info">
                    <p>${data.Runtime}</p>
                    <p>${data.Genre}</p>
                </div>
                <button class="add-watchlist-btn" data-imdb-id="${data.imdbID}">
                    <i class="fa-solid fa-circle-plus"></i>
                    Watchlist
                </button>
                <p class="summary">${data.Plot}</p>
            </div>
        </section>
        `
    return html
}
