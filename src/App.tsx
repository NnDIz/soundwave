import { useState } from 'react'
import {
  Home,
  Music2,
  Heart,
  ListMusic,
  Plus,
  Search,
  User,
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Volume2,
  Upload,
  MoreHorizontal,
} from 'lucide-react'
import './index.css'

type Song = {
  id: number
  title: string
  artist: string
  cover: string
  audio: string
}

function App() {
  const [songs, setSongs] = useState<Song[]>([])
  const [currentSong, setCurrentSong] = useState<Song | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [favorites, setFavorites] = useState<number[]>([])

  const addSong = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]

    if (!file) return

    const newSong: Song = {
      id: Date.now(),
      title: file.name.replace(/\.[^/.]+$/, ''),
      artist: 'Мой трек',
      cover: '',
      audio: URL.createObjectURL(file),
    }

    setSongs((prev) => [...prev, newSong])
  }

  const toggleFavorite = (id: number) => {
    setFavorites((prev) =>
      prev.includes(id)
        ? prev.filter((songId) => songId !== id)
        : [...prev, id]
    )
  }

  const playSong = (song: Song) => {
    setCurrentSong(song)
    setIsPlaying(true)
  }

  return (
    <div className="app">
      <aside className="sidebar">
        <div className="logo">
          <div className="logo-icon">M</div>
          <span>MY MUSIC</span>
        </div>

        <nav>
          <p className="nav-title">МЕНЮ</p>

          <button className="nav-item active">
            <Home size={20} />
            Главная
          </button>

          <button className="nav-item">
            <Music2 size={20} />
            Моя музыка
          </button>

          <button className="nav-item">
            <Heart size={20} />
            Любимые
          </button>

          <button className="nav-item">
            <ListMusic size={20} />
            Плейлисты
          </button>
        </nav>

        <div className="playlist-section">
          <p className="nav-title">ПЛЕЙЛИСТЫ</p>

          <button className="create-playlist">
            <Plus size={18} />
            Создать плейлист
          </button>
        </div>
      </aside>

      <main className="main">
        <header className="header">
          <div className="search">
            <Search size={20} />
            <input placeholder="Поиск музыки..." />
          </div>

          <button className="profile">
            <User size={20} />
          </button>
        </header>

        <section className="hero">
          <div>
            <span className="eyebrow">ВАША МУЗЫКА</span>
            <h1>Добро пожаловать</h1>
            <p>
              Загружайте свою музыку, создавайте коллекцию
              и слушайте её в одном месте.
            </p>

            <label className="upload-button">
              <Upload size={19} />
              Добавить музыку
              <input
                type="file"
                accept="audio/*"
                onChange={addSong}
                hidden
              />
            </label>
          </div>
        </section>

        <section className="section">
          <div className="section-header">
            <h2>Недавно добавленные</h2>
            <span>{songs.length} треков</span>
          </div>

          {songs.length === 0 ? (
            <div className="empty">
              <Music2 size={42} />
              <h3>Здесь пока пусто</h3>
              <p>Добавьте свою первую песню</p>
            </div>
          ) : (
            <div className="song-list">
              {songs.map((song) => (
                <div className="song-row" key={song.id}>
                  <div
                    className="song-cover"
                    onClick={() => playSong(song)}
                  >
                    {song.cover ? (
                      <img src={song.cover} alt="" />
                    ) : (
                      <Music2 size={24} />
                    )}

                    <div className="play-overlay">
                      <Play size={18} fill="currentColor" />
                    </div>
                  </div>

                  <div
                    className="song-info"
                    onClick={() => playSong(song)}
                  >
                    <strong>{song.title}</strong>
                    <span>{song.artist}</span>
                  </div>

                  <div className="song-actions">
                    <button
                      className={`icon-button ${
                        favorites.includes(song.id) ? 'liked' : ''
                      }`}
                      onClick={() => toggleFavorite(song.id)}
                    >
                      <Heart
                        size={19}
                        fill={
                          favorites.includes(song.id)
                            ? 'currentColor'
                            : 'none'
                        }
                      />
                    </button>

                    <button className="icon-button">
                      <MoreHorizontal size={20} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>

      <footer className="player">
        <div className="now-playing">
          <div className="player-cover">
            <Music2 size={22} />
          </div>

          <div>
            <strong>
              {currentSong?.title || 'Музыка не выбрана'}
            </strong>
            <span>
              {currentSong?.artist || 'Выберите трек'}
            </span>
          </div>
        </div>

        <div className="player-controls">
          <div className="buttons">
            <button>
              <SkipBack size={20} />
            </button>

            <button
              className="play-button"
              onClick={() => setIsPlaying(!isPlaying)}
              disabled={!currentSong}
            >
              {isPlaying ? (
                <Pause size={21} fill="currentColor" />
              ) : (
                <Play size={21} fill="currentColor" />
              )}
            </button>

            <button>
              <SkipForward size={20} />
            </button>
          </div>

          <div className="progress">
            <span>0:00</span>
            <div className="progress-line">
              <div className="progress-value" />
            </div>
            <span>0:00</span>
          </div>
        </div>

        <div className="volume">
          <Volume2 size={19} />
          <div className="volume-line">
            <div className="volume-value" />
          </div>
        </div>
      </footer>
    </div>
  )
}

export default App