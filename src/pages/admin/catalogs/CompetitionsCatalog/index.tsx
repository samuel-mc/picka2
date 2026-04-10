import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { UserLayout } from "@/layouts/UsersLayout";
import { Button } from "@/components/common/ui/button";
import { useApi } from "@/hooks/useApi";
import { CatalogLogoUploader } from "@/components/admin/catalogs/CatalogLogoUploader";
import type {
  ApiResponse,
  CatalogItem,
  CompetitionItem,
} from "@/types/catalog";

interface CompetitionForm {
  name: string;
  sportId: string;
  countryId: string;
  active: boolean;
}

const initialForm: CompetitionForm = {
  name: "",
  sportId: "",
  countryId: "",
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

export const CompetitionsCatalogPage = () => {
  const api = useApi();
  const [items, setItems] = useState<CompetitionItem[]>([]);
  const [sports, setSports] = useState<CatalogItem[]>([]);
  const [countries, setCountries] = useState<CatalogItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editingItem, setEditingItem] = useState<CompetitionItem | null>(null);
  const [form, setForm] = useState<CompetitionForm>(initialForm);

  const loadCatalogs = async () => {
    try {
      setLoading(true);
      const [competitionsResponse, sportsResponse, countriesResponse] = await Promise.all([
        api.get<ApiResponse<CompetitionItem[]>>("/catalogs/competitions"),
        api.get<ApiResponse<CatalogItem[]>>("/catalogs/sports"),
        api.get<ApiResponse<CatalogItem[]>>("/catalogs/countries"),
      ]);

      setItems(competitionsResponse.data.data);
      setSports(sportsResponse.data.data);
      setCountries(countriesResponse.data.data);
    } catch (error) {
      toast.error(getErrorMessage(error, "No fue posible cargar las competiciones"));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCatalogs();
  }, []);

  const resetForm = () => {
    setEditingItem(null);
    setForm(initialForm);
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!form.name.trim() || !form.sportId || !form.countryId) {
      toast.error("Completa nombre, deporte y país");
      return;
    }

    try {
      setSaving(true);
      const payload = {
        name: form.name.trim(),
        sportId: Number(form.sportId),
        countryId: Number(form.countryId),
        active: form.active,
      };

      if (editingItem) {
        const response = await api.put<ApiResponse<CompetitionItem>>(
          `/catalogs/competitions/${editingItem.id}`,
          payload
        );
        setItems((current) =>
          current.map((item) =>
            item.id === editingItem.id ? response.data.data : item
          )
        );
        toast.success("Competición actualizada");
      } else {
        const response = await api.post<ApiResponse<CompetitionItem>>(
          "/catalogs/competitions",
          payload
        );
        setItems((current) => [...current, response.data.data]);
        toast.success("Competición creada");
      }

      resetForm();
    } catch (error) {
      toast.error(getErrorMessage(error, "No fue posible guardar la competición"));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (item: CompetitionItem) => {
    const confirmed = window.confirm(
      `¿Seguro que quieres eliminar la competición "${item.name}"?`
    );
    if (!confirmed) return;

    try {
      await api.delete(`/catalogs/competitions/${item.id}`);
      setItems((current) => current.filter((entry) => entry.id !== item.id));
      if (editingItem?.id === item.id) resetForm();
      toast.success("Competición eliminada");
    } catch (error) {
      toast.error(getErrorMessage(error, "No fue posible eliminar la competición"));
    }
  };

  const startEdit = (item: CompetitionItem) => {
    setEditingItem(item);
    setForm({
      name: item.name,
      sportId: String(item.sportId),
      countryId: String(item.countryId),
      active: item.active,
    });
  };

  return (
    <UserLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-primaryBlue">
            Catálogo de competiciones
          </h1>
          <p className="text-slate-600">
            Cada competición pertenece a un deporte y a un país.
          </p>
        </div>

        <section className="rounded-xl border border-slate-200 bg-slate-50 p-6">
          <div className="mb-4 flex items-center gap-2">
            <Plus className="h-5 w-5 text-primaryBlue" />
            <h2 className="text-xl font-semibold">
              {editingItem ? "Editar competición" : "Nueva competición"}
            </h2>
          </div>

          <form className="grid gap-4 md:grid-cols-2" onSubmit={handleSubmit}>
            <input
              type="text"
              value={form.name}
              onChange={(event) =>
                setForm((current) => ({ ...current, name: event.target.value }))
              }
              placeholder="Nombre de la competición"
              className="rounded-md border border-slate-300 bg-white px-3 py-2"
            />

            <select
              value={form.sportId}
              onChange={(event) =>
                setForm((current) => ({ ...current, sportId: event.target.value }))
              }
              className="rounded-md border border-slate-300 bg-white px-3 py-2"
            >
              <option value="">Selecciona un deporte</option>
              {sports.map((sport) => (
                <option key={sport.id} value={sport.id}>
                  {sport.name}
                </option>
              ))}
            </select>

            <select
              value={form.countryId}
              onChange={(event) =>
                setForm((current) => ({ ...current, countryId: event.target.value }))
              }
              className="rounded-md border border-slate-300 bg-white px-3 py-2"
            >
              <option value="">Selecciona un país</option>
              {countries.map((country) => (
                <option key={country.id} value={country.id}>
                  {country.name}
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
              Activa
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
                entityLabel="competición"
                currentLogoUrl={editingItem.logoUrl}
                presignEndpoint={`/catalogs/competitions/${editingItem.id}/logo/presign`}
                completeEndpoint={`/catalogs/competitions/${editingItem.id}/logo/complete`}
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
              No hay competiciones registradas.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-left text-sm">
                <thead className="bg-slate-100 text-slate-700">
                  <tr>
                    <th className="px-6 py-3">Nombre</th>
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
                                className="h-full w-full object-cover"
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
                          {item.active ? "Activa" : "Inactiva"}
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
