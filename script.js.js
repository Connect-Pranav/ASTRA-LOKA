/* =========================================================
   ASTRA LOKA — Cinematic Hero engine
   Vanilla ES5-compatible JavaScript. No dependencies.
========================================================= */

(function(){
  "use strict";

  var REDUCED_MOTION = (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  var IS_TOUCH = ('ontouchstart' in window) || (navigator.maxTouchPoints > 0);

  var video          = document.getElementById('character-video');
  var stage          = document.getElementById('stage');
  var hero           = document.getElementById('hero');
  var particlesCanvas= document.getElementById('particles');
  var halo           = document.querySelector('.halo-glow');
  var title          = document.getElementById('hero-title');
  var subtitle       = document.getElementById('hero-subtitle');
  var instruction    = document.getElementById('hero-instruction');
  var dragIndicator  = document.getElementById('drag-indicator');

  var DURATION = 10;          // fallback duration in seconds, corrected once metadata loads
  var CENTER_TIME = 5;        // resting pose (mouse at center)
  var TIME_EASE = 0.07;       // scrub inertia — lower = smoother/slower catch-up
  var TILT_EASE = 0.06;       // vertical parallax inertia
  var MIN_SEEK_DELTA = 0.012; // seconds — avoid redundant currentTime writes

  var targetTime = CENTER_TIME;
  var currentInterpTime = CENTER_TIME;
  var lastWrittenTime = -1;

  var targetTiltX = 0, currentTiltX = 0;   // vertical mouse -> rotate
  var targetTiltY = 0, currentTiltY = 0;   // horizontal mouse -> subtle translate

  var hasInteracted = false;
  var interactionEnabled = false;
  var rafId = null;

  /* -----------------------------------------------------------
     1. Preload + prep video
  ----------------------------------------------------------- */
  video.pause();
  video.controls = false;
  video.removeAttribute('controls');

  video.addEventListener('error', function(){
    var err = video.error;
    var msg = 'ASTRA LOKA: character-rotation.mp4 failed to load.';
    if(err){
      // MediaError.code: 1=ABORTED 2=NETWORK 3=DECODE 4=SRC_NOT_SUPPORTED
      msg += ' MediaError code ' + err.code + '.';
      if(err.code === 4){
        msg += ' The file was likely not found at "character-rotation.mp4" ' +
               'relative to this page, or the codec is unsupported — check the ' +
               'Network tab for a 404 and verify the path/filename/casing on the deployed repo.';
      }
    }
    console.error(msg);
    // Don't leave the hero stuck on a black screen — reveal text/particles
    // even if the character itself couldn't load, so the page isn't blank.
    revealHero();
  });

  function onMetadata(){
    if(video.duration && isFinite(video.duration) && video.duration > 0){
      DURATION = video.duration;
      CENTER_TIME = DURATION / 2;
      targetTime = CENTER_TIME;
      currentInterpTime = CENTER_TIME;
    }
    seekTo(CENTER_TIME, function(){
      revealHero();
    });
  }

  function seekTo(t, cb){
    var done = false;
    function onSeeked(){
      if(done) return;
      done = true;
      video.removeEventListener('seeked', onSeeked);
      if(cb) cb();
    }
    video.addEventListener('seeked', onSeeked);
    try{ video.currentTime = t; }catch(e){}
    // fallback in case 'seeked' never fires (some mobile browsers)
    setTimeout(function(){ if(!done){ onSeeked(); } }, 600);
  }

  if(video.readyState >= 1){
    onMetadata();
  } else {
    video.addEventListener('loadedmetadata', onMetadata);
  }
  // hard fallback so the intro never hangs forever on a slow network
  setTimeout(function(){
    if(!heroRevealed){ revealHero(); }
  }, 4000);

  /* -----------------------------------------------------------
     2. Intro reveal sequence
  ----------------------------------------------------------- */
  var heroRevealed = false;
  function revealHero(){
    if(heroRevealed) return;
    heroRevealed = true;

    particlesCanvas.className = particlesCanvas.className + ' visible';

    var d1 = REDUCED_MOTION ? 60 : 500;
    var d2 = REDUCED_MOTION ? 120 : 1200;
    var d3 = REDUCED_MOTION ? 180 : 1900;
    var d4 = REDUCED_MOTION ? 240 : 2600;
    var d5 = REDUCED_MOTION ? 300 : 3300;

    setTimeout(function(){
      video.className = video.className + ' visible';
    }, d1);

    setTimeout(function(){
      halo.className = halo.className + ' visible';
    }, d2);

    setTimeout(function(){
      title.className = title.className + ' visible';
    }, d3);

    setTimeout(function(){
      subtitle.className = subtitle.className + ' visible';
    }, d4);

    setTimeout(function(){
      instruction.className = instruction.className + ' visible';
      dragIndicator.className = dragIndicator.className + ' visible';
    }, d5);

    setTimeout(function(){
      interactionEnabled = true;
    }, d5);
  }

  /* -----------------------------------------------------------
     3. Pointer / touch -> target time + tilt
  ----------------------------------------------------------- */
  function mapXToTime(clientX){
    var ratio = clientX / window.innerWidth;
    if(ratio < 0) ratio = 0;
    if(ratio > 1) ratio = 1;
    return ratio * DURATION;
  }

  function mapYToTilt(clientY){
    var ratio = (clientY / window.innerHeight) - 0.5; // -0.5..0.5
    return ratio;
  }

  function onPointerUpdate(clientX, clientY){
    if(!interactionEnabled) return;
    targetTime = mapXToTime(clientX);
    var yRatio = mapYToTilt(clientY);
    targetTiltX = (-yRatio) * (REDUCED_MOTION ? 0 : 5);   // subtle rotateX, degrees
    targetTiltY = ((clientX / window.innerWidth) - 0.5) * (REDUCED_MOTION ? 0 : 10); // subtle translateX px

    if(!hasInteracted){
      hasInteracted = true;
      dismissDragIndicator();
      dismissInstruction();
    }
  }

  function dismissDragIndicator(){
    dragIndicator.className = dragIndicator.className.replace(' visible','') + ' dismissed';
  }
  function dismissInstruction(){
    instruction.className = instruction.className + ' faded';
  }

  if(!IS_TOUCH){
    window.addEventListener('mousemove', function(e){
      onPointerUpdate(e.clientX, e.clientY);
    }, {passive:true});
  }

  // touch (also enabled as a fallback even on hybrid devices)
  var touchActive = false;
  hero.addEventListener('touchstart', function(e){
    if(!e.touches || !e.touches.length) return;
    touchActive = true;
    onPointerUpdate(e.touches[0].clientX, e.touches[0].clientY);
  }, {passive:true});

  hero.addEventListener('touchmove', function(e){
    if(!e.touches || !e.touches.length) return;
    onPointerUpdate(e.touches[0].clientX, e.touches[0].clientY);
    if(touchActive){ e.preventDefault(); }
  }, {passive:false});

  hero.addEventListener('touchend', function(){
    touchActive = false;
  }, {passive:true});

  /* -----------------------------------------------------------
     4. Lightweight particle field (canvas)
  ----------------------------------------------------------- */
  var ctx = particlesCanvas.getContext('2d');
  var particles = [];
  var PARTICLE_COUNT = REDUCED_MOTION ? 0 : (IS_TOUCH ? 26 : 42);
  var dpr = Math.min(window.devicePixelRatio || 1, 2);

  function resizeCanvas(){
    particlesCanvas.width = window.innerWidth * dpr;
    particlesCanvas.height = window.innerHeight * dpr;
    particlesCanvas.style.width = window.innerWidth + 'px';
    particlesCanvas.style.height = window.innerHeight + 'px';
    ctx.setTransform(dpr,0,0,dpr,0,0);
  }
  resizeCanvas();

  function makeParticle(){
    return {
      x: Math.random()*window.innerWidth,
      y: Math.random()*window.innerHeight,
      r: Math.random()*1.6 + 0.4,
      speed: Math.random()*0.18 + 0.04,
      drift: (Math.random()-0.5)*0.12,
      alpha: Math.random()*0.5 + 0.15,
      flicker: Math.random()*0.02
    };
  }
  var pi;
  for(pi=0; pi<PARTICLE_COUNT; pi++){
    particles.push(makeParticle());
  }

  function drawParticles(){
    if(!PARTICLE_COUNT) return;
    ctx.clearRect(0,0,window.innerWidth,window.innerHeight);
    var i, p;
    for(i=0;i<particles.length;i++){
      p = particles[i];
      p.y -= p.speed;
      p.x += p.drift;
      p.alpha += (Math.random()-0.5)*p.flicker;
      if(p.alpha < 0.05) p.alpha = 0.05;
      if(p.alpha > 0.65) p.alpha = 0.65;
      if(p.y < -10){
        p.y = window.innerHeight + 10;
        p.x = Math.random()*window.innerWidth;
      }
      ctx.beginPath();
      ctx.fillStyle = 'rgba(232,194,115,' + p.alpha.toFixed(3) + ')';
      ctx.arc(p.x, p.y, p.r, 0, Math.PI*2);
      ctx.fill();
    }
  }

  /* -----------------------------------------------------------
     5. Main animation loop — smooth interpolation + video scrub
  ----------------------------------------------------------- */
  function tick(){
    rafId = requestAnimationFrame(tick);

    // interpolate scrub time toward target
    currentInterpTime += (targetTime - currentInterpTime) * TIME_EASE;

    if(interactionEnabled && video.readyState >= 2){
      if(Math.abs(currentInterpTime - lastWrittenTime) > MIN_SEEK_DELTA){
        var t = currentInterpTime;
        if(t < 0) t = 0;
        if(t > DURATION - 0.03) t = DURATION - 0.03;
        video.currentTime = t;
        lastWrittenTime = currentInterpTime;
      }
    }

    // interpolate tilt/parallax
    currentTiltX += (targetTiltX - currentTiltX) * TILT_EASE;
    currentTiltY += (targetTiltY - currentTiltY) * TILT_EASE;

    stage.style.transform =
      'translate3d(' + currentTiltY.toFixed(2) + 'px, ' + (currentTiltX*-1.4).toFixed(2) + 'px, 0) ' +
      'rotateX(' + currentTiltX.toFixed(2) + 'deg) ' +
      'rotateY(' + (currentTiltY*0.25).toFixed(2) + 'deg)';

    drawParticles();
  }
  rafId = requestAnimationFrame(tick);

  /* -----------------------------------------------------------
     6. Resize handling
  ----------------------------------------------------------- */
  var resizeTimer = null;
  window.addEventListener('resize', function(){
    if(resizeTimer) clearTimeout(resizeTimer);
    resizeTimer = setTimeout(function(){
      resizeCanvas();
    }, 120);
  });

  /* -----------------------------------------------------------
     7. Pause work when tab hidden (perf/battery courtesy)
  ----------------------------------------------------------- */
  document.addEventListener('visibilitychange', function(){
    if(document.hidden){
      if(rafId){ cancelAnimationFrame(rafId); rafId = null; }
    } else {
      if(!rafId){ rafId = requestAnimationFrame(tick); }
    }
  });

})();
