// Smooth Volume Fader for Foundry VTT

Hooks.on('ready', () => {
  
  if (!game.user.isGM) return;

  Hooks.on('renderPlaylistDirectory', (app, html) => {
    console.log("Fader | Hooks on");
    
    $('#currently-playing').find("ol").each((i, element) => {
          const controlBar = $(element).find('.sound-controls');
          console.log("Fader | Sound flexrow playing founded");
          
          if (controlBar.find('.smooth-fade').length > 0) return; // Avoid duplicate buttons

          const trackId = $(element).closest('.playlist-sound').data('sound-id');

          console.log(`Fader | Track Id ${trackId}`);

          const playlist = game.playlists.contents.find(p => p.sounds.some(s => s.id === trackId));
          if (!playlist) return;
          
          const track = playlist.sounds.find(sound => sound.id === trackId);
          if (!track || track.volume === 0 || !track.playing) return; // Skip if volume is 0 or track is not playing

          // Add our smooth fade button
          const fadeButton = $(`
              <button class="smooth-fade">
                  <i class="fas fa-volume-down"></i>
              </button>
          `);

          controlBar.append(fadeButton);

          // Attach click event
          fadeButton.on('click', () => {
            const fadeDuration = 5000; // 5 seconds fade-out as default
            smoothFadeVolume(trackId, fadeDuration);
          });
      });
  });
});

async function smoothFadeVolume(trackId, duration) {
  const playlist = game.playlists.contents.find(p => p.sounds.some(s => s.id === trackId));
  if (!playlist) return ui.notifications.error('Playlist containing track not found.');

  const track = playlist.sounds.find(sound => sound.id === trackId);
  if (!track) return ui.notifications.error('Track not found or not playing.');

  const startVolume = track.volume;
  const steps = 50; // Number of steps in the fade
  const interval = duration / steps;
  const delta = startVolume / steps;

  for (let i = 1; i <= steps; i++) {
      const newVolume = Math.max(startVolume - delta * i, 0);
      track.update({ volume: newVolume });
      await new Promise(resolve => setTimeout(resolve, interval));
  }
}
