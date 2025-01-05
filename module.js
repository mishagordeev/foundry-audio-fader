// Smooth Volume Fader for Foundry VTT

Hooks.on('ready', () => {
  
  if (!game.user.isGM) return;

  Hooks.on('renderPlaylistDirectory', (app, html) => {
    console.log("Fader | Hooks on");
    
    $('#currently-playing').find('ol').find('li').each((i, element) => {
          const controlBar = $(element).find('.sound-controls');
          
          console.log("Fader | " + $(element).text());
          
          if (controlBar.find('.smooth-fade').length > 0) return; // Avoid duplicate buttons

          const trackId = $(element).data('sound-id');

          console.log(`Fader | Track Id ${trackId}`);

          const playlist = game.playlists.contents.find(p => p.sounds.some(s => s.id === trackId));
          if (!playlist) return;
          
          const track = playlist.sounds.find(sound => sound.id === trackId);
          
          if (!track || !track.playing) return; // Skip if the track is not playing

          const isDisabled = track.volume === 0 ? ' disabled' : '';
          

          // Add our smooth fade button
          const fadeControl = $(
            `<a class="sound-control fas fa-volume-down smooth-fade${isDisabled}"
                data-action="smooth-fade" 
                data-tooltip="Fade Out">
            </a>`
          );
          controlBar.append(fadeControl);

          // Attach click event
          fadeControl.on('click', () => {
            const fadeDuration = 5000; // 5 seconds fade-out as default
            smoothFadeVolume(trackId, fadeDuration);
          });
      });
  });

  Hooks.on('updatePlaylistSound', (playlist, sound, data) => {
    if (!('volume' in data)) return; // Only handle volume changes

    const trackId = sound.id;
    const html = document.querySelector(`[data-sound-id="${trackId}"]`);
    if (!html) return;

    const fadeButton = html.querySelector('.smooth-fade');
    if (!fadeButton) return;

    // Enable or disable the button based on the volume
    if (data.volume === 0) {
        fadeButton.classList.add('disabled');
    } else {
        fadeButton.classList.remove('disabled');
    }
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
