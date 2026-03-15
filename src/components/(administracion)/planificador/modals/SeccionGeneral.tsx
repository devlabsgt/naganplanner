import { Calendar, AlignLeft } from 'lucide-react';

interface Props {
  title: string;
  setTitle: (v: string) => void;
  description: string;
  setDescription: (v: string) => void;
  dueDate: string;
  setDueDate: (v: string) => void;
  disabled: boolean;
}

export function SeccionGeneral({ title, setTitle, description, setDescription, dueDate, setDueDate, disabled }: Props) {
  return (
    <div className="space-y-5">
      <div>
        <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Nombre del Evento</label>
        <input 
          value={title} 
          onChange={e => setTitle(e.target.value)}
          disabled={disabled}
          className={`w-full px-4 py-3.5 bg-gray-50 dark:bg-neutral-900/50 border border-gray-200 dark:border-neutral-800 rounded-2xl text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all font-medium ${disabled ? 'opacity-60 cursor-not-allowed' : ''}`}
          placeholder="Ej. Concierto de Primavera..."
          autoFocus={!disabled}
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <div>
          <label className="text-xs font-bold text-gray-400 uppercase mb-2 flex gap-2"><Calendar size={14}/> Fecha y Hora</label>
          <input 
            type="datetime-local"
            value={dueDate}
            onChange={e => setDueDate(e.target.value)}
            disabled={disabled}
            className={`w-full px-4 py-3 bg-gray-50 dark:bg-neutral-900/50 border border-gray-200 dark:border-neutral-800 rounded-2xl text-gray-900 dark:text-white outline-none color-scheme: dark; ${disabled ? 'opacity-60 cursor-not-allowed' : ''}`}
          />
        </div>
      </div>

      <div>
        <label className="text-xs font-bold text-gray-400 uppercase mb-2 flex gap-2"><AlignLeft size={14}/> Descripción (Opcional)</label>
        <textarea 
          value={description}
          onChange={e => setDescription(e.target.value)}
          rows={2}
          className="w-full px-4 py-3 bg-gray-50 dark:bg-neutral-900/50 border border-gray-200 dark:border-neutral-800 rounded-2xl text-gray-900 dark:text-white outline-none resize-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
          placeholder="Detalles del repertorio o logística..."
        />
      </div>
    </div>
  );
}