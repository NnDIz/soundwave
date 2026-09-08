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