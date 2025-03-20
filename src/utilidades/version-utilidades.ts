/**
 * Utilidades para trabajar con versiones de paquetes
 */
import * as semver from 'semver';

/**
 * Comprueba si una versión es compatible con un rango de versiones
 * @param version - Versión a comprobar
 * @param rango - Rango de versiones con el que comprobar compatibilidad
 * @returns Verdadero si la versión es compatible con el rango
 */
export const esVersionCompatible = (version: string, rango: string): boolean => {
  return semver.satisfies(version, rango);
};

/**
 * Comprueba si una actualización es segura (solo cambia el número de parche)
 * @param versionActual - Versión actual del paquete
 * @param versionNueva - Nueva versión del paquete
 * @returns Verdadero si la actualización es segura
 */
export const esActualizacionSegura = (versionActual: string, versionNueva: string): boolean => {
  const actual = semver.parse(versionActual);
  const nueva = semver.parse(versionNueva);
  if (!actual || !nueva) {
    return false;
  }
  return actual.major === nueva.major && actual.minor === nueva.minor;
};

/**
 * Normaliza un rango de versiones para facilitar comparaciones
 * @param rango - Rango de versiones a normalizar
 * @returns Rango normalizado o null si no es válido
 */
export const normalizarRangoVersion = (rango: string): string | null => {
  return semver.validRange(rango);
};

/**
 * Obtiene la versión más reciente que satisface un rango
 * @param versiones - Lista de versiones disponibles
 * @param rango - Rango de versiones a satisfacer
 * @returns La versión más reciente que satisface el rango o null si ninguna lo hace
 */
export const obtenerVersionMasReciente = (versiones: string[], rango: string): string | null => {
  return semver.maxSatisfying(versiones, rango);
};

/**
 * Compara dos rangos de versiones para determinar si son compatibles
 * @param rango1 - Primer rango de versiones
 * @param rango2 - Segundo rango de versiones
 * @returns Verdadero si los rangos son compatibles (tienen intersección)
 */
export const sonRangosCompatibles = (rango1: string, rango2: string): boolean => {
  const r1 = semver.validRange(rango1);
  const r2 = semver.validRange(rango2);
  if (!r1 || !r2) {
    return false;
  }
  // Intentamos encontrar una versión que satisfaga ambos rangos
  // Creamos un conjunto de versiones de prueba
  const versionesPrueba = [];
  for (let major = 0; major < 20; major++) {
    for (let minor = 0; minor < 20; minor++) {
      for (let patch = 0; patch < 5; patch++) {
        versionesPrueba.push(`${major}.${minor}.${patch}`);
      }
    }
  }
  return versionesPrueba.some(v => semver.satisfies(v, r1) && semver.satisfies(v, r2));
};
