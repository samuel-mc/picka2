import { UserLayout } from "@/layouts/UsersLayout";
import { SimpleCatalogManager } from "@/components/admin/catalogs/SimpleCatalogManager";

export const HomePrashesCatalogPage = () => {
  return (
    <UserLayout>
      <SimpleCatalogManager
        title="Catálogo home_prashes"
        description="Administra los textos principales que aparecen en el bloque inicial del feed de tipsters."
        endpoint="/catalogs/home-prashes"
        entityLabel="home prashe"
        supportsLogo={false}
      />
    </UserLayout>
  );
};
