import React, { useCallback } from 'react';
import Particles from '@tsparticles/react';
import { loadSlim } from '@tsparticles/slim';

const ParticleBackground = () => {
  const particlesInit = useCallback(async (engine) => {
    await loadSlim(engine);
  }, []);

  const particlesLoaded = useCallback(async (container) => {
    await console.log(container);
  }, []);

  return (
    <Particles
      id="tsparticles"
      init={particlesInit}
      loaded={particlesLoaded}
      options={{
        background: {
          color: {
            value: 'transparent',
          },
        },
        fpsLimit: 60,
        interactivity: {
          events: {
            onHover: {
              enable: true,
              mode: 'repulse',
            },
            resize: true,
          },
          modes: {
            repulse: {
              distance: 100,
              duration: 0.4,
            },
          },
        },
        particles: {
          color: {
            value: ['#50E3C2', '#7FFFD4', '#40D9A4', '#66F2D9'],
          },
          links: {
            color: '#50E3C2',
            distance: 120,
            enable: true,
            opacity: 0.8,
            width: 2,
          },
          collisions: {
            enable: true,
          },
          move: {
            direction: 'none',
            enable: true,
            outModes: {
              default: 'bounce',
            },
            random: true,
            speed: 1.5,
            straight: false,
          },
          number: {
            density: {
              enable: true,
              area: 600,
            },
            value: 120,
          },
          opacity: {
            value: 0.8,
            random: true,
            animation: {
              enable: true,
              speed: 1,
              minimumValue: 0.3,
            },
          },
          shape: {
            type: ['circle', 'triangle'],
          },
          size: {
            value: { min: 2, max: 8 },
            random: true,
            animation: {
              enable: true,
              speed: 2,
              minimumValue: 1,
            },
          },
        },
        detectRetina: true,
      }}
    />
  );
};

export default ParticleBackground;