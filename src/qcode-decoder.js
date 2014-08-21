/**
 * Constructor for QRCodeDecoder
 */
function QRCodeDecoder () {
  this.tmrCapture = null;
  this.canvasElem = null;
}

/**
 * Prepares the canvas element (which will
 * receive the image from the camera and provide
 * what the algorithm needs for checking for a
 * QRCode and then decoding it.)
 * @param  {DOMElement} canvasElem the canvas
 * element
 * @param  {number} width      The width that
 * the canvas element should have
 * @param  {number} height     The height that
 * the canvas element should have
 * @return {DOMElement}            the canvas
 * after the resize if width and height
 * provided.
 */
QRCodeDecoder.prototype.prepareCanvas = function (canvasElem, width, height) {
  if (width && height) {
    canvasElem.style.width = width + "px";
    canvasElem.style.height = height + "px";
    canvasElem.width = width;
    canvasElem.height = height;
  }

  qrcode.setCanvasElement(canvasElem);
  this.canvasElem = canvasElem;

  return canvasElem;
};

QRCodeDecoder.prototype._captureToCanvas = function () {
  var scope = this;
  var cWidth = this.canvasElem.width;
  var cHeight = this.canvasElem.height;

  if (this.tmrCapture) {
    clearTimeout(this.tmrCapture);
  }

  var gCtx = this.canvasElem.getContext("2d");
  gCtx.clearRect(0, 0, cWidth, cHeight);

  try{
    gCtx.drawImage(this.videoElem, 0, 0,cWidth,cHeight);
    try{
      qrcode.decode();
    }
    catch(e){
      console.log(e);
      this.tmrCapture = setTimeout(function () {
        scope._captureToCanvas.apply(scope, null);
      }, 500);
    }
  }
  catch(e){
      console.log(e);
      this.tmrCapture = setTimeout(function () {
        scope._captureToCanvas.apply(scope, null);
      }, 500);
  }
};

/**
 * Verifies if the user has getUserMedia enabled
 * in the browser.
 */
QRCodeDecoder.prototype.hasGetUserMedia = function () {
  return !!(navigator.getUserMedia || navigator.webkitGetUserMedia ||
            navigator.mozGetUserMedia || navigator.msGetUserMedia);
};

/**
 * Verifies if canvas element is supported.
 */
QRCodeDecoder.prototype.isCanvasSupported = function () {
  var elem = document.createElement('canvas');

  return !!(elem.getContext && elem.getContext('2d'));
};

/**
 * Prepares the video element for receiving
 * camera's input.
 * @param  {DOMElement} videoElem <video> dom
 * element
 * @param  {Function} errcb     callback
 * function to be called in case of error
 */
QRCodeDecoder.prototype.prepareVideo = function(videoElem, errcb) {
  var scope = this;

  navigator.getUserMedia = navigator.getUserMedia ||
      navigator.webkitGetUserMedia ||
      navigator.mozGetUserMedia ||
      navigator.msGetUserMedia;

  if (navigator.getUserMedia) {
    navigator.getUserMedia({video:true, audio:false}, function (stream) {
      videoElem.src = window.URL.createObjectURL(stream);
      scope.videoElem = videoElem;
      scope.stream = stream;
      setTimeout(function () {
        scope._captureToCanvas.apply(scope, null);
      }, 500);
    }, errcb);
  } else {
    console.log('Couldn\'t get video from camera');
  }

  setTimeout(function () {
    scope._captureToCanvas.apply(scope, null);
  }, 500);
};

/**
 * Releases a video stream that was being
 * captured by prepareToVideo
 */
QRCodeDecoder.prototype.releaseVideo = function() {
  this.stream.stop();
};
 
 /**
+ * Releases a video stream that was being captured by prepareToVideo
+ */
QRCodeDecoder.prototype.stop = function() {
  this.releaseVideo();
  if (this.tmrCapture) {
    clearTimeout(this.tmrCapture);
    delete this.tmrCapture;
  }
};

/**
 * Sets the callback for the decode event
 */
QRCodeDecoder.prototype.setDecoderCallback = function (cb) {
  qrcode.callback = cb;
};

QRCodeDecoder.prototype.decodeFromSrc = function(src) {
  qrcode.decode(src);
};
