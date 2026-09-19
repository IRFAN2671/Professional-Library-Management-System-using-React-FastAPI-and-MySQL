import { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";

function Books() {
  const [books, setBooks] = useState([]);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingBook, setEditingBook] = useState(null);

  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");
  const [isbn, setIsbn] = useState("");
  const [category, setCategory] = useState("");
  const [quantity, setQuantity] = useState("");

  const API_URL = "http://127.0.0.1:8000";

  useEffect(() => {
    fetchBooks();
  }, []);

  async function fetchBooks() {
    const token = localStorage.getItem("access_token");

    try {
      const response = await fetch(
        `${API_URL}/books/`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setError(data.detail || "Unable to load books");
        return;
      }

      setBooks(data);
      setError("");
    } catch (error) {
      console.error("Fetch books error:", error);
      setError("Unable to connect to backend");
    }
  }

  async function handleSearch() {
    const token = localStorage.getItem("access_token");

    if (!searchQuery.trim()) {
      fetchBooks();
      return;
    }

    try {
      const response = await fetch(
        `${API_URL}/books/search?query=${encodeURIComponent(searchQuery)}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setError(data.detail || "Unable to search books");
        return;
      }

      setBooks(data);
      setError("");

      setMessage(
        data.length === 0
          ? "No books found"
          : `${data.length} book(s) found`
      );
    } catch (error) {
      console.error("Search error:", error);
      setError("Unable to connect to backend");
    }
  }

  function handleSearchKeyDown(event) {
    if (event.key === "Enter") {
      handleSearch();
    }
  }

  function clearSearch() {
    setSearchQuery("");
    setMessage("");
    setError("");
    fetchBooks();
  }

  function clearForm() {
    setTitle("");
    setAuthor("");
    setIsbn("");
    setCategory("");
    setQuantity("");
    setEditingBook(null);
    setShowForm(false);
  }

  async function handleSubmit(event) {
    event.preventDefault();

    const token = localStorage.getItem("access_token");

    const bookData = {
      title: title,
      author: author,
      isbn: isbn,
      category: category,
      total_copies: Number(quantity),
    };

    try {
      const url = editingBook
        ? `${API_URL}/books/${editingBook.id}`
        : `${API_URL}/books/`;

      const method = editingBook ? "PUT" : "POST";

      const response = await fetch(url, {
        method: method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(bookData),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.detail || "Operation failed");
        return;
      }

      setMessage(
        editingBook
          ? "Book updated successfully"
          : "Book added successfully"
      );

      setError("");
      clearForm();
      fetchBooks();
    } catch (error) {
      console.error("Save book error:", error);
      setError("Unable to connect to backend");
    }
  }

  function handleEdit(book) {
    setEditingBook(book);
    setTitle(book.title);
    setAuthor(book.author);
    setIsbn(book.isbn);
    setCategory(book.category);
    setQuantity(book.total_copies);
    setShowForm(true);
    setMessage("");
    setError("");
  }

  async function handleDelete(bookId) {
    const confirmed = window.confirm(
      "Are you sure you want to delete this book?"
    );

    if (!confirmed) {
      return;
    }

    const token = localStorage.getItem("access_token");

    try {
      const response = await fetch(
        `${API_URL}/books/${bookId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setError(data.detail || "Unable to delete book");
        return;
      }

      setMessage("Book deleted successfully");
      setError("");
      fetchBooks();
    } catch (error) {
      console.error("Delete book error:", error);
      setError("Unable to connect to backend");
    }
  }

  return (
    <div style={pageStyle}>
      <Sidebar />

      <main style={mainStyle}>
        <div style={headerStyle}>
          <div>
            <h1 style={titleStyle}>Books Management</h1>

            <p style={subtitleStyle}>
              Manage and search all library books
            </p>
          </div>

          <button
            onClick={() => {
              setShowForm(true);
              setEditingBook(null);
              setMessage("");
              setError("");
            }}
            style={addButtonStyle}
          >
            + Add Book
          </button>
        </div>

        {message && (
          <div style={successMessageStyle}>
            {message}
          </div>
        )}

        {error && (
          <div style={errorMessageStyle}>
            {error}
          </div>
        )}

        <div style={searchContainerStyle}>
          <div>
            <h2 style={{ marginTop: 0 }}>
              Search Books
            </h2>

            <p style={searchHintStyle}>
              Search by title, author, ISBN, or category
            </p>
          </div>

          <div style={searchRowStyle}>
            <input
              type="text"
              placeholder="Enter book title, author, ISBN..."
              value={searchQuery}
              onChange={(event) =>
                setSearchQuery(event.target.value)
              }
              onKeyDown={handleSearchKeyDown}
              style={searchInputStyle}
            />

            <button
              onClick={handleSearch}
              style={searchButtonStyle}
            >
              🔍 Search
            </button>

            <button
              onClick={clearSearch}
              style={clearButtonStyle}
            >
              Clear
            </button>
          </div>
        </div>

        {showForm && (
          <div style={formContainerStyle}>
            <h2>
              {editingBook ? "Edit Book" : "Add New Book"}
            </h2>

            <form onSubmit={handleSubmit}>
              <input
                type="text"
                placeholder="Book Title"
                value={title}
                onChange={(event) =>
                  setTitle(event.target.value)
                }
                required
                style={inputStyle}
              />

              <input
                type="text"
                placeholder="Author"
                value={author}
                onChange={(event) =>
                  setAuthor(event.target.value)
                }
                required
                style={inputStyle}
              />

              <input
                type="text"
                placeholder="ISBN"
                value={isbn}
                onChange={(event) =>
                  setIsbn(event.target.value)
                }
                required
                style={inputStyle}
              />

              <input
                type="text"
                placeholder="Category"
                value={category}
                onChange={(event) =>
                  setCategory(event.target.value)
                }
                required
                style={inputStyle}
              />

              <input
                type="number"
                placeholder="Quantity"
                value={quantity}
                onChange={(event) =>
                  setQuantity(event.target.value)
                }
                min="1"
                required
                style={inputStyle}
              />

              <button
                type="submit"
                style={saveButtonStyle}
              >
                {editingBook
                  ? "Update Book"
                  : "Save Book"}
              </button>

              <button
                type="button"
                onClick={clearForm}
                style={cancelButtonStyle}
              >
                Cancel
              </button>
            </form>
          </div>
        )}

        <div style={tableContainerStyle}>
          <div style={tableHeaderContainerStyle}>
            <div>
              <h2 style={{ margin: 0 }}>
                Book List
              </h2>

              <p style={countStyle}>
                {books.length} book(s)
              </p>
            </div>
          </div>

          {books.length === 0 ? (
            <div style={emptyStyle}>
              <div style={{ fontSize: "40px" }}>
                📚
              </div>

              <h3>No books found</h3>

              <p>
                Try another search or add a new book.
              </p>
            </div>
          ) : (
            <div style={{ overflowX: "auto" }}>
              <table style={tableStyle}>
                <thead>
                  <tr>
                    <th style={tableHeader}>ID</th>
                    <th style={tableHeader}>Title</th>
                    <th style={tableHeader}>Author</th>
                    <th style={tableHeader}>ISBN</th>
                    <th style={tableHeader}>Category</th>
                    <th style={tableHeader}>Quantity</th>
                    <th style={tableHeader}>Actions</th>
                  </tr>
                </thead>

                <tbody>
                  {books.map((book) => (
                    <tr key={book.id}>
                      <td style={tableCell}>
                        {book.id}
                      </td>

                      <td style={tableCell}>
                        {book.title}
                      </td>

                      <td style={tableCell}>
                        {book.author}
                      </td>

                      <td style={tableCell}>
                        {book.isbn}
                      </td>

                      <td style={tableCell}>
                        {book.category}
                      </td>

                      <td style={tableCell}>
                        {book.total_copies}
                      </td>

                      <td style={tableCell}>
                        <button
                          onClick={() =>
                            handleEdit(book)
                          }
                          style={editButtonStyle}
                        >
                          Edit
                        </button>

                        <button
                          onClick={() =>
                            handleDelete(book.id)
                          }
                          style={deleteButtonStyle}
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

const pageStyle = {
  minHeight: "100vh",
  backgroundColor: "#f5f7fb",
};

const mainStyle = {
  marginLeft: "240px",
  padding: "35px",
};

const headerStyle = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  marginBottom: "25px",
};

const titleStyle = {
  margin: 0,
  fontSize: "30px",
  color: "#1f2937",
};

const subtitleStyle = {
  color: "#6b7280",
  marginTop: "8px",
};

const addButtonStyle = {
  backgroundColor: "#2563eb",
  color: "white",
  border: "none",
  padding: "12px 20px",
  borderRadius: "8px",
  cursor: "pointer",
  fontWeight: "600",
};

const successMessageStyle = {
  backgroundColor: "#dcfce7",
  color: "#166534",
  padding: "12px 16px",
  borderRadius: "8px",
  marginBottom: "20px",
};

const errorMessageStyle = {
  backgroundColor: "#fee2e2",
  color: "#991b1b",
  padding: "12px 16px",
  borderRadius: "8px",
  marginBottom: "20px",
};

const searchContainerStyle = {
  backgroundColor: "white",
  padding: "24px",
  borderRadius: "14px",
  boxShadow: "0 4px 15px rgba(0, 0, 0, 0.06)",
  marginBottom: "25px",
};

const searchHintStyle = {
  color: "#6b7280",
  fontSize: "14px",
  marginTop: "5px",
};

const searchRowStyle = {
  display: "flex",
  gap: "10px",
  marginTop: "18px",
};

const searchInputStyle = {
  flex: 1,
  padding: "13px 15px",
  border: "1px solid #d1d5db",
  borderRadius: "8px",
  fontSize: "15px",
  outline: "none",
};

const searchButtonStyle = {
  backgroundColor: "#2563eb",
  color: "white",
  border: "none",
  padding: "12px 20px",
  borderRadius: "8px",
  cursor: "pointer",
  fontWeight: "600",
};

const clearButtonStyle = {
  backgroundColor: "#e5e7eb",
  color: "#374151",
  border: "none",
  padding: "12px 20px",
  borderRadius: "8px",
  cursor: "pointer",
  fontWeight: "600",
};

const formContainerStyle = {
  backgroundColor: "white",
  marginBottom: "25px",
  padding: "25px",
  borderRadius: "14px",
  boxShadow: "0 4px 15px rgba(0, 0, 0, 0.06)",
};

const inputStyle = {
  display: "block",
  width: "100%",
  padding: "12px",
  marginBottom: "15px",
  boxSizing: "border-box",
  border: "1px solid #d1d5db",
  borderRadius: "8px",
};

const saveButtonStyle = {
  backgroundColor: "#2563eb",
  color: "white",
  padding: "12px 20px",
  border: "none",
  borderRadius: "7px",
  cursor: "pointer",
  marginRight: "10px",
};

const cancelButtonStyle = {
  backgroundColor: "#e5e7eb",
  color: "#374151",
  padding: "12px 20px",
  border: "none",
  borderRadius: "7px",
  cursor: "pointer",
};

const tableContainerStyle = {
  backgroundColor: "white",
  padding: "24px",
  borderRadius: "14px",
  boxShadow: "0 4px 15px rgba(0, 0, 0, 0.06)",
};

const tableHeaderContainerStyle = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  marginBottom: "15px",
};

const countStyle = {
  color: "#6b7280",
  fontSize: "14px",
  marginTop: "6px",
};

const tableStyle = {
  width: "100%",
  borderCollapse: "collapse",
  marginTop: "10px",
};

const tableHeader = {
  textAlign: "left",
  padding: "14px",
  backgroundColor: "#f9fafb",
  borderBottom: "2px solid #e5e7eb",
  color: "#374151",
  fontSize: "14px",
};

const tableCell = {
  padding: "14px",
  borderBottom: "1px solid #eee",
  color: "#374151",
};

const editButtonStyle = {
  backgroundColor: "#2563eb",
  color: "white",
  border: "none",
  padding: "7px 12px",
  borderRadius: "6px",
  cursor: "pointer",
  marginRight: "8px",
};

const deleteButtonStyle = {
  backgroundColor: "#dc2626",
  color: "white",
  border: "none",
  padding: "7px 12px",
  borderRadius: "6px",
  cursor: "pointer",
};

const emptyStyle = {
  textAlign: "center",
  padding: "50px 20px",
  color: "#6b7280",
};

export default Books;