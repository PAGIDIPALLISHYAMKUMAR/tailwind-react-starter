import React, { useEffect, useState } from "react";
import axios from "axios";
import { getAuth } from "firebase/auth";
import toast from "react-hot-toast";

const AdminPanel = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);

  const [newEmail, setNewEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [newIsAdmin, setNewIsAdmin] = useState(false);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const token = await getAuth().currentUser.getIdToken();
      const res = await axios.get("http://localhost:8000/admin/users", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUsers(res.data);
    } catch (err) {
      console.error("Error fetching users:", err);
      toast.error("❌ Access denied or failed to fetch users.");
    } finally {
      setLoading(false);
    }
  };

  const toggleAdmin = async (email, isAdmin) => {
    try {
      const token = await getAuth().currentUser.getIdToken();
      await axios.post(
        "http://localhost:8000/admin/toggle-admin",
        { email, isAdmin: !isAdmin },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      toast.success(`✅ Updated admin status for ${email}`);
      fetchUsers();
    } catch (err) {
      console.error("Toggle error:", err);
      toast.error("❌ Failed to update admin status.");
    }
  };

  const deleteUser = async (email) => {
    if (!window.confirm(`Are you sure you want to delete user ${email}?`)) return;

    try {
      const token = await getAuth().currentUser.getIdToken();
      await axios.delete("http://localhost:8000/admin/delete-user", {
        headers: { Authorization: `Bearer ${token}` },
        data: { email }, // axios supports sending body with DELETE
      });

      toast.success(`✅ User ${email} deleted.`);
      fetchUsers();
    } catch (err) {
      console.error("Delete error:", err);
      toast.error("❌ Failed to delete user.");
    }
  };

  const createUser = async (e) => {
    e.preventDefault();
    try {
      const token = await getAuth().currentUser.getIdToken();
      const res = await axios.post(
        "http://localhost:8000/admin/create-user",
        {
          email: newEmail,
          password: newPassword,
          isAdmin: newIsAdmin,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      toast.success(res.data.message);
      setNewEmail("");
      setNewPassword("");
      setNewIsAdmin(false);
      fetchUsers();
    } catch (err) {
      console.error("Create user error:", err);
      toast.error("❌ " + (err.response?.data?.detail || "Failed to create user."));
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  return (
    <div className="p-6 bg-white dark:bg-gray-900 text-black dark:text-white min-h-screen">
      <h2 className="text-2xl font-semibold mb-6">🛠️ Admin Panel - Manage Users</h2>

      {loading ? (
        <p>Loading users...</p>
      ) : (
        <table className="w-full border border-gray-300 dark:border-gray-700 mb-8">
          <thead className="bg-gray-100 dark:bg-gray-800">
            <tr>
              <th className="py-2 px-4 text-left">Email</th>
              <th className="py-2 px-4 text-left">Role</th>
              <th className="py-2 px-4 text-left">Action</th>
            </tr>
          </thead>
          <tbody>
            {users.length === 0 ? (
              <tr>
                <td colSpan="3" className="text-center py-4">
                  No users found.
                </td>
              </tr>
            ) : (
              users.map((user) => (
                <tr key={user.email} className="border-t border-gray-200 dark:border-gray-700">
                  <td className="py-2 px-4">{user.email}</td>
                  <td className="py-2 px-4">{user.isAdmin ? "👑 Admin" : "👤 User"}</td>
                  <td className="py-2 px-4 space-x-2">
                    <button
                      onClick={() => toggleAdmin(user.email, user.isAdmin)}
                      className={`px-3 py-1 rounded text-white ${
                        user.isAdmin ? "bg-red-600 hover:bg-red-700" : "bg-green-600 hover:bg-green-700"
                      }`}
                    >
                      {user.isAdmin ? "Revoke Admin" : "Make Admin"}
                    </button>
                    <button
                      onClick={() => deleteUser(user.email)}
                      className="px-3 py-1 rounded bg-gray-500 hover:bg-gray-600 text-white"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      )}

      <div className="border border-gray-300 dark:border-gray-700 p-6 rounded-md max-w-md">
        <h3 className="text-lg font-semibold mb-4">➕ Create New User</h3>
        <form onSubmit={createUser} className="space-y-4">
          <input
            type="email"
            placeholder="Email"
            value={newEmail}
            onChange={(e) => setNewEmail(e.target.value)}
            required
            className="w-full px-3 py-2 rounded border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800 text-black dark:text-white"
          />
          <input
            type="password"
            placeholder="Password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
            className="w-full px-3 py-2 rounded border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800 text-black dark:text-white"
          />
          <label className="flex items-center space-x-2 text-sm">
            <input
              type="checkbox"
              checked={newIsAdmin}
              onChange={(e) => setNewIsAdmin(e.target.checked)}
              className="accent-blue-500"
            />
            <span>Make Admin</span>
          </label>
          <button
            type="submit"
            className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded w-full"
          >
            Create User
          </button>
        </form>
      </div>
    </div>
  );
};

export default AdminPanel;
