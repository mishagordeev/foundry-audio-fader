// Smooth Volume Fader for Foundry VTT

Hooks.on('ready', () => {
  // Extend the Soundscape Player with our custom button
  Hooks.on('renderAudioSidebar', (app, html) => {
    console.log("Fader | Hooks on");
      html.find('.sound flexrow playing').each((i, element) => {
          const controlBar = $(element).find('.sound-controls flexrow');
          console.log("Fader | Sound flexrow playing founded");
          if (controlBar.find('.smooth-fade').length > 0) return; // Avoid duplicate buttons

          // Add our smooth fade button
          const fadeButton = $(`
              <button class="smooth-fade">
                  <i class="fas fa-volume-down"></i>
              </button>
          `);

          controlBar.append(fadeButton);

          // Attach click event
          fadeButton.on('click', () => {
              const trackId = $(element).data('track-id');
              const fadeDuration = 5000; // 5 seconds fade-out as default
              smoothFadeVolume(trackId, fadeDuration);
          });
      });
  });
});

async function smoothFadeVolume(trackId, duration) {
  const track = game.audio.playing.find(t => t.id === trackId);
  if (!track) return ui.notifications.error('Track not found or not playing.');

  const startVolume = track.volume;
  const steps = 50; // Number of steps in the fade
  const interval = duration / steps;
  const delta = startVolume / steps;

  for (let i = 1; i <= steps; i++) {
      const newVolume = Math.max(startVolume - delta * i, 0);
      track.setVolume(newVolume);
      await new Promise(resolve => setTimeout(resolve, interval));
  }

  // Stop the track when fully faded
  track.stop();
  ui.notifications.info('Track faded out successfully.');
}
