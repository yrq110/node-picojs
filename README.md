# node-picojs

Make using [picojs](https://github.com/tehnokv/picojs) feel cool in **Node** env.

## Install

```bash
npm install --save node-picojs
# or
yarn add node-picojs
```

## Usage

```js
const pico = require('node-picojs')
const qThreshold = 10.0; // default is 5.0
const IoU = 0.3; // default is 0.2
pico.face_detection('image_file.jpg', qThreshold, IoU),then(response => {
  /**
   * Ref to picojs doc: 
   * The array response contains quadruplets of the form(r, c, s, q), where r, c and s specify 
   * the position (row, column) and size of face region, and q represents the detection score. 
   * The higher the score of the region, the more likely it is a face. 
  */
  console.log('face detection results: ', response)
})
```

## Feature

* Automatically calculate object sizes based on input image.
* Custom qThreshold and [IoU](https://en.wikipedia.org/wiki/Jaccard_index) parameters
