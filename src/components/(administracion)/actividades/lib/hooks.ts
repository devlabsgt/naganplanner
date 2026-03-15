'use client';

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { 
  obtenerDatosGestor, 
  guardarActividad, 
  eliminarActividad, 
  cambiarEstado,
  actualizarChecklist 
} from "./actions";
import { ActividadForm, ChecklistItem } from "./zod";

const KEYS = {
  gestor: (vista: string) => ["gestor-actividades", vista],
  all: ["gestor-actividades"] 
};

const CACHE_TIME = 1000 * 60 * 6;

export const useGestorActividades = (tipoVista: 'mis_actividades' | 'mi_equipo' | 'todas', initialData?: any) => {
  return useQuery({
    queryKey: KEYS.gestor(tipoVista),
    queryFn: async () => {
      const res = await obtenerDatosGestor(tipoVista);
      return res; // Ahora incluirá departamentosEquipo automáticamente
    },
    initialData, 
    staleTime: CACHE_TIME, 
  });
};

export const useActividadMutations = () => {
  const queryClient = useQueryClient();
  const invalidar = () => queryClient.invalidateQueries({ queryKey: KEYS.all });

  const guardar = useMutation({
    mutationFn: ({ data, id }: { data: ActividadForm, id?: string }) => guardarActividad(data, id),
    onSuccess: invalidar,
  });

  const eliminar = useMutation({
    mutationFn: (id: string) => eliminarActividad(id),
    onSuccess: invalidar,
  });

  const cambiarStatus = useMutation({
    mutationFn: ({ id, estado }: { id: string, estado: string }) => cambiarEstado(id, estado),
    onSuccess: invalidar,
  });

  const updateChecklistMutation = useMutation({
    mutationFn: ({ id, items }: { id: string, items: ChecklistItem[] }) => actualizarChecklist(id, items),
    onSuccess: invalidar,
  });

  return { 
    guardar, 
    eliminar, 
    cambiarStatus,
    updateChecklistMutation,
    isLoading: guardar.isPending || eliminar.isPending || cambiarStatus.isPending || updateChecklistMutation.isPending
  };
};