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

server.get('/searches/new', (req,res) => {
    res.render('./pages/searches/new');
})

server.post('/searches', (req,res)=>{
    console.log('Hello from search');
    let searchInput = req.body.search;
    let key= process.env.GOOGLE_API_KEY;
    let url;
    if (req.body.searchValue === 'title'){
        url = `https://www.googleapis.com/books/v1/volumes?q=${searchInput}+intitle`;
    }else{
        url = `https://www.googleapis.com/books/v1/volumes?q=${searchInput}+inauthor`;
    }
    console.log('Hello from search22');
   superagent.get(url)
    .then(result =>{
        console.log(result);
        let booksArray = result.body.items.map((item)=>{
        return new Book(item);
    })
    console.log('ASEEL',booksArray);
    // renderData(booksArray);
    // res.send(booksArray);
    res.render('pages/searches/show', { books: booksArray });
    })
    .catch(()=>{
                errorHandler('Error in getting data from BooksAPI');
            })

})

// function renderData(req,res,arr){
//     res.render('pages/searches/show', { books: arr });
// }

server.get('/', (req,res) => {
    res.render('./pages/index');
})

server.get('/error', (req,res) => {
    errorHandler('Error!!');
})

server.listen(PORT, () => {
    console.log(`Listening to PORT ${PORT}`);
})

function errorHandler(errors) {
    server.use('*',(req,res)=>{
        res.status(500).send(errors);
    })
}

// function Book (data){
//     // this.url = data.volumeInfo.imageLinks.thumbnail || `https://i.imgur.com/J5LVHEL.jpg`;
//     this.url = data.volumeInfo.imageLinks;
//     this.title = data.volumeInfo.title;
//     this.author = data.volumeInfo.authors;
//     this.description = data.searchInfo.textSnippet;

// }
function Book(data) {
    this.image_url =
      (data.volumeInfo.imageLinks && data.volumeInfo.imageLinks.thumbnail) ||
      "https://i.imgur.com/J5LVHEL.jpg";
    this.title = data.volumeInfo.title;
    this.author = data.volumeInfo.authors;
    this.description = data.volumeInfo.description || "There is no description";
  }