import { z } from 'zod';

export const aulaFormSchema = z.object({
  nombre: z.string()
    .min(3, "El nombre debe tener al menos 3 caracteres")
    .max(100, "El nombre es muy largo"),
  
  descripcion: z.string()
    .max(500, "La descripción no puede exceder los 500 caracteres")
    .optional()
    .nullable(),
  
  catedratico_id: z.string()
    .min(1, "Debes seleccionar un catedrático")
    .uuid("ID de catedrático inválido"),
  
  horario: z.string()
    .max(200, "El horario es muy largo")
    .optional()
    .nullable(),
  
  status: z.boolean().default(true),
});

export type AulaForm = z.infer<typeof aulaFormSchema>;

export interface Aula {
  id: string;
  nombre: string;
  descripcion: string | null;
  catedratico_id: string;
  horario: string | null;
  status: boolean;
  created_at: string;
  created_by: string;
  // Campos del JOIN de profiles
  perfil_catedratico?: {
    nombre: string;
    avatar_url?: string;
  };
}

export interface Perfil {
  id: string;
  nombre: string;
  avatar_url?: string;
  activo: boolean;
  rol?: string;
}
