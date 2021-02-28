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
    res.render('./pages/index');
})

server.get('/new', (req,res) => {
    res.render('./pages/searches/new');
})


server.get('/', (req,res) => {
    res.render('./pages/index');
})

server.get('/error', (req,res) => {
    errorHandler('Error!!');
})

server.post('/searches', (req,res)=>{
    res.send('HIIIIIIIIIIIIIIIIIIIII')
})

server.post('/new', (req,res) =>{
    let search= req.query.search;
    // let title = req.query.title;
    // let author = req.query.author;
    let key = process.env.GOOGLE_API_KEY;
    let url;
    if ($('#title').is(":checked"))
    {
    url = `https://www.googleapis.com/books/v1/volumes?q=${search}+intitle:keyes&key=${key}`
    }else{
        url =`https://www.googleapis.com/books/v1/volumes?q=${search}+inauthor:keyes&key=${key}`;
    }
    superagent.get(url)
    .then(result => {
        let booksArray = result.body.items.volumeInfo.map((item)=>{
            return new Book(item);
    })
    $('button').click(()=>{

        res.render('./pages/searches/show',{bookData:booksArray});
    })
    })
    .catch(()=>{
        errorHandler('Error in getting data from BooksAPI');
    })
});


server.listen(PORT, () => {
    console.log(`Listening to PORT ${PORT}`);
})

function errorHandler(errors) {
    server.use('*',(req,res)=>{
        res.status(500).send(errors);
    })
}

function Book (data){
    this.url = data.imageLinks.imageLinks;
    this.title = data.title;
    this.author = data.authors[0];
    this.description = data.description;

}