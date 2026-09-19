import { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";

function Members() {
  const [members, setMembers] = useState([]);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const [showForm, setShowForm] = useState(false);
  const [editingMember, setEditingMember] = useState(null);

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [membershipId, setMembershipId] = useState("");
  const [department, setDepartment] = useState("");
  const [isActive, setIsActive] = useState(true);

  useEffect(() => {
    fetchMembers();
  }, []);

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

  function resetForm() {
    setFullName("");
    setEmail("");
    setPhone("");
    setMembershipId("");
    setDepartment("");
    setIsActive(true);
    setEditingMember(null);
    setShowForm(false);
  }

  function handleEdit(member) {
    setEditingMember(member);
    setFullName(member.full_name);
    setEmail(member.email);
    setPhone(member.phone || "");
    setMembershipId(member.membership_id);
    setDepartment(member.department || "");
    setIsActive(member.is_active);
    setMessage("");
    setError("");
    setShowForm(true);
  }

  async function handleSubmit(event) {
    event.preventDefault();

    const token = localStorage.getItem("access_token");

    try {
      let response;

      if (editingMember) {
        response = await fetch(
          "http://127.0.0.1:8000/members/" + editingMember.id,
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
              Authorization: "Bearer " + token,
            },
            body: JSON.stringify({
              full_name: fullName,
              email: email,
              phone: phone,
              membership_id: membershipId,
              department: department,
              is_active: isActive,
            }),
          }
        );
      } else {
        response = await fetch(
          "http://127.0.0.1:8000/members/",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: "Bearer " + token,
            },
            body: JSON.stringify({
              full_name: fullName,
              email: email,
              phone: phone,
              membership_id: membershipId,
              department: department,
            }),
          }
        );
      }

      const data = await response.json();

      if (!response.ok) {
        setError(
          data.detail ||
            (editingMember
              ? "Unable to update member"
              : "Unable to add member")
        );
        return;
      }

      setMessage(
        editingMember
          ? "Member updated successfully"
          : "Member added successfully"
      );

      setError("");
      resetForm();
      await fetchMembers();
    } catch (error) {
      setError("Unable to connect to backend");
    }
  }

  async function handleDelete(memberId) {
    const confirmed = window.confirm(
      "Are you sure you want to delete this member?"
    );

    if (!confirmed) {
      return;
    }

    const token = localStorage.getItem("access_token");

    try {
      const response = await fetch(
        "http://127.0.0.1:8000/members/" + memberId,
        {
          method: "DELETE",
          headers: {
            Authorization: "Bearer " + token,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setError(data.detail || "Unable to delete member");
        return;
      }

      setMessage("Member deleted successfully");
      setError("");

      await fetchMembers();
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
            <h1>Members Management</h1>

            <p style={{ color: "#666" }}>
              Manage library members
            </p>
          </div>

          <button
            onClick={() => {
              setEditingMember(null);
              setFullName("");
              setEmail("");
              setPhone("");
              setMembershipId("");
              setDepartment("");
              setIsActive(true);
              setShowForm(true);
              setMessage("");
              setError("");
            }}
            style={buttonStyle}
          >
            + Add Member
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
              {editingMember ? "Edit Member" : "Add New Member"}
            </h2>

            <form onSubmit={handleSubmit}>
              <input
                type="text"
                placeholder="Full Name"
                value={fullName}
                onChange={(event) =>
                  setFullName(event.target.value)
                }
                required
                style={inputStyle}
              />

              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(event) =>
                  setEmail(event.target.value)
                }
                required
                style={inputStyle}
              />

              <input
                type="text"
                placeholder="Phone"
                value={phone}
                onChange={(event) =>
                  setPhone(event.target.value)
                }
                style={inputStyle}
              />

              <input
                type="text"
                placeholder="Membership ID"
                value={membershipId}
                onChange={(event) =>
                  setMembershipId(event.target.value)
                }
                required
                style={inputStyle}
              />

              <input
                type="text"
                placeholder="Department"
                value={department}
                onChange={(event) =>
                  setDepartment(event.target.value)
                }
                style={inputStyle}
              />

              {editingMember && (
                <label
                  style={{
                    display: "block",
                    marginBottom: "15px",
                  }}
                >
                  <input
                    type="checkbox"
                    checked={isActive}
                    onChange={(event) =>
                      setIsActive(event.target.checked)
                    }
                  />
                  {" "}Active Member
                </label>
              )}

              <button
                type="submit"
                style={buttonStyle}
              >
                {editingMember
                  ? "Update Member"
                  : "Save Member"}
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
          <h2>Member List</h2>

          {members.length === 0 ? (
            <p>No members found.</p>
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
                  <th style={tableHeader}>Name</th>
                  <th style={tableHeader}>Email</th>
                  <th style={tableHeader}>Phone</th>
                  <th style={tableHeader}>Membership ID</th>
                  <th style={tableHeader}>Department</th>
                  <th style={tableHeader}>Status</th>
                  <th style={tableHeader}>Actions</th>
                </tr>
              </thead>

              <tbody>
                {members.map((member) => (
                  <tr key={member.id}>
                    <td style={tableCell}>{member.id}</td>

                    <td style={tableCell}>
                      {member.full_name}
                    </td>

                    <td style={tableCell}>
                      {member.email}
                    </td>

                    <td style={tableCell}>
                      {member.phone || "-"}
                    </td>

                    <td style={tableCell}>
                      {member.membership_id}
                    </td>

                    <td style={tableCell}>
                      {member.department || "-"}
                    </td>

                    <td style={tableCell}>
                      {member.is_active
                        ? "Active"
                        : "Inactive"}
                    </td>

                    <td style={tableCell}>
                      <button
                        onClick={() =>
                          handleEdit(member)
                        }
                        style={editButtonStyle}
                      >
                        Edit
                      </button>

                      <button
                        onClick={() =>
                          handleDelete(member.id)
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

const editButtonStyle = {
  padding: "8px 12px",
  border: "none",
  borderRadius: "5px",
  cursor: "pointer",
  marginRight: "6px",
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

export default Members;