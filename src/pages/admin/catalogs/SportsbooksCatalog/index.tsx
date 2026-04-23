import { UserLayout } from "@/layouts/UsersLayout";
import { SportsbooksCatalogManager } from "@/components/admin/catalogs/SportsbooksCatalogManager";

export const SportsbooksCatalogPage = () => {
  return (
    <UserLayout>
      <SportsbooksCatalogManager endpoint="/catalogs/sportsbooks" />
    </UserLayout>
  );
};

