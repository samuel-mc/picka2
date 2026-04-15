import { useEffect, useMemo, useState, type ChangeEvent, type ComponentType } from "react";
import toast from "react-hot-toast";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  BadgeCheck,
  Edit,
  MoreHorizontal,
  Plus,
  Search,
  Shield,
  Trash,
  UserCheck,
  UserMinus,
  Users,
  Trophy,
  X,
} from "lucide-react";
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

type UserRole = "ADMIN" | "TIPSTER";
type RoleFilter = "ALL" | UserRole;
type ValidationFilter = "ALL" | "PENDING" | "VALIDATED";

interface AdminUser {
  id: number;
  name: string;
  lastname: string;
  username: string;
  email: string;
  role: UserRole;
  validatedTipster?: boolean;
  active?: boolean;
  createdAt: string | null;
}

const roleCards: Array<{
  role: RoleFilter;
  label: string;
  icon: ComponentType<{ className?: string }>;
  tone: string;
}> = [
  {
    role: "ALL",
    label: "Todas las cuentas",
    icon: Users,
    tone: "bg-slate-900 text-white border-slate-900",
  },
  {
    role: "TIPSTER",
    label: "Tipsters",
    icon: Trophy,
    tone: "bg-[#eef4fb] text-[#0f4c81] border-[#cfe1ee]",
  },
  {
    role: "ADMIN",
    label: "Admins",
    icon: Shield,
    tone: "bg-slate-100 text-slate-700 border-slate-200",
  },
];

export const UsersList = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [roleFilter, setRoleFilter] = useState<RoleFilter>(
    normalizeRoleFilter(searchParams.get("role"))
  );
  const [validationFilter, setValidationFilter] = useState<ValidationFilter>(
    normalizeValidationFilter(searchParams.get("validation"))
  );
  const [searchValue, setSearchValue] = useState("");
  const [editingUser, setEditingUser] = useState<AdminUser | null>(null);
  const [editFormData, setEditFormData] = useState<Partial<AdminUser>>({});
  const [deletingUserId, setDeletingUserId] = useState<number | null>(null);

  useEffect(() => {
    void fetchUsers();
  }, []);

  useEffect(() => {
    const next = new URLSearchParams();
    if (roleFilter !== "ALL") next.set("role", roleFilter);
    if (validationFilter !== "ALL") next.set("validation", validationFilter.toLowerCase());
    setSearchParams(next, { replace: true });
  }, [roleFilter, setSearchParams, validationFilter]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${import.meta.env.VITE_API_URL}/users`, {
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
      });
      if (!res.ok) throw new Error("No se pudieron cargar las cuentas");
      const data = (await res.json()) as AdminUser[];
      setUsers(data);
    } catch (err) {
      console.error(err);
      toast.error("Error cargando cuentas");
    } finally {
      setLoading(false);
    }
  };

  const counts = useMemo(
    () => ({
      ALL: users.length,
      TIPSTER: users.filter((user) => user.role === "TIPSTER").length,
      ADMIN: users.filter((user) => user.role === "ADMIN").length,
    }),
    [users]
  );

  const normalizedSearch = searchValue.trim().toLowerCase();
  const filteredUsers = useMemo(() => {
    return users.filter((user) => {
      const matchesRole = roleFilter === "ALL" || user.role === roleFilter;
      if (!matchesRole) return false;
      const matchesValidation =
        validationFilter === "ALL" ||
        (user.role === "TIPSTER" &&
          ((validationFilter === "VALIDATED" && user.validatedTipster) ||
            (validationFilter === "PENDING" && !user.validatedTipster)));
      if (!matchesValidation) return false;
      if (!normalizedSearch) return true;

      const haystack = [
        user.name,
        user.lastname,
        user.username,
        user.email,
        formatRole(user.role),
      ]
        .join(" ")
        .toLowerCase();

      return haystack.includes(normalizedSearch);
    });
  }, [normalizedSearch, roleFilter, users, validationFilter]);

  const activeFilterLabel =
    roleCards.find((card) => card.role === roleFilter)?.label ?? "Todas las cuentas";
  const pendingTipstersCount = useMemo(
    () => users.filter((user) => user.role === "TIPSTER" && !user.validatedTipster).length,
    [users]
  );

  const confirmDelete = async () => {
    if (deletingUserId === null) return;
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/users/${deletingUserId}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (!res.ok) throw new Error("No se pudo eliminar la cuenta");
      setUsers((current) => current.filter((user) => user.id !== deletingUserId));
      setDeletingUserId(null);
      toast.success("Cuenta eliminada correctamente");
    } catch (err) {
      console.error(err);
      toast.error("Error eliminando cuenta");
    }
  };

  const handleToggleActive = async (user: AdminUser) => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/users/${user.id}/inactivate`, {
        method: "PUT",
        credentials: "include",
      });
      if (!res.ok) throw new Error("No se pudo actualizar el estado");
      setUsers((current) =>
        current.map((entry) =>
          entry.id === user.id ? { ...entry, active: !entry.active } : entry
        )
      );
      toast.success("Estado actualizado correctamente");
    } catch (err) {
      console.error(err);
      toast.error("Error cambiando estado");
    }
  };

  const handleToggleTipsterValidation = async (user: AdminUser) => {
    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/users/${user.id}/tipster-validation`,
        {
          method: "PUT",
          credentials: "include",
        }
      );
      if (!res.ok) throw new Error("No se pudo actualizar la validacion");
      const updated = (await res.json()) as AdminUser;
      setUsers((current) =>
        current.map((entry) => (entry.id === user.id ? { ...entry, ...updated } : entry))
      );
      toast.success(
        updated.validatedTipster
          ? "Tipster validado correctamente"
          : "Validacion de tipster removida"
      );
    } catch (err) {
      console.error(err);
      toast.error("Error actualizando la validacion");
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

  const handleEditChange = (e: ChangeEvent<HTMLInputElement>) => {
    setEditFormData((current) => ({ ...current, [e.target.name]: e.target.value }));
  };

  const handleUpdateUser = async () => {
    if (!editingUser) return;
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/users/${editingUser.id}`, {
        method: "PUT",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(editFormData),
      });
      if (!res.ok) throw new Error("No se pudo actualizar la cuenta");
      const updated = (await res.json()) as AdminUser;

      setUsers((current) =>
        current.map((user) =>
          user.id === editingUser.id ? { ...user, ...updated } : user
        )
      );
      setEditingUser(null);
      toast.success("Cuenta actualizada correctamente");
    } catch (err) {
      console.error(err);
      toast.error("Error actualizando cuenta");
    }
  };

  return (
    <UserLayout>
      <div className="space-y-6">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
          <div>
              <h1 className="text-3xl font-bold tracking-tight text-slate-900">Gestión de cuentas</h1>
              <p className="mt-2 max-w-3xl text-slate-600">
              Administra administradores y tipsters desde un solo panel.
              </p>
            </div>
          <Button onClick={() => navigate("/admin/registro")}>
            <Plus className="mr-2 h-4 w-4" />
            Registrar admin
          </Button>
        </div>

        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {roleCards.map((card) => {
            const Icon = card.icon;
            const active = roleFilter === card.role;
            return (
              <button
                key={card.role}
                type="button"
                onClick={() => {
                  setRoleFilter(card.role);
                  if (card.role !== "TIPSTER" && validationFilter !== "ALL") {
                    setValidationFilter("ALL");
                  }
                }}
                className={`rounded-3xl border p-5 text-left transition ${
                  active ? `${card.tone} shadow-lg` : "border-slate-200 bg-white text-slate-700 hover:border-slate-300"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold uppercase tracking-[0.18em]">
                    {card.label}
                  </span>
                  <Icon className="h-5 w-5" />
                </div>
                <p className="mt-4 text-4xl font-black">{counts[card.role]}</p>
              </button>
            );
          })}
        </section>

        <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h2 className="text-lg font-semibold text-slate-900">Cola de tipsters pendientes</h2>
              <p className="mt-1 text-sm text-slate-500">
                {formatNumber(pendingTipstersCount)} tipsters esperando validación manual.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button
                variant={validationFilter === "ALL" ? "default" : "outline"}
                onClick={() => {
                  setRoleFilter("TIPSTER");
                  setValidationFilter("ALL");
                }}
              >
                Todos los tipsters
              </Button>
              <Button
                variant={validationFilter === "PENDING" ? "default" : "outline"}
                onClick={() => {
                  setRoleFilter("TIPSTER");
                  setValidationFilter("PENDING");
                }}
              >
                Pendientes
              </Button>
              <Button
                variant={validationFilter === "VALIDATED" ? "default" : "outline"}
                onClick={() => {
                  setRoleFilter("TIPSTER");
                  setValidationFilter("VALIDATED");
                }}
              >
                Validados
              </Button>
            </div>
          </div>
        </section>

        <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h2 className="text-lg font-semibold text-slate-900">{activeFilterLabel}</h2>
              <p className="mt-1 text-sm text-slate-500">
                {formatNumber(filteredUsers.length)} cuentas visibles con el filtro actual.
              </p>
              {roleFilter === "TIPSTER" && validationFilter !== "ALL" && (
                <p className="mt-1 text-sm text-slate-500">
                  Vista: {validationFilter === "PENDING" ? "Pendientes" : "Validados"}
                </p>
              )}
            </div>

            <div className="relative w-full max-w-md">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                value={searchValue}
                onChange={(event) => setSearchValue(event.target.value)}
                placeholder="Buscar por nombre, username o correo"
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-4 text-sm text-slate-700 outline-none transition focus:border-primaryBlue focus:bg-white"
              />
            </div>
          </div>

          <div className="mt-5 rounded-2xl border bg-white shadow-sm">
            <Table>
              <TableHeader>
                <TableRow className="text-center">
                  <TableHead className="w-[80px]">ID</TableHead>
                  <TableHead>Nombre</TableHead>
                  <TableHead>Username</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Rol</TableHead>
                  <TableHead>Validación</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Alta</TableHead>
                  <TableHead>Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={9} className="py-10 text-center text-muted-foreground">
                      Cargando cuentas...
                    </TableCell>
                  </TableRow>
                ) : filteredUsers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} className="py-10 text-center text-muted-foreground">
                      No se encontraron cuentas para este filtro.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredUsers.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell className="font-medium">{user.id}</TableCell>
                      <TableCell>{`${user.name || ""} ${user.lastname || ""}`.trim()}</TableCell>
                      <TableCell>{user.username}</TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>
                        <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${roleBadgeClass(user.role)}`}>
                          {formatRole(user.role)}
                        </span>
                      </TableCell>
                      <TableCell>
                        {user.role === "TIPSTER" ? (
                          <span
                            className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold ${
                              user.validatedTipster
                                ? "bg-emerald-100 text-emerald-700"
                                : "bg-amber-100 text-amber-700"
                            }`}
                          >
                            <BadgeCheck className="h-3.5 w-3.5" />
                            {user.validatedTipster ? "Validado" : "Pendiente"}
                          </span>
                        ) : (
                          <span className="text-xs text-slate-400">N/A</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <span
                          className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                            user.active
                              ? "bg-green-100 text-green-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          {user.active ? "Activo" : "Inactivo"}
                        </span>
                      </TableCell>
                      <TableCell>{formatDate(user.createdAt)}</TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger className="flex h-8 w-8 items-center justify-center rounded-md hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-slate-400">
                            <span className="sr-only">Abrir acciones</span>
                            <MoreHorizontal className="h-4 w-4" />
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem className="cursor-pointer" onClick={() => openEditModal(user)}>
                              <Edit className="mr-2 h-4 w-4" />
                              Editar
                            </DropdownMenuItem>
                            <DropdownMenuItem className="cursor-pointer" onClick={() => handleToggleActive(user)}>
                              {user.active ? (
                                <>
                                  <UserMinus className="mr-2 h-4 w-4" />
                                  Inactivar
                                </>
                              ) : (
                                <>
                                  <UserCheck className="mr-2 h-4 w-4" />
                                  Activar
                                </>
                              )}
                            </DropdownMenuItem>
                            {user.role === "TIPSTER" && (
                              <DropdownMenuItem
                                className="cursor-pointer"
                                onClick={() => handleToggleTipsterValidation(user)}
                              >
                                <BadgeCheck className="mr-2 h-4 w-4" />
                                {user.validatedTipster ? "Quitar validación" : "Validar tipster"}
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuItem
                              className="cursor-pointer text-red-600 focus:text-red-600"
                              onClick={() => setDeletingUserId(user.id)}
                            >
                              <Trash className="mr-2 h-4 w-4" />
                              Eliminar
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
        </section>
      </div>

      {editingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
          <div className="relative w-full max-w-md rounded-lg bg-white p-6 shadow-lg">
            <button
              className="absolute right-4 top-4 text-slate-500 hover:text-slate-700"
              onClick={() => setEditingUser(null)}
            >
              <X className="h-5 w-5" />
            </button>
            <h2 className="mb-1 text-xl font-bold">Editar cuenta</h2>
            <p className="mb-4 text-sm text-slate-500">
              Rol actual: {formatRole(editingUser.role)}
            </p>

            <div className="space-y-4">
              <div>
                <label className="mb-1 block text-sm font-medium">Nombre</label>
                <input
                  type="text"
                  name="name"
                  value={editFormData.name || ""}
                  onChange={handleEditChange}
                  className="w-full rounded-md border px-3 py-2"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium">Apellido</label>
                <input
                  type="text"
                  name="lastname"
                  value={editFormData.lastname || ""}
                  onChange={handleEditChange}
                  className="w-full rounded-md border px-3 py-2"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium">Username</label>
                <input
                  type="text"
                  name="username"
                  value={editFormData.username || ""}
                  onChange={handleEditChange}
                  className="w-full rounded-md border px-3 py-2"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium">Email</label>
                <input
                  type="email"
                  name="email"
                  value={editFormData.email || ""}
                  onChange={handleEditChange}
                  className="w-full rounded-md border px-3 py-2"
                />
              </div>
            </div>

            <div className="mt-6 flex justify-end space-x-3">
              <Button variant="outline" onClick={() => setEditingUser(null)}>
                Cancelar
              </Button>
              <Button onClick={handleUpdateUser}>Guardar</Button>
            </div>
          </div>
        </div>
      )}

      {deletingUserId !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
          <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-lg">
            <h2 className="text-xl font-bold text-slate-900">Eliminar cuenta</h2>
            <p className="mt-2 text-sm text-slate-600">
              Esta acción desactiva y marca la cuenta como eliminada. ¿Deseas continuar?
            </p>
            <div className="mt-6 flex justify-end gap-3">
              <Button variant="outline" onClick={() => setDeletingUserId(null)}>
                Cancelar
              </Button>
              <Button variant="destructive" onClick={confirmDelete}>
                Eliminar
              </Button>
            </div>
          </div>
        </div>
      )}
    </UserLayout>
  );
};

function formatRole(role: UserRole) {
  if (role === "ADMIN") return "Admin";
  return "Tipster";
}

function roleBadgeClass(role: UserRole) {
  if (role === "ADMIN") return "bg-slate-100 text-slate-700";
  return "bg-[#eef4fb] text-[#0f4c81]";
}

function formatDate(value: string | null) {
  if (!value) return "N/D";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "N/D";

  return new Intl.DateTimeFormat("es-MX", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
}

function formatNumber(value: number) {
  return new Intl.NumberFormat("es-MX").format(value);
}

function normalizeRoleFilter(value: string | null): RoleFilter {
  if (value === "ADMIN" || value === "TIPSTER") {
    return value;
  }
  return "ALL";
}

function normalizeValidationFilter(value: string | null): ValidationFilter {
  if (value === "pending") return "PENDING";
  if (value === "validated") return "VALIDATED";
  return "ALL";
}
