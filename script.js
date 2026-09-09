const track = [

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
console.log(recentTracks);

const trackCard = document.createElement("div");
trackCard.classList.add("track-card");
recentTracks.appendChild(trackCard);

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

request.onsuccess = function (event) {
    const db = event.target.result;
    console.log("Database opened successfully");

    const transation = db.transaction("tracks", "readonly");
    const store = transation.objectStore("tracks");

    const getAllRequest = store.getAll();

    getAllRequest.onsuccess = function (event) {
        const tracksFromDB = getAllRequest.result;

        console.log("Tracks retrieved successfully");
        console.log(tracksFromDB);
    };

    // const transaction = db.transaction("tracks", "readwrite");
    // const store = transaction.objectStore("tracks");


};

request.onerror = function (event) {
    console.error("Database error: " + event.target.errorCode);
};