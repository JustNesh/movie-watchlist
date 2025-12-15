const main = document.querySelector("main");
let watchlistArr = JSON.parse(localStorage.getItem("watchlistArr")) || [];
let cache = [];

document.addEventListener("click",(e)=>{
    if(e.target.dataset.imdbId){
        // addToWatchlistArr(e.target.dataset.imdbID,watchlistArr);
        watchlistArr = watchlistArr.filter((cur)=> cur != e.target.dataset.imdbId);
        localStorage.setItem("watchlistArr",JSON.stringify(watchlistArr));
        cache = cache.filter((cur)=>!cur.includes(e.target.dataset.imdbId));
        console.log(watchlistArr);
        renderWatchList();
    }

})

// This is a fetch request to render each movie from the watchlist when loading in.
async function onLoadRenderWatchList(){
    if(watchlistArr.length === 0){
        main.innerHTML = "<h3>Your watchlist is looking a little empty...</h3>"
        return false
    }
    let mainInnerHTML = "";
    for(let movieId of watchlistArr){
        const htmlMovie = await handleFetchIndividualMovie(movieId);
        cache.push(htmlMovie);
        mainInnerHTML +=htmlMovie;
    }
    main.innerHTML = mainInnerHTML;
}

// This runs again, but prevents having to request more than once to the Omdb API.
function renderWatchList(){
    if(watchlistArr.length === 0){
        main.innerHTML = "<h3>Your watchlist is looking a little empty...</h3>"
        return false
    }
    let mainInnerHTML = "";
    for(let htmlMovie of cache){
        mainInnerHTML += htmlMovie;
    }
    main.innerHTML = mainInnerHTML;
}

// Handles the fetch request to the Omdd API and sets up an HTML
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
                    <i class="fa-solid fa-circle-minus"></i>
                    Remove
                </button>
                <p class="summary">${data.Plot}</p>
            </div>
        </section>
        `
    return html
}

await onLoadRenderWatchList()