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

const artists = [
    {
        name: "Ed Sheeran",
        tracks: 12,
        image: "empty-photo-artist.png"
    },
    {
        name: "Imagine Dragons",
        tracks: 8,
        image: "empty-photo-artist.png"
    },
    {
        name: "Linkin Park",
        tracks: 15,
        image: "empty-photo-artist.png"
    }
];


const artistSelect = document.querySelector("#artist-select");
const artistSearch = document.querySelector(".artist-controls input");
const artistSpace = document.querySelector(".artist-space");
const artistWorld = document.querySelector(".artist-world");

artistSearch.addEventListener("input", function() {
    const searchText = artistSearch.value
        .toLowerCase()
        .replace(/\s/g, "");

    const nodes = document.querySelectorAll(".artist-node");

    nodes.forEach(function(node, index) {
        const artistName = artists[index].name
            .toLowerCase()
            .replace(/\s/g, "");

        node.classList.remove("search-match");
        node.style.removeProperty("--search-glow");
        node.style.opacity = "1";
        node.style.boxShadow = "";

        if (searchText === "") {
            return;
        }

        let searchIndex = 0;
        let matchedCharacters = 0;

        // Ищем буквы запроса по порядку в имени артиста
        for (let i = 0; i < artistName.length; i++) {
            if (artistName[i] === searchText[searchIndex]) {
                matchedCharacters++;
                searchIndex++;

                if (searchIndex === searchText.length) {
                    break;
                }
            }
        }

        // Доля совпавших букв относительно длины имени артиста
        const matchPercent = matchedCharacters / artistName.length;

        if (matchedCharacters > 0) {
            node.classList.add("search-match");

            const glowSize = 10 + matchPercent * 80;

            node.style.setProperty(
                "--search-glow",
                "#7d8cff"
            );

            node.style.boxShadow = `
                0 0 ${glowSize}px #7d8cff,
                0 0 ${glowSize * 2}px #7d8cff,
                0 0 ${glowSize * 3}px #7d8cff
            `;

            node.style.opacity = 0.25 + matchPercent * 0.75;
        } else {
            node.style.opacity = "0.25";
        }
    });
});
// Заполняем список исполнителей
artists.forEach(function(artist) {
    const option = document.createElement("option");

    option.value = artist.name;
    option.textContent = artist.name;

    artistSelect.appendChild(option);
});


// Камера
let cameraX = 0;
let cameraY = 0;

let isDragging = false;
let startX = 0;
let startY = 0;

artistSpace.addEventListener("mousedown", function(event) {
    isDragging = true;

    startX = event.clientX;
    startY = event.clientY;
});

artistSpace.addEventListener("mousemove", function(event) {
    if(!isDragging)
    {
        return;
    }
    
    const deltaX = event.clientX - startX;
    const deltaY = event.clientY - startY;

    moveCamera(
        cameraX + deltaX,
        cameraY + deltaY
    );

    startX = event.clientX;
    startY = event.clientY;

});

artistSpace.addEventListener("mouseup", function() {
    isDragging = false;
});

artistSpace.addEventListener("mouseleave", function() {
    isDragging = false;
});

function moveCamera(x, y) {
    cameraX = x;
    cameraY = y;

    artistWorld.style.transform = `translate(${cameraX}px, ${cameraY}px)`;
}


// Создаём исполнителей
function renderArtists() {
    artistWorld.innerHTML = "";

    artists.forEach(function(artist, index) {

        const node = document.createElement("div");
        node.classList.add("artist-node");

        const image = document.createElement("img");
        image.src = artist.image;
        image.alt = artist.name;

        node.appendChild(image);


        // Размер круга зависит от количества треков
        const size = 50 + artist.tracks * 5;

        node.style.width = `${size}px`;
        node.style.height = `${size}px`;


        // Информация при наведении
        const info = document.createElement("span");

        info.textContent = `${artist.name} • ${artist.tracks} треков`;

        node.appendChild(info);
        artistWorld.appendChild(node);


        // Позиция исполнителя внутри мира
        const x = 500 + (index % 4) * 500;
        const y = 400 + Math.floor(index / 4) * 400;

        node.style.left = `${x}px`;
        node.style.top = `${y}px`;
    });
}


renderArtists();


// Ставим камеру в центр мира
moveCamera(
    artistSpace.clientWidth / 2 - artistWorld.offsetWidth / 2,
    artistSpace.clientHeight / 2 - artistWorld.offsetHeight / 2
);


// Выбор исполнителя
artistSelect.addEventListener("change", function() {

    const selectedArtist = artistSelect.value;

    // Если выбрали "Все исполнители"
    if (selectedArtist === "Все исполнители") {

        moveCamera(
            artistSpace.clientWidth / 2 - artistWorld.offsetWidth / 2,
            artistSpace.clientHeight / 2 - artistWorld.offsetHeight / 2
        );

        return;
    }


    const nodes = document.querySelectorAll(".artist-node");

    nodes.forEach(function(node, index) {

        if (artists[index].name === selectedArtist) {

            const nodeCenterX = node.offsetLeft + node.offsetWidth / 2;
            const nodeCenterY = node.offsetTop + node.offsetHeight / 2;

            const cameraX =
                artistSpace.clientWidth / 2 - nodeCenterX;

            const cameraY =
                artistSpace.clientHeight / 2 - nodeCenterY;

            moveCamera(cameraX, cameraY);
        }
    });
});