/**
 * Optimizador para mejorar la carga de instalación de dependencias
 */
import { Dependencias } from '../tipos/tipos-proyecto';

/**
 * Analiza las dependencias y sugiere optimizaciones para la instalación
 * @param dependencias - Dependencias del proyecto
 * @param devDependencias - Dependencias de desarrollo
 * @returns Lista de sugerencias de optimización
 */
export const analizarOptimizacionesInstalacion = (
  dependencias: Dependencias = {},
  devDependencias: Dependencias = {}
): string[] => {
  const sugerencias: string[] = [];
  
  // Verificar dependencias duplicadas en prod y dev
  const dependenciasDuplicadas = Object.keys(dependencias)
    .filter(dep => Object.keys(devDependencias).includes(dep));
  
  if (dependenciasDuplicadas.length > 0) {
    sugerencias.push(
      `Se encontraron dependencias duplicadas en 'dependencies' y 'devDependencies': ${dependenciasDuplicadas.join(', ')}. ` +
      'Considera moverlas solo a una de las secciones.'
    );
  }
  
  // Verificar dependencias que deberían estar en devDependencies
  const dependenciasComunes = [
    'eslint', 'prettier', 'typescript', 'jest', 'mocha', 'chai', 'babel',
    'webpack', 'rollup', 'gulp', 'grunt', 'karma', 'jasmine', 'nyc', 'tslint'
  ];
  
  const dependenciasDevMalUbicadas = Object.keys(dependencias)
    .filter(dep => 
      dependenciasComunes.some(devDep => 
        dep === devDep || dep.startsWith(`${devDep}-`) || dep.startsWith(`@types/`)
      )
    );
  
  if (dependenciasDevMalUbicadas.length > 0) {
    sugerencias.push(
      `Las siguientes dependencias deberían estar en 'devDependencies' en lugar de 'dependencies': ${dependenciasDevMalUbicadas.join(', ')}`
    );
  }
  
  // Verificar si hay demasiadas dependencias
  const totalDependencias = Object.keys(dependencias).length + Object.keys(devDependencias).length;
  if (totalDependencias > 50) {
    sugerencias.push(
      `El proyecto tiene ${totalDependencias} dependencias, lo que puede ralentizar la instalación. ` +
      'Considera revisar si todas son necesarias o si algunas pueden consolidarse.'
    );
  }
  
  // Sugerir uso de pnpm para mejorar la velocidad de instalación
  sugerencias.push(
    'Considera usar pnpm en lugar de npm para mejorar la velocidad de instalación y reducir el espacio en disco.'
  );
  
  // Sugerir uso de cache para CI/CD
  sugerencias.push(
    'Para entornos CI/CD, asegúrate de cachear node_modules para acelerar las instalaciones.'
  );
  
  return sugerencias;
};

/**
 * Analiza las dependencias para detectar paquetes obsoletos o sin mantenimiento
 * @param dependencias - Todas las dependencias del proyecto
 * @param paquetesObsoletos - Mapa de paquetes obsoletos y sus alternativas recomendadas
 * @returns Lista de sugerencias sobre paquetes obsoletos
 */
export const analizarPaquetesObsoletos = (
  dependencias: Dependencias,
  paquetesObsoletos: Map<string, string> = obtenerPaquetesObsoletosConocidos()
): string[] => {
  const sugerencias: string[] = [];
  
  // Verificar si hay paquetes obsoletos
  Object.keys(dependencias).forEach(paquete => {
    if (paquetesObsoletos.has(paquete)) {
      sugerencias.push(
        `El paquete '${paquete}' está obsoleto o sin mantenimiento. ` +
        `Considera usar ${paquetesObsoletos.get(paquete)} como alternativa.`
      );
    }
  });
  
  return sugerencias;
};

/**
 * Obtiene un mapa de paquetes obsoletos conocidos y sus alternativas recomendadas
 * @returns Mapa de paquetes obsoletos y sus alternativas
 */
const obtenerPaquetesObsoletosConocidos = (): Map<string, string> => {
  const paquetesObsoletos = new Map<string, string>();
  
  // Lista de paquetes obsoletos conocidos y sus alternativas
  paquetesObsoletos.set('request', 'node-fetch, axios o got');
  paquetesObsoletos.set('left-pad', 'String.prototype.padStart');
  paquetesObsoletos.set('gulp', 'webpack, rollup o esbuild');
  paquetesObsoletos.set('bower', 'npm o yarn');
  paquetesObsoletos.set('tslint', 'eslint con typescript-eslint');
  paquetesObsoletos.set('moment', 'date-fns o luxon');
  paquetesObsoletos.set('underscore', 'lodash o funciones nativas de JavaScript');
  paquetesObsoletos.set('coffeescript', 'TypeScript o JavaScript moderno');
  
  return paquetesObsoletos;
};
