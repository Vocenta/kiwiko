/**
 * Analizador de actualizaciones disponibles para dependencias
 */
import * as semver from 'semver';
import axios from 'axios';
import { Dependencias, ActualizacionPaquete } from '../tipos/tipos-proyecto';
import { esActualizacionSegura } from '../utilidades/version-utilidades';

/**
 * Interfaz para la respuesta del registro de npm
 */
type RespuestaNpm = {
  readonly name: string;
  readonly 'dist-tags': {
    readonly latest: string;
    readonly [tag: string]: string;
  };
  readonly versions: {
    readonly [version: string]: {
      readonly version: string;
      readonly deprecated?: string;
    };
  };
  readonly time: {
    readonly [version: string]: string;
  };
};

/**
 * Obtiene información de un paquete desde el registro de npm
 * @param nombrePaquete - Nombre del paquete a consultar
 * @returns Información del paquete o undefined si hay error
 */
const obtenerInfoPaquete = async (nombrePaquete: string): Promise<RespuestaNpm | undefined> => {
  try {
    const respuesta = await axios.get<RespuestaNpm>(`https://registry.npmjs.org/${nombrePaquete}`);
    return respuesta.data;
  } catch (error) {
    console.error(`Error al obtener información del paquete ${nombrePaquete}: ${error instanceof Error ? error.message : String(error)}`);
    return undefined;
  }
};

/**
 * Analiza las actualizaciones disponibles para las dependencias del proyecto
 * @param dependencias - Dependencias del proyecto
 * @returns Lista de actualizaciones posibles
 */
export const analizarActualizacionesDependencias = async (
  dependencias: Dependencias
): Promise<ActualizacionPaquete[]> => {
  const actualizaciones: ActualizacionPaquete[] = [];
  
  // Procesar cada dependencia
  for (const [paquete, versionActual] of Object.entries(dependencias)) {
    try {
      // Obtener información del paquete desde npm
      const infoPaquete = await obtenerInfoPaquete(paquete);
      if (!infoPaquete) continue;
      
      const versionActualNormalizada = semver.clean(versionActual.replace(/[~^]/, '')) || versionActual;
      const versionLatest = infoPaquete['dist-tags'].latest;
      
      // Verificar si hay una versión más reciente
      if (semver.gt(versionLatest, versionActualNormalizada)) {
        // Determinar si la actualización es segura
        const esSegura = esActualizacionSegura(versionActualNormalizada, versionLatest);
        
        // Obtener cambios relevantes (simulado)
        const cambios = obtenerCambiosRelevantes(infoPaquete, versionActualNormalizada, versionLatest);
        
        actualizaciones.push({
          paquete,
          versionActual: versionActualNormalizada,
          versionDisponible: versionLatest,
          esSegura,
          cambios
        });
      }
    } catch (error) {
      console.error(`Error al analizar actualizaciones para ${paquete}: ${error instanceof Error ? error.message : String(error)}`);
    }
  }
  
  return actualizaciones;
};

/**
 * Simula la obtención de cambios relevantes entre versiones
 * @param infoPaquete - Información del paquete
 * @param versionActual - Versión actual
 * @param versionNueva - Versión nueva
 * @returns Lista de cambios relevantes
 */
const obtenerCambiosRelevantes = (
  infoPaquete: RespuestaNpm,
  versionActual: string,
  versionNueva: string
): string[] => {
  // En una implementación real, esto podría obtener los cambios del changelog
  // o del historial de commits. Aquí simplemente simulamos algunos cambios.
  const cambios: string[] = [];
  
  // Obtener todas las versiones entre la actual y la nueva
  const todasVersiones = Object.keys(infoPaquete.versions)
    .filter(v => semver.gt(v, versionActual) && semver.lte(v, versionNueva))
    .sort(semver.compare);
  
  // Simulamos algunos cambios basados en el tipo de actualización
  if (todasVersiones.length > 0) {
    const actualParsed = semver.parse(versionActual);
    const nuevaParsed = semver.parse(versionNueva);
    
    if (actualParsed && nuevaParsed) {
      if (nuevaParsed.major > actualParsed.major) {
        cambios.push(`Cambio de versión mayor (${actualParsed.major} -> ${nuevaParsed.major}): posibles cambios que rompen compatibilidad`);
      } else if (nuevaParsed.minor > actualParsed.minor) {
        cambios.push(`Nuevas funcionalidades añadidas en la versión ${versionNueva}`);
      } else {
        cambios.push(`Correcciones de errores y mejoras de rendimiento`);
      }
    }
    
    // Añadir información sobre versiones deprecadas
    todasVersiones.forEach(v => {
      if (infoPaquete.versions[v].deprecated) {
        cambios.push(`Versión ${v} marcada como deprecada: ${infoPaquete.versions[v].deprecated}`);
      }
    });
  }
  
  return cambios;
};
