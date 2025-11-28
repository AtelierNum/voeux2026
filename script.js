document.addEventListener('DOMContentLoaded', () => {
  const enterArBtn = document.getElementById('enter-ar-btn');
  const enterArLogoBtn = document.getElementById('enter-ar-logo-btn');
  const arScene = document.getElementById('ar-scene');
  const enterArContainer = document.getElementById('enter-ar-container');
  const videos = document.querySelectorAll('video');

  const startARExperience = async () => {
    // Hide the button and show the AR scene
    enterArContainer.style.display = 'none';

    // Mute all videos and play them to unlock
    videos.forEach(video => {
      video.muted = true;
      video.play().catch(e => console.error("Error playing video:", e));
    });

    // Enter AR mode
    await arScene.enterAR();

    // Unmute videos after a short delay
    setTimeout(() => {
      videos.forEach(video => {
        video.muted = false;
        video.pause(); // Pause after unlocking
      });
    }, 1000);
  };

  enterArBtn.addEventListener('click', startARExperience);
  enterArLogoBtn.addEventListener('click', startARExperience);
});

AFRAME.registerComponent('gaze-interaction', {
  schema: {
    zoomPosition: {type: 'vec3', default: {x: 0, y: 0, z: 10}}
  },

  init: function () {
    const position = this.el.getAttribute('position');
    this.originalPosition = {x: position.x, y: position.y, z: position.z};
    this.video = this.el.getAttribute('src');

    this.el.addEventListener('mouseenter', this.onMouseEnter.bind(this));
    this.el.addEventListener('mouseleave', this.onMouseLeave.bind(this));
  },

  onMouseEnter: function () {
    // Zoom in and make opaque
    this.el.setAttribute('animation__position', {
      property: 'position',
      to: this.calculateZoomPosition(),
      dur: 500,
      easing: 'easeOutQuad'
    });
    this.el.setAttribute('animation__opacity', {
      property: 'material.opacity',
      to: 1.0,
      dur: 500,
      easing: 'easeOutQuad'
    });

    // Play video and handle the promise to avoid errors
    if (this.video) {
      const playPromise = this.video.play();
      if (playPromise !== undefined) {
        playPromise.catch(error => {
          console.error("Gaze-interaction play failed:", error);
        });
      }
    }
  },

  onMouseLeave: function () {
    // Zoom out and make semi-transparent
    this.el.setAttribute('animation__position', {
      property: 'position',
      to: this.originalPosition,
      dur: 500,
      easing: 'easeOutQuad'
    });
    this.el.setAttribute('animation__opacity', {
      property: 'material.opacity',
      to: 0.75,
      dur: 500,
      easing: 'easeOutQuad'
    });

    // Pause video
    if (this.video) {
      this.video.pause();
    }
  },

  calculateZoomPosition: function() {
    let newPos = {};
    let direction = new THREE.Vector3();
    this.el.object3D.getWorldDirection(direction);
    // Move card 20 units closer to the camera along its direction vector
    direction.multiplyScalar(20);
    newPos.x = this.originalPosition.x + direction.x;
    newPos.y = this.originalPosition.y + direction.y;
    newPos.z = this.originalPosition.z + direction.z;
    return newPos;
  }
});
