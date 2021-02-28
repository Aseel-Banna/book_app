'use strict';

const express = require('express');
require('dotenv').config();

const cors = require('cors');
const superagent = require('superagent');

const PORT = process.env.PORT || 3000; 
const server = express();
server.use(cors()); 
server.set('view engine', 'ejs');

server.use(express.static('./public'));
server.use(express.urlencoded({extended:true}));

server.get('/hello', (req,res) => {
    let helloArray = ['Hello World'];
    res.render('./pages/index', {helloWorld:helloArray});
})


server.get('/', (req,res) => {
    res.render('./pages/index');
})

server.listen(PORT, () => {
    console.log(`Listening to PORT ${PORT}`);
})