'use client';

import { CheckCircle2, Ban, HelpCircle, MessageSquare, RefreshCw, UserMinus, Briefcase } from 'lucide-react';
import { Integrante } from './lib/zod';

interface Props {
  integrante: Integrante;
  usuarioActualId: string;
  puedeEditar: boolean;
  onVerJustificacion: (motivo: string, nombre: string) => void;
  onSustituir: (e: React.MouseEvent, usuario_id: string, nombre: string) => void;
  onDarDeBaja: (e: React.MouseEvent, usuario_id: string, nombre: string) => void;
  isJefe?: boolean;
}

export default function FilaIntegrante({
  integrante,
  usuarioActualId,
  puedeEditar,
  onVerJustificacion,
  onSustituir,
  onDarDeBaja,
  isJefe = false 
}: Props) {
  const nombre = integrante.perfil?.nombre || 'Usuario Desconocido';
  const estado = integrante.invitación; 
  const esMiUsuario = integrante.usuario_id === usuarioActualId;
  const rol = integrante.rol;

  return (
    <div className="flex flex-col bg-white dark:bg-[#111111] p-3 rounded-lg border border-gray-100 dark:border-neutral-800 transition-colors hover:border-blue-500/30">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-2 sm:mb-0">
        
        <div className="flex flex-col">
            <div className="flex items-center gap-2 flex-wrap">
            <span className="font-bold text-sm text-gray-800 dark:text-gray-200">
                {nombre} {esMiUsuario && "(Tú)"}
            </span>
            
            {estado === true && (
                <span className="flex items-center gap-1 text-[10px] bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 px-1.5 py-0.5 rounded-md font-bold uppercase tracking-wider">
                <CheckCircle2 size={10}/> Confirmado
                </span>
            )}
            {estado === false && (
                <span className="flex items-center gap-1 text-[10px] bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 px-1.5 py-0.5 rounded-md font-bold uppercase tracking-wider">
                <Ban size={10}/> Rechazado
                </span>
            )}
            {(estado === null || estado === undefined) && (
                <span className="flex items-center gap-1 text-[10px] bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 px-1.5 py-0.5 rounded-md font-bold uppercase tracking-wider">
                <HelpCircle size={10}/> Pendiente
                </span>
            )}

            {/* ÍCONOS DE ACCIÓN */}
            <div className="flex items-center gap-0.5 ml-1">
                
                {estado === false && integrante.justificación && (
                <button 
                    onClick={(e) => { e.stopPropagation(); onVerJustificacion(integrante.justificación!, nombre); }}
                    className="p-1.5 text-gray-400 hover:text-amber-600 hover:bg-amber-50 dark:hover:text-amber-400 dark:hover:bg-amber-900/20 rounded-lg transition-all"
                    title="Leer justificación"
                >
                    <MessageSquare size={15} />
                </button>
                )}

                {/* --- LÓGICA ACTUALIZADA --- 
                    Mostramos si puedeEditar (jefe/creador) O si es el propio usuario (auto-gestión)
                */}
                {(puedeEditar || esMiUsuario) && (
                <>
                    <button 
                      onClick={(e) => onSustituir(e, integrante.usuario_id, nombre)}
                      className="group flex items-center gap-1.5 ml-2 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider text-gray-500 hover:text-blue-600 bg-gray-100 hover:bg-blue-50 dark:text-gray-400 dark:hover:text-blue-400 dark:bg-white/5 dark:hover:bg-blue-500/10 border border-transparent hover:border-blue-200 dark:hover:border-blue-500/30 rounded-md transition-all active:scale-95"
                      title={esMiUsuario ? "Buscar a alguien que me sustituya" : "Sustituir a este miembro"}
                    >
                      <RefreshCw size={12} className="group-hover:rotate-180 transition-transform duration-500" strokeWidth={2.5} />
                      <span className="hidden sm:inline">Sustituir</span>
                    </button>

                    {/* OPCIÓN DAR DE BAJA ELIMINADA POR SOLICITUD */}
                </>
                )}
            </div>
            </div>

            {rol && (
                <div className="flex items-center gap-1 mt-0.5 text-xs text-blue-600 dark:text-blue-400 font-medium">
                    <Briefcase size={12} className="opacity-70"/>
                    <span>{rol}</span>
                </div>
            )}
        </div>

        <div className="flex items-center gap-3 text-xs font-mono mt-2 sm:mt-0">
          <span className="text-gray-500 dark:text-gray-400">
            Entrada: <span className="text-gray-700 dark:text-gray-300 font-medium">--:--</span>
          </span>
          <span className="text-gray-500 dark:text-gray-400">
            Salida: <span className="text-gray-700 dark:text-gray-300 font-medium">--:--</span>
          </span>
          <span className="text-blue-600 dark:text-blue-400 font-medium ml-1">
            Duración: --h --m
          </span>
        </div>

      </div>
    </div>
  );
}