const table = document.querySelector("#tableContainer");
const openBookForm = document.querySelector("#openBookForm");
const addBook = document.querySelector("#addBook");
const bookForm = document.querySelector("#bookForm");
const titleField = document.querySelector("#title");
const authorField = document.querySelector("#author");
const pagesField = document.querySelector("#pages");
const readField = document.querySelector("#read");
const notYetReadField = document.querySelector("#notyetread");

// Check whether localStorage is supported and available
function storageAvailable(type) {
  var storage;
  try {
    storage = window[type];
    var x = "__storage_test__";
    storage.setItem(x, x);
    storage.removeItem(x);
    return true;
  } catch (e) {
    return (
      e instanceof DOMException &&
      // everything except Firefox
      (e.code === 22 ||
        // Firefox
        e.code === 1014 ||
        // test name field too, because code might not be present
        // everything except Firefox
        e.name === "QuotaExceededError" ||
        // Firefox
        e.name === "NS_ERROR_DOM_QUOTA_REACHED") &&
      // acknowledge QuotaExceededError only if there's something already stored
      storage &&
      storage.length !== 0
    );
  }
}
const localStorageAvailable = storageAvailable("localStorage");

const myLibrary = [];

if (localStorageAvailable && localStorage.getItem("myLibrary")) {
  const libraryData = JSON.parse(localStorage.getItem("myLibrary"));
  libraryData.forEach((bookData) => {
    const book = new Book(bookData);
    myLibrary.push(book);
  });
}

function Book({ title, author, pages, read }) {
  this.title = title;
  this.author = author;
  this.pages = pages;
  this.read = read;
}

Book.prototype.info = function () {
  return `${title} by ${author}, ${pages} pages, ${
    this.read ? "read" : "not read yet"
  }`;
};

Book.prototype.getReadDisplay = function () {
  return this.read ? "Read" : "Not yet read";
};

Book.prototype.toggleRead = function () {
  this.read = this.read ? false : true;
};

function addBookToLibrary(newBook) {
  myLibrary.push(newBook);
  if (localStorageAvailable)
    localStorage.setItem("myLibrary", JSON.stringify(myLibrary));
}

function createNewRow() {
  const newRow = document.createElement("tr");
  table.appendChild(newRow);
  return newRow;
}

function addPropertiesToRow(book, row) {
  const bookProperties = ["title", "author", "pages", "read"];
  bookProperties.forEach((property) => {
    const newCell = document.createElement("td");
    newCell.textContent =
      property !== "read" ? book[property] : book.getReadDisplay();
    row.appendChild(newCell);
  });
}

function addRemoveButtonToRow(book, row) {
  const newCell = document.createElement("td");
  row.appendChild(newCell);
  const removeButton = document.createElement("button");
  removeButton.textContent = "Remove";
  newCell.appendChild(removeButton);

  removeButton.addEventListener("click", (e) => {
    const bookIndex = myLibrary.indexOf(book);
    myLibrary.splice(bookIndex, 1);
    if (localStorageAvailable)
      localStorage.setItem("myLibrary", JSON.stringify(myLibrary));
    row.remove();
    if (myLibrary.length === 0) table.classList.add("hidden");
  });
}

function addReadToggleButtonToRow(book, row) {
  const newCell = document.createElement("td");
  row.appendChild(newCell);
  const toggleReadButton = document.createElement("button");
  toggleReadButton.textContent = book.read ? "Mark Unread" : "Mark Read";
  newCell.appendChild(toggleReadButton);

  toggleReadButton.addEventListener("click", () => {
    const readCell = [...row.children].find(
      (e) => e.textContent === book.getReadDisplay()
    );
    book.toggleRead();
    if (localStorageAvailable)
      localStorage.setItem("myLibrary", JSON.stringify(myLibrary));
    readCell.textContent = book.getReadDisplay();
    toggleReadButton.textContent = book.read ? "Mark Unread" : "Mark Read";
  });
}

function renderNewBook(book) {
  const newRow = createNewRow();
  addPropertiesToRow(book, newRow);
  addReadToggleButtonToRow(book, newRow);
  addRemoveButtonToRow(book, newRow);
  table.classList.remove("hidden");
}

function renderLibrary(myLibrary) {
  if (myLibrary.length === 0) table.classList.add("hidden");
  else table.classList.remove("hidden");
  myLibrary.forEach(renderNewBook);
}

function createBookFromForm() {
  newBook = new Book({
    title: titleField.value,
    author: authorField.value,
    pages: pagesField.value,
    read: readField.checked,
  });
  return newBook;
}

function clearForm() {
  titleField.value = null;
  authorField.value = null;
  pagesField.value = null;
  readField.checked = false;
  notYetReadField.checked = false;
}

openBookForm.addEventListener("click", () => {
  openBookForm.classList.add("hidden");
  bookForm.classList.remove("hidden");
});

addBook.addEventListener("click", (e) => {
  e.preventDefault();
  openBookForm.classList.remove("hidden");
  bookForm.classList.add("hidden");
  newBook = createBookFromForm();
  addBookToLibrary(newBook);
  renderNewBook(newBook);
  clearForm();
});

// // Populate myLibrary to test
// const LOTR = new Book({
//   title: "LOTR",
//   author: "Tolkien",
//   pages: 442,
//   read: false,
// });
// const mereChristianity = new Book({
//   title: "Mere Christianity",
//   author: "C.S. Lewis",
//   pages: 123,
//   read: true,
// });

// addBookToLibrary(LOTR);
// addBookToLibrary(mereChristianity);

renderLibrary(myLibrary);
