import { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";

function Issues() {
  const [issues, setIssues] = useState([]);
  const [books, setBooks] = useState([]);
  const [members, setMembers] = useState([]);

  const [bookId, setBookId] = useState("");
  const [memberId, setMemberId] = useState("");
  const [dueDate, setDueDate] = useState("");

  const [editingIssue, setEditingIssue] = useState(null);
  const [showForm, setShowForm] = useState(false);

  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetchIssues();
    fetchBooks();
    fetchMembers();
  }, []);

  async function fetchIssues() {
    const token = localStorage.getItem("access_token");

    try {
      const response = await fetch(
        "http://127.0.0.1:8000/issues/",
        {
          headers: {
            Authorization: "Bearer " + token,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setError(data.detail || "Unable to load issues");
        return;
      }

      setIssues(data);
    } catch (error) {
      setError("Unable to connect to backend");
    }
  }

  async function fetchBooks() {
    const token = localStorage.getItem("access_token");

    try {
      const response = await fetch(
        "http://127.0.0.1:8000/books/",
        {
          headers: {
            Authorization: "Bearer " + token,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setError(data.detail || "Unable to load books");
        return;
      }

      setBooks(data);
    } catch (error) {
      setError("Unable to connect to backend");
    }
  }

  async function fetchMembers() {
    const token = localStorage.getItem("access_token");

    try {
      const response = await fetch(
        "http://127.0.0.1:8000/members/",
        {
          headers: {
            Authorization: "Bearer " + token,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setError(data.detail || "Unable to load members");
        return;
      }

      setMembers(data);
    } catch (error) {
      setError("Unable to connect to backend");
    }
  }

  function getBookTitle(bookId) {
    const book = books.find(
      (item) => item.id === bookId
    );

    return book ? book.title : "Unknown Book";
  }

  function getMemberName(memberId) {
    const member = members.find(
      (item) => item.id === memberId
    );

    return member ? member.full_name : "Unknown Member";
  }

  function formatDateTimeLocal(value) {
    const date = new Date(value);
    const offset = date.getTimezoneOffset();
    const localDate = new Date(
      date.getTime() - offset * 60000
    );

    return localDate.toISOString().slice(0, 16);
  }

  function resetForm() {
    setBookId("");
    setMemberId("");
    setDueDate("");
    setEditingIssue(null);
    setShowForm(false);
  }

  function startAddIssue() {
    setEditingIssue(null);
    setBookId("");
    setMemberId("");
    setDueDate("");
    setError("");
    setMessage("");
    setShowForm(true);
  }

  function startEditIssue(issue) {
    setEditingIssue(issue);
    setBookId(String(issue.book_id));
    setMemberId(String(issue.member_id));
    setDueDate(formatDateTimeLocal(issue.due_date));
    setError("");
    setMessage("");
    setShowForm(true);
  }

  async function handleSubmit(event) {
    event.preventDefault();

    const token = localStorage.getItem("access_token");

    setError("");
    setMessage("");

    const url = editingIssue
      ? "http://127.0.0.1:8000/issues/" +
        editingIssue.id
      : "http://127.0.0.1:8000/issues/";

    const method = editingIssue ? "PUT" : "POST";

    try {
      const response = await fetch(url, {
        method: method,
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + token,
        },
        body: JSON.stringify({
          book_id: Number(bookId),
          member_id: Number(memberId),
          due_date: dueDate,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(
          data.detail ||
            (editingIssue
              ? "Unable to update issue"
              : "Unable to issue book")
        );
        return;
      }

      if (editingIssue) {
        setMessage("Issue updated successfully");
      } else {
        setMessage("Book issued successfully");
      }

      resetForm();

      await fetchIssues();
      await fetchBooks();
    } catch (error) {
      setError("Unable to connect to backend");
    }
  }

  async function handleReturn(issueId) {
    const confirmed = window.confirm(
      "Are you sure you want to return this book?"
    );

    if (!confirmed) {
      return;
    }

    const token = localStorage.getItem("access_token");

    setError("");
    setMessage("");

    try {
      const response = await fetch(
        "http://127.0.0.1:8000/issues/" +
          issueId +
          "/return",
        {
          method: "PUT",
          headers: {
            Authorization: "Bearer " + token,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setError(data.detail || "Unable to return book");
        return;
      }

      setMessage("Book returned successfully");

      await fetchIssues();
      await fetchBooks();
    } catch (error) {
      setError("Unable to connect to backend");
    }
  }

  async function handleDelete(issueId) {
    const confirmed = window.confirm(
      "Are you sure you want to delete this issue record?"
    );

    if (!confirmed) {
      return;
    }

    const token = localStorage.getItem("access_token");

    setError("");
    setMessage("");

    try {
      const response = await fetch(
        "http://127.0.0.1:8000/issues/" +
          issueId,
        {
          method: "DELETE",
          headers: {
            Authorization: "Bearer " + token,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setError(
          data.detail || "Unable to delete issue record"
        );
        return;
      }

      setMessage(
        "Issue record deleted successfully"
      );

      await fetchIssues();
      await fetchBooks();
    } catch (error) {
      setError("Unable to connect to backend");
    }
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundColor: "#f4f6f8",
      }}
    >
      <Sidebar />

      <main
        style={{
          marginLeft: "240px",
          padding: "35px",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <div>
            <h1>Book Issues</h1>

            <p style={{ color: "#666" }}>
              Manage book issue and return records
            </p>
          </div>

          <button
            onClick={startAddIssue}
            style={buttonStyle}
          >
            + Issue Book
          </button>
        </div>

        {message && (
          <p
            style={{
              color: "green",
              backgroundColor: "#e8f5e9",
              padding: "12px",
              borderRadius: "6px",
            }}
          >
            {message}
          </p>
        )}

        {error && (
          <p
            style={{
              color: "red",
              backgroundColor: "#ffebee",
              padding: "12px",
              borderRadius: "6px",
            }}
          >
            {error}
          </p>
        )}

        {showForm && (
          <div
            style={{
              backgroundColor: "white",
              marginTop: "25px",
              padding: "25px",
              borderRadius: "10px",
            }}
          >
            <h2>
              {editingIssue
                ? "Edit Issue"
                : "Issue Book"}
            </h2>

            <form onSubmit={handleSubmit}>
              <select
                value={bookId}
                onChange={(event) =>
                  setBookId(event.target.value)
                }
                required
                disabled={!!editingIssue}
                style={inputStyle}
              >
                <option value="">Select Book</option>

                {books.map((book) => (
                  <option
                    key={book.id}
                    value={book.id}
                  >
                    {book.title} - Available:{" "}
                    {book.available_copies}
                  </option>
                ))}
              </select>

              <select
                value={memberId}
                onChange={(event) =>
                  setMemberId(event.target.value)
                }
                required
                disabled={!!editingIssue}
                style={inputStyle}
              >
                <option value="">Select Member</option>

                {members
                  .filter(
                    (member) => member.is_active
                  )
                  .map((member) => (
                    <option
                      key={member.id}
                      value={member.id}
                    >
                      {member.full_name} -{" "}
                      {member.membership_id}
                    </option>
                  ))}
              </select>

              <label
                style={{
                  display: "block",
                  marginBottom: "8px",
                }}
              >
                Due Date
              </label>

              <input
                type="datetime-local"
                value={dueDate}
                onChange={(event) =>
                  setDueDate(event.target.value)
                }
                required
                style={inputStyle}
              />

              <button
                type="submit"
                style={buttonStyle}
              >
                {editingIssue
                  ? "Update Issue"
                  : "Issue Book"}
              </button>

              <button
                type="button"
                onClick={resetForm}
                style={cancelButtonStyle}
              >
                Cancel
              </button>
            </form>
          </div>
        )}

        <div
          style={{
            backgroundColor: "white",
            marginTop: "25px",
            padding: "20px",
            borderRadius: "10px",
            overflowX: "auto",
          }}
        >
          <h2>Issue Records</h2>

          {issues.length === 0 ? (
            <p>No issue records found.</p>
          ) : (
            <table
              style={{
                width: "100%",
                borderCollapse: "collapse",
                marginTop: "20px",
              }}
            >
              <thead>
                <tr>
                  <th style={tableHeader}>ID</th>
                  <th style={tableHeader}>Book</th>
                  <th style={tableHeader}>Member</th>
                  <th style={tableHeader}>Issue Date</th>
                  <th style={tableHeader}>Due Date</th>
                  <th style={tableHeader}>Return Date</th>
                  <th style={tableHeader}>Status</th>
                  <th style={tableHeader}>Action</th>
                </tr>
              </thead>

              <tbody>
                {issues.map((issue) => (
                  <tr key={issue.id}>
                    <td style={tableCell}>
                      {issue.id}
                    </td>

                    <td style={tableCell}>
                      {getBookTitle(issue.book_id)}
                    </td>

                    <td style={tableCell}>
                      {getMemberName(issue.member_id)}
                    </td>

                    <td style={tableCell}>
                      {new Date(
                        issue.issue_date
                      ).toLocaleString()}
                    </td>

                    <td style={tableCell}>
                      {new Date(
                        issue.due_date
                      ).toLocaleString()}
                    </td>

                    <td style={tableCell}>
                      {issue.return_date
                        ? new Date(
                            issue.return_date
                          ).toLocaleString()
                        : "-"}
                    </td>

                    <td style={tableCell}>
                      {issue.status === "issued"
                        ? "Issued"
                        : "Returned"}
                    </td>

                    <td style={tableCell}>
                      {issue.status === "issued" && (
                        <button
                          onClick={() =>
                            handleReturn(issue.id)
                          }
                          style={returnButtonStyle}
                        >
                          Return
                        </button>
                      )}

                      <button
                        onClick={() =>
                          startEditIssue(issue)
                        }
                        style={editButtonStyle}
                      >
                        Edit
                      </button>

                      <button
                        onClick={() =>
                          handleDelete(issue.id)
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
          )}
        </div>
      </main>
    </div>
  );
}

const buttonStyle = {
  padding: "12px 20px",
  border: "none",
  borderRadius: "6px",
  cursor: "pointer",
  fontSize: "15px",
  marginRight: "10px",
};

const cancelButtonStyle = {
  padding: "12px 20px",
  border: "none",
  borderRadius: "6px",
  cursor: "pointer",
  fontSize: "15px",
};

const returnButtonStyle = {
  padding: "8px 12px",
  border: "none",
  borderRadius: "5px",
  cursor: "pointer",
  marginRight: "5px",
};

const editButtonStyle = {
  padding: "8px 12px",
  border: "none",
  borderRadius: "5px",
  cursor: "pointer",
  marginRight: "5px",
};

const deleteButtonStyle = {
  padding: "8px 12px",
  border: "none",
  borderRadius: "5px",
  cursor: "pointer",
};

const inputStyle = {
  display: "block",
  width: "100%",
  padding: "12px",
  marginBottom: "15px",
  boxSizing: "border-box",
  border: "1px solid #ddd",
  borderRadius: "6px",
  backgroundColor: "white",
};

const tableHeader = {
  textAlign: "left",
  padding: "12px",
  borderBottom: "2px solid #ddd",
};

const tableCell = {
  padding: "12px",
  borderBottom: "1px solid #eee",
};

export default Issues;