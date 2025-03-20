/**
 * Utilidades para leer y analizar archivos package.json
 */
import * as fs from 'fs';
import * as path from 'path';
import { PackageJson } from '../tipos/tipos-proyecto';

/**
 * Lee el archivo package.json del directorio actual o especificado
 * @param directorio - Directorio donde buscar el package.json (opcional)
 * @returns Contenido del package.json parseado o undefined si no existe
 */
export const leerPackageJson = (directorio: string = process.cwd()): PackageJson | undefined => {
  try {
    const rutaPackageJson = path.join(directorio, 'package.json');
    if (!fs.existsSync(rutaPackageJson)) {
      return undefined;
    }
    const contenido = fs.readFileSync(rutaPackageJson, 'utf-8');
    return JSON.parse(contenido) as PackageJson;
  } catch (error) {
    console.error(`Error al leer package.json: ${error instanceof Error ? error.message : String(error)}`);
    return undefined;
  }
};

/**
 * Obtiene todas las dependencias de un package.json (prod, dev y peer)
 * @param packageJson - Objeto package.json parseado
 * @returns Objeto con todas las dependencias combinadas
 */
export const obtenerTodasDependencias = (packageJson: PackageJson): Record<string, string> => {
  const todasDependencias: Record<string, string> = {};
  
  // Combinar todas las dependencias
  if (packageJson.dependencies) {
    Object.entries(packageJson.dependencies).forEach(([paquete, version]) => {
      todasDependencias[paquete] = version;
    });
  }
  
  if (packageJson.devDependencies) {
    Object.entries(packageJson.devDependencies).forEach(([paquete, version]) => {
      if (!todasDependencias[paquete]) {
        todasDependencias[paquete] = version;
      }
    });
  }
  
  if (packageJson.peerDependencies) {
    Object.entries(packageJson.peerDependencies).forEach(([paquete, version]) => {
      if (!todasDependencias[paquete]) {
        todasDependencias[paquete] = version;
      }
    });
  }
  
  return todasDependencias;
};

/**
 * Obtiene la versión de Node.js requerida por el proyecto
 * @param packageJson - Objeto package.json parseado
 * @returns Versión de Node.js requerida o undefined si no está especificada
 */
export const obtenerVersionNodeRequerida = (packageJson: PackageJson): string | undefined => {
  return packageJson.engines?.node;
};

/**
 * Verifica si un package.json tiene una estructura válida
 * @param packageJson - Objeto package.json a validar
 * @returns Verdadero si el package.json es válido
 */
export const esPackageJsonValido = (packageJson: unknown): packageJson is PackageJson => {
  if (!packageJson || typeof packageJson !== 'object') {
    return false;
  }
  
  const pkg = packageJson as Record<string, unknown>;
  
  // Verificar campos obligatorios
  if (!pkg.name || typeof pkg.name !== 'string') {
    return false;
  }
  
  if (!pkg.version || typeof pkg.version !== 'string') {
    return false;
  }
  
  return true;
};
