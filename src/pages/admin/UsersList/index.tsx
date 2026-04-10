import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { UserLayout } from "../../../layouts/UsersLayout";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/common/ui/button";
import { MoreHorizontal, Edit, Trash, UserMinus, UserCheck, Plus, X } from "lucide-react";
import { useAuthStore } from "@/stores/authStore";

interface AdminUser {
  id: number;
  name: string;
  lastname: string;
  username: string;
  email: string;
  active?: number;
  createdAt: string | null;
}

export const UsersList = () => {
  const navigate = useNavigate();
  const token = useAuthStore((state) => state.token);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);

  const [editingUser, setEditingUser] = useState<AdminUser | null>(null);
  const [editFormData, setEditFormData] = useState<Partial<AdminUser>>({});
  const [deletingUserId, setDeletingUserId] = useState<number | null>(null);

  useEffect(() => {
    fetchAdmins();
  }, []);

  const fetchAdmins = async () => {
    try {
      setLoading(true);
      const res = await fetch(import.meta.env.VITE_API_URL + "/users/admins", {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        }
      });
      if (!res.ok) throw new Error("Failed to fetch admin users");
      const data = await res.json();
      setUsers(data);
    } catch (err) {
      console.error(err);
      toast.error("Error cargando usuarios: " + err);
    } finally {
      setLoading(false);
    }
  };

  const confirmDelete = async () => {
    if (deletingUserId === null) return;
    try {
      const res = await fetch(import.meta.env.VITE_API_URL + `/users/${deletingUserId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) throw new Error("Failed to delete user");
      setUsers(users.filter(u => u.id !== deletingUserId));
      setDeletingUserId(null);
      toast.success("Usuario eliminado exitosamente");
    } catch (err) {
      console.error(err);
      toast.error("Error eliminando usuario");
    }
  };

  const handleToggleActive = async (user: AdminUser) => {
    try {
      const isCurrentlyActive = user.active; 
      
      const res = await fetch(import.meta.env.VITE_API_URL + `/users/${user.id}/inactivate`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) throw new Error("Failed to inactivate user");
      if (isCurrentlyActive) {
        setUsers(users.map(u => u.id === user.id ? { ...u, active: 0 } : u));
      } else {
        setUsers(users.map(u => u.id === user.id ? { ...u, active: 1 } : u));
      }
      toast.success("Estado del usuario actualizado");
    } catch (err) {
      console.error(err);
      toast.error("Error cambiando estado del usuario");
    }
  };

  const openEditModal = (user: AdminUser) => {
    setEditingUser(user);
    setEditFormData({
      name: user.name,
      lastname: user.lastname,
      username: user.username,
      email: user.email,
    });
  };

  const handleEditChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEditFormData({ ...editFormData, [e.target.name]: e.target.value });
  };

  const handleUpdateUser = async () => {
    if (!editingUser) return;
    try {
      const res = await fetch(import.meta.env.VITE_API_URL + `/users/${editingUser.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(editFormData)
      });
      if (!res.ok) throw new Error("Failed to update user");
      
      setUsers(users.map(u => u.id === editingUser.id ? { ...u, ...editFormData } : u));
      setEditingUser(null);
      toast.success("Usuario actualizado exitosamente");
    } catch (err) {
      console.error(err);
      toast.error("Error actualizando usuario");
    }
  };

  return (
    <UserLayout>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Users List</h1>
          <p className="text-muted-foreground">Manage administrator accounts.</p>
        </div>
        <Button onClick={() => navigate("/admin/registro")}>
          <Plus className="mr-2 h-4 w-4" /> Registrar usuario
        </Button>
      </div>

      <div className="rounded-md border bg-white dark:bg-slate-950 shadow-sm">
        <Table>
          <TableHeader>
            <TableRow className="text-center">
              <TableHead className="w-[80px]">ID</TableHead>
              <TableHead>Nombre</TableHead>
              <TableHead>Username</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead>Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-10 text-muted-foreground">
                  Loading...
                </TableCell>
              </TableRow>
            ) : users.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-10 text-muted-foreground">
                  No admin users found.
                </TableCell>
              </TableRow>
            ) : (
              users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="font-medium">{user.id}</TableCell>
                  <TableCell>{`${user.name || ''} ${user.lastname || ''}`.trim()}</TableCell>
                  <TableCell>{user.username}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${user.active ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100' : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100'}`}>
                      {user.active ? 'Activo' : 'Inactivo'}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger className="flex h-8 w-8 items-center justify-center rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-400">
                        <span className="sr-only">Open menu</span>
                        <MoreHorizontal className="h-4 w-4" />
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem className="cursor-pointer" onClick={() => openEditModal(user)}>
                          <Edit className="mr-2 h-4 w-4" /> Editar
                        </DropdownMenuItem>
                        <DropdownMenuItem className="cursor-pointer" onClick={() => handleToggleActive(user)}>
                          {user.active ? (
                            <><UserMinus className="mr-2 h-4 w-4" /> Inactivar</>
                          ) : (
                            <><UserCheck className="mr-2 h-4 w-4" /> Activar</>
                          )}
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-red-600 focus:text-red-600 cursor-pointer focus:bg-red-50 dark:focus:bg-red-950/50" onClick={() => setDeletingUserId(user.id)}>
                          <Trash className="mr-2 h-4 w-4" /> Eliminar
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {editingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white dark:bg-slate-900 rounded-lg shadow-lg w-full max-w-md p-6 relative">
            <button 
              className="absolute top-4 right-4 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
              onClick={() => setEditingUser(null)}
            >
              <X className="h-5 w-5" />
            </button>
            <h2 className="text-xl font-bold mb-4">Editar Usuario</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Nombre</label>
                <input 
                  type="text" 
                  name="name" 
                  value={editFormData.name || ''} 
                  onChange={handleEditChange}
                  className="w-full px-3 py-2 border rounded-md dark:bg-slate-800 dark:border-slate-700"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Apellido</label>
                <input 
                  type="text" 
                  name="lastname" 
                  value={editFormData.lastname || ''} 
                  onChange={handleEditChange}
                  className="w-full px-3 py-2 border rounded-md dark:bg-slate-800 dark:border-slate-700"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Username</label>
                <input 
                  type="text" 
                  name="username" 
                  value={editFormData.username || ''} 
                  onChange={handleEditChange}
                  className="w-full px-3 py-2 border rounded-md dark:bg-slate-800 dark:border-slate-700"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Email</label>
                <input 
                  type="email" 
                  name="email" 
                  value={editFormData.email || ''} 
                  onChange={handleEditChange}
                  className="w-full px-3 py-2 border rounded-md dark:bg-slate-800 dark:border-slate-700"
                />
              </div>
            </div>

            <div className="mt-6 flex justify-end space-x-3">
              <Button variant="outline" onClick={() => setEditingUser(null)}>
                Cancelar
              </Button>
              <Button onClick={handleUpdateUser}>
                Guardar
              </Button>
            </div>
          </div>
        </div>
      )}
      {deletingUserId !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white dark:bg-slate-900 rounded-lg shadow-lg w-full max-w-sm p-6 relative text-center">
            <h2 className="text-xl font-bold mb-4">Confirmar Eliminación</h2>
            <p className="mb-6 text-slate-600 dark:text-slate-400">
              ¿Estás seguro de que deseas eliminar este usuario? Esta acción no se puede deshacer.
            </p>
            <div className="flex justify-center space-x-3">
              <Button variant="outline" onClick={() => setDeletingUserId(null)}>
                Cancelar
              </Button>
              <Button onClick={confirmDelete} className="bg-red-600 hover:bg-red-700 text-white focus:ring-red-500">
                Eliminar
              </Button>
            </div>
          </div>
        </div>
      )}
    </UserLayout>
  );
};
