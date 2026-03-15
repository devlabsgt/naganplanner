"use client";

import { useState } from "react";
import { X, Search, User, Shield, CheckCircle2, Loader2 } from "lucide-react";
import { useUsuariosDisponibles, useAsignarUsuario } from "./lib/hooks";
import Swal from "sweetalert2";

interface ModalAsignarProps {
  isOpen: boolean;
  onClose: () => void;
  puestoId: string;
  puestoNombre: string;
}

export default function ModalAsignarUsuario({ isOpen, onClose, puestoId, puestoNombre }: ModalAsignarProps) {
  const [search, setSearch] = useState("");
  const [selectedUser, setSelectedUser] = useState<string | null>(null);
  
  const { data: usuarios, isLoading } = useUsuariosDisponibles();
  const { mutate: asignar, isPending } = useAsignarUsuario();

  const filteredUsers = usuarios?.filter(u => 
    u.nombre?.toLowerCase().includes(search.toLowerCase()) || 
    u.rol?.toLowerCase().includes(search.toLowerCase())
  );

  const handleAsignar = () => {
    if (!selectedUser) return;

    asignar({ userId: selectedUser, puestoId }, {
      onSuccess: () => {
        Swal.fire({
          icon: 'success', title: 'Usuario Asignado', 
          background: document.documentElement.classList.contains('dark') ? '#18181b' : '#fff',
          color: document.documentElement.classList.contains('dark') ? '#fff' : '#000', 
          toast: true, position: 'top-end', showConfirmButton: false, timer: 3000
        });
        onClose();
        setSelectedUser(null);
      },
      onError: (e) => Swal.fire({ 
        icon: 'error', 
        title: 'Error', 
        text: e.message,
        background: document.documentElement.classList.contains('dark') ? '#18181b' : '#fff',
        color: document.documentElement.classList.contains('dark') ? '#fff' : '#000', 
      })
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 dark:bg-black/60 backdrop-blur-sm p-4 animate-in fade-in">
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[80vh]">
        
        <div className="px-6 py-4 border-b border-zinc-200 dark:border-zinc-800 flex justify-between items-center bg-zinc-50 dark:bg-zinc-950/50 shrink-0">
          <div>
            <h3 className="text-lg font-bold text-zinc-900 dark:text-white">Asignar Colaborador</h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">Puesto: <span className="text-amber-600 dark:text-amber-500 font-bold">{puestoNombre}</span></p>
          </div>
          <button onClick={onClose} className="text-zinc-400 hover:text-zinc-600 dark:hover:text-white transition-colors"><X size={20} /></button>
        </div>

        <div className="p-4 border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shrink-0">
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-zinc-400 dark:text-zinc-500" />
            <input 
              type="text" 
              placeholder="Buscar por nombre o rol..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg pl-9 pr-4 py-2 text-sm text-zinc-800 dark:text-zinc-200 focus:ring-2 focus:ring-amber-500/50 outline-none transition-all"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-2 space-y-1 bg-white dark:bg-zinc-900/20">
          {isLoading ? (
            <div className="flex justify-center py-10"><Loader2 className="animate-spin text-zinc-400 dark:text-zinc-500" /></div>
          ) : filteredUsers?.length === 0 ? (
            <div className="text-center py-10 text-zinc-500 text-sm italic">No hay usuarios disponibles sin puesto.</div>
          ) : (
            filteredUsers?.map((user) => (
              <div 
                key={user.id} 
                onClick={() => setSelectedUser(user.id)}
                className={`flex items-center justify-between p-3 rounded-lg cursor-pointer transition-all border ${
                  selectedUser === user.id 
                    ? "bg-amber-50 dark:bg-amber-500/10 border-amber-500/50 shadow-sm" 
                    : "bg-transparent border-transparent hover:bg-zinc-100 dark:hover:bg-zinc-800"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`h-8 w-8 rounded-full flex items-center justify-center border ${
                    selectedUser === user.id 
                    ? "bg-amber-100 dark:bg-zinc-800 border-amber-200 dark:border-zinc-700 text-amber-600 dark:text-amber-500" 
                    : "bg-zinc-100 dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 text-zinc-500 dark:text-zinc-400"
                  }`}>
                    <User size={14} />
                  </div>
                  <div>
                    <p className={`text-sm font-semibold ${selectedUser === user.id ? "text-amber-700 dark:text-amber-400" : "text-zinc-700 dark:text-zinc-200"}`}>
                      {user.nombre || "Usuario sin nombre"}
                    </p>
                    
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <Shield size={10} className="text-zinc-400 dark:text-zinc-500" />
                      <span className="text-[10px] uppercase font-bold tracking-wide text-zinc-500 dark:text-zinc-400 bg-zinc-100 dark:bg-zinc-800 px-1.5 py-0.5 rounded border border-zinc-200 dark:border-zinc-700">
                        {user.rol || "N/A"}
                      </span>
                    </div>
                  </div>
                </div>

                {selectedUser === user.id && <CheckCircle2 className="text-amber-600 dark:text-amber-500 h-5 w-5 animate-in zoom-in" />}
              </div>
            ))
          )}
        </div>

        <div className="p-4 border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950/50 flex justify-end gap-2 shrink-0">
          <button onClick={onClose} className="px-4 py-2 rounded-lg text-sm font-medium text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-white transition-colors">Cancelar</button>
          <button 
            onClick={handleAsignar}
            disabled={!selectedUser || isPending}
            className="px-4 py-2 rounded-lg text-sm font-bold bg-amber-600 hover:bg-amber-700 text-white disabled:opacity-50 transition-all shadow-md active:scale-95 shadow-amber-900/10 dark:shadow-amber-900/20"
          >
            {isPending ? "Asignando..." : "Confirmar Asignación"}
          </button>
        </div>

      </div>
    </div>
  );
}