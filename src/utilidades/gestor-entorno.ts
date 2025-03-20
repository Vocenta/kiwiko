/**
 * Utilidades para gestionar el entorno de Node.js utilizando Volta
 */
import * as fs from 'fs';
import * as path from 'path';
import { promisify } from 'util';
import { exec as execCallback } from 'child_process';
import * as semver from 'semver';

// Promisificar exec para usar async/await
const exec = promisify(execCallback);

/**
 * Resultado de la verificación de Volta
 */
export type ResultadoVerificacionVolta = {
  readonly instalado: boolean;
  readonly version?: string;
  readonly error?: string;
};

/**
 * Resultado de la creación de un entorno encapsulado
 */
export type ResultadoCreacionEntorno = {
  readonly exito: boolean;
  readonly mensaje: string;
  readonly error?: string;
};

/**
 * Verifica si Volta está instalado en el sistema
 * @returns Resultado de la verificación
 */
export const verificarVolta = async (): Promise<ResultadoVerificacionVolta> => {
  try {
    const { stdout } = await exec('volta --version');
    return {
      instalado: true,
      version: stdout.trim()
    };
  } catch (error) {
    return {
      instalado: false,
      error: error instanceof Error ? error.message : String(error)
    };
  }
};

/**
 * Instala Volta en el sistema si no está instalado
 * @returns Resultado de la instalación
 */
export const instalarVolta = async (): Promise<ResultadoCreacionEntorno> => {
  try {
    // En Windows, recomendamos la instalación manual
    if (process.platform === 'win32') {
      return {
        exito: false,
        mensaje: 'Para instalar Volta en Windows, por favor visita https://volta.sh y sigue las instrucciones de instalación.'
      };
    }
    
    // En Linux/macOS podemos usar el script de instalación
    await exec('curl https://get.volta.sh | bash');
    return {
      exito: true,
      mensaje: 'Volta ha sido instalado correctamente. Por favor, reinicia tu terminal para usar Volta.'
    };
  } catch (error) {
    return {
      exito: false,
      mensaje: 'Error al instalar Volta',
      error: error instanceof Error ? error.message : String(error)
    };
  }
};

/**
 * Configura un proyecto para usar una versión específica de Node.js con Volta
 * @param versionNode - Versión de Node.js a usar
 * @param directorio - Directorio del proyecto
 * @returns Resultado de la configuración
 */
export const configurarVersionNodeConVolta = async (
  versionNode: string,
  directorio: string = process.cwd()
): Promise<ResultadoCreacionEntorno> => {
  try {
    // Verificar si Volta está instalado
    const verificacion = await verificarVolta();
    if (!verificacion.instalado) {
      return {
        exito: false,
        mensaje: 'Volta no está instalado. Por favor, instálalo primero.',
        error: verificacion.error
      };
    }
    
    // Normalizar la versión de Node.js
    const versionNormalizada = semver.valid(semver.coerce(versionNode));
    if (!versionNormalizada) {
      return {
        exito: false,
        mensaje: `La versión de Node.js "${versionNode}" no es válida.`
      };
    }
    
    // Configurar el proyecto para usar la versión específica de Node.js
    await exec(`volta pin node@${versionNormalizada}`, { cwd: directorio });
    
    return {
      exito: true,
      mensaje: `El proyecto ha sido configurado para usar Node.js ${versionNormalizada} con Volta.`
    };
  } catch (error) {
    return {
      exito: false,
      mensaje: 'Error al configurar el proyecto con Volta',
      error: error instanceof Error ? error.message : String(error)
    };
  }
};

/**
 * Instala dependencias globales en el entorno encapsulado de Volta
 * @param paquetes - Lista de paquetes a instalar
 * @returns Resultado de la instalación
 */
export const instalarDependenciasGlobales = async (
  paquetes: string[]
): Promise<ResultadoCreacionEntorno> => {
  if (paquetes.length === 0) {
    return {
      exito: true,
      mensaje: 'No hay paquetes para instalar.'
    };
  }
  
  try {
    // Verificar si Volta está instalado
    const verificacion = await verificarVolta();
    if (!verificacion.instalado) {
      return {
        exito: false,
        mensaje: 'Volta no está instalado. Por favor, instálalo primero.',
        error: verificacion.error
      };
    }
    
    // Instalar los paquetes globalmente con Volta
    const paquetesString = paquetes.join(' ');
    await exec(`volta install ${paquetesString}`);
    
    return {
      exito: true,
      mensaje: `Los siguientes paquetes han sido instalados globalmente: ${paquetesString}`
    };
  } catch (error) {
    return {
      exito: false,
      mensaje: 'Error al instalar dependencias globales',
      error: error instanceof Error ? error.message : String(error)
    };
  }
};

/**
 * Instala las dependencias locales del proyecto
 * @param directorio - Directorio del proyecto
 * @returns Resultado de la instalación
 */
export const instalarDependenciasProyecto = async (
  directorio: string = process.cwd()
): Promise<ResultadoCreacionEntorno> => {
  try {
    // Verificar si existe package.json
    const rutaPackageJson = path.join(directorio, 'package.json');
    if (!fs.existsSync(rutaPackageJson)) {
      return {
        exito: false,
        mensaje: 'No se encontró el archivo package.json en el directorio especificado.'
      };
    }
    
    // Instalar dependencias
    await exec('npm install', { cwd: directorio });
    
    return {
      exito: true,
      mensaje: 'Las dependencias del proyecto han sido instaladas correctamente.'
    };
  } catch (error) {
    return {
      exito: false,
      mensaje: 'Error al instalar las dependencias del proyecto',
      error: error instanceof Error ? error.message : String(error)
    };
  }
};
