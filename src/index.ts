/**
 * Módulo principal de la biblioteca kiwiko
 */
import * as fs from 'fs';
import * as path from 'path';
import * as chalk from 'chalk';
import ora from 'ora';
import { 
  analizarCompatibilidadNode,
  analizarConflictosDependencias,
  analizarActualizaciones,
  analizarOptimizaciones
} from './analizadores';
import { 
  ResultadoAnalisis,
  ResultadoCompatibilidadNode,
  ConflictoDependencia,
  ActualizacionPosible,
  OptimizacionSugerida
} from './tipos/tipos-proyecto';
import { ejecutarComando } from './utilidades/ejecutar-comando';

/**
 * Verifica si Volta está instalado en el sistema
 * @returns Resultado de la verificación
 */
export const verificarVoltaInstalado = async (): Promise<{ instalado: boolean, version?: string }> => {
  try {
    const resultado = await ejecutarComando('volta --version');
    return {
      instalado: true,
      version: resultado.stdout.trim()
    };
  } catch (error) {
    return {
      instalado: false
    };
  }
};

/**
 * Configura un entorno encapsulado con Volta
 * @param versionNode - Versión de Node.js a usar
 * @param directorio - Directorio del proyecto
 * @returns Resultado de la configuración
 */
export const configurarEntornoVolta = async (
  versionNode: string,
  directorio: string
): Promise<{ exito: boolean, mensaje: string, error?: string }> => {
  try {
    const spinner = ora('Configurando entorno con Volta...').start();
    
    // Configurar Node.js
    await ejecutarComando(`volta pin node@${versionNode}`, { cwd: directorio });
    
    // Instalar dependencias del proyecto
    await ejecutarComando('npm install', { cwd: directorio });
    
    spinner.succeed(chalk.green('Entorno configurado correctamente'));
    return {
      exito: true,
      mensaje: 'Entorno configurado correctamente'
    };
  } catch (error) {
    const mensajeError = error instanceof Error ? error.message : String(error);
    return {
      exito: false,
      mensaje: 'Error al configurar el entorno',
      error: mensajeError
    };
  }
};

/**
 * Analiza un proyecto Node.js para verificar compatibilidad, conflictos y optimizaciones
 * @param directorio - Directorio del proyecto a analizar (opcional, por defecto directorio actual)
 * @returns Resultado completo del análisis o undefined si no se pudo leer el package.json
 */
export const analizarProyecto = async (directorio?: string): Promise<ResultadoAnalisis | undefined> => {
  try {
    // Leer el package.json
    const rutaPackageJson = path.join(directorio || process.cwd(), 'package.json');
    const contenido = await fs.promises.readFile(rutaPackageJson, 'utf-8');
    const packageJson = JSON.parse(contenido);

    // Analizar compatibilidad de Node.js
    const compatibilidad = analizarCompatibilidadNode(packageJson.engines?.node);

    // Analizar conflictos entre dependencias
    const conflictos = analizarConflictosDependencias(packageJson.dependencies);

    // Analizar posibles actualizaciones
    const actualizaciones = await analizarActualizaciones(packageJson.dependencies);

    // Analizar optimizaciones sugeridas
    const optimizaciones = analizarOptimizaciones(packageJson);

    return {
      compatibilidadNode: compatibilidad,
      conflictos,
      actualizacionesPosibles: actualizaciones,
      optimizacionesSugeridas: optimizaciones
    };
  } catch (error) {
    console.error('Error al analizar el proyecto:', error instanceof Error ? error.message : String(error));
    return undefined;
  }
};

/**
 * Instala Volta en el sistema
 * @returns Resultado de la instalación
 */
export const instalarVolta = async (): Promise<{ exito: boolean, mensaje: string, error?: string }> => {
  try {
    const spinner = ora('Instalando Volta...').start();
    
    const resultado = await ejecutarComando('npm install -g volta');
    
    if (resultado.exito) {
      spinner.succeed(chalk.green('Volta instalado correctamente'));
      return {
        exito: true,
        mensaje: 'Volta instalado correctamente',
        error: undefined
      };
    } else {
      spinner.fail(chalk.red('Error al instalar Volta'));
      return {
        exito: false,
        mensaje: 'Error al instalar Volta',
        error: resultado.error
      };
    }
  } catch (error) {
    console.error('Error al instalar Volta:', error);
    return {
      exito: false,
      mensaje: 'Error al instalar Volta',
      error: error instanceof Error ? error.message : String(error)
    };
  }
};

export default analizarProyecto;
