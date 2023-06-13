var express = require('express');
const jwt = require('jsonwebtoken');
const session = require('express-session')
var app = express();
app.use(express.json())


let books = [
    {
      "ISBN": "9780439554930",
      "author": "J.K. Rowling",
      "title": "Harry Potter and the Sorcerer's Stone",
      "reviews": [
        {
          "username": "user1",
          "rating": 5,
          "comment": "Amazing book! Loved the magical world and captivating story."
        },
        {
          "username": "user2",
          "rating": 4,
          "comment": "A great start to the series. Exciting and well-written."
        }
      ]
    },
    {
      "ISBN": "9780061120084",
      "author": "Harper Lee",
      "title": "To Kill a Mockingbird",
      "reviews": [
        {
          "username": "user3",
          "rating": 5,
          "comment": "A classic! Beautifully written and thought-provoking."
        },
        {
          "username": "user4",
          "rating": 4,
          "comment": "A powerful story that addresses important social issues."
        }
      ]
    },
    {
      "ISBN": "9780142424179",
      "author": "John Green",
      "title": "The Fault in Our Stars",
      "reviews": [
        {
          "username": "user5",
          "rating": 5,
          "comment": "Heartbreaking and heartwarming at the same time. A must-read."
        },
        {
          "username": "user6",
          "rating": 3,
          "comment": "A touching story, but a bit predictable for my taste."
        }
      ]
    }
  ];
let users = [];

app.get('/',function(req,res){
    res.send("Hello, Welcome to Node.js project");
});

/* Get the book list available in the shop */ 
app.get('/books', (req,res) =>{
    res.send(books);
});

/* Get the books based on ISBNx */
app.get('/books/:isbn', (req,res) =>{
    const isbn = req.params.isbn;
    let filtered_book = books.filter((book) => book.ISBN === isbn);
    if (filtered_book.length == 0 ) {
        res.send('Book not found');
        return;
      }
    res.send(filtered_book);
});

/* Get all books by Author */
app.get('/books/:author', (req,res) => {
    const author = decodeURIComponent(req.params.author);
    let filtered_book = books.filter((book) => book.author === author);
    if (filtered_book.length == 0 ) {
        res.send('Book not found');
        return;
      }
    res.send(filtered_book);
});

/* Get all books based on Title  */
app.get('/books/:title', (req,res) => {
    const title = decodeURIComponent(req.params.title);
    let filtered_book = books.filter((book) => book.title === title);
    if (filtered_book.length == 0 ) {
        res.send('Book not found');
        return;
      }
    res.send(filtered_book);
});

/* Get book Review */
app.get('/books/reviews/:isbn', (req,res) => {
    const isbn = req.params.isbn;
    let filtered_book = books.filter((book) => book.ISBN === isbn);
    if (filtered_book.length == 0 ) {
        res.send('Book not found');
        return;
      }
    if (filtered_book.reviews.length === 0){
        res.send('No reviews for this book')
        return;
    }
    res.send(filtered_book.reviews);

});

/* Register New user */
app.post('/register', (req, res) => {
    const { username, email, password } = req.body;
  
    const user = {
      username,
      email,
      password,
    };
  
    users.push(user);
    res.send('Register successful, use login');
});

/* Login as a Registered user */
app.post('/login', (req, res) => {
    const { username, password } = req.body;

    const user = users.find((user) => user.username === username);

    if (!user) {
        res.send('Invalid username or password');
        return;
    }

    if (user.password !== password) {
        res.send('Invalid username or password');
        return;
    }

    res.send('Login successful');
  });

/* Add/modify a book review */
app.post('/books/:isbn/reviews', (req, res) => {
    const { isbn } = req.params; // Get the ISBN from the URL parameter
    const { username, rating, comment } = req.body; // Get the user's review details from the request body
  
    // Find the book with the matching ISBN
    const book = books.find((book) => book.ISBN === isbn);
  
    if (!book) {
      res.status(404).json({ error: 'Book not found' });
      return;
    }
  
    // Check if the user already has a review for the book
    const existingReview = book.reviews.find((review) => review.username === username);
  
    if (existingReview) {
      // Modify the existing review
      existingReview.rating = rating;
      existingReview.comment = comment;
    } else {
      // Add a new review for the user
      book.reviews.push({ username, rating, comment });
    }
  
    res.json({ message: 'Review added/modified successfully' });
  });
  

/* Delete book review added by that particular user */
app.delete('/books/:isbn/reviews/:username', (req, res) => {
    const { isbn, username } = req.params; // Get the ISBN and username from the URL parameters
  
    // Find the book with the matching ISBN
    const book = books.find((book) => book.ISBN === isbn);
  
    if (!book) {
      res.status(404).json({ error: 'Book not found' });
      return;
    }
  
    // Find the index of the review given by the user
    const reviewIndex = book.reviews.findIndex((review) => review.username === username);
  
    if (reviewIndex === -1) {
      res.status(404).json({ error: 'Review not found' });
      return;
    }
  
    // Remove the review from the book's reviews array
    book.reviews.splice(reviewIndex, 1);
  
    res.json({ message: 'Review deleted successfully' });
  });

/* Get all books – Using async callback function */
app.get('/books/async', async (req, res) => {
    try {
      const books = await getBooks();
      res.send(books);
    } catch (error) {
      res.status(500).json({ error: 'Unable to retrieve books' });
    }
  });
  
  // Function to get the books (simulating an asynchronous operation)
  function getBooks() {
    return new Promise((resolve, reject) => {
      // Simulating a delay
      setTimeout(() => {
        if (books.length === 0) {
          reject(new Error('No books found'));
        } else {
          resolve(books);
        }
      }, 1000);
    });
  }
  
/* Search by ISBN – Using Promises */
app.get('/books/promises/:isbn', (req, res) => {
const isbn = req.params.isbn;

getBookByISBN(isbn)
    .then((filteredBook) => {
    if (filteredBook.length === 0) {
        res.send('Book not found');
    } else {
        res.send(filteredBook);
    }
    })
    .catch((error) => {
    res.status(500).json({ error: 'Unable to retrieve book' });
    });
    });
  
  // Function to get the book by ISBN (simulating an asynchronous operation)
  function getBookByISBN(isbn) {
    return new Promise((resolve, reject) => {
      // Simulating a delay
      setTimeout(() => {
        const filteredBook = books.filter((book) => book.ISBN === isbn);
        resolve(filteredBook);
      }, 1000);
    });
  }

/* Search by Author using async */
app.get('/books/async/:author', async (req, res) => {
try {
    const author = decodeURIComponent(req.params.author);
    const filteredBooks = await getBooksByAuthor(author);

    if (filteredBooks.length === 0) {
    res.send('Book not found');
    } else {
    res.send(filteredBooks);
    }
} catch (error) {
    res.status(500).json({ error: 'Unable to retrieve books' });
}
});
  
  // Function to get books by author (simulating an asynchronous operation)
  function getBooksByAuthor(author) {
    return new Promise((resolve, reject) => {
      // Simulating a delay
      setTimeout(() => {
        const filteredBooks = books.filter((book) => book.author === author);
        resolve(filteredBooks);
      }, 1000);
    });
  }
  
/* Search by title using promises */
app.get('/books/:title', (req, res) => {
const title = decodeURIComponent(req.params.title);
getBooksByTitle(title)
    .then((filteredBooks) => {
    if (filteredBooks.length === 0) {
        res.send('Book not found');
    } else {
        res.send(filteredBooks);
    }
    })
    .catch((error) => {
    res.status(500).json({ error: 'Unable to retrieve books' });
    });
});
  
  // Function to get books by title (simulating an asynchronous operation)
  function getBooksByTitle(title) {
    return new Promise((resolve, reject) => {
      // Simulating a delay
      setTimeout(() => {
        const filteredBooks = books.filter((book) => book.title === title);
        resolve(filteredBooks);
      }, 1000);
    });
  }
  
app.listen(3000, () => {
    console.log('Server is running on port 3000');
  });