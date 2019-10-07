// import pico from 'index.js';
const pico_node = require('./index')

let img = 'img.jpg';

const main = async () => {
  try {
    const results = await pico_node.face_detection(img)
    console.log('results: ', results) 
  } catch (err) {
    console.log(err)
  }
}

main()
