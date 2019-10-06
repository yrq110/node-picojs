// import pico from 'picojs'
const pico = require('picojs');
const fetch = require('node-fetch');
const { createCanvas, loadImage } = require('canvas');
/*
  1. download the face-detection cascade
*/
var facefinder_classify_region = function(r, c, s, pixels, ldim) {return -1.0;};
const getClassifier = async () => {
  var cascadeurl = 'https://raw.githubusercontent.com/nenadmarkus/pico/c2e81f9d23cc11d1a612fd21e4f9de0921a5d0d9/rnt/cascades/facefinder';
  let response = await fetch(cascadeurl)
  let buffer = await response.arrayBuffer()
  var bytes = new Int8Array(buffer);
  facefinder_classify_region = pico.unpack_cascade(bytes);
  console.log('* cascade loaded');
}
/*
  2. prepare the image and canvas context
*/
const imageUrl = 'img.png';
let image = null;
let width, height;
const getImage = async () => {
  const e = new Error({})
  image = await loadImage(imageUrl)
  width = image.width;
  height = image.height;

  const canvas = createCanvas(width, height)
  const ctx = canvas.getContext('2d')
  ctx.drawImage(image, 0, 0)
  return ctx;
}
/*
  3. a function to transform an RGBA image to grayscale
*/
function rgba_to_grayscale(rgba, nrows, ncols) {
  var gray = new Uint8Array(nrows*ncols);
  for(var r=0; r<nrows; ++r)
    for(var c=0; c<ncols; ++c)
      // gray = 0.2*red + 0.7*green + 0.1*blue
      gray[r*ncols + c] = (2*rgba[r*4*ncols+4*c+0]+7*rgba[r*4*ncols+4*c+1]+1*rgba[r*4*ncols+4*c+2])/10;
  return gray;
}
/*
  4. main function
*/
const main = async () => {
  await getClassifier();
  let ctx = await getImage();
  // re-draw the image to clear previous results and get its RGBA pixel data
  var rgba = ctx.getImageData(0, 0, width, height).data;
  // prepare input to `run_cascade`
  image = {
    "pixels": rgba_to_grayscale(rgba, height, width),
    "nrows": height,
    "ncols": width,
    "ldim": width
  }
  params = {
    "shiftfactor": 0.1, // move the detection window by 10% of its size
    "minsize": 20,      // minimum size of a face (not suitable for real-time detection, set it to 100 in that case)
    "maxsize": 1000,    // maximum size of a face
    "scalefactor": 1.1  // for multiscale processing: resize the detection window by 10% when moving to the higher scale
  }
  // run the cascade over the image
  // dets is an array that contains (r, c, s, q) quadruplets
  // (representing row, column, scale and detection score)
  dets = pico.run_cascade(image, facefinder_classify_region, params);
  // cluster the obtained detections
  dets = pico.cluster_detections(dets, 0.2); // set IoU threshold to 0.2
  // draw results
  qthresh = 5.0 // this constant is empirical: other cascades might require a different one
  console.log('results: ', dets);
  for(i=0; i<dets.length; ++i) {
    // check the detection score
    // if it's above the threshold, draw it
    if(dets[i][3]>qthresh)
    {
      console.log('detect face: ', dets[i]);
    }
  }
}

main();