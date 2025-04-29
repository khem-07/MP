import React, { useEffect, useRef, useState } from "react";
import Wave from "react-wavify";
import { FaPlay, FaPause, FaStepBackward, FaStepForward } from "react-icons/fa";
import "../starryBackground.scss";

const STREAM_URL = "https://listen.ramashamedia.com:8330/stream";
const SONGTITLE_API = "https://listen.ramashamedia.com:8330/stats?sid=1&json=1";

export default function AudioPlayer() {
  const audioRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [songTitle, setSongTitle] = useState("Loading...");
  const [artist, setArtist] = useState("Unknown Artist");
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const vinylRef = useRef(null);
  const [rotation, setRotation] = useState(0);
  const animationRef = useRef(null);

  useEffect(() => {
    let lastTitle = "";
    const fetchSongTitle = async () => {
      try {
        const res = await fetch(SONGTITLE_API);
        const data = await res.json();
        const currentTitle = data?.SONGTITLE || "Unknown Title";
        if (currentTitle !== lastTitle) {
          lastTitle = currentTitle;
          const [song, artistName] = currentTitle.split(" - ");
          setSongTitle(song || currentTitle);
          setArtist(artistName || "Unknown Artist");
        }
      } catch (error) {
        console.error("Error fetching song title:", error);
      }
    };
    fetchSongTitle();
    const interval = setInterval(fetchSongTitle, 15000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    let lastTimestamp = 0;
    const ROTATION_SPEED = 0.02;
    const animateVinyl = (timestamp) => {
      if (!lastTimestamp) lastTimestamp = timestamp;
      const elapsed = timestamp - lastTimestamp;
      if (isPlaying) {
        setRotation((prev) => (prev + elapsed * ROTATION_SPEED) % 360);
      }
      lastTimestamp = timestamp;
      animationRef.current = requestAnimationFrame(animateVinyl);
    };
    animationRef.current = requestAnimationFrame(animateVinyl);
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isPlaying]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const updateTime = () => setCurrentTime(audio.currentTime);
    const updateDuration = () => setDuration(audio.duration || 0);

    audio.addEventListener("timeupdate", updateTime);
    audio.addEventListener("loadedmetadata", updateDuration);
    audio.addEventListener("play", () => setCurrentTime(0));

    return () => {
      audio.removeEventListener("timeupdate", updateTime);
      audio.removeEventListener("loadedmetadata", updateDuration);
      audio.removeEventListener("play", () => setCurrentTime(0));
    };
  }, []);

  const handlePlayPause = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-[#090819]">
      {/* Starry Background */}
      <div id="stars"></div>
      <div id="stars2"></div>
      <div id="stars3"></div>

      {/* Audio Player Container with updated margin */}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-[500px] w-full max-w-md mx-6 md:mx-auto my-6 md:my-8 p-4 md:p-6 bg-gradient-to-b from-gray-900/70 to-purple-900/50 rounded-2xl backdrop-blur-xl border border-purple-900/30 shadow-2xl">

        {/* Vinyl Section */}
        <div className="relative w-32 h-32 md:w-48 md:h-48 mb-6 flex items-center justify-center">
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-full h-full rounded-full border-4 border-purple-500 animate-pulse"></div>
          </div>
          <div
            ref={vinylRef}
            className="absolute inset-2 rounded-full bg-gray-800 shadow-lg flex items-center justify-center"
            style={{
              transform: `rotate(${rotation}deg)`,
              transition: isPlaying ? "none" : "transform 0.2s ease-out",
            }}
          >
            <img
              src="vinyl.png"
              alt="Vinyl"
              className="w-full h-full object-cover rounded-full"
            />
            <img
              src="logo.png"
              alt="Logo"
              className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-10 h-10 md:w-16 md:h-16 object-contain rounded-full"
            />
          </div>
        </div>

        {/* Song Info */}
        <div className="text-white text-base md:text-lg font-semibold mb-2 truncate w-full text-center">
          {songTitle}
        </div>
        <div className="text-purple-300 text-xs md:text-sm mb-8 text-center">{artist}</div>

        {/* Audio Element */}
        <audio
          ref={audioRef}
          src={STREAM_URL}
          preload="none"
          onPlay={() => setIsPlaying(true)}
          onPause={() => setIsPlaying(false)}
        />

        {/* Controls */}
        <div className="flex items-center justify-center space-x-6 md:space-x-8 mb-6">
          <button
            className="text-white hover:text-purple-400 transition text-2xl md:text-3xl"
            aria-label="Previous"
          >
            <FaStepBackward />
          </button>
          <button
            onClick={handlePlayPause}
            className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-full p-5 md:p-6 shadow-lg hover:shadow-purple-500/50 transition-all duration-300 focus:outline-none text-2xl md:text-3xl text-white"
            aria-label={isPlaying ? "Pause" : "Play"}
          >
            {isPlaying ? <FaPause /> : <FaPlay />}
          </button>
          <button
            className="text-white hover:text-purple-400 transition text-2xl md:text-3xl"
            aria-label="Next"
          >
            <FaStepForward />
          </button>
        </div>
      </div>

      {/* Wave Animation */}
      <Wave
        fill="#271d45"
        paused={!isPlaying}
        options={{
          height: 60,
          amplitude: 40,
          speed: 0.25,
          points: 4,
        }}
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
        }}
      />
    </div>
  );
}
