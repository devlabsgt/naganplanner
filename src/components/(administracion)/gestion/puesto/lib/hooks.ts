import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"; // <--- AQUÍ FALTABA useQuery
import { 
  createPuesto, 
  deletePuesto, 
  updatePuesto,
  getUsuariosDisponibles, 
  asignarUsuarioPuesto,
  desvincularUsuarioPuesto
} from "./actions";
import { PuestoFormValues } from "./schemas";

const DEPARTAMENTOS_KEY = ["departamentos"];
const USUARIOS_DISPONIBLES_KEY = ["usuarios-disponibles"];

export function useCreatePuesto() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (values: PuestoFormValues) => {
      const res = await createPuesto(values);
      if (res.error) throw new Error(res.error);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: DEPARTAMENTOS_KEY });
    }
  });
}

export function useUpdatePuesto() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, values }: { id: string, values: any }) => {
      const res = await updatePuesto(id, values);
      if (res.error) throw new Error(res.error);
      return res;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: DEPARTAMENTOS_KEY });
    }
  });
}

export function useDeletePuesto() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const res = await deletePuesto(id);
      if (res.error) throw new Error(res.error);
      return res;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: DEPARTAMENTOS_KEY });
    }
  });
}

export function useUsuariosDisponibles() {
  return useQuery({
    queryKey: USUARIOS_DISPONIBLES_KEY,
    queryFn: async () => {
      const res = await getUsuariosDisponibles();
      if (res.error) throw new Error(res.error);
      return res.data;
    },
    staleTime: 1000 * 60 * 6, 
  });
}

export function useAsignarUsuario() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ userId, puestoId }: { userId: string, puestoId: string }) => {
      const res = await asignarUsuarioPuesto(userId, puestoId);
      if (res.error) throw new Error(res.error);
      return res;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: DEPARTAMENTOS_KEY });
      queryClient.invalidateQueries({ queryKey: USUARIOS_DISPONIBLES_KEY });
    }
  });
}

export function useDesvincularUsuario() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (userId: string) => {
      const res = await desvincularUsuarioPuesto(userId);
      if (res.error) throw new Error(res.error);
      return res;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["departamentos"] });
    }
  });
}