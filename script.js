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
    },
    {
        title: "Perfect",
        artist: "Ed Sheeran",
        album: "Divide",
        duration: "4:23",
        year: 2017,
        genre: "Pop",
        cover: "prototype.png",
        audio: "prototype.mp3"
    },
    {
        title: "Photograph",
        artist: "Ed Sheeran",
        album: "X",
        duration: "4:18",
        year: 2014,
        genre: "Pop",
        cover: "prototype.png",
        audio: "prototype.mp3"
    },
    {
        title: "Believer",
        artist: "Imagine Dragons",
        album: "Evolve",
        duration: "3:24",
        year: 2017,
        genre: "Pop Rock",
        cover: "infested.png",
        audio: "prototype.mp3"
    },
    {
        title: "Thunder",
        artist: "Imagine Dragons",
        album: "Evolve",
        duration: "3:07",
        year: 2017,
        genre: "Pop",
        cover: "infested.png",
        audio: "prototype.mp3"
    },
    {
        title: "Demons",
        artist: "Imagine Dragons",
        album: "Night Visions",
        duration: "2:57",
        year: 2012,
        genre: "Alternative Rock",
        cover: "infested.png",
        audio: "prototype.mp3"
    },
    {
        title: "Numb",
        artist: "Linkin Park",
        album: "Meteora",
        duration: "3:07",
        year: 2003,
        genre: "Nu Metal",
        cover: "prototype.png",
        audio: "prototype.mp3"
    },
    {
        title: "In the End",
        artist: "Linkin Park",
        album: "Hybrid Theory",
        duration: "3:36",
        year: 2000,
        genre: "Nu Metal",
        cover: "prototype.png",
        audio: "prototype.mp3"
    },
    {
        title: "What I've Done",
        artist: "Linkin Park",
        album: "Minutes to Midnight",
        duration: "3:25",
        year: 2007,
        genre: "Alternative Rock",
        cover: "prototype.png",
        audio: "prototype.mp3"
    }
];


const artists = [
    {
        name: "Ed Sheeran",
        image: "empty-photo-artist.png"
    },
    {
        name: "Imagine Dragons",
        image: "empty-photo-artist.png"
    },
    {
        name: "Linkin Park",
        image: "empty-photo-artist.png"
    }
];


// ====================
// IndexedDB
// ====================

const request = indexedDB.open("SoundWaveDB", 2);

request.onupgradeneeded = function(event) {
    const db = event.target.result;

    if (!db.objectStoreNames.contains("tracks")) {
        db.createObjectStore("tracks", {
            keyPath: "id",
            autoIncrement: true
        });
    }
};

request.onsuccess = function(event) {
    const db = event.target.result;
    console.log("Database opened successfully");
    loadTracks(db);
};

request.onerror = function(event) {
    console.error("Database error:", event.target.error);
};


function loadTracks(db) {
    const store = db
        .transaction("tracks", "readonly")
        .objectStore("tracks");

    store.getAll().onsuccess = function(event) {
        const tracksFromDB = event.target.result;
        const list = document.querySelector(".my-music-list");

        list.innerHTML = "";

        tracksFromDB.forEach(function(track) {
            const card = document.createElement("div");
            card.className = "my-music-card";

            card.innerHTML = `
                <div class="my-music-cover">
                    <img src="${track.cover}" alt="Обложка трека">
                </div>
                <div class="my-music-info">
                    <h3>${track.title}</h3>
                    <p>${track.artist}</p>
                </div>
            `;

            list.appendChild(card);
        });
    };
}


// ====================
// Навигация
// ====================

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


// ====================
// Исполнители
// ====================

const artistSelect = document.querySelector("#artist-select");
const artistSearch = document.querySelector(".artist-controls input");
const artistSpace = document.querySelector(".artist-space");
const artistWorld = document.querySelector(".artist-world");


// Заполняем select

artists.forEach(function(artist) {
    const option = document.createElement("option");

    option.value = artist.name;
    option.textContent = artist.name;

    artistSelect.appendChild(option);
});


// Поиск исполнителя

artistSearch.addEventListener("input", function() {
    const searchText = artistSearch.value
        .toLowerCase()
        .replace(/\s/g, "");

    document.querySelectorAll(".artist-node").forEach(function(node, index) {
        const name = artists[index].name
            .toLowerCase()
            .replace(/\s/g, "");

        node.style.opacity = "1";
        node.style.boxShadow = "";

        if (!searchText) {
            return;
        }

        let searchIndex = 0;
        let matched = 0;

        for (let letter of name) {
            if (letter === searchText[searchIndex]) {
                matched++;
                searchIndex++;

                if (searchIndex === searchText.length) {
                    break;
                }
            }
        }

        if (matched === 0) {
            node.style.opacity = "0.25";
            return;
        }

        const percent = matched / name.length;
        const glow = 10 + percent * 80;

        node.style.boxShadow = `
            0 0 ${glow}px #7d8cff,
            0 0 ${glow * 2}px #7d8cff,
            0 0 ${glow * 3}px #7d8cff
        `;

        node.style.opacity = 0.25 + percent * 0.75;
    });
});


// ====================
// Камера
// ====================

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
    if (!isDragging) return;

    moveCamera(
        cameraX + event.clientX - startX,
        cameraY + event.clientY - startY
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

    artistWorld.style.transform =
        `translate(${cameraX}px, ${cameraY}px)`;
}


// ====================
// Модальное окно исполнителя
// ====================

const artistModal = document.querySelector("#artist-modal");
const artistModalClose = document.querySelector("#artist-modal-close");


function openArtist(artist) {
    const artistTracks = tracks.filter(function(track) {
        return track.artist === artist.name;
    });

    document.querySelector("#artist-modal-image").src = artist.image;
    document.querySelector("#artist-modal-name").textContent = artist.name;
    document.querySelector("#artist-modal-tracks").textContent =
        `${artistTracks.length} треков`;

    const list = document.querySelector("#artist-modal-tracks-list");

    list.innerHTML = "";

    artistTracks.forEach(function(track) {
        const card = document.createElement("div");

        card.className = "artist-modal-track";

        card.innerHTML = `
            <button class="artist-track-play">▶</button>

            <div>
                <span>${track.title}</span>
                <div>${track.artist}</div>
            </div>

            <span>${track.duration}</span>
        `;

        list.appendChild(card);
    });

    artistModal.classList.add("active");
}


artistModalClose.addEventListener("click", function() {
    artistModal.classList.remove("active");
});


// ====================
// Создание исполнителей
// ====================

function renderArtists() {
    artistWorld.innerHTML = "";

    artists.forEach(function(artist, index) {
        const artistTracks = tracks.filter(function(track) {
            return track.artist === artist.name;
        });

        const node = document.createElement("div");

        node.className = "artist-node";

        node.innerHTML = `
            <img src="${artist.image}" alt="${artist.name}">
            <span>${artist.name} • ${artistTracks.length} треков</span>
        `;

        const size = 50 + artistTracks.length * 5;

        node.style.width = `${size}px`;
        node.style.height = `${size}px`;

        node.style.left = `${500 + (index % 4) * 500}px`;
        node.style.top = `${400 + Math.floor(index / 4) * 400}px`;

        node.addEventListener("click", function() {
            openArtist(artist);
        });

        artistWorld.appendChild(node);
    });
}


renderArtists();


// ====================
// Центрирование камеры
// ====================

function centerArtists() {
    moveCamera(
        artistSpace.clientWidth / 2 - artistWorld.offsetWidth / 2,
        artistSpace.clientHeight / 2 - artistWorld.offsetHeight / 2
    );
}

centerArtists();


// ====================
// Выбор исполнителя
// ====================

artistSelect.addEventListener("change", function() {
    const selectedArtist = artistSelect.value;

    if (selectedArtist === "Все исполнители") {
        centerArtists();
        return;
    }

    document.querySelectorAll(".artist-node").forEach(function(node, index) {
        if (artists[index].name !== selectedArtist) return;

        const x = node.offsetLeft + node.offsetWidth / 2;
        const y = node.offsetTop + node.offsetHeight / 2;

        moveCamera(
            artistSpace.clientWidth / 2 - x,
            artistSpace.clientHeight / 2 - y
        );
    });
});


const addTrackButton = document.querySelector("#add-track-button");
const trackFileInput = document.querySelector("#track-file-input");

addTrackButton.addEventListener("click", function() {
    trackFileInput.click();
});

trackFileInput.addEventListener("change", function() {
    const file = trackFileInput.files[0];

    if (!file) {
        return;
    }

    console.log("Выбран файл:", file);
    console.log("Название:", file.name);
    console.log("Размер:", file.size);
    console.log("Тип:", file.type);
});