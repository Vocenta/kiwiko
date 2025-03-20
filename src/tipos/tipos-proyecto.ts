/**
 * Define los tipos de datos utilizados para representar información de proyectos Node.js
 */

/**
 * Representa la información de un paquete en package.json
 */
export type InfoPaquete = {
  readonly nombre: string;
  readonly version: string;
  readonly descripcion?: string;
};

/**
 * Representa las dependencias de un proyecto
 */
export type Dependencias = {
  readonly [paquete: string]: string;
};

/**
 * Tipos relacionados con proyectos Node.js
 */

export interface PackageJson {
  name: string;
  version: string;
  description?: string;
  main?: string;
  scripts?: { [key: string]: string };
  dependencies?: { [key: string]: string };
  devDependencies?: { [key: string]: string };
  engines?: { node?: string };
}

export interface ResultadoCompatibilidadNode {
  esCompatible: boolean;
  versionRequerida?: string;
  versionActual: string;
  recomendacion?: string;
}

export interface ConflictoDependencia {
  paquete: string;
  versionRequerida: string;
  versionesConflictivas: Array<{
    dependencia: string;
    versionRequerida: string;
  }>;
  solucionRecomendada?: string;
}

export interface ActualizacionPosible {
  paquete: string;
  versionActual: string;
  versionDisponible: string;
  esSegura: boolean;
  cambios?: string[];
}

export interface OptimizacionSugerida {
  tipo: 'instalacion' | 'performance' | 'seguridad' | 'mantenimiento';
  descripcion: string;
  prioridad: 'alta' | 'media' | 'baja';
  acciones: string[];
}

export interface ResultadoAnalisis {
  compatibilidadNode: ResultadoCompatibilidadNode;
  conflictos: ConflictoDependencia[];
  actualizacionesPosibles: ActualizacionPosible[];
  optimizacionesSugeridas: OptimizacionSugerida[];
}

export interface ResultadoVerificacionVolta {
  instalado: boolean;
  version?: string;
  error?: string;
}

export interface ResultadoCreacionEntorno {
  exito: boolean;
  mensaje: string;
  error?: string;
}
