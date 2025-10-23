import { useState, useEffect, useRef } from "react";
import { ArrowLeftToLine } from "lucide-react";

const AcceleratingMusicPlayer = () => {
  //  Static playlist of local songs (in /public/audio)
  const playlist = [
    { title: "Sunny Morning", src: "/audio/sunny-morning.mp3" },
    { title: "Lo-Fi Breeze", src: "/audio/lofi-breeze.mp3" },
    { title: "Chill Drive", src: "/audio/chill-drive.mp3" },
  ];

  // 🎛️ State variables
  const [trackIndex, setTrackIndex] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [currentTrack, setCurrentTrack] = useState(playlist[0]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [playbackSpeed, setPlaybackSpeed] = useState(1.0);
  const [startSpeed, setStartSpeed] = useState(1.0);
  const [maxSpeed, setMaxSpeed] = useState(2.0);
  const [acceleration, setAcceleration] = useState(0.5);

  const audioRef = useRef(null);
  const speedIntervalRef = useRef(null);

  // ⚙️ Automatically load the correct song when trackIndex changes
  useEffect(() => {
    if (!audioRef.current) return;

    //  THIS is the key line that sets which song file to load:
    audioRef.current.src = playlist[trackIndex].src;

    setCurrentTrack(playlist[trackIndex]);
    setCurrentTime(0);
    audioRef.current.playbackRate = startSpeed;
    setPlaybackSpeed(startSpeed);

    if (isPlaying) {
      audioRef.current.play().catch(() => setIsPlaying(false));
    }
  }, [trackIndex]);

  // 🚀 Acceleration logic (keep your existing code)
  useEffect(() => {
    if (isPlaying) {
      if (speedIntervalRef.current) {
        clearInterval(speedIntervalRef.current);
      }

      speedIntervalRef.current = setInterval(() => {
        if (!audioRef.current || !audioRef.current.duration) return;

        const currentProgress =
          audioRef.current.currentTime / audioRef.current.duration;
        const speedRange = maxSpeed - startSpeed;
        const accelerationCurve = Math.pow(currentProgress, 1 / acceleration);
        const newSpeed = startSpeed + speedRange * accelerationCurve;
        const clampedSpeed = Math.min(maxSpeed, Math.max(startSpeed, newSpeed));

        audioRef.current.playbackRate = clampedSpeed;
        setPlaybackSpeed(clampedSpeed);
      }, 500);
    } else {
      if (speedIntervalRef.current) {
        clearInterval(speedIntervalRef.current);
      }
    }

    return () => {
      if (speedIntervalRef.current) {
        clearInterval(speedIntervalRef.current);
      }
    };
  }, [isPlaying, startSpeed, maxSpeed, acceleration]);

  // 🔊 Mute/Unmute
  const toggleMute = () => {
    if (!audioRef.current) return;
    audioRef.current.muted = !audioRef.current.muted;
    setIsMuted(audioRef.current.muted);
  };

  // ▶️ Play / Pause
  const togglePlay = () => {
    if (!audioRef.current) return;

    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play();
      setIsPlaying(true);
    }
  };

  // ⏮ / ⏭ Track navigation
  const nextTrack = () => {
    setTrackIndex((prev) => (prev + 1) % playlist.length);
    setIsPlaying(true);
  };

  const prevTrack = () => {
    setTrackIndex((prev) => (prev - 1 + playlist.length) % playlist.length);
    setIsPlaying(true);
  };

  // ⏩ / ⏪ Seek
  const seekBackward = () => {
    if (audioRef.current) {
      audioRef.current.currentTime = Math.max(0, currentTime - 10);
    }
  };

  const seekForward = () => {
    if (audioRef.current) {
      audioRef.current.currentTime = Math.min(duration, currentTime + 10);
    }
  };

  // ⌨️ Keyboard shortcuts
  useEffect(() => {
    const handleKey = (e) => {
      const key = e.key.toLowerCase();
      if (key === " ") {
        e.preventDefault();
        togglePlay();
      } else if (key === "m") {
        toggleMute();
      } else if (key === "n") {
        nextTrack();
      } else if (key === "p") {
        prevTrack();
      } else if (key === "arrowright") {
        seekForward();
      } else if (key === "arrowleft") {
        seekBackward();
      }
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [isPlaying, trackIndex, isMuted]);

  // 🎚️ Helpers
  const formatTime = (seconds) => {
    if (isNaN(seconds)) return "0:00";
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
  };

  const handleLoadedMetadata = () => {
    setDuration(audioRef.current.duration);
    audioRef.current.playbackRate = startSpeed;
    setPlaybackSpeed(startSpeed);
  };

  const handleTimeUpdate = () => {
    setCurrentTime(audioRef.current.currentTime);
  };

  const handleEnded = () => {
    setIsPlaying(false);
    audioRef.current.playbackRate = startSpeed;
    setPlaybackSpeed(startSpeed);
  };

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  // 🎨 UI
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-600 via-purple-700 to-indigo-800 p-4">
      <div className="bg-white/10 backdrop-blur-xl rounded-3xl p-10 shadow-2xl border border-white/20 max-w-xl w-full">
        <h1 className="text-4xl font-bold text-center mb-8 bg-gradient-to-r from-white to-gray-200 bg-clip-text text-transparent">
          🚀 Accelerating Player
        </h1>

        {/* Current Track Info */}
        <div className="mb-8 min-h-[60px] text-center">
          <div className="text-xl font-bold text-white mb-1">
            {currentTrack.title}
          </div>
          <div className="text-sm text-white/80">
            Track {trackIndex + 1} of {playlist.length}
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mb-6">
          <div className="w-full h-2 bg-white/20 rounded-full overflow-hidden mb-3">
            <div
              className="h-full bg-gradient-to-r from-teal-400 to-green-500 transition-all duration-100"
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="flex justify-between text-sm text-white/80">
            <span>{formatTime(currentTime)}</span>
            <span>{formatTime(duration)}</span>
          </div>
        </div>

        {/* Controls */}
        <div className="flex justify-center gap-5 mb-6">
          <button onClick={prevTrack} className="player-btn text-white text-xl">
            ⏮
          </button>
          <button
            onClick={togglePlay}
            className={`player-btn w-20 h-20 rounded-full bg-gradient-to-br from-purple-600 to-indigo-700 text-white text-2xl hover:scale-110 transition-transform shadow-lg ${
              isPlaying ? "animate-pulse" : ""
            }`}
          >
            {isPlaying ? "⏸" : "▶"}
          </button>
          <button onClick={nextTrack} className="player-btn text-white text-xl">
            ⏭
          </button>
        </div>

        {/* Mute Button */}
        <div className="flex justify-center mb-6">
          <button
            onClick={toggleMute}
            className="px-6 py-3 rounded-full bg-white/20 text-white hover:bg-white/30 transition"
          >
            {isMuted ? "🔈 Unmute" : "🔇 Mute"}
          </button>
        </div>

        {/* Speed Info */}
        <div className="bg-white/10 rounded-2xl p-6 mb-6">
          <div className="text-3xl font-bold text-teal-300 mb-2 text-center">
            {playbackSpeed.toFixed(2)}x
          </div>
          <div className="text-sm text-white/50 text-center leading-relaxed">
            <p>Speed increases as the song progresses.</p>
            <p>The longer you listen, the faster it gets!</p>
          </div>
        </div>

        {/* Hidden Audio Element */}
        <audio
          ref={audioRef}
          onLoadedMetadata={handleLoadedMetadata}
          onTimeUpdate={handleTimeUpdate}
          onEnded={handleEnded}
          preload="auto"
        />
      </div>
    </div>
  );
};

export default AcceleratingMusicPlayer;

