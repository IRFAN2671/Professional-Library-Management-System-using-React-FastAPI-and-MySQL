import { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";

function Reservations() {
  const [reservations, setReservations] = useState([]);
  const [books, setBooks] = useState([]);
  const [members, setMembers] = useState([]);

  const [bookId, setBookId] = useState("");
  const [memberId, setMemberId] = useState("");

  const [editingReservation, setEditingReservation] =
    useState(null);

  const [showForm, setShowForm] = useState(false);

  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetchReservations();
    fetchBooks();
    fetchMembers();
  }, []);

  async function fetchReservations() {
    const token = localStorage.getItem("access_token");

    try {
      const response = await fetch(
        "http://127.0.0.1:8000/reservations/",
        {
          headers: {
            Authorization: "Bearer " + token,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setError(
          data.detail || "Unable to load reservations"
        );
        return;
      }

      setReservations(data);
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
        setError(
          data.detail || "Unable to load members"
        );
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

    return member
      ? member.full_name
      : "Unknown Member";
  }

  function resetForm() {
    setBookId("");
    setMemberId("");
    setEditingReservation(null);
    setShowForm(false);
  }

  function startAddReservation() {
    setEditingReservation(null);
    setBookId("");
    setMemberId("");
    setError("");
    setMessage("");
    setShowForm(true);
  }

  function startEditReservation(reservation) {
    setEditingReservation(reservation);
    setBookId(String(reservation.book_id));
    setMemberId(String(reservation.member_id));
    setError("");
    setMessage("");
    setShowForm(true);
  }

  async function handleSubmit(event) {
    event.preventDefault();

    const token = localStorage.getItem("access_token");

    setError("");
    setMessage("");

    const url = editingReservation
      ? "http://127.0.0.1:8000/reservations/" +
        editingReservation.id
      : "http://127.0.0.1:8000/reservations/";

    const method = editingReservation
      ? "PUT"
      : "POST";

    const body = editingReservation
      ? {
          book_id: Number(bookId),
          member_id: Number(memberId),
        }
      : {
          book_id: Number(bookId),
          member_id: Number(memberId),
        };

    try {
      const response = await fetch(url, {
        method: method,
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + token,
        },
        body: JSON.stringify(body),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(
          data.detail ||
            (editingReservation
              ? "Unable to update reservation"
              : "Unable to create reservation")
        );
        return;
      }

      setMessage(
        editingReservation
          ? "Reservation updated successfully"
          : "Reservation created successfully"
      );

      resetForm();

      await fetchReservations();
    } catch (error) {
      setError("Unable to connect to backend");
    }
  }

  async function handleCancel(reservationId) {
    const confirmed = window.confirm(
      "Are you sure you want to cancel this reservation?"
    );

    if (!confirmed) {
      return;
    }

    const token = localStorage.getItem("access_token");

    setError("");
    setMessage("");

    try {
      const response = await fetch(
        "http://127.0.0.1:8000/reservations/" +
          reservationId +
          "/cancel",
        {
          method: "PUT",
          headers: {
            Authorization: "Bearer " + token,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setError(
          data.detail || "Unable to cancel reservation"
        );
        return;
      }

      setMessage(
        "Reservation cancelled successfully"
      );

      await fetchReservations();
    } catch (error) {
      setError("Unable to connect to backend");
    }
  }

  async function handleDelete(reservationId) {
    const confirmed = window.confirm(
      "Are you sure you want to delete this reservation?"
    );

    if (!confirmed) {
      return;
    }

    const token = localStorage.getItem("access_token");

    setError("");
    setMessage("");

    try {
      const response = await fetch(
        "http://127.0.0.1:8000/reservations/" +
          reservationId,
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
          data.detail ||
            "Unable to delete reservation"
        );
        return;
      }

      setMessage(
        "Reservation deleted successfully"
      );

      await fetchReservations();
    } catch (error) {
      setError("Unable to connect to backend");
    }
  }

  const totalReservations =
    reservations.length;

  const activeReservations = reservations.filter(
    (reservation) =>
      reservation.status === "reserved"
  ).length;

  const cancelledReservations =
    reservations.filter(
      (reservation) =>
        reservation.status === "cancelled"
    ).length;

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
            <h1>Book Reservations</h1>

            <p style={{ color: "#666" }}>
              Manage book reservations
            </p>
          </div>

          <button
            onClick={startAddReservation}
            style={buttonStyle}
          >
            + Add Reservation
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

        <div
          style={{
            display: "grid",
            gridTemplateColumns:
              "repeat(3, 1fr)",
            gap: "20px",
            marginTop: "25px",
          }}
        >
          <div style={cardStyle}>
            <h3>Total Reservations</h3>
            <h2>{totalReservations}</h2>
          </div>

          <div style={cardStyle}>
            <h3>Active Reservations</h3>
            <h2>{activeReservations}</h2>
          </div>

          <div style={cardStyle}>
            <h3>Cancelled</h3>
            <h2>{cancelledReservations}</h2>
          </div>
        </div>

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
              {editingReservation
                ? "Edit Reservation"
                : "Add Reservation"}
            </h2>

            <form onSubmit={handleSubmit}>
              <label style={labelStyle}>
                Book
              </label>

              <select
                value={bookId}
                onChange={(event) =>
                  setBookId(event.target.value)
                }
                required
                style={inputStyle}
              >
                <option value="">
                  Select Book
                </option>

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

              <label style={labelStyle}>
                Member
              </label>

              <select
                value={memberId}
                onChange={(event) =>
                  setMemberId(event.target.value)
                }
                required
                style={inputStyle}
              >
                <option value="">
                  Select Member
                </option>

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

              <button
                type="submit"
                style={buttonStyle}
              >
                {editingReservation
                  ? "Update Reservation"
                  : "Add Reservation"}
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
          <h2>Reservation Records</h2>

          {reservations.length === 0 ? (
            <p>No reservation records found.</p>
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
                  <th style={tableHeader}>
                    Reservation Date
                  </th>
                  <th style={tableHeader}>Status</th>
                  <th style={tableHeader}>Action</th>
                </tr>
              </thead>

              <tbody>
                {reservations.map(
                  (reservation) => (
                    <tr key={reservation.id}>
                      <td style={tableCell}>
                        {reservation.id}
                      </td>

                      <td style={tableCell}>
                        {getBookTitle(
                          reservation.book_id
                        )}
                      </td>

                      <td style={tableCell}>
                        {getMemberName(
                          reservation.member_id
                        )}
                      </td>

                      <td style={tableCell}>
                        {new Date(
                          reservation.reservation_date
                        ).toLocaleString()}
                      </td>

                      <td style={tableCell}>
                        {reservation.status ===
                        "reserved"
                          ? "Reserved"
                          : "Cancelled"}
                      </td>

                      <td style={tableCell}>
                        {reservation.status ===
                          "reserved" && (
                          <>
                            <button
                              onClick={() =>
                                startEditReservation(
                                  reservation
                                )
                              }
                              style={
                                editButtonStyle
                              }
                            >
                              Edit
                            </button>

                            <button
                              onClick={() =>
                                handleCancel(
                                  reservation.id
                                )
                              }
                              style={
                                cancelActionStyle
                              }
                            >
                              Cancel
                            </button>
                          </>
                        )}

                        <button
                          onClick={() =>
                            handleDelete(
                              reservation.id
                            )
                          }
                          style={
                            deleteButtonStyle
                          }
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  )
                )}
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

const editButtonStyle = {
  padding: "8px 12px",
  border: "none",
  borderRadius: "5px",
  cursor: "pointer",
  marginRight: "5px",
};

const cancelActionStyle = {
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

const labelStyle = {
  display: "block",
  marginBottom: "8px",
  fontWeight: "500",
};

const cardStyle = {
  backgroundColor: "white",
  padding: "20px",
  borderRadius: "10px",
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

export default Reservations;