'use strict';

const express = require('express');
require('dotenv').config();

const cors = require('cors');
const superagent = require('superagent');
const methodOverride = require('method-override');

const PORT = process.env.PORT || 3000;
const server = express();
server.use(cors());
server.set('view engine', 'ejs');


const pg = require('pg');

const client = new pg.Client({ connectionString: process.env.DATABASE_URL,   ssl: { rejectUnauthorized: false } });
// const client = new pg.Client(process.env.DATABASE_URL);

server.use(express.static('./public'));
server.use(express.urlencoded({ extended: true }));
server.use(methodOverride('_method'));

server.get('/hello', (req, res) => {
    res.render('./pages/index');
})

server.put('/books/:id', (req,res) => {
  console.log(req.body);
  let id = req.params.id;
  let { author ,title, isbn , image_url, description} = req.body;
  let SQL = `UPDATE books SET author=$1,title=$2,isbn=$3, image_url=$4,  description=$5 WHERE id =$6;`;
  console.log('Hello!! After SQL');
  let values = [author ,title, isbn, image_url, description, id];
  console.log('Hello!! After Values');
  client.query(SQL, values)
    .then(() => {
            console.log('Hello!!');
      res.redirect(`/books/${id}`);
    })
    .catch(err => {
      errorHandler('Error in updating the DATA!')
    })
});

server.delete('/deleteBook/:id', (req,res) => {
    let id = req.params.id;
    let SQL = `DELETE FROM books WHERE id=$1;`;
    let value = [id];
    client.query(SQL,value)
    .then(()=>{
      res.redirect('/');
    })
})

server.get("/books/:id", (req, res) => {
    let id = req.params.id;
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
});

server.get('/searches/new', (req, res) => {
    res.render('./pages/searches/new');
});

server.post('/searches', (req, res) => {
    let searchInput = req.body.search;
    let key = process.env.GOOGLE_API_KEY;
    let url;
    if (req.body.searchValue === 'title') {
        url = `https://www.googleapis.com/books/v1/volumes?q=+intitle:${searchInput}`;
    } else {
        url = `https://www.googleapis.com/books/v1/volumes?q=+inauthor:${searchInput}`;
    }
    console.log('Hello from search22', url);
    superagent.get(url)
        .then(result => {
            console.log(result.body);
            let booksArray = result.body.items.map((item) => {
                return new Book(item);
            })
            res.render('pages/searches/show', { books: booksArray });
        })
        .catch(() => {
            errorHandler('Error in getting data from BooksAPI');
        })

})

server.get('/', (req, res) => {
    let SQL = `SELECT * FROM books;`
    client.query(SQL)
        .then(result => {
            res.render('pages/index', { booksList: result.rows, bookCount: result.rowCount });
        });
});

server.get('/error', (req, res) => {
    errorHandler('Error!!');
})

server.post('/books', (req, res) => {
    let newSQL = `INSERT INTO books (author, title, isbn, image_url, description) VALUES ($1, $2, $3, $4, $5) RETURNING id;`;
    let newValues = [req.body.author, req.body.title, req.body.isbn, req.body.image_url, req.body.description];
  
    return client.query(newSQL, newValues)
      .then(result => {
        res.redirect(`/books/${result.rows[0].id}`);
      })
      .catch(()=>{
                errorHandler('Error in getting data!!');
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

function Book(data) {
    if (data.volumeInfo.imageLinks && data.volumeInfo.imageLinks.thumbnail) {
        this.image_url = data.volumeInfo.imageLinks.thumbnail
    } else {
        this.image_url = "https://i.imgur.com/J5LVHEL.jpg";
    }
    this.title = (data.volumeInfo.title) ? data.volumeInfo.title : `Title Unavailable`;
    this.author = (Array.isArray(data.volumeInfo.authors)) ? data.volumeInfo.authors.join(', ') : `Unknown Author`;
    this.description = (data.volumeInfo.description) ? data.volumeInfo.description : `Description Unavailable`;
    if (data.volumeInfo.industryIdentifiers) {
        this.isbn = data.volumeInfo.industryIdentifiers[0].identifier
    } else {
        this.isbn = "No ISBN for this book!!";
    }
}