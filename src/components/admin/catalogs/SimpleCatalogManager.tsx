import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/common/ui/button";
import { useApi } from "@/hooks/useApi";
import type { ApiResponse, CatalogItem } from "@/types/catalog";
import { CatalogLogoUploader } from "./CatalogLogoUploader";

interface SimpleCatalogManagerProps {
  title: string;
  description: string;
  endpoint: string;
  entityLabel: string;
  supportsLogo?: boolean;
}

interface FormState {
  name: string;
  active: boolean;
}

const initialForm: FormState = {
  name: "",
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

export const SimpleCatalogManager = ({
  title,
  description,
  endpoint,
  entityLabel,
  supportsLogo = true,
}: SimpleCatalogManagerProps) => {
  const api = useApi();
  const [items, setItems] = useState<CatalogItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editingItem, setEditingItem] = useState<CatalogItem | null>(null);
  const [form, setForm] = useState<FormState>(initialForm);

  const loadItems = async () => {
    try {
      setLoading(true);
      const response = await api.get<ApiResponse<CatalogItem[]>>(endpoint);
      setItems(response.data.data);
    } catch (error) {
      toast.error(getErrorMessage(error, `No fue posible cargar ${entityLabel}`));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadItems();
  }, []);

  const resetForm = () => {
    setForm(initialForm);
    setEditingItem(null);
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!form.name.trim()) {
      toast.error(`Captura el nombre del ${entityLabel}`);
      return;
    }

    try {
      setSaving(true);
      const payload = {
        name: form.name.trim(),
        active: form.active,
      };

      if (editingItem) {
        const response = await api.put<ApiResponse<CatalogItem>>(
          `${endpoint}/${editingItem.id}`,
          payload
        );
        setItems((current) =>
          current.map((item) =>
            item.id === editingItem.id ? response.data.data : item
          )
        );
        toast.success(`${title.slice(0, -1)} actualizado`);
      } else {
        const response = await api.post<ApiResponse<CatalogItem>>(endpoint, payload);
        setItems((current) => [...current, response.data.data]);
        toast.success(`${title.slice(0, -1)} creado`);
      }

      resetForm();
    } catch (error) {
      toast.error(getErrorMessage(error, `No fue posible guardar ${entityLabel}`));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (item: CatalogItem) => {
    const confirmed = window.confirm(
      `¿Seguro que quieres eliminar ${entityLabel} "${item.name}"?`
    );
    if (!confirmed) return;

    try {
      await api.delete(`${endpoint}/${item.id}`);
      setItems((current) => current.filter((entry) => entry.id !== item.id));
      if (editingItem?.id === item.id) resetForm();
      toast.success(`${title.slice(0, -1)} eliminado`);
    } catch (error) {
      toast.error(getErrorMessage(error, `No fue posible eliminar ${entityLabel}`));
    }
  };

  const startEdit = (item: CatalogItem) => {
    setEditingItem(item);
    setForm({
      name: item.name,
      active: item.active,
    });
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-primaryBlue">{title}</h1>
          <p className="text-slate-600">{description}</p>
        </div>
      </div>

      <section className="rounded-xl border border-slate-200 bg-slate-50 p-6">
        <div className="mb-4 flex items-center gap-2">
          <Plus className="h-5 w-5 text-primaryBlue" />
          <h2 className="text-xl font-semibold">
            {editingItem ? `Editar ${entityLabel}` : `Nuevo ${entityLabel}`}
          </h2>
        </div>

        <form className="grid gap-4 md:grid-cols-[minmax(0,1fr)_180px_auto]" onSubmit={handleSubmit}>
          <input
            type="text"
            value={form.name}
            onChange={(event) =>
              setForm((current) => ({ ...current, name: event.target.value }))
            }
            placeholder={`Nombre del ${entityLabel}`}
            className="rounded-md border border-slate-300 bg-white px-3 py-2"
          />

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

          <div className="flex gap-2">
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

        {editingItem && supportsLogo ? (
          <div className="mt-4">
            <CatalogLogoUploader
              entityId={editingItem.id}
              entityLabel={entityLabel}
              currentLogoUrl={editingItem.logoUrl}
              presignEndpoint={`${endpoint}/${editingItem.id}/logo/presign`}
              completeEndpoint={`${endpoint}/${editingItem.id}/logo/complete`}
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
            No hay registros para este catálogo.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="bg-slate-100 text-slate-700">
                <tr>
                  <th className="px-6 py-3">Nombre</th>
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
                          {supportsLogo && item.logoUrl ? (
                            <img
                              src={item.logoUrl}
                              alt={item.name}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <span className="text-[10px] font-semibold uppercase text-slate-400">
                              {supportsLogo ? "Sin" : "Txt"}
                            </span>
                          )}
                        </div>
                        <span className="font-medium text-slate-900">{item.name}</span>
                      </div>
                    </td>
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
  );
};
