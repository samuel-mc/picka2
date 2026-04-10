import { UserLayout } from "@/layouts/UsersLayout";
import { SimpleCatalogManager } from "@/components/admin/catalogs/SimpleCatalogManager";

export const CountriesCatalogPage = () => {
  return (
    <UserLayout>
      <SimpleCatalogManager
        title="Catálogo de países"
        description="Define los países disponibles para relacionar competiciones."
        endpoint="/catalogs/countries"
        entityLabel="país"
      />
    </UserLayout>
  );
};
