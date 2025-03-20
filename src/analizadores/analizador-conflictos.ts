/**
 * Analizador de conflictos entre dependencias
 */
import * as semver from 'semver';
import { Dependencias, ConflictoDependencia } from '../tipos/tipos-proyecto';
import { sonRangosCompatibles, obtenerVersionMasReciente } from '../utilidades/version-utilidades';

/**
 * Analiza los conflictos entre las dependencias de un proyecto
 * @param dependencias - Objeto con todas las dependencias del proyecto
 * @param dependenciasAnidadas - Mapa de dependencias anidadas (paquete -> sus dependencias)
 * @returns Lista de conflictos encontrados
 */
export const analizarConflictosDependencias = (
  dependencias: Dependencias,
  dependenciasAnidadas: Map<string, Dependencias>
): ConflictoDependencia[] => {
  const conflictos: ConflictoDependencia[] = [];
  const dependenciasProcesadas = new Set<string>();
  
  // Para cada dependencia, verificar conflictos con otras dependencias
  Object.entries(dependencias).forEach(([paquete, versionRequerida]) => {
    // Evitar procesar la misma dependencia más de una vez
    if (dependenciasProcesadas.has(paquete)) {
      return;
    }
    dependenciasProcesadas.add(paquete);
    
    const versionesConflictivas: Array<{
      readonly dependencia: string;
      readonly versionRequerida: string;
    }> = [];
    
    // Buscar conflictos en las dependencias anidadas
    dependenciasAnidadas.forEach((deps, dependenciaPadre) => {
      if (deps[paquete] && !sonRangosCompatibles(versionRequerida, deps[paquete])) {
        versionesConflictivas.push({
          dependencia: dependenciaPadre,
          versionRequerida: deps[paquete]
        });
      }
    });
    
    // Si hay conflictos, añadir a la lista
    if (versionesConflictivas.length > 0) {
      // Intentar encontrar una solución
      const todasVersiones = [versionRequerida, ...versionesConflictivas.map(v => v.versionRequerida)];
      const versionesPrueba = [];
      for (let major = 0; major < 20; major++) {
        for (let minor = 0; minor < 20; minor++) {
          for (let patch = 0; patch < 5; patch++) {
            versionesPrueba.push(`${major}.${minor}.${patch}`);
          }
        }
      }
      
      // Buscar versiones que satisfagan todos los rangos
      const versionesCompatibles = versionesPrueba.filter(v => 
        todasVersiones.every(rango => semver.satisfies(v, rango))
      );
      
      let solucionRecomendada: string | undefined;
      if (versionesCompatibles.length > 0) {
        const versionMasReciente = obtenerVersionMasReciente(versionesCompatibles, '*');
        if (versionMasReciente) {
          solucionRecomendada = `Usar la versión ${versionMasReciente} que es compatible con todos los requisitos.`;
        }
      }
      
      conflictos.push({
        paquete,
        versionRequerida,
        versionesConflictivas,
        solucionRecomendada
      });
    }
  });
  
  return conflictos;
};

/**
 * Simula la obtención de dependencias anidadas (en una implementación real, esto requeriría
 * analizar los package.json de cada dependencia instalada)
 * @param dependencias - Dependencias directas del proyecto
 * @returns Mapa de dependencias anidadas
 */
export const obtenerDependenciasAnidadas = async (
  dependencias: Dependencias
): Promise<Map<string, Dependencias>> => {
  // Esta es una implementación simulada
  // En una implementación real, se analizarían los node_modules
  const dependenciasAnidadas = new Map<string, Dependencias>();
  
  // Simulamos algunas dependencias anidadas para demostración
  // En una implementación real, esto se obtendría de los package.json en node_modules
  if (dependencias['react']) {
    dependenciasAnidadas.set('react', {
      'loose-envify': '^1.1.0',
      'object-assign': '^4.1.1'
    });
  }
  
  if (dependencias['express']) {
    dependenciasAnidadas.set('express', {
      'accepts': '~1.3.8',
      'array-flatten': '1.1.1',
      'body-parser': '1.20.1',
      'debug': '2.6.9'
    });
  }
  
  return dependenciasAnidadas;
};
