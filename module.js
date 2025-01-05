Hooks.on('ready', () => {
  
  if (!game.user.isGM) return;

  Hooks.on('renderPlaylistDirectory', (app, html) => {
    
    $('#currently-playing').find('ol').find('li').each((i, element) => {
          const controlBar = $(element).find('.sound-controls');
          
          if (controlBar.find('.smooth-fade').length > 0) return;

          controlBar.each((i, controlElement) => {
            const currentFlexBasis = parseInt(window.getComputedStyle(controlElement).flexBasis, 10) || 0;
            const newFlexBasis = currentFlexBasis + 16;
            controlElement.style.flexBasis = `${newFlexBasis}px`;
          });

          const trackId = $(element).data('sound-id');

          const playlist = game.playlists.contents.find(p => p.sounds.some(s => s.id === trackId));
          if (!playlist) return;
          
          const track = playlist.sounds.find(sound => sound.id === trackId);
          
          if (!track || !track.playing) return;

          const isDisabled = track.volume === 0 ? ' inactive' : '';
          
          const fadeControl = $(
            `<a class="sound-control fas fa-volume-down smooth-fade${isDisabled}"
                data-action="smooth-fade" 
                data-tooltip="Fade Out">
            </a>`
          );

          controlBar.children(':first').before(fadeControl);

          fadeControl.on('click', () => {
            const fadeDuration = 5000;
            smoothFadeVolume(trackId, fadeDuration);
          });
      });
  });

  Hooks.on('updatePlaylistSound', (playlist, sound, data) => {
    
    if (!('volume' in playlist)) return;

    const trackId = sound._id;
    const html = document.querySelector(`[data-sound-id="${trackId}"]`);
    if (!html) return;

    const fadeButton = html.querySelector('.smooth-fade');
    if (!fadeButton) return;

    if (playlist.volume === 0) {
      fadeButton.classList.add('inactive');
    } else {
      fadeButton.classList.remove('inactive');
    }
  });

});

async function smoothFadeVolume(trackId, duration) {
  const playlist = game.playlists.contents.find(p => p.sounds.some(s => s.id === trackId));
  if (!playlist) return ui.notifications.error('Playlist containing track not found.');

  const track = playlist.sounds.find(sound => sound.id === trackId);
  if (!track) return ui.notifications.error('Track not found or not playing.');

  const startVolume = track.volume;
  const steps = 20;
  const interval = duration / steps;
  const delta = startVolume / steps;

  for (let i = 1; i <= steps; i++) {
      const newVolume = Math.max(startVolume - delta * i, 0);
      track.update({ volume: newVolume });
      await new Promise(resolve => setTimeout(resolve, interval));
  }
}
