# node-picojs

Making [picojs](https://github.com/tehnokv/picojs) be cool with Node env.

## Usage

```js
const pico = require('node-picojs')
const qThreshold = 10.0; // default is 5.0
const IoU = 0.3; // default is 0.2
pico.face_detection('image_file.jpg', qThreshold, IoU),then(res => {
  console.log('face detection results: ', res)
})
```

## Feature

* Easy to use
* Automatically calculate object sizes based on input image.
* Custom qThreshold and [IoU](https://en.wikipedia.org/wiki/Jaccard_index) parameters
