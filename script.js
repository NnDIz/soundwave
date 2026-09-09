const tracks = [

    {
        title: "Shape of You",
        artist: "Ed Sheeran",
        album: "Divide",
        duration: "3:53",
        year: 2017,
        genre: "Pop",
        cover: "prototype.png",
        audio: "prototype.mp3"
    }
]

const recentTracks = document.querySelector(".recent-tracks");


const request = indexedDB.open("SoundWaveDB", 2);

request.onupgradeneeded = function (event) {
    const db = event.target.result;

    if (!db.objectStoreNames.contains("tracks")) {
            db.createObjectStore("tracks", 
            { 
                keyPath: "id", 
                autoIncrement: true 
            }
        );
    }
    
};

function loadTracks(db) {
    const transaction = db.transaction("tracks", "readonly");
    const store = transaction.objectStore("tracks");

    const myMusicList = document.querySelector(".my-music-list");

    const getAllRequest = store.getAll();

    getAllRequest.onsuccess = function () {

        const tracksFromDB = getAllRequest.result;
        console.log(tracksFromDB[0]);

        myMusicList.innerHTML = "";

        tracksFromDB.forEach(function(track) {

            const card = document.createElement("div");
            card.classList.add("my-music-card");

            const cover = document.createElement("div");
            cover.classList.add("my-music-cover");

            const img = document.createElement("img");
            img.src = track.cover;
            img.alt = "Обложка трека";

            cover.appendChild(img);

            const info = document.createElement("div");
            info.classList.add("my-music-info");

            const title = document.createElement("h3");
            title.textContent = track.title;

            const artist = document.createElement("p");
            artist.textContent = track.artist;

            info.appendChild(title);
            info.appendChild(artist);

            card.appendChild(cover);
            card.appendChild(info);

            myMusicList.appendChild(card);

        });

        console.log("Tracks retrieved successfully");
        console.log(tracksFromDB);
    };
};

request.onsuccess = function (event) {
    const db = event.target.result;
    console.log("Database opened successfully");

    loadTracks(db);
};

request.onerror = function (event) {
    console.error("Database error: " + event.target.errorCode);
};

const navigationLinks = document.querySelectorAll("aside a");
const sections = document.querySelectorAll("main > section");

navigationLinks.forEach(function(link) {
    link.addEventListener("click", function(event) {
        event.preventDefault();

        const targetId = link.getAttribute("href").substring(1);

        sections.forEach(function(section) {
            section.style.display = "none";
        });

        document.getElementById(targetId).style.display = "block";

        navigationLinks.forEach(function(item) {
            item.classList.remove("active");
        });

        link.classList.add("active");
    });
});