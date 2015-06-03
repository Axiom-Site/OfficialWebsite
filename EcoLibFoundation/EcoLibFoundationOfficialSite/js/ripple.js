/*
* Adapted from Neil Wallis' Water Java simulation
* http://www.neilwallis.com/projects/java/water/index.php
*
*/
window.addEventListener('load', function() {
  "use strict";
  // source image
  var img = new Image();
  img.src = document.getElementById("intro").getAttribute("data-image");
  var screen = ge1doot.screen.init("canvas", null, true),
    ctx = screen.ctx,
    width = screen.width,
    height = screen.height,
    hwidth = width / 2,
    hheight = height / 2,
    pointer = screen.pointer.init(),
    size = width * (height + 2) * 2,
    len = width * height,
    map = new Int16Array(size),
    oldind = width,
    newind = width * (height + 3);
  ctx.drawImage(img, 0, 0);
  // source texture
  var texture = ctx.getImageData(0, 0, width, height);
  var textureBuffer = new ArrayBuffer(texture.data.length);
  var textureBuffer8 = new Uint8ClampedArray(textureBuffer); // 8 bit clamped view
  var textureBuffer32 = new Uint32Array(textureBuffer); // 32 bits view
  // copy texture image
  for (var i = 0; i < textureBuffer8.length; i++) {
    textureBuffer8[i] = texture.data[i];
  }
  // ripple texture
  var ripple = ctx.getImageData(0, 0, width, height);
  var rippleBuffer = new ArrayBuffer(ripple.data.length);
  var rippleBuffer8 = new Uint8ClampedArray(rippleBuffer);
  var rippleBuffer32 = new Uint32Array(rippleBuffer);
  // create wave
  function wave(dx, dy, r) {
    for (var j = dy - r; j < dy + r; j++) {
      for (var k = dx - r; k < dx + r; k++) {
        if (j >= 0 && j < height && k >= 0 && k < width) {
          map[oldind + (j * width) + k] += 512;
        }
      }
    }
  }

  function gloop() {
    wave(hwidth | 0, hheight | 0, 8);
  }

  function water() {
      var i, x, y, a, b, data, mapind;
      // toggle maps each frame
      i = oldind;
      oldind = newind;
      newind = i;
      mapind = oldind;
      for (i = 0; i < len; i++) {
        x = (i % width) | 0;
        y = (i / width) | 0;
        data = (
          (
            map[mapind - width] +
            map[mapind + width] +
            map[mapind - 1] +
            map[mapind + 1]
          ) >> 1
        ) - map[newind + i];
        data -= data >> 6;
        mapind++;
        if (x !== 0) map[newind + i] = data;
        data = 1024 - data;
        // offsets
        a = (((x - hwidth) * data / 1024) + hwidth) | 0;
        b = (((y - hheight) * data / 1024) + hheight) | 0;
        // bounds check
        if (a >= width) a = width - 1;
        else if (a < 0) a = 0;
        if (b >= height) b = height - 1;
        else if (b < 0) b = 0;
        // 32 bits pixel copy
        rippleBuffer32[i] = textureBuffer32[a + (b * width)];
      }
      ripple.data.set(rippleBuffer8);
    }
    // main loop
  function run() {
      requestAnimationFrame(run);
      water();
      ctx.putImageData(ripple, 0, 0);
      // create waves
      if (pointer.active) {
        wave(pointer.pos.x | 0, pointer.pos.y | 0, 3);
      }
    }
    // start
  requestAnimationFrame(run);
  gloop();
  setInterval(gloop, 4000);
});