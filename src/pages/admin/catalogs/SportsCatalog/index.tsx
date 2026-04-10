import { UserLayout } from "@/layouts/UsersLayout";
import { SimpleCatalogManager } from "@/components/admin/catalogs/SimpleCatalogManager";

export const SportsCatalogPage = () => {
  return (
    <UserLayout>
      <SimpleCatalogManager
        title="Catálogo de deportes"
        description="Administra los deportes disponibles para organizar competiciones."
        endpoint="/catalogs/sports"
        entityLabel="deporte"
      />
    </UserLayout>
  );
};
