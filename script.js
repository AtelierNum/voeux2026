document.addEventListener('DOMContentLoaded', () => {
  const enterArBtn = document.getElementById('enter-ar-btn');
  const arScene = document.getElementById('ar-scene');
  const enterArContainer = document.getElementById('enter-ar-container');
  const videos = document.querySelectorAll('video');

  const startARExperience = () => {
    // Hide the button and show the AR scene
    enterArContainer.style.display = 'none';
    arScene.style.display = 'block';

    // Play all videos once to unlock them for mobile
    let videosPlayed = 0;
    videos.forEach(video => {
      video.play().then(() => {
        videosPlayed++;
        if (videosPlayed === videos.length) {
          // All videos are unlocked, pause them
          videos.forEach(v => v.pause());
        }
      }).catch(error => {
        console.error("Video playback failed:", error);
      });
    });

    // Start the A-Frame scene
    if (arScene.hasLoaded) {
      arScene.play();
    } else {
      arScene.addEventListener('loaded', () => arScene.play());
    }
  };

  enterArBtn.addEventListener('click', startARExperience);
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

    // Play video
    if (this.video) {
      this.video.play();
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
      to: 0.5,
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
