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
 * Representa la estructura de un archivo package.json
 */
export type PackageJson = {
  readonly name: string;
  readonly version: string;
  readonly description?: string;
  readonly main?: string;
  readonly scripts?: Record<string, string>;
  readonly dependencies?: Dependencias;
  readonly devDependencies?: Dependencias;
  readonly peerDependencies?: Dependencias;
  readonly engines?: {
    readonly node?: string;
    readonly npm?: string;
  };
};

/**
 * Representa un conflicto entre dependencias
 */
export type ConflictoDependencia = {
  readonly paquete: string;
  readonly versionRequerida: string;
  readonly versionesConflictivas: Array<{
    readonly dependencia: string;
    readonly versionRequerida: string;
  }>;
  readonly solucionRecomendada?: string;
};

/**
 * Representa una actualización posible para un paquete
 */
export type ActualizacionPaquete = {
  readonly paquete: string;
  readonly versionActual: string;
  readonly versionDisponible: string;
  readonly esSegura: boolean;
  readonly cambios?: string[];
};

/**
 * Resultado del análisis de compatibilidad de Node.js
 */
export type ResultadoCompatibilidadNode = {
  readonly versionRequerida: string;
  readonly versionActual: string;
  readonly esCompatible: boolean;
  readonly recomendacion?: string;
};

/**
 * Resultado completo del análisis de un proyecto
 */
export type ResultadoAnalisis = {
  readonly compatibilidadNode: ResultadoCompatibilidadNode;
  readonly conflictos: ConflictoDependencia[];
  readonly actualizacionesPosibles: ActualizacionPaquete[];
  readonly optimizacionesSugeridas: string[];
};
