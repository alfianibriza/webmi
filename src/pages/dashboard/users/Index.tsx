import { useEffect, useState } from 'react';
import { getAdminUsers, deleteUser, createUser, updateUser } from '../../../api';
import { useAuth } from '../../../contexts/AuthContext';
import { Pencil, Trash2, UserCog } from 'lucide-react';
import Modal from '../../../components/Modal';
import type { User } from '../../../types/safe_types';

export default function UsersIndex() {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');

  // Modal & Form State
  const [showModal, setShowModal] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  // Modified initial state
  const initialFormState = {
    name: '',
    email: '',
    password: '',
    role: 'admin', // Default to admin
    identity_number: '',
    person_id: 0,
    student_id: 0,
  };
  const [formData, setFormData] = useState(initialFormState);

  useEffect(() => {
    fetchUsers();
  }, [search]);

  const fetchUsers = async () => {
    try {
      const response = await getAdminUsers({ search, role: '' });
      const data = response.data;
      setUsers(Array.isArray(data) ? data : (data?.data || []));
    } catch (error) {
      console.error('Error fetching users:', error);
      setUsers([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Apakah Anda yakin ingin menghapus user ini?')) {
      return;
    }
    try {
      await deleteUser(id);
      fetchUsers();
    } catch (error) {
      console.error('Error deleting user:', error);
      alert('Gagal menghapus user.');
    }
  };

  const handleCreate = async () => {
    setEditingId(null);
    setFormData(initialFormState);
    setShowModal(true);
    // No need to fetchUnregisteredData for admin only
  };

  const handleEdit = (user: User) => {
    setEditingId(user.id);
    setFormData({
      name: user.name,
      email: user.email,
      password: '',
      role: user.role, // Keep existing role for edit, but create is admin-only
      identity_number: user.nip || user.nis || '',
      person_id: 0,
      student_id: user.student_id || 0,
    });
    setShowModal(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      if (editingId) {
        // Edit mode
        const payload: Record<string, unknown> = {
          name: formData.name,
          email: formData.email,
          role: formData.role,
        };

        if (formData.password) {
          payload.password = formData.password;
        }
        // Identity number logic preserved for backward compatibility if editing old users
        payload.nip = formData.identity_number;

        await updateUser(editingId, payload);
      } else {
        // Create mode - Always Admin
        const payload: Record<string, unknown> = {
          role: 'admin',
          name: formData.name,
          email: formData.email,
          password: formData.password,
        };

        await createUser(payload);
      }
      setShowModal(false);
      fetchUsers();
    } catch (error: any) {
      console.error('Error saving user:', error);
      const errorMessage = error.response?.data?.message || 'Gagal menyimpan user';
      alert(errorMessage);
    } finally {
      setIsSaving(false);
    }
  };

  // ... (loading check)

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold leading-tight text-gray-800 flex items-center gap-2">
            <UserCog className="w-8 h-8 text-brand-green-main" />
            Manajemen Akun
          </h2>
          <p className="text-gray-500 mt-1">Kelola akun pengguna sistem</p>
        </div>
      </div>

      <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
        <div className="p-6 text-gray-900">
          <div className="flex flex-col md:flex-row justify-between items-center mb-4 gap-4">
            <div className="flex gap-2">
              <button
                onClick={handleCreate}
                className="bg-purple-600 text-white px-4 py-2 rounded-md hover:bg-purple-700 transition font-medium text-sm"
              >
                + Tambah Admin
              </button>
              {/* Export Button Removed */}
            </div>

            <div className="flex gap-2 w-full md:w-auto">
              {/* Role Filter Removed */}

              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Cari user..."
                className="border-gray-300 rounded-md shadow-sm focus:ring-brand-green-main focus:border-brand-green-main w-full md:w-64 text-sm"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nama</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email/Login</th>
                  {/* Password column hidden/removed or kept? Keeping as per original but simplified if needed. Original had it. */}
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Password</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Aksi</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {users.length > 0 ? users.map((user) => (
                  <tr key={user.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{user.name}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">{user.email}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 font-mono bg-amber-50 px-2 select-all">
                      {user.plain_password || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-purple-100 text-purple-800">
                        {user.role === 'admin' ? 'Admin' : user.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => handleEdit(user)}
                        className="text-indigo-600 hover:text-indigo-900 mr-4"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      {currentUser?.id !== user.id && (
                        <button
                          onClick={() => handleDelete(user.id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan={5} className="px-6 py-4 text-center text-gray-500">
                      Belum ada data user.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* CREATE/EDIT MODAL */}
      <Modal
        show={showModal}
        onClose={() => setShowModal(false)}
        title={editingId ? "Edit Akun Admin" : "Tambah Akun Admin"}
        maxWidth="md"
      >
        <form onSubmit={handleSave} className="space-y-4">

          {/* Simplified Form: Only Name, Email, Password */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Nama Lengkap</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:border-brand-green-main focus:ring-brand-green-main"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Email</label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:border-brand-green-main focus:ring-brand-green-main"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Password {editingId && <span className="text-gray-400 font-normal">(Kosongkan jika tidak ubah)</span>}
            </label>
            <input
              type="text"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:border-brand-green-main focus:ring-brand-green-main"
              placeholder={!editingId ? "Minimal 6 karakter" : ""}
              required={!editingId}
            />
          </div>

          <div className="flex justify-end gap-3 mt-6 pt-4 border-t">
            <button
              type="button"
              onClick={() => setShowModal(false)}
              className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="px-4 py-2 bg-brand-green-main text-white rounded-md text-sm font-medium hover:bg-brand-green-dark disabled:opacity-50"
            >
              {isSaving ? 'Menyimpan...' : 'Simpan'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

