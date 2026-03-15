'use client';

import { useState, useEffect } from 'react';
import { X, Save, Sparkles, Loader2, Trash2, Layers, Tag, Users, UserPlus, ClipboardList, Dices } from 'lucide-react';
import Swal from 'sweetalert2';
import { usePlanificadorMutations, useGestorEquipos } from '../lib/hooks';
import { PlanificadorForm, planificadorFormSchema, Perfil, Planificador, ChecklistItem, VideoAdjunto } from '../lib/zod';

// Componentes de sección
import { SeccionGeneral } from './SeccionGeneral';
import { SeccionChecklist } from './SeccionChecklist';
import { SeccionEquipo, IntegranteUI } from './SeccionEquipo';
import GestorEquipos from './GestorEquipos';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  usuarios: Perfil[];
  usuarioActualId: string;
  planificadorEditar?: Planificador | null;
  isJefe: boolean;
  modulo?: 'alabanza' | 'danza' | 'multimedia' | 'todas';
}

const MODULOS_DISPONIBLES = [
  { value: 'alabanza', label: 'Alabanza' },
  { value: 'danza', label: 'Danza' },
  { value: 'multimedia', label: 'Multimedia' },
];

const TIPOS_SERVICIO = [
  { value: 'servicio', label: 'Servicio' },
  { value: 'ensayo', label: 'Ensayo' },
  { value: 'servicio_especial', label: 'Servicio Especial' },
];

type ModuloType = 'alabanza' | 'danza' | 'multimedia';
type StatusType = 'servicio' | 'ensayo' | 'servicio_especial';
type ModoAsignacion = 'INDIVIDUAL' | 'EQUIPO';

export default function NuevoPlanificador({ isOpen, onClose, usuarios, usuarioActualId, planificadorEditar, isJefe, modulo }: Props) {
  const { guardar, eliminar } = usePlanificadorMutations();
  const { cargarMiembros, plantillas } = useGestorEquipos();

  const isEditing = !!planificadorEditar;
  const isModuloLocked = modulo && modulo !== 'todas';

  // --- ESTADOS ---
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [selectedModulo, setSelectedModulo] = useState<ModuloType>('alabanza');
  const [selectedStatus, setSelectedStatus] = useState<StatusType>('servicio');

  const [modoAsignacion, setModoAsignacion] = useState<ModoAsignacion>('INDIVIDUAL');
  const [integrantes, setIntegrantes] = useState<IntegranteUI[]>([]);
  const [checklist, setChecklist] = useState<ChecklistItem[]>([]);
  const [videosUrl, setVideosUrl] = useState<VideoAdjunto[]>([]);

  const [isGestorOpen, setIsGestorOpen] = useState(false);
  const [isRandomLoading, setIsRandomLoading] = useState(false);

  // Estado para recordar el último índice aleatorio y evitar repeticiones
  const [lastRandomIndex, setLastRandomIndex] = useState<number | null>(null);

  // BLOQUEO DE SCROLL
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      document.documentElement.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
      document.documentElement.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
      document.documentElement.style.overflow = '';
    };
  }, [isOpen]);

  // CARGA DE DATOS
  useEffect(() => {
    if (isOpen) {
      if (planificadorEditar) {
        setTitle(planificadorEditar.title);
        setDescription(planificadorEditar.description || '');
        setSelectedModulo((planificadorEditar.modulo as ModuloType) || 'alabanza');
        const statusDB = planificadorEditar.status as StatusType;
        setSelectedStatus(statusDB && ['servicio', 'ensayo', 'servicio_especial'].includes(statusDB) ? statusDB : 'servicio');

        if (planificadorEditar.due_date) {
          const d = new Date(planificadorEditar.due_date);
          const localISO = new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
          setDueDate(localISO);
        }

        const mapped = planificadorEditar.integrantes.map(i => ({
          usuario_id: i.usuario_id,
          nombre: i.perfil?.nombre || 'Desconocido',
          avatar_url: i.perfil?.avatar_url,
          es_encargado: i.es_encargado,
          rol: i.rol || '',
          is_new: false
        }));
        setIntegrantes(mapped);
        setChecklist(planificadorEditar.checklist || []);
        setVideosUrl(planificadorEditar.videos_url || []);
        setModoAsignacion('INDIVIDUAL');

      } else {
        setTitle('');
        setDescription('');
        setDueDate('');
        setChecklist([]);
        setVideosUrl([]);
        setModoAsignacion('INDIVIDUAL');
        const modPorDefecto = (isModuloLocked ? modulo : 'alabanza') as ModuloType;
        setSelectedModulo(modPorDefecto);
        setSelectedStatus('servicio');
        const yo = usuarios.find(u => u.id === usuarioActualId);
        setIntegrantes(yo ? [{ usuario_id: yo.id, nombre: yo.nombre, avatar_url: yo.avatar_url, es_encargado: true, rol: '', is_new: true }] : []);
      }
    }
  }, [isOpen, planificadorEditar, usuarios, usuarioActualId, modulo, isModuloLocked]);

  const handleDeleteComision = async () => {
    if (!planificadorEditar) return;
    const result = await Swal.fire({
      title: '¿Eliminar actividad?',
      text: "Se eliminará permanentemente el registro y sus integrantes.",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
      background: document.documentElement.classList.contains('dark') ? '#1a1a1a' : '#fff',
      color: document.documentElement.classList.contains('dark') ? '#fff' : '#000',
    });

    if (result.isConfirmed) {
      try {
        await eliminar.mutateAsync(planificadorEditar.id);
        onClose();
      } catch (e: any) { }
    }
  };

  const handleSelectPlantilla = async (plantillaId: string, nombrePlantilla?: string) => {
    try {
      const nuevosMiembros = await cargarMiembros.mutateAsync(plantillaId) as any;
      setIntegrantes(nuevosMiembros);

      const msg = nombrePlantilla
        ? `¡Equipo "${nombrePlantilla}" cargado!`
        : 'Equipo cargado correctamente';

      Swal.mixin({
        toast: true, position: 'top-end', showConfirmButton: false, timer: 2000
      }).fire({ icon: 'success', title: msg });

    } catch (error) {
      Swal.fire('Error', 'No se pudo cargar la plantilla', 'error');
    }
  };

  const handleRandomTeam = async () => {
    if (!plantillas || plantillas.length === 0) {
      Swal.fire({
        icon: 'info',
        title: 'Sin equipos',
        text: 'Primero debes crear plantillas en el Gestor de Equipos.',
        toast: true, position: 'top-end', showConfirmButton: false, timer: 3000
      });
      return;
    }

    setIsRandomLoading(true);
    await new Promise(resolve => setTimeout(resolve, 600));

    // --- LÓGICA ANTI-REPETICIÓN ---
    let randomIndex;

    if (plantillas.length === 1) {
      // Si solo hay 1 equipo, no hay opción de cambiar
      randomIndex = 0;
    } else {
      // Si hay más de 1, buscamos uno diferente al anterior
      do {
        randomIndex = Math.floor(Math.random() * plantillas.length);
      } while (randomIndex === lastRandomIndex);
    }

    // Guardamos el índice actual para la próxima vez
    setLastRandomIndex(randomIndex);

    const randomTemplate = plantillas[randomIndex];
    await handleSelectPlantilla(randomTemplate.id, randomTemplate.nombre);

    setIsRandomLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!integrantes.some(i => i.es_encargado)) {
      Swal.fire('Atención', 'Debes seleccionar al menos a un Encargado (Líder).', 'warning');
      return;
    }
    const rawData = {
      title,
      description,
      due_date: dueDate,
      checklist,
      modulo: selectedModulo,
      status: selectedStatus,
      videos_url: videosUrl,
      integrantes: integrantes.map(i => ({
        usuario_id: i.usuario_id,
        es_encargado: i.es_encargado,
        rol: i.rol,
        es_nuevo: i.is_new
      }))
    };
    const validation = planificadorFormSchema.safeParse(rawData);
    if (!validation.success) {
      Swal.fire({
        icon: 'warning',
        title: 'Datos incompletos',
        text: validation.error.issues[0].message,
        background: document.documentElement.classList.contains('dark') ? '#1a1a1a' : '#fff',
      });
      return;
    }
    try {
      await guardar.mutateAsync({ data: rawData as PlanificadorForm, id: planificadorEditar?.id });
      onClose();
    } catch (error: any) { }
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
        <div className="bg-white dark:bg-[#1a1a1a] w-full max-w-[1000px] xl:max-w-[1200px] rounded-3xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden border border-gray-100 dark:border-neutral-800">

          {/* HEADER */}
          <div className="px-6 sm:px-8 py-5 border-b border-gray-100 dark:border-neutral-800 flex justify-between items-center bg-white dark:bg-[#1a1a1a]">
            <div className="flex flex-col gap-1 w-full">
              <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2 whitespace-nowrap">
                  {isEditing ? <Save className="text-blue-600" size={22} /> : <Sparkles className="text-blue-600" size={22} />}
                  {isEditing ? 'Editar Actividad' : 'Nueva Actividad'}
                </h2>

                <div className="flex items-center gap-2 ml-auto sm:ml-4 flex-wrap justify-end">
                  <div className="relative group">
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none">
                      <Tag size={14} />
                    </div>
                    <select
                      value={selectedStatus}
                      onChange={(e) => setSelectedStatus(e.target.value as StatusType)}
                      disabled={guardar.isPending}
                      className="appearance-none pl-9 pr-8 py-1.5 text-xs font-bold uppercase tracking-wide bg-gray-100 dark:bg-neutral-800 text-gray-700 dark:text-gray-300 border border-transparent hover:border-gray-300 dark:hover:border-neutral-600 rounded-lg cursor-pointer outline-none focus:ring-2 focus:ring-blue-500/50 transition-all disabled:opacity-60"
                    >
                      {TIPOS_SERVICIO.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                    </select>
                  </div>

                  <div className="relative group">
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none">
                      <Layers size={14} />
                    </div>
                    <select
                      value={selectedModulo}
                      onChange={(e) => setSelectedModulo(e.target.value as ModuloType)}
                      disabled={!!isModuloLocked || guardar.isPending}
                      className="appearance-none pl-9 pr-8 py-1.5 text-xs font-bold uppercase tracking-wide bg-gray-100 dark:bg-neutral-800 text-gray-700 dark:text-gray-300 border border-transparent hover:border-gray-300 dark:hover:border-neutral-600 rounded-lg cursor-pointer outline-none focus:ring-2 focus:ring-blue-500/50 transition-all disabled:opacity-60"
                    >
                      {MODULOS_DISPONIBLES.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
                    </select>
                  </div>
                </div>
              </div>
            </div>
            <button onClick={onClose} className="p-2 ml-3 hover:bg-gray-100 dark:hover:bg-white/5 rounded-full transition-colors text-gray-400">
              <X size={22} />
            </button>
          </div>

          {/* CONTENIDO */}
          <form id="form-comision" onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 sm:p-8 custom-scrollbar bg-white dark:bg-[#1a1a1a]">

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 xl:gap-12 h-full">

              {/* COLUMNA IZQUIERDA: GENERAL Y CHECKLIST */}
              <div className="flex flex-col space-y-8 lg:pr-4">
                <SeccionGeneral
                  title={title} setTitle={setTitle}
                  description={description} setDescription={setDescription}
                  dueDate={dueDate} setDueDate={setDueDate}
                  disabled={guardar.isPending}
                />

                {!isEditing && (
                  <div className="animate-in fade-in duration-300">
                    <div className="h-px bg-gray-100 dark:bg-neutral-800 mb-8" />
                    <SeccionChecklist checklist={checklist} setChecklist={setChecklist} />
                  </div>
                )}
              </div>

              {/* COLUMNA DERECHA: ASIGNACIÓN DE MIEMBROS */}
              {!isEditing && (
                <div className="flex flex-col space-y-4 lg:pl-6 lg:border-l lg:border-gray-100 dark:lg:border-neutral-800 h-full animate-in fade-in duration-300">
                  <div className="flex flex-col gap-4">
                    {/* Encabezado: Título */}
                    <div className="flex items-center gap-2">
                      <div className="p-1.5 bg-blue-100 dark:bg-blue-900/30 rounded-lg text-blue-600 dark:text-blue-400">
                        <Users size={16} />
                      </div>
                      <div className="flex flex-col">
                        <span className="text-sm font-bold text-gray-800 dark:text-white leading-none">
                          Asignación de Miembros
                        </span>
                        {integrantes.length > 0 && (
                          <span className="text-[10px] text-gray-500 font-medium mt-0.5">
                            {integrantes.length} {integrantes.length === 1 ? 'miembro seleccionado' : 'miembros seleccionados'}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Controles de Asignación */}
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 w-full">

                      {/* Switch de Modo */}
                      <div className="flex bg-gray-100 dark:bg-neutral-800 p-1 rounded-xl w-full sm:w-fit border border-gray-200 dark:border-neutral-700">
                        <button
                          type="button"
                          onClick={() => setModoAsignacion('INDIVIDUAL')}
                          className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${modoAsignacion === 'INDIVIDUAL' ? 'bg-white dark:bg-neutral-700 text-blue-600 dark:text-blue-400 shadow-sm' : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'}`}
                        >
                          <UserPlus size={14} /> Individual
                        </button>
                        <button
                          type="button"
                          onClick={() => setModoAsignacion('EQUIPO')}
                          className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${modoAsignacion === 'EQUIPO' ? 'bg-white dark:bg-neutral-700 text-blue-600 dark:text-blue-400 shadow-sm' : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'}`}
                        >
                          <Users size={14} /> Equipos
                        </button>
                      </div>

                      {/* Botones de Acción (Solo modo EQUIPO) */}
                      {modoAsignacion === 'EQUIPO' && (
                        <div className="flex items-center gap-2 w-full sm:w-auto animate-in fade-in slide-in-from-right-2">
                          <button
                            type="button"
                            onClick={() => setIsGestorOpen(true)}
                            className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-3 py-2 sm:py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold transition-all shadow-md shadow-blue-500/20 active:scale-95"
                          >
                            <ClipboardList size={14} />
                            <span>Elegir Equipo</span>
                          </button>
                          <button
                            type="button"
                            onClick={handleRandomTeam}
                            disabled={isRandomLoading}
                            className="flex-1 sm:flex-none relative flex items-center justify-center gap-2 px-3 py-2 sm:py-1.5 bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 text-white rounded-lg text-xs font-bold transition-all shadow-[0_0_15px_rgba(245,158,11,0.4)] hover:shadow-[0_0_25px_rgba(245,158,11,0.6)] active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed group overflow-hidden border border-amber-400/30"
                            title="Seleccionar equipo al azar"
                          >
                            <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
                            <Dices size={15} className={`relative z-10 ${isRandomLoading ? "animate-spin" : "group-hover:scale-110 group-hover:-rotate-12 transition-transform duration-300"}`} />
                            <span className="relative z-10 drop-shadow-md tracking-wide">Azar</span>
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Renderizado de la lista de integrantes o buscador */}
                  <div className="flex-1 mt-2">
                    <SeccionEquipo
                      integrantes={integrantes}
                      setIntegrantes={setIntegrantes}
                      usuarios={usuarios}
                    />
                  </div>
                </div>
              )}
            </div>
          </form>

          {/* FOOTER */}
          <div className="px-8 py-5 border-t border-gray-100 dark:border-neutral-800 bg-gray-50 dark:bg-[#1a1a1a] flex justify-between gap-3">
            {isEditing && (
              <button
                type="button"
                onClick={handleDeleteComision}
                disabled={eliminar.isPending}
                className="flex items-center gap-2 px-4 py-2.5 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl font-bold text-sm transition-colors disabled:opacity-50"
              >
                {eliminar.isPending ? <Loader2 size={18} className="animate-spin" /> : <Trash2 size={18} />}
                <span className="hidden sm:inline">Eliminar Actividad</span>
              </button>
            )}

            <div className="flex gap-3 ml-auto w-full sm:w-auto">
              <button type="button" onClick={onClose} className="flex-1 sm:flex-none px-6 py-2.5 text-gray-600 hover:bg-white dark:text-gray-300 dark:hover:bg-neutral-800 border border-transparent hover:border-gray-200 dark:hover:border-neutral-700 rounded-xl font-bold text-sm transition-all">
                Cancelar
              </button>
              <button
                type="submit"
                form="form-comision"
                disabled={guardar.isPending || (integrantes.length === 0 && !isEditing)}
                className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-8 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-sm shadow-xl shadow-blue-500/20 disabled:opacity-70 transition-all transform active:scale-95"
              >
                {guardar.isPending ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
                {isEditing ? 'Guardar Cambios' : 'Crear Actividad'}
              </button>
            </div>
          </div>
        </div>
      </div>

      <GestorEquipos
        isOpen={isGestorOpen}
        onClose={() => setIsGestorOpen(false)}
        usuarios={usuarios}
        onSelectPlantilla={(id) => handleSelectPlantilla(id)}
      />
    </>
  );
}