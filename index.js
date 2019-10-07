// import pico from 'picojs'
const pico = require('picojs');
const fs = require('fs');
const { createCanvas, loadImage } = require('canvas');
/*
  1. load the face-detection cascade
*/
const getFaceClassifier = async () => {
  let buffer = fs.readFileSync('./bin/facefinder');
  var bytes = new Int8Array(buffer);
  console.log('cascade loaded');
  return pico.unpack_cascade(bytes);
}
/*
  2. prepare the image and canvas context
*/
const getImage = async (source) => {
  const image = await loadImage(source)
  const { width, height } = image
  const canvas = createCanvas(width, height)
  const ctx = canvas.getContext('2d')
  ctx.drawImage(image, 0, 0)
  return { image, ctx };
}
/*
  3. transform an RGBA image to grayscale
*/
const rgba_to_grayscale = (rgba, nrows, ncols) => {
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
const getDefaultParams = (width, height) => {
  const factor = {
    shiftfactor: 0.1,
    scalefactor: 1.1
  }
  const size = {
    minsize: Math.min(width, height) * 0.07 >> 0, // minimum size of a face
    maxsize: Math.max(width, height) * 3 >> 0 // maximum size of a face
  }
  return Object.assign(factor, size);
}

const face_detection = async (img, option, qThreshold = 5.0, IoU = 0.2) => {
  const facefinder_classify_region = await getFaceClassifier();
  let { image, ctx} = await getImage(img);
  let { width, height } = image
  // re-draw the image to clear previous results and get its RGBA pixel data
  var rgba = ctx.getImageData(0, 0, width, height).data;
  // prepare input to `run_cascade`
  const imageParams = {
    "pixels": rgba_to_grayscale(rgba, height, width),
    "nrows": height,
    "ncols": width,
    "ldim": width
  }
  const params = Object.assign(getDefaultParams(width, height), option);
  // run the cascade over the image
  // dets is an array that contains (r, c, s, q) quadruplets
  // (representing row, column, scale and detection score)
  dets = pico.run_cascade(imageParams, facefinder_classify_region, params);
  // cluster the obtained detections
  dets = pico.cluster_detections(dets, IoU); // set IoU threshold to 0.2
  // return results
  return dets.filter(e => e[3] > qThreshold);
}

const pico_node = {};
pico_node.face_detection = face_detection;
module.exports = pico_node;
