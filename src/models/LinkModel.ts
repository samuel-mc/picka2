import type { LucideProps } from "lucide-react";

export interface LinkModel {
  id: number;
  name: string;
  link: string;
  icon: React.ForwardRefExoticComponent<
    Omit<LucideProps, "ref"> & React.RefAttributes<SVGSVGElement>
  >;
}
