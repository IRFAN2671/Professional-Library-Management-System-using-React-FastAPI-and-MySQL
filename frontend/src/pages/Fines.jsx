import { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";

function Fines() {
  const [fines, setFines] = useState([]);
  const [issues, setIssues] = useState([]);
  const [members, setMembers] = useState([]);

  const [issueId, setIssueId] = useState("");
  const [memberId, setMemberId] = useState("");
  const [amount, setAmount] = useState("");
  const [reason, setReason] = useState("");

  const [editingFine, setEditingFine] = useState(null);
  const [showForm, setShowForm] = useState(false);

  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetchFines();
    fetchIssues();
    fetchMembers();
  }, []);

  async function fetchFines() {
    const token = localStorage.getItem("access_token");

    try {
      const response = await fetch(
        "http://127.0.0.1:8000/fines/",
        {
          headers: {
            Authorization: "Bearer " + token,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setError(data.detail || "Unable to load fines");
        return;
      }

      setFines(data);
    } catch (error) {
      setError("Unable to connect to backend");
    }
  }

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

  function getMemberName(memberId) {
    const member = members.find(
      (item) => item.id === memberId
    );

    return member ? member.full_name : "Unknown Member";
  }

  function getIssueLabel(issueId) {
    const issue = issues.find(
      (item) => item.id === issueId
    );

    if (!issue) {
      return "Issue #" + issueId;
    }

    return "Issue #" + issue.id;
  }

  function resetForm() {
    setIssueId("");
    setMemberId("");
    setAmount("");
    setReason("");
    setEditingFine(null);
    setShowForm(false);
  }

  function startAddFine() {
    setEditingFine(null);
    setIssueId("");
    setMemberId("");
    setAmount("");
    setReason("");
    setError("");
    setMessage("");
    setShowForm(true);
  }

  function startEditFine(fine) {
    setEditingFine(fine);
    setIssueId(String(fine.issue_id));
    setMemberId(String(fine.member_id));
    setAmount(String(fine.amount));
    setReason(fine.reason || "");
    setError("");
    setMessage("");
    setShowForm(true);
  }

  async function handleSubmit(event) {
    event.preventDefault();

    const token = localStorage.getItem("access_token");

    setError("");
    setMessage("");

    const url = editingFine
      ? "http://127.0.0.1:8000/fines/" +
        editingFine.id
      : "http://127.0.0.1:8000/fines/";

    const method = editingFine ? "PUT" : "POST";

    const body = editingFine
      ? {
          amount: Number(amount),
          reason: reason || null,
        }
      : {
          issue_id: Number(issueId),
          member_id: Number(memberId),
          amount: Number(amount),
          reason: reason || null,
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
            (editingFine
              ? "Unable to update fine"
              : "Unable to create fine")
        );
        return;
      }

      setMessage(
        editingFine
          ? "Fine updated successfully"
          : "Fine created successfully"
      );

      resetForm();

      await fetchFines();
    } catch (error) {
      setError("Unable to connect to backend");
    }
  }

  async function handlePay(fineId) {
    const confirmed = window.confirm(
      "Are you sure you want to mark this fine as paid?"
    );

    if (!confirmed) {
      return;
    }

    const token = localStorage.getItem("access_token");

    setError("");
    setMessage("");

    try {
      const response = await fetch(
        "http://127.0.0.1:8000/fines/" +
          fineId +
          "/pay",
        {
          method: "PUT",
          headers: {
            Authorization: "Bearer " + token,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setError(data.detail || "Unable to pay fine");
        return;
      }

      setMessage("Fine marked as paid successfully");

      await fetchFines();
    } catch (error) {
      setError("Unable to connect to backend");
    }
  }

  async function handleDelete(fineId) {
    const confirmed = window.confirm(
      "Are you sure you want to delete this fine?"
    );

    if (!confirmed) {
      return;
    }

    const token = localStorage.getItem("access_token");

    setError("");
    setMessage("");

    try {
      const response = await fetch(
        "http://127.0.0.1:8000/fines/" +
          fineId,
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
          data.detail || "Unable to delete fine"
        );
        return;
      }

      setMessage("Fine deleted successfully");

      await fetchFines();
    } catch (error) {
      setError("Unable to connect to backend");
    }
  }

  const totalFines = fines.reduce(
    (total, fine) => total + Number(fine.amount),
    0
  );

  const unpaidFines = fines
    .filter((fine) => fine.status === "unpaid")
    .reduce(
      (total, fine) => total + Number(fine.amount),
      0
    );

  const paidFines = fines
    .filter((fine) => fine.status === "paid")
    .reduce(
      (total, fine) => total + Number(fine.amount),
      0
    );

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
            <h1>Fine Management</h1>

            <p style={{ color: "#666" }}>
              Manage library fines and payments
            </p>
          </div>

          <button
            onClick={startAddFine}
            style={buttonStyle}
          >
            + Add Fine
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
            <h3>Total Fines</h3>
            <h2>Rs. {totalFines.toFixed(2)}</h2>
          </div>

          <div style={cardStyle}>
            <h3>Unpaid Fines</h3>
            <h2>Rs. {unpaidFines.toFixed(2)}</h2>
          </div>

          <div style={cardStyle}>
            <h3>Paid Fines</h3>
            <h2>Rs. {paidFines.toFixed(2)}</h2>
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
              {editingFine
                ? "Edit Fine"
                : "Add Fine"}
            </h2>

            <form onSubmit={handleSubmit}>
              <label style={labelStyle}>
                Issue
              </label>

              <select
                value={issueId}
                onChange={(event) =>
                  setIssueId(event.target.value)
                }
                required
                disabled={!!editingFine}
                style={inputStyle}
              >
                <option value="">
                  Select Issue
                </option>

                {issues.map((issue) => (
                  <option
                    key={issue.id}
                    value={issue.id}
                  >
                    Issue #{issue.id} - Member #{issue.member_id}
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
                disabled={!!editingFine}
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

              <label style={labelStyle}>
                Amount
              </label>

              <input
                type="number"
                min="0.01"
                step="0.01"
                value={amount}
                onChange={(event) =>
                  setAmount(event.target.value)
                }
                required
                placeholder="Enter fine amount"
                style={inputStyle}
              />

              <label style={labelStyle}>
                Reason
              </label>

              <input
                type="text"
                value={reason}
                onChange={(event) =>
                  setReason(event.target.value)
                }
                placeholder="Enter reason"
                style={inputStyle}
              />

              <button
                type="submit"
                style={buttonStyle}
              >
                {editingFine
                  ? "Update Fine"
                  : "Add Fine"}
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
          <h2>Fine Records</h2>

          {fines.length === 0 ? (
            <p>No fine records found.</p>
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
                  <th style={tableHeader}>Member</th>
                  <th style={tableHeader}>Issue</th>
                  <th style={tableHeader}>Amount</th>
                  <th style={tableHeader}>Reason</th>
                  <th style={tableHeader}>Status</th>
                  <th style={tableHeader}>Paid At</th>
                  <th style={tableHeader}>Action</th>
                </tr>
              </thead>

              <tbody>
                {fines.map((fine) => (
                  <tr key={fine.id}>
                    <td style={tableCell}>
                      {fine.id}
                    </td>

                    <td style={tableCell}>
                      {getMemberName(
                        fine.member_id
                      )}
                    </td>

                    <td style={tableCell}>
                      {getIssueLabel(
                        fine.issue_id
                      )}
                    </td>

                    <td style={tableCell}>
                      Rs.{" "}
                      {Number(
                        fine.amount
                      ).toFixed(2)}
                    </td>

                    <td style={tableCell}>
                      {fine.reason || "-"}
                    </td>

                    <td style={tableCell}>
                      {fine.status === "paid"
                        ? "Paid"
                        : "Unpaid"}
                    </td>

                    <td style={tableCell}>
                      {fine.paid_at
                        ? new Date(
                            fine.paid_at
                          ).toLocaleString()
                        : "-"}
                    </td>

                    <td style={tableCell}>
                      {fine.status === "unpaid" && (
                        <button
                          onClick={() =>
                            handlePay(fine.id)
                          }
                          style={payButtonStyle}
                        >
                          Pay
                        </button>
                      )}

                      <button
                        onClick={() =>
                          startEditFine(fine)
                        }
                        style={editButtonStyle}
                      >
                        Edit
                      </button>

                      <button
                        onClick={() =>
                          handleDelete(fine.id)
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

const payButtonStyle = {
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

export default Fines;