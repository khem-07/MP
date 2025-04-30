import React, { useEffect, useRef, useState } from "react";
import Wave from "react-wavify";
import { FaPlay, FaPause, FaStepBackward, FaStepForward } from "react-icons/fa";
import "../starryBackground.scss";

const STREAM_URL = "https://listen.ramashamedia.com:8330/stream";
const SONGTITLE_API = "/currentsong"; // Proxy endpoint

export default function AudioPlayer() {
  const audioRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [songTitle, setSongTitle] = useState("Loading...");
  const [artist, setArtist] = useState("Unknown Artist");
  const [rotation, setRotation] = useState(0);
  const animationRef = useRef(null);

  // Track current song title internally to compare with new fetches
  const currentSongRef = useRef("");
  // Track if song ended
  const songEndedRef = useRef(true);

  // Play/Pause handler
  const handlePlayPause = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  // Fetch song title every 15 seconds, but only update if previous song ended
  useEffect(() => {
    const fetchSongTitle = async () => {
      try {
        const res = await fetch(SONGTITLE_API);
        const text = await res.text();
        const currentTitle = text.trim();

        if (currentTitle !== currentSongRef.current) {
          // Only update if previous song ended
          if (songEndedRef.current) {
            currentSongRef.current = currentTitle;
            const [song, artistName] = currentTitle.split(" - ");
            setSongTitle(song || currentTitle);
            setArtist(artistName || "Unknown Artist");
            songEndedRef.current = false; // New song started
          }
          // else: do nothing, wait for current song to end
        }
      } catch (error) {
        console.error("Error fetching song title:", error);
      }
    };

    fetchSongTitle();
    const interval = setInterval(fetchSongTitle, 15000);
    return () => clearInterval(interval);
  }, []);

  // Vinyl rotation animation
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
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, [isPlaying]);

  // Audio event listeners
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const onEnded = () => {
      songEndedRef.current = true; // Mark song ended so next fetch can update
      setIsPlaying(false);
    };

    const onPlay = () => {
      songEndedRef.current = false; // Song started playing
      setIsPlaying(true);
    };

    audio.addEventListener("ended", onEnded);
    audio.addEventListener("play", onPlay);
    audio.addEventListener("pause", () => setIsPlaying(false));

    return () => {
      audio.removeEventListener("ended", onEnded);
      audio.removeEventListener("play", onPlay);
      audio.removeEventListener("pause", () => setIsPlaying(false));
    };
  }, []);

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-[#090819] flex items-center justify-center">
      {/* Starry Background */}
      <div id="stars"></div>
      <div id="stars2"></div>
      <div id="stars3"></div>

      {/* Audio Player Container */}
      <div className="
        relative z-10 flex flex-col items-center justify-center
        w-full max-w-xs sm:max-w-sm
        mx-auto mt-0 mb-20
        pt-4 pb-2 sm:pt-6 sm:pb-8 space-y-10 sm:space-y-10
        bg-gradient-to-b from-gray-900/70 to-purple-900/50 rounded-2xl
        backdrop-blur-xl border border-purple-900/30 shadow-2xl
        min-h-[400px] sm:min-h-[500px]
      ">
        {/* Vinyl Section */}
        <div className="
          relative w-24 h-24 sm:w-32 sm:h-32 md:w-48 md:h-48 
          mb-6 sm:mb-8 md:mb-10
          flex items-center justify-center
        ">
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-full h-full rounded-full border-4 border-purple-500 animate-pulse"></div>
          </div>
          <div
            className="absolute inset-2 rounded-full bg-gray-800 shadow-lg flex items-center justify-center"
            style={{
              transform: `rotate(${rotation}deg)`,
              transition: isPlaying ? "none" : "transform 0.2s ease-out",
            }}
          >
            <img
              src="/vinyl.png"
              alt="Vinyl"
              className="w-full h-full object-cover rounded-full"
            />
            <img
              src="/logo.png"
              alt="Logo"
              className="
                absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2
                w-12 h-12 sm:w-16 sm:h-16 md:w-20 md:h-20
                object-contain rounded-full
              "
            />
          </div>
        </div>

        {/* Song Info */}
        <div className="text-white text-lg sm:text-xl md:text-2xl font-bold mb-2 truncate w-full text-center px-4">
          {artist}
        </div>
        <div className="text-purple-300 text-xs sm:text-sm md:text-base mb-6 text-center px-4">
          {songTitle}
        </div>

        {/* Audio Element */}
        <audio
          ref={audioRef}
          src={STREAM_URL}
          preload="none"
          controls={false}
        />

        {/* Controls */}
        <div className="flex items-center justify-center space-x-6 sm:space-x-8 md:space-x-10 mb-4 w-full max-w-xs sm:max-w-sm">
          <button
            className="text-white hover:text-purple-400 transition text-xl sm:text-2xl md:text-3xl"
            aria-label="Previous"
          >
            <FaStepBackward />
          </button>
          <button
            onClick={handlePlayPause}
            className="
              bg-gradient-to-r from-purple-500 to-pink-500 rounded-full
              p-4 sm:p-5 md:p-6 shadow-lg hover:shadow-purple-500/50
              transition-all duration-300 focus:outline-none
              text-2xl sm:text-3xl md:text-4xl text-white
            "
            aria-label={isPlaying ? "Pause" : "Play"}
          >
            {isPlaying ? <FaPause /> : <FaPlay />}
          </button>
          <button
            className="text-white hover:text-purple-400 transition text-xl sm:text-2xl md:text-3xl"
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
          amplitude: 30,
          speed: 0.25,
          points: 8,
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
