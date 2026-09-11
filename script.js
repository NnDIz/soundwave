// const tracks = [
// { title: "Shape of You", artist: "Ed Sheeran", album: "Divide", duration: "3:53", year: 2017, genre: "Pop", cover: "prototype.png", audio: "prototype.mp3" },
// { title: "Perfect", artist: "Ed Sheeran", album: "Divide", duration: "4:23", year: 2017, genre: "Pop", cover: "prototype.png", audio: "prototype.mp3" },
// { title: "Photograph", artist: "Ed Sheeran", album: "X", duration: "4:18", year: 2014, genre: "Pop", cover: "prototype.png", audio: "prototype.mp3" },
// { title: "Believer", artist: "Imagine Dragons", album: "Evolve", duration: "3:24", year: 2017, genre: "Pop Rock", cover: "infested.png", audio: "prototype.mp3" },
// { title: "Thunder", artist: "Imagine Dragons", album: "Evolve", duration: "3:07", year: 2017, genre: "Pop", cover: "infested.png", audio: "prototype.mp3" },
// { title: "Demons", artist: "Imagine Dragons", album: "Night Visions", duration: "2:57", year: 2012, genre: "Alternative Rock", cover: "infested.png", audio: "prototype.mp3" },
// { title: "Numb", artist: "Linkin Park", album: "Meteora", duration: "3:07", year: 2003, genre: "Nu Metal", cover: "prototype.png", audio: "prototype.mp3" },
// { title: "In the End", artist: "Linkin Park", album: "Hybrid Theory", duration: "3:36", year: 2000, genre: "Nu Metal", cover: "prototype.png", audio: "prototype.mp3" },
// { title: "What I've Done", artist: "Linkin Park", album: "Minutes to Midnight", duration: "3:25", year: 2007, genre: "Alternative Rock", cover: "prototype.png", audio: "prototype.mp3" }
// ];

// const artists = [
// { name: "Ed Sheeran", image: "empty-photo-artist.png" },
// { name: "Imagine Dragons", image: "empty-photo-artist.png" },
// { name: "Linkin Park", image: "empty-photo-artist.png" }
// ];

// ====================
// IndexedDB
// ====================

let db;

const request = indexedDB.open("SoundWaveDB", 2);


request.onupgradeneeded = function(event) {
db = event.target.result;

if (!db.objectStoreNames.contains("tracks")) {
    db.createObjectStore("tracks", {
        keyPath: "id",
        autoIncrement: true
    });
}

};

request.onsuccess = function(event) {
    db = event.target.result;

    loadTracks();
    loadArtists();
};

request.onerror = function(event) {
console.error("Ошибка базы:", event.target.error);
};

function loadTracks() {
    const store = db
        .transaction("tracks", "readonly")
        .objectStore("tracks");

    store.getAll().onsuccess = async function(event) {
        const savedTracks = event.target.result;
        const list = document.querySelector(".my-music-list");

        list.innerHTML = "";

        const lastActiveTrackId =
            Number(localStorage.getItem("lastActiveTrackId"));

        const lastActiveTrack =
            savedTracks.find(function(track) {
                return track.id === lastActiveTrackId;
            });

        if (lastActiveTrack) {
            currentTrack = lastActiveTrack;
            updateActiveTrack(lastActiveTrack);
        } else {
            updateActiveTrack(null);
        }

        renderHomeTracks(savedTracks);

        for (const track of savedTracks) {

            // Автоматически определяем длительность
            if (track.audio) {
                try {
                    const seconds = await getAudioDuration(track.audio);
                    const duration = formatDuration(seconds);

                    if (track.duration !== duration) {
                        const transaction = db.transaction(
                            "tracks",
                            "readwrite"
                        );

                        const updateStore =
                            transaction.objectStore("tracks");

                        track.duration = duration;
                        updateStore.put(track);
                    }

                } catch (error) {
                    console.error(
                        `Не удалось определить длительность "${track.title}":`,
                        error
                    );
                }
            }

            const card = document.createElement("div");

            card.className = "my-music-card";

            card.innerHTML = `
                <div class="my-music-cover">
                    <img
                        src="${track.cover}"
                        alt="Обложка трека"
                    >
                </div>

                <div class="my-music-info">
                    <h3>${track.title}</h3>
                    <p>${track.artist}</p>
                    <span>${track.duration || "Неизвестно"}</span>
                </div>

                <button class="my-music-play">
                    ▶
                </button>
            `;

            const playButton =
                card.querySelector(".my-music-play");

            playButton.addEventListener("click", function() {
                playTrack(track);
            });

            card.addEventListener("dblclick", function(event) {
                if (event.target.closest(".my-music-play")) return;

                openTrackCard(track);
            });

            list.appendChild(card);
        }
    };
}

let currentAudio = null;
let currentTrack = null;
let currentAudioUrl = null;

function updateActiveTrack(track) {

    if (!track) {

        activeTrackCover.src =
            "empty-photo-artist.png";

        activeTrackTitle.textContent =
            "Трек не выбран";

        activeTrackArtist.textContent =
            "—";

        activeTrackDetails.textContent =
            "—";

        activeTrackCurrentTime.textContent =
            "0:00";

        activeTrackDuration.textContent =
            "0:00";

        activeTrackProgress.value = 0;
        activeTrackProgress.max = 100;

        activeTrackPlay.textContent = "▶";

        return;
    }

    activeTrackCover.src =
        track.cover || "empty-photo-artist.png";

    activeTrackTitle.textContent =
        track.title || "Без названия";

    activeTrackArtist.textContent =
        track.artist || "Неизвестный исполнитель";

    const details = [
        track.album,
        track.genre,
        track.year
    ].filter(Boolean);

    activeTrackDetails.textContent =
        details.length
            ? details.join(" • ")
            : "—";

    activeTrackDuration.textContent =
        track.duration || "0:00";

    activeTrackPlay.textContent =
        currentAudio && !currentAudio.paused
            ? "⏸"
            : "▶";
}

const playerCover = document.querySelector("#player-cover");
const playerTitle = document.querySelector("#player-title");
const playerArtist = document.querySelector("#player-artist");

const activeTrackCover =
    document.querySelector("#active-track-cover");

const activeTrackArtist =
    document.querySelector("#active-track-artist");

const activeTrackTitle =
    document.querySelector("#active-track-title");

const activeTrackDetails =
    document.querySelector("#active-track-details");

    const activeTrackPlay =
    document.querySelector("#active-track-play");

const activeTrackProgress =
    document.querySelector("#active-track-progress");

const activeTrackCurrentTime =
    document.querySelector("#active-track-current-time");

const activeTrackDuration =
    document.querySelector("#active-track-duration");

const activeTrackVolume =
    document.querySelector("#active-track-volume"); 

const playerPlay = document.querySelector("#player-play");
const playerProgress = document.querySelector("#player-progress");

const playerCurrentTime =
    document.querySelector("#player-current-time");

const playerDuration =
    document.querySelector("#player-duration");

const playerVolume =
    document.querySelector("#player-volume");

const searchForm = document.querySelector(".search-engine");
const searchInput = document.querySelector(".search-input");
const searchResults = document.querySelector(".search-results");


function playTrack(track) {
    

    if (!track.audio) {
        alert("У этого трека нет аудиофайла.");
        return;
    }


    localStorage.setItem("lastActiveTrackId", track.id);
    // Нажали на уже играющий трек
    if (currentTrack === track && currentAudio) {

        if (currentAudio.paused) {
            currentAudio.play();
        } else {
            currentAudio.pause();
        }

        updatePlayerButton();
        return;
    }

    // Останавливаем предыдущий трек
    if (currentAudio) {
        currentAudio.pause();
    }

    // Освобождаем старый Blob URL
    if (currentAudioUrl) {
        URL.revokeObjectURL(currentAudioUrl);
        currentAudioUrl = null;
    }

    let audioSource;

    if (track.audio instanceof Blob) {
        currentAudioUrl = URL.createObjectURL(track.audio);
        audioSource = currentAudioUrl;
    } else if (typeof track.audio === "string") {
        audioSource = track.audio;
    } else {
        alert("Не удалось открыть аудиофайл.");
        return;
    }

    currentAudio = new Audio(audioSource);
    currentTrack = track;

    updateActiveTrack(track);

    // Информация о треке
    playerCover.src =
        track.cover || "empty-photo-artist.png";

    playerTitle.textContent = track.title;
    playerArtist.textContent = track.artist;

    currentAudio.addEventListener("loadedmetadata", function() {

        const duration =
            formatDuration(currentAudio.duration);

        playerDuration.textContent = duration;
        playerProgress.max = currentAudio.duration;

        activeTrackDuration.textContent = duration;
        activeTrackProgress.max = currentAudio.duration;
    });
    currentAudio.addEventListener("timeupdate", function() {

        const currentTime =
            currentAudio.currentTime;

        playerProgress.value = currentTime;

        playerCurrentTime.textContent =
            formatDuration(currentTime);

        activeTrackProgress.value =
            currentTime;

        activeTrackCurrentTime.textContent =
            formatDuration(currentTime);
    });

    currentAudio.addEventListener("play", updatePlayerButton);
    currentAudio.addEventListener("pause", updatePlayerButton);

    currentAudio.addEventListener("ended", function() {
        playerProgress.value = 0;
        playerCurrentTime.textContent = "0:00";

        currentTrack = null;
        updatePlayerButton();
    });

    currentAudio.play();

    updatePlayerButton();
}


function updatePlayerButton() {

    const isPlaying =
        currentAudio && !currentAudio.paused;

    playerPlay.textContent =
        isPlaying ? "⏸" : "▶";

    activeTrackPlay.textContent =
        isPlaying ? "⏸" : "▶";
}

playerPlay.addEventListener("click", function() {

    if (!currentAudio) return;

    if (currentAudio.paused) {
        currentAudio.play();
    } else {
        currentAudio.pause();
    }
});

activeTrackPlay.addEventListener("click", function(event) {

    event.stopPropagation();

    if (!currentAudio) return;

    if (currentAudio.paused) {
        currentAudio.play();
    } else {
        currentAudio.pause();
    }
});

activeTrackProgress.addEventListener("input", function(event) {

    event.stopPropagation();

    if (!currentAudio) return;

    currentAudio.currentTime =
        Number(activeTrackProgress.value);
});

activeTrackVolume.addEventListener("input", function(event) {

    event.stopPropagation();

    if (!currentAudio) return;

    const volume =
        Number(activeTrackVolume.value);

    currentAudio.volume = volume;

    playerVolume.value = volume;
});

playerProgress.addEventListener("input", function() {

    if (!currentAudio) return;

    currentAudio.currentTime =
        Number(playerProgress.value);
});


playerVolume.addEventListener("input", function() {

    if (!currentAudio) return;

    const volume =
        Number(playerVolume.value);

    currentAudio.volume = volume;

    activeTrackVolume.value = volume;
});
// ====================
// Навигация
// ====================

const navigationLinks = document.querySelectorAll("aside a");
const sections = document.querySelectorAll("main > section");

navigationLinks.forEach(function(link) {
link.addEventListener("click", function(event) {
event.preventDefault();

    const id = link.getAttribute("href").substring(1);

    sections.forEach(function(section) {
        section.style.display = "none";
    });

    document.getElementById(id).style.display = "block";

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

let artists = [];
let artistTracks = [];


function loadArtists() {
    const transaction = db.transaction("tracks", "readonly");
    const store = transaction.objectStore("tracks");

    store.getAll().onsuccess = function(event) {
        artistTracks = event.target.result;

        const names = [...new Set(
            artistTracks
                .map(track => track.artist)
                .filter(Boolean)
        )];

        artists = names.map(name => ({
            name: name,
            image: "empty-photo-artist.png"
        }));

        artistSelect.innerHTML =
            `<option value="Все исполнители">Все исполнители</option>`;

        artists.forEach(function(artist) {
            const option = document.createElement("option");

            option.value = artist.name;
            option.textContent = artist.name;

            artistSelect.appendChild(option);
        });

        renderArtists();
        centerArtists();
    };
}


artistSearch.addEventListener("input", function() {
    const search =
        artistSearch.value.toLowerCase().replace(/\s/g, "");

    document.querySelectorAll(".artist-node").forEach(function(node, index) {
        const name =
            artists[index].name.toLowerCase().replace(/\s/g, "");

        node.style.opacity = "1";
        node.style.boxShadow = "";

        if (!search) return;

        let position = 0;
        let matched = 0;

        for (const letter of name) {
            if (letter === search[position]) {
                matched++;
                position++;

                if (position === search.length) break;
            }
        }

        if (!matched) {
            node.style.opacity = "0.25";
            return;
        }

        const percent = matched / name.length;
        const glow = 10 + percent * 80;

        node.style.opacity = 0.25 + percent * 0.75;
        node.style.boxShadow = `
            0 0 ${glow}px #7d8cff,
            0 0 ${glow * 2}px #7d8cff,
            0 0 ${glow * 3}px #7d8cff
        `;
    });
});


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
        `translate(${x}px, ${y}px)`;
}


const artistModal = document.querySelector("#artist-modal");
const artistModalClose = document.querySelector("#artist-modal-close");


function openArtist(artist) {
    const tracks = artistTracks.filter(
        track => track.artist === artist.name
    );

    document.querySelector("#artist-modal-image").src = artist.image;
    document.querySelector("#artist-modal-name").textContent = artist.name;

    document.querySelector("#artist-modal-tracks").textContent =
        `${tracks.length} треков`;

    const list =
        document.querySelector("#artist-modal-tracks-list");

    list.innerHTML = "";

    tracks.forEach(function(track) {
        const card = document.createElement("div");

        card.className = "artist-modal-track";

        card.innerHTML = `
            <button class="artist-track-play">▶</button>

            <div>
                <span>${track.title}</span>
                <div>${track.artist}</div>
            </div>

            <span>${track.duration || "Неизвестно"}</span>
        `;

        card.querySelector(".artist-track-play")
            .addEventListener("click", function() {
                playTrack(track);
            });

        list.appendChild(card);
    });

    artistModal.classList.add("active");
}


artistModalClose.addEventListener("click", function() {
    artistModal.classList.remove("active");
});


function renderArtists() {
    artistWorld.innerHTML = "";

    artists.forEach(function(artist, index) {

        const tracks = artistTracks.filter(
            track => track.artist === artist.name
        );

        const node = document.createElement("div");

        node.className = "artist-node";

        node.innerHTML = `
            <img src="${artist.image}" alt="${artist.name}">
            <span>
                ${artist.name} • ${tracks.length} треков
            </span>
        `;

        const size = 50 + tracks.length * 5;

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


function centerArtists() {
    moveCamera(
        artistSpace.clientWidth / 2 -
            artistWorld.offsetWidth / 2,

        artistSpace.clientHeight / 2 -
            artistWorld.offsetHeight / 2
    );
}


artistSelect.addEventListener("change", function() {
    const selected = artistSelect.value;

    if (selected === "Все исполнители") {
        centerArtists();
        return;
    }

    document.querySelectorAll(".artist-node")
        .forEach(function(node, index) {

            if (artists[index].name !== selected) return;

            moveCamera(
                artistSpace.clientWidth / 2 -
                    (node.offsetLeft + node.offsetWidth / 2),

                artistSpace.clientHeight / 2 -
                    (node.offsetTop + node.offsetHeight / 2)
            );
        });
});




// ====================
// Добавление трека
// ====================

function openTrackCard(track) {
    const card = document.createElement("div");

    card.className = "track-full-card";

    card.innerHTML = `
        <div class="track-full-card-content">

            <button class="track-full-card-close">×</button>

            <img
                class="track-full-card-cover"
                src="${track.cover || "empty-photo-artist.png"}"
                alt="${track.title}"
            >

            <div class="track-full-card-info">

                <h2>${track.title}</h2>

                <p class="track-full-card-artist">
                    ${track.artist}
                </p>

                <button class="track-full-card-play">
                    ▶ Воспроизвести
                </button>

                <div class="track-full-card-details">

                    <div>
                        <span>Альбом</span>
                        <strong>${track.album || "Не указан"}</strong>
                    </div>

                    <div>
                        <span>Жанр</span>
                        <strong>${track.genre || "Не указан"}</strong>
                    </div>

                    <div>
                        <span>Год</span>
                        <strong>${track.year || "Не указан"}</strong>
                    </div>

                    <div>
                        <span>Длительность</span>
                        <strong>${track.duration || "Неизвестно"}</strong>
                    </div>

                </div>

            </div>

        </div>
    `;

    document.body.appendChild(card);

    card.querySelector(".track-full-card-close")
        .addEventListener("click", function() {
            card.remove();
        });

    card.querySelector(".track-full-card-play")
        .addEventListener("click", function() {
            playTrack(track);
        });

    card.addEventListener("click", function(event) {
        if (event.target === card) {
            card.remove();
        }
    });
}

const addTrackButton = document.querySelector("#add-track-button");
const trackFileInput = document.querySelector("#track-file-input");
const addTrackForm = document.querySelector("#add-track-form");
const saveTrackButton = document.querySelector("#save-track-button");
const cancelTrackButton = document.querySelector("#cancel-track-button");

const trackFields = {
    title: document.querySelector("#track-title"),
    artist: document.querySelector("#track-artist"),
    album: document.querySelector("#track-album"),
    genre: document.querySelector("#track-genre"),
    year: document.querySelector("#track-year")
};

// При загрузке страницы форма добавления закрыта
addTrackForm.classList.remove("active");
trackFileInput.value = "";


// Открытие выбора файла
addTrackButton.addEventListener("click", function() {
    trackFileInput.click();
});


// Выбран MP3
trackFileInput.addEventListener("change", function() {
    const file = trackFileInput.files[0];

    if (!file) return;

    addTrackForm.classList.add("active");
    document.body.classList.add("track-form-open");

    console.log("Выбран файл:", file.name);
});

// Отмена добавления
cancelTrackButton.addEventListener("click", function() {
    cancelAddingTrack();
});

function cancelAddingTrack() {
    trackFileInput.value = "";

    Object.values(trackFields).forEach(function(field) {
        field.value = "";
    });

    addTrackForm.classList.remove("active");
    document.body.classList.remove("track-form-open");
}

// Сохранение трека
saveTrackButton.addEventListener("click", async function() {
    const file = trackFileInput.files[0];

    if (!file) return;

    if (!trackFields.title.value || !trackFields.artist.value) {
        alert("Укажи название трека и исполнителя.");
        return;
    }

    saveTrackButton.disabled = true;

    try {
        // Автоматически определяем длительность MP3
        const seconds = await getAudioDuration(file);

        const track = {
            title: trackFields.title.value,
            artist: trackFields.artist.value,
            album: trackFields.album.value,
            genre: trackFields.genre.value,
            year: Number(trackFields.year.value),
            duration: formatDuration(seconds),
            cover: "empty-photo-artist.png",
            audio: file
        };

        const transaction = db.transaction("tracks", "readwrite");
        const store = transaction.objectStore("tracks");

        store.add(track);

        transaction.oncomplete = function() {
            console.log("Трек сохранён:", track);

            addTrackForm.classList.remove("active");
            document.body.classList.remove("track-form-open");
            trackFileInput.value = "";

            Object.values(trackFields).forEach(function(field) {
                field.value = "";
            });

            saveTrackButton.disabled = false;

            loadTracks();
            
        };

        transaction.onerror = function(event) {
            console.error(
                "Ошибка сохранения:",
                event.target.error
            );

            saveTrackButton.disabled = false;
        };

    } catch (error) {
        console.error(error);

        alert("Не удалось определить длительность MP3.");

        saveTrackButton.disabled = false;
    }
});


// ====================
// Определение длительности
// ====================

function getAudioDuration(file) {
    return new Promise(function(resolve, reject) {
        const audio = new Audio();

        // Если это File или Blob
        if (file instanceof Blob) {
            const url = URL.createObjectURL(file);

            audio.addEventListener("loadedmetadata", function() {
                URL.revokeObjectURL(url);
                resolve(audio.duration);
            });

            audio.addEventListener("error", function() {
                URL.revokeObjectURL(url);
                reject(new Error("Не удалось определить длительность"));
            });

            audio.src = url;
        }

        // Если это путь к MP3, например "prototype.mp3"
        else if (typeof file === "string") {

            audio.addEventListener("loadedmetadata", function() {
                resolve(audio.duration);
            });

            audio.addEventListener("error", function() {
                reject(new Error("Не удалось определить длительность"));
            });

            audio.src = file;
        }

        else {
            reject(new Error("Неверный формат аудиофайла"));
        }
    });
}

function formatDuration(seconds) {
    const minutes = Math.floor(seconds / 60);
    const secondsLeft = Math.floor(seconds % 60);

    return `${minutes}:${String(secondsLeft).padStart(2, "0")}`;
}

function renderHomeTracks(tracks) {
    const recentList = document.querySelector(".recent-tracks");

    if (!recentList) return;

    recentList.innerHTML = "";

    const recentTracks = [...tracks].reverse().slice(0, 5);

    recentTracks.forEach(function(track) {
        const card = document.createElement("div");
        card.className = "track-card";

        card.innerHTML = `
            <div class="track-cover">
                <img src="${track.cover || "empty-photo-artist.png"}" alt="Обложка трека">
            </div>

            <div class="track-info">
                <h3>${track.title}</h3>
                <p>${track.artist}</p>
            </div>
        `;

        card.addEventListener("click", function() {
            playTrack(track);
        });

        recentList.appendChild(card);
    });
}

function searchTracks(query) {
    const transaction = db.transaction("tracks", "readonly");
    const store = transaction.objectStore("tracks");

    store.getAll().onsuccess = function(event) {
        const tracks = event.target.result;

        const normalizedQuery = query
            .toLowerCase()
            .trim();

        if (!normalizedQuery) {
            renderSearchResults([]);
            return;
        }

        const results = tracks
            .map(function(track) {

                const title = (track.title || "").toLowerCase();
                const artist = (track.artist || "").toLowerCase();

                let score = 0;

                // ====================
                // Название трека
                // ====================

                if (title === normalizedQuery) {
                    score += 1000;
                }
                else if (title.startsWith(normalizedQuery)) {
                    score += 700;
                }
                else if (title.includes(normalizedQuery)) {
                    score += 500;
                }

                // ====================
                // Исполнитель
                // ====================

                if (artist === normalizedQuery) {
                    score += 900;
                }
                else if (artist.startsWith(normalizedQuery)) {
                    score += 650;
                }
                else if (artist.includes(normalizedQuery)) {
                    score += 450;
                }

                return {
                    track: track,
                    score: score
                };
            })
            .filter(function(result) {
                return result.score > 0;
            })
            .sort(function(a, b) {
                return b.score - a.score;
            });

        renderSearchResults(
            results.map(function(result) {
                return result.track;
            })
        );
    };
}

function renderSearchResults(results) {
    searchResults.innerHTML = "";

    if (results.length === 0) {
        searchResults.innerHTML = "<p>Ничего не найдено.</p>";
        return;
    }

    results.forEach(function(track) {
        const result = document.createElement("div");

        result.className = "search-result";

        result.innerHTML = `
            <img src="${track.cover || "empty-photo-artist.png"}">
            <div class="search-result-info">
                <strong>${track.title}</strong>
                <span>${track.artist}</span>
            </div>
            <span class="search-result-duration">${track.duration || "—"}</span>
        `;

        result.addEventListener("click", function() {
            playTrack(track);
        });

        searchResults.appendChild(result);
    });
}

searchForm.addEventListener("submit", function(event) {
    event.preventDefault();

    searchTracks(searchInput.value);
});

searchInput.addEventListener("input", function() {
    const query = searchInput.value.trim();

    if (query === "") {
        searchResults.innerHTML = "";
        return;
    }

    searchTracks(query);
});

const activeTrack =
    document.querySelector(".current-active-track");

activeTrack.addEventListener("dblclick", function() {

    if (!currentTrack) return;

    openTrackCard(currentTrack);
});

activeTrack.addEventListener("dblclick", function(event) {

    if (
        event.target.closest("button") ||
        event.target.closest("input")
    ) {
        return;
    }

    if (!currentTrack) return;

    openTrackCard(currentTrack);
});