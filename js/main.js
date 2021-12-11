//app is for general control over the application
//and connections between the other components

const APP = {
  key: "9eb5fbb08f7a18ab176e471ff7b6d333",
  baseURL: "https://api.themoviedb.org/3/",
  baseImageUrl: "https://image.tmdb.org/t/p/w500",

  init: () => {
    //this function runs when the page loads and click listener on search
    //call history api (obj, title, # what we want to appear in the url)
    //when we search a name, it will appear in the url
    history.replaceState(null, "", "#");

    window.addEventListener("popstate", NAV.poppy);

    let searchBtn = document.getElementById("btnSearch");
    searchBtn.addEventListener("click", SEARCH.getInput);
  },
};

//search is for anything to do with the fetch api
const SEARCH = {
  //empty array
  results: [],
  input: "",

  //get the input (searched name - part four)
  getInput: (ev) => {
    ev.preventDefault();
    SEARCH.input = document.getElementById("search").value;
    //use history or location.hash
    history.pushState({}, "", `${location.hash}${SEARCH.input}`);

    let input = location.hash;
    SEARCH.doSearch(input);
  },

  //search function
  doSearch: (input) => {
    SEARCH.input = document.getElementById("search").value;
    let key = STORAGE.base_key + SEARCH.input;

    if (key in localStorage) {
      ACTORS.actorResults = localStorage.getItem(key);
      ACTORS.displayActor(JSON.parse(ACTORS.actorResults));
    } else {
      SEARCH.doFetch();
    }
  },

  doFetch() {
    let url = `${APP.baseURL}search/person?api_key=${APP.key}&query=${SEARCH.input}&language=en-US`;
    console.log("doing a fetch..");
    fetch(url)
      .then((response) => {
        // see if it has an okay status
        if (response.ok) {
          return response.json();
        } else {
          throw new Error(
            `Error ${response.status_code} ${response.status_message}`
          );
        }
      })
      //data returned from fetch
      .then((data) => {
        //data (save the results, store data, display actor page)
        //test to see how data looks like log(data);
        SEARCH.results = data.results;
        //store the data inside a local storage, create function for it
        STORAGE.setStorages(SEARCH.input, data.results);
        //display actions, create function for it
        ACTORS.displayActor(data.results);
      })
      .catch((err) => {
        alert(err.message);
      });
  },
}; //end SEARCH nameSpace

//actors is for changes connected to content in the actors section
const ACTORS = {
  actorsResults: [],

  displayActor: (actorResults) => {
    let homePage = document.getElementById("instructions");
    let actorsPage = document.getElementById("actors");

    homePage.style.display = "none";
    actorsPage.style.display = "block";

    let dFrag = document.createDocumentFragment();
    let cardDivSection = document.createElement("div");
    cardDivSection.className = "card-div";

    //put click listener inside function below
    actorResults.forEach((actor) => {
      //build the initial div
      // let columnDiv = document.createElement("div");
      // columnDiv.className = "col";

      let cardDiv = document.createElement("div");
      cardDiv.className = "div";

      //click listen for media name space
      cardDiv.addEventListener("click", MEDIA.setHistory);
      cardDiv.setAttribute("click", actor.id);

      //img div
      let img = document.createElement("img");
      img.className = "card-img";
      if (actor.profile_path) {
        img.src = APP.baseImageUrl + actor.profile_path;
      } else {
        //placeholder image
        img.src = " https://via.placeholder.com/150";
      }

      img.style.maxWidth = "50%";
      img.alt = actor.name;

      //create body div
      let divBody = document.createElement("div");
      divBody.className = "body-div";

      //header
      let h3 = document.createElement("h3");
      h3.className = "card-title";
      h3.innerHTML = `Actor: ${actor.name}`;

      //display popularity and what actor is known for, as paragraphs div
      let divPop = document.createElement("p");
      divPop.className = "text-card-pop";
      divPop.innerHTML = `Popularity: ${actor.popularity}`;

      let divKnown = document.createElement("p");
      divKnown.className = "text-card";
      divKnown.innerHTML = `Known for Department: ${actor.known_for_department}`;

      let divKnownFor = document.createElement("p");
      divKnownFor.className = "text-card";
      divKnownFor.innerHTML = `Known for in Media: ${actor.known_for[0].original_title}`; //test for media display

      //appending
      divBody.append(h3, divPop, divKnown, divKnownFor);
      cardDiv.append(img, divBody);
      dFrag.append(cardDiv);
    });

    cardDivSection.innerHTML = "";
    cardDivSection.append(dFrag);

    let actorDiv = document.getElementById("actor-Section");
    actorDiv.append(cardDivSection);
  },
};

//media is for changes connected to content in the media section
//display known for object and (picture of media, title of media, year of media)
//method: look inside index positions of actors in the array, and take the known for array to display the media
const MEDIA = {
  mediaActorId: null,
  Media: [],

  //history function
  setHistory: (ev) => {
    let actorMediaTarget = ev.target.closest(".div");
    MEDIA.mediaActorId = actorMediaTarget.getAttribute("data-id");
    //test
    // console.log(actorMediaTarget);


    history.pushState({}, "", `${location.hash}/${MEDIA.mediaActorId}`);
    MEDIA.displayMedia(MEDIA.mediaActorId);
  },

  displayMedia: (mediaActorId) => {
    // let actorMediaID = ev.target.closest(".div").getAttribute("data-id");
    // console.log(actorMediaID);// testing click on cards

    let actorsPage = document.getElementById("actors");
    let moviePage = document.getElementById("media");

    actorsPage.style.display = "none";
    moviePage.style.display = "block";

    let key = STORAGE.base_key + SEARCH.input;
    let media = JSON.parse(localStorage.getItem(key));
    let df = document.createDocumentFragment();
    //error message here: use actorMediaID?
    media.forEach((actor) => {
      if (actor.id == MEDIA.mediaActorId) {
        actor.known_for.forEach((media) => {
          //main section - media page
          let mediaDivSection = document.createElement("div");
          mediaDivSection.className = "media-section";

          // media cards
          let mediaCard = document.createElement("div");
          mediaCard.className = "media-card";

          //media image
          let imgMedia = document.createElement("img");
          imgMedia.className = "media-img";
          if (media.known_for.poster_path) {
            imgMedia.src = APP.baseImageUrl + media.poster_path;
          } else {
            //placeholder image
            imgMedia.src = " https://via.placeholder.com/150";
          }

          imgMedia.style.maxWidth = "50%";
          imgMedia.alt = actor.name;

          //do an if statement of if the media is a tv show or a movie

          //media body
          //error message here - body is not defined?
          let mediaCardBody = document.createElement("div");
          mediaCardBody.className = "media-body";

          //known for : title of media
          let mediaTitle = document.createElement("h3");
          mediaTitle.className = "text-card";
          mediaTitle.innerHTML = `Known for in Media: ${media.original_title}`;
        });
      }

      //appending elements to media
      mediaCardBody.append(mediaTitle);
      mediaCard.append(imgMedia, mediaCardBody);
      df.append(mediaCard);
    });

    let movieDiv = document.getElementById("media-content");
    movieDiv.append(mediaDivSection);
  },
};

//storage is for working with local-storage
const STORAGE = {
  //   this will be used in Assign 4
  //array to storage keys
  // keys: [],
  base_key: "Search-Actor-",

  setStorages: (input, results) => {
    let key = STORAGE.base_key + input;
    localStorage.setItem(key, JSON.stringify(results));
    // STORAGE.keys.push(key); //push key to empty array
    // console.log(STORAGE.keys);
  },
};

//nav is for anything connected to the history api and location: (spa 4)
const NAV = {
  poppy: () => {
    let input = location.hash.replace("#", "");
    SEARCH.input = input;
    // console.log(input);
    SEARCH.doSearch(input);
  },
  //this will be used in Assign 4
};

//Start everything running
document.addEventListener("DOMContentLoaded", APP.init);
