'use strict';

$('#viewButton').on('click', ()=>{
  console.log("HELLO BUTTON!!!");
  $('main').html(booksList.forEach((book) => { '<div class="img-div"> <img src=book.image_url alt="image">  <h2>book.title</h2> <h3>book.author</h3> <p><%= book.description %></p> <p><%= book.isbn %></p>'})
  );
});