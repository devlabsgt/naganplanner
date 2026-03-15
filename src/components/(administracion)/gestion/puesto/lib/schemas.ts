import { z } from "zod";

export const puestoSchema = z.object({
  id: z.string().uuid().optional(),
  nombre: z.string().min(2, { message: "El nombre debe tener al menos 2 caracteres" }),
  departamento_id: z.string().uuid({ message: "ID de departamento inválido" }),
  es_jefatura: z.boolean().default(false),
  usuario_id: z.string().uuid().nullable().optional(),
});

export type PuestoFormValues = z.infer<typeof puestoSchema>;

export type PuestoRow = PuestoFormValues & {
  id: string;
  created_at?: string;
};