/**
 * Analizador de compatibilidad de versiones de Node.js
 */
import * as semver from 'semver';
import { ResultadoCompatibilidadNode } from '../tipos/tipos-proyecto';

/**
 * Analiza la compatibilidad de la versión actual de Node.js con la requerida por el proyecto
 * @param versionRequerida - Versión de Node.js requerida por el proyecto
 * @returns Resultado del análisis de compatibilidad
 */
export const analizarCompatibilidadNode = (versionRequerida?: string): ResultadoCompatibilidadNode => {
  const versionActual = process.version;
  
  // Si no hay versión requerida, consideramos que es compatible
  if (!versionRequerida) {
    return {
      versionRequerida: '*',
      versionActual,
      esCompatible: true
    };
  }
  
  const esCompatible = semver.satisfies(versionActual, versionRequerida);
  
  let recomendacion: string | undefined;
  if (!esCompatible) {
    const versionRequeridaMin = semver.minVersion(versionRequerida);
    if (versionRequeridaMin && semver.lt(versionActual, versionRequeridaMin.version)) {
      recomendacion = `Se recomienda actualizar Node.js a la versión ${versionRequeridaMin.version} o superior.`;
    } else {
      recomendacion = `Se recomienda usar una versión de Node.js que cumpla con el requisito: ${versionRequerida}.`;
    }
  }
  
  return {
    versionRequerida,
    versionActual,
    esCompatible,
    recomendacion
  };
};
