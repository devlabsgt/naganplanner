// Tipos de roles disponibles en el sistema (en minúscula, tal como se guardan en Supabase)
export type Rol = 'user' | 'super' | 'admin' | 'rrhh';

// Tipo de un módulo del sistema
export interface Modulo {
  id: string;
  titulo: string;
  descripcion: string;
  ruta: string;
  iconKey: string; // Key de lordicon CDN
  color?: {
    primaryColor?: string;
    secondaryColor?: string;
  };
  categoria: 'Planificación' | 'Administración' | 'Recursos Humanos';
  // Si está vacío, lo pueden ver todos los roles. Si es 'TODOS', también.
  rolesPermitidos: Rol[] | 'TODOS';
  // Si es true, solo los usuarios con estado de jefe pueden verlo.
  soloJefe?: boolean;
}

// Fuente de verdad de todos los módulos del sistema NAGÁN
export const TODOS_LOS_MODULOS: Modulo[] = [
  {
    id: 'PLANIFICADOR',
    titulo: 'Planificador de Actividades',
    descripcion: 'Gestión de actividades, grupos y asignaciones.',
    ruta: '/kore/planificador',
    iconKey: 'ctuxkbtj',
    color: {
      primaryColor: '#f59e0b', // amber-500
    },
    categoria: 'Planificación',
    rolesPermitidos: 'TODOS',
    soloJefe: true,
  },
  {
    id: 'ALABANZA',
    titulo: 'Departamento de Alabanza',
    descripcion: 'Gestión de actividades del departamento de alabanza.',
    ruta: '/kore/planificador/alabanza',
    iconKey: 'jlhrsjqp',
    color: {
      primaryColor: '#3b82f6', // blue-500
    },
    categoria: 'Planificación',
    rolesPermitidos: 'TODOS',
  },
  {
    id: 'DANZA',
    titulo: 'Departamento de Danza',
    descripcion: 'Gestión de actividades del departamento de danza.',
    ruta: '/kore/planificador/danza',
    iconKey: 'hwszmalz',
    color: {
      primaryColor: '#ec4899', // pink-500
    },
    categoria: 'Planificación',
    rolesPermitidos: 'TODOS',
  },
  {
    id: 'MULTIMEDIA',
    titulo: 'Departamento de Multimedia',
    descripcion: 'Gestión de actividades del departamento de multimedia.',
    ruta: '/kore/planificador/multimedia',
    iconKey: 'rhrmfnhf',
    color: {
      primaryColor: '#06b6d4', // cyan-500
    },
    categoria: 'Planificación',
    rolesPermitidos: 'TODOS',
  },
  {
    id: 'ORGANIZACION',
    titulo: 'Organización',
    descripcion: 'Estructura organizacional, departamentos y puestos.',
    ruta: '/kore/admin',
    iconKey: 'giblkgwf',
    color: {
      primaryColor: '#a855f7', // purple-500
    },
    categoria: 'Administración',
    rolesPermitidos: ['admin', 'super'],
  },
  {
    id: 'ACTIVIDADES_GLOBALES',
    titulo: 'Actividades Globales',
    descripcion: 'Vista general de todas las actividades de todos los departamentos.',
    ruta: '/kore/planificador/admin',
    iconKey: 'dkvquwgz',
    color: {
      primaryColor: '#6366f1', // indigo-500
    },
    categoria: 'Administración',
    rolesPermitidos: ['admin', 'super', 'rrhh'],
  },
  {
    id: 'ESCUELAS',
    titulo: 'Escuelas de Aprendizaje Espiritual',
    descripcion: 'Gestión de actividades del ministerio de danza.',
    ruta: '/kore/planificador/escolas',
    iconKey: 'nhkwajfc',
    color: {
      primaryColor: '#53be0bff', // green-500
    },
    categoria: 'Planificación',
    rolesPermitidos: 'TODOS',
  },
];
