import { useCallback, useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { UserLayout } from "@/layouts/UsersLayout";
import { Button } from "@/components/common/ui/button";
import { useApi } from "@/hooks/useApi";
import { CatalogLogoUploader } from "@/components/admin/catalogs/CatalogLogoUploader";
import type {
  ApiResponse,
  CompetitionItem,
  TeamItem,
} from "@/types/catalog";

interface TeamForm {
  name: string;
  competitionId: string;
  active: boolean;
}

const initialForm: TeamForm = {
  name: "",
  competitionId: "",
  active: true,
};

const getErrorMessage = (error: unknown, fallback: string) => {
  if (
    typeof error === "object" &&
    error !== null &&
    "response" in error &&
    typeof error.response === "object" &&
    error.response !== null &&
    "data" in error.response
  ) {
    const responseData = error.response.data as { message?: string };
    if (responseData?.message) return responseData.message;
  }

  if (error instanceof Error && error.message) return error.message;
  return fallback;
};

export const TeamsCatalogPage = () => {
  const api = useApi();
  const [items, setItems] = useState<TeamItem[]>([]);
  const [competitions, setCompetitions] = useState<CompetitionItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editingItem, setEditingItem] = useState<TeamItem | null>(null);
  const [form, setForm] = useState<TeamForm>(initialForm);

  const loadCatalogs = useCallback(async () => {
    try {
      setLoading(true);
      const [teamsResponse, competitionsResponse] = await Promise.all([
        api.get<ApiResponse<TeamItem[]>>("/catalogs/teams"),
        api.get<ApiResponse<CompetitionItem[]>>("/catalogs/competitions"),
      ]);

      setItems(teamsResponse.data.data);
      setCompetitions(competitionsResponse.data.data);
    } catch (error) {
      toast.error(getErrorMessage(error, "No fue posible cargar los equipos"));
    } finally {
      setLoading(false);
    }
  }, [api]);

  useEffect(() => {
    void loadCatalogs();
  }, [loadCatalogs]);

  const resetForm = () => {
    setEditingItem(null);
    setForm(initialForm);
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!form.name.trim() || !form.competitionId) {
      toast.error("Completa nombre y competición");
      return;
    }

    try {
      setSaving(true);
      const payload = {
        name: form.name.trim(),
        competitionId: Number(form.competitionId),
        active: form.active,
      };

      if (editingItem) {
        const response = await api.put<ApiResponse<TeamItem>>(
          `/catalogs/teams/${editingItem.id}`,
          payload
        );
        setItems((current) =>
          current.map((item) =>
            item.id === editingItem.id ? response.data.data : item
          )
        );
        toast.success("Equipo actualizado");
      } else {
        const response = await api.post<ApiResponse<TeamItem>>("/catalogs/teams", payload);
        setItems((current) => [...current, response.data.data]);
        toast.success("Equipo creado");
      }

      resetForm();
    } catch (error) {
      toast.error(getErrorMessage(error, "No fue posible guardar el equipo"));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (item: TeamItem) => {
    const confirmed = window.confirm(
      `¿Seguro que quieres eliminar el equipo "${item.name}"?`
    );
    if (!confirmed) return;

    try {
      await api.delete(`/catalogs/teams/${item.id}`);
      setItems((current) => current.filter((entry) => entry.id !== item.id));
      if (editingItem?.id === item.id) resetForm();
      toast.success("Equipo eliminado");
    } catch (error) {
      toast.error(getErrorMessage(error, "No fue posible eliminar el equipo"));
    }
  };

  const startEdit = (item: TeamItem) => {
    setEditingItem(item);
    setForm({
      name: item.name,
      competitionId: String(item.competitionId),
      active: item.active,
    });
  };

  return (
    <UserLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-primaryBlue">Catálogo de equipos</h1>
          <p className="text-slate-600">
            Cada equipo pertenece a una competición, y esa competición define su
            deporte y país.
          </p>
        </div>

        <section className="rounded-xl border border-slate-200 bg-slate-50 p-6">
          <div className="mb-4 flex items-center gap-2">
            <Plus className="h-5 w-5 text-primaryBlue" />
            <h2 className="text-xl font-semibold">
              {editingItem ? "Editar equipo" : "Nuevo equipo"}
            </h2>
          </div>

          <form className="grid gap-4 md:grid-cols-2" onSubmit={handleSubmit}>
            <input
              type="text"
              value={form.name}
              onChange={(event) =>
                setForm((current) => ({ ...current, name: event.target.value }))
              }
              placeholder="Nombre del equipo"
              className="rounded-md border border-slate-300 bg-white px-3 py-2"
            />

            <select
              value={form.competitionId}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  competitionId: event.target.value,
                }))
              }
              className="rounded-md border border-slate-300 bg-white px-3 py-2"
            >
              <option value="">Selecciona una competición</option>
              {competitions.map((competition) => (
                <option key={competition.id} value={competition.id}>
                  {competition.name} - {competition.sportName} / {competition.countryName}
                </option>
              ))}
            </select>

            <label className="flex items-center gap-2 rounded-md border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700">
              <input
                type="checkbox"
                checked={form.active}
                onChange={(event) =>
                  setForm((current) => ({ ...current, active: event.target.checked }))
                }
              />
              Activo
            </label>

            <div className="flex gap-2 md:col-span-2">
              <Button type="submit" disabled={saving}>
                {saving ? "Guardando..." : editingItem ? "Actualizar" : "Crear"}
              </Button>
              {editingItem ? (
                <Button type="button" variant="outline" onClick={resetForm}>
                  Cancelar
                </Button>
              ) : null}
            </div>
          </form>

          {editingItem ? (
            <div className="mt-4">
              <CatalogLogoUploader
                entityId={editingItem.id}
                entityLabel="equipo"
                currentLogoUrl={editingItem.logoUrl}
                presignEndpoint={`/catalogs/teams/${editingItem.id}/logo/presign`}
                completeEndpoint={`/catalogs/teams/${editingItem.id}/logo/complete`}
                onUploaded={(logoUrl) => {
                  setEditingItem((current) =>
                    current ? { ...current, logoUrl } : current
                  );
                  setItems((current) =>
                    current.map((item) =>
                      item.id === editingItem.id ? { ...item, logoUrl } : item
                    )
                  );
                }}
              />
            </div>
          ) : null}
        </section>

        <section className="rounded-xl border border-slate-200 bg-white">
          <div className="border-b border-slate-200 px-6 py-4">
            <h2 className="text-xl font-semibold text-slate-900">Listado</h2>
          </div>

          {loading ? (
            <div className="px-6 py-10 text-center text-slate-500">Cargando información...</div>
          ) : items.length === 0 ? (
            <div className="px-6 py-10 text-center text-slate-500">
              No hay equipos registrados.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-left text-sm">
                <thead className="bg-slate-100 text-slate-700">
                  <tr>
                    <th className="px-6 py-3">Nombre</th>
                    <th className="px-6 py-3">Competición</th>
                    <th className="px-6 py-3">Deporte</th>
                    <th className="px-6 py-3">País</th>
                    <th className="px-6 py-3">Estado</th>
                    <th className="px-6 py-3 text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((item) => (
                    <tr key={item.id} className="border-t border-slate-200">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-11 w-11 items-center justify-center overflow-hidden rounded-lg border border-slate-200 bg-slate-100">
                            {item.logoUrl ? (
                              <img
                                src={item.logoUrl}
                                alt={item.name}
                                className="h-full w-full object-contain"
                              />
                            ) : (
                              <span className="text-[10px] font-semibold uppercase text-slate-400">
                                Sin
                              </span>
                            )}
                          </div>
                          <span className="font-medium text-slate-900">{item.name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">{item.competitionName}</td>
                      <td className="px-6 py-4">{item.sportName}</td>
                      <td className="px-6 py-4">{item.countryName}</td>
                      <td className="px-6 py-4">
                        <span
                          className={`rounded-full px-3 py-1 text-xs font-semibold ${
                            item.active
                              ? "bg-emerald-100 text-emerald-700"
                              : "bg-rose-100 text-rose-700"
                          }`}
                        >
                          {item.active ? "Activo" : "Inactivo"}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex justify-end gap-2">
                          <Button type="button" variant="outline" onClick={() => startEdit(item)}>
                            <Pencil className="mr-2 h-4 w-4" />
                            Editar
                          </Button>
                          <Button type="button" variant="outline" onClick={() => handleDelete(item)}>
                            <Trash2 className="mr-2 h-4 w-4" />
                            Eliminar
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </UserLayout>
  );
};
