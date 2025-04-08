import React, { useEffect, useRef } from "react";

const Background3D = () => {
  const particlesRef = useRef(null);

  useEffect(() => {
    if (!particlesRef.current) return;

    // Clear existing particles
    particlesRef.current.innerHTML = "";

    // Create new particles
    const count = 100;
    for (let i = 0; i < count; i++) {
      const particle = document.createElement("div");
      particle.classList.add("particle");

      // Random position
      const x = Math.random() * 100;
      const y = Math.random() * 100;
      const z = Math.random() * 500 - 250;

      // Random size
      const size = Math.random() * 3 + 1;

      // Random animation delay and duration
      const delay = Math.random() * 20;
      const duration = 15 + Math.random() * 20;

      // Random colors based on our theme
      const colors = [
        "rgba(255, 255, 255, 0.8)",
        "rgba(77, 93, 255, 0.8)",
        "rgba(0, 229, 255, 0.8)",
        "rgba(255, 69, 147, 0.8)",
        "rgba(196, 0, 255, 0.8)",
      ];
      const color = colors[Math.floor(Math.random() * colors.length)];

      // Apply styles
      particle.style.left = `${x}%`;
      particle.style.top = `${y}%`;
      particle.style.width = `${size}px`;
      particle.style.height = `${size}px`;
      particle.style.background = color;
      particle.style.boxShadow = `0 0 ${size * 3}px ${color}`;
      particle.style.animationDelay = `${delay}s`;
      particle.style.animationDuration = `${duration}s`;
      particle.style.transform = `translateZ(${z}px)`;

      particlesRef.current.appendChild(particle);
    }

    return () => {
      if (particlesRef.current) {
        particlesRef.current.innerHTML = "";
      }
    };
  }, []);

  return (
    <div className="scene-bg">
      <div className="bg-gradient"></div>
      <div className="bg-grid"></div>
      <div className="bg-glow"></div>
      <div className="bg-particles" ref={particlesRef}></div>
      <div className="bg-vignette"></div>
    </div>
  );
};

export default Background3D;
