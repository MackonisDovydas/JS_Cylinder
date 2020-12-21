const express = require('express')
const app = express()
const path = require('path')

app.use(express.static(__dirname + '/public'))
app.use('/build/', express.static(path.join(__dirname, 'node_modules/three/build')));
app.use('/jsm/', express.static(path.join(__dirname, 'node_modules/three/examples/jsm')));
app.use('/js/', express.static(path.join(__dirname, 'node_modules/three/examples/js')));
app.use('/dat/', express.static(path.join(__dirname, 'node_modules/dat.gui/build')));
app.use('/jquery/', express.static(path.join(__dirname, 'node_modules/jquery/dist')));
app.use('/assets/', express.static(path.join(__dirname, 'assets')));
app.listen(3000, () =>
  console.log('Visit http://localhost:3000')
);
