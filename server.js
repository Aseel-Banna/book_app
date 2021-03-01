'use strict';

const express = require('express');
require('dotenv').config();

const cors = require('cors');
const superagent = require('superagent');

const PORT = process.env.PORT || 3000;
const server = express();
server.use(cors());
server.set('view engine', 'ejs');


const pg = require('pg');

// const client = new pg.Client({ connectionString: process.env.DATABASE_URL,   ssl: { rejectUnauthorized: false } });
const client = new pg.Client(process.env.DATABASE_URL);

server.use(express.static('./public'));
server.use(express.urlencoded({ extended: true }));

server.get('/hello', (req, res) => {
    res.render('./pages/index');
})

// SOLVEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEE
server.get("/books/:id", (req, res) => {
    let id = req.params.id;
    //   let bookShelf = getBookShelf();
    let SQL = `SELECT * FROM books WHERE id=$1;`;
    let values = [id];
    client.query(SQL, values)
        .then((result) => {
            console.log('MAKE SURE',result.rows[0]);
            res.render('pages/books/details', { book :result.rows[0]});
        })
        .catch(() => {
            errorHandler('Error in getting Database');
        });
    // res.render("pages/books/show", { books: book, bookShelf: bookShelf });
});

server.get('/searches/new', (req, res) => {
    res.render('./pages/searches/new');
});

server.post('/searches', (req, res) => {
    // console.log('Hello from search');
    let searchInput = req.body.search;
    let key = process.env.GOOGLE_API_KEY;
    let url;
    if (req.body.searchValue === 'title') {
        url = `https://www.googleapis.com/books/v1/volumes?q=${searchInput}+intitle`;
    } else {
        url = `https://www.googleapis.com/books/v1/volumes?q=${searchInput}+inauthor`;
    }
    // console.log('Hello from search22');
    superagent.get(url)
        .then(result => {
            // console.log(result);
            let booksArray = result.body.items.map((item) => {
                return new Book(item);
            })
            // console.log('ASEEL',booksArray);
            // renderData(booksArray);
            // res.send(booksArray);
            res.render('pages/searches/show', { books: booksArray });
        })
        .catch(() => {
            errorHandler('Error in getting data from BooksAPI');
        })

})

server.get('/', (req, res) => {
    // res.render('./pages/index');
    let SQL = `SELECT * FROM books;`
    client.query(SQL)
        .then(result => {
            //   console.log(result.rows);
            res.render('pages/index', { booksList: result.rows, bookCount: result.rowCount });
        });
});

server.get('/error', (req, res) => {
    errorHandler('Error!!');
})

server.post('/books', (req, res) => {
    let SQL = `INSERT INTO books (author, title, isbn, image_url, description) VALUES ($1, $2, $3, $4, $5)RETURNING id;`;
    let value = req.body;
    let safeValues = [value.author, value.title, value.isbn ,value.image_url, value.description];
    client.query(SQL, safeValues)
        .then(results => {
            // console.log('ROOOWS', results.rows);
            // console.log(results.rows[0].id);
            console.log(results);
            res.redirect(`/books/${results.rows[0].id}`);
        })
})

client.connect()
    .then(() => {
        server.listen(PORT, () => console.log(`Listening on port: ${PORT}`));
    })


function errorHandler(errors) {
    server.use('*', (req, res) => {
        res.status(500).send(errors);
    })
}



// function getBookShelf() {
//     let SQL = "SELECT DISTINCT bookshelf FROM books";
//     return client.query(SQL)
//         .then((res) => {
//             return res.rows;
//         })
//         .catch(() => {
//             errorHandler('Error in getting Database');
//         });
// }

function Book(data) {
    // this.image_url =
    //   (data.volumeInfo.imageLinks && data.volumeInfo.imageLinks.thumbnail) ||
    //   "https://i.imgur.com/J5LVHEL.jpg";
    if (data.volumeInfo.imageLinks && data.volumeInfo.imageLinks.thumbnail) {
        this.image_url = data.volumeInfo.imageLinks.thumbnail
    } else {
        this.image_url = "https://i.imgur.com/J5LVHEL.jpg";
    }
    this.title = data.volumeInfo.title;
    this.author = data.volumeInfo.authors;
    this.description = data.volumeInfo.description || "There is no description";
    this.isbn = (data.volumeInfo.industryIdentifiers && data.volumeInfo.industryIdentifiers[0].type + " " +
        data.volumeInfo.industryIdentifiers[0].identifier) || "There is no isbn ";
}