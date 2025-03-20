/**
 * Punto de entrada principal para la librería kiwiko
 */
import { PackageJson, ResultadoAnalisis } from './tipos/tipos-proyecto';
import { leerPackageJson, obtenerTodasDependencias, obtenerVersionNodeRequerida } from './utilidades/lector-proyecto';
import { analizarCompatibilidadNode } from './analizadores/analizador-compatibilidad';
import { analizarConflictosDependencias, obtenerDependenciasAnidadas } from './analizadores/analizador-conflictos';
import { analizarActualizacionesDependencias } from './analizadores/analizador-actualizaciones';
import { analizarOptimizacionesInstalacion, analizarPaquetesObsoletos } from './optimizadores/optimizador-instalacion';
import { 
  verificarVolta, 
  instalarVolta, 
  configurarVersionNodeConVolta, 
  instalarDependenciasGlobales, 
  instalarDependenciasProyecto,
  ResultadoVerificacionVolta,
  ResultadoCreacionEntorno
} from './utilidades/gestor-entorno';

/**
 * Analiza un proyecto Node.js para verificar compatibilidad, conflictos y optimizaciones
 * @param directorio - Directorio del proyecto a analizar (opcional, por defecto directorio actual)
 * @returns Resultado completo del análisis o undefined si no se pudo leer el package.json
 */
export const analizarProyecto = async (directorio?: string): Promise<ResultadoAnalisis | undefined> => {
  // Leer el package.json
  const packageJson = leerPackageJson(directorio);
  if (!packageJson) {
    console.error('No se pudo encontrar o leer el archivo package.json');
    return undefined;
  }
  
  // Obtener todas las dependencias
  const todasDependencias = obtenerTodasDependencias(packageJson);
  
  // Analizar compatibilidad de Node.js
  const versionNodeRequerida = obtenerVersionNodeRequerida(packageJson);
  const compatibilidadNode = analizarCompatibilidadNode(versionNodeRequerida);
  
  // Obtener dependencias anidadas
  const dependenciasAnidadas = await obtenerDependenciasAnidadas(todasDependencias);
  
  // Analizar conflictos entre dependencias
  const conflictos = analizarConflictosDependencias(todasDependencias, dependenciasAnidadas);
  
  // Analizar actualizaciones disponibles
  const actualizacionesPosibles = await analizarActualizacionesDependencias(todasDependencias);
  
  // Analizar optimizaciones de instalación
  const optimizacionesInstalacion = analizarOptimizacionesInstalacion(
    packageJson.dependencies,
    packageJson.devDependencies
  );
  
  // Analizar paquetes obsoletos
  const sugerenciasPaquetesObsoletos = analizarPaquetesObsoletos(todasDependencias);
  
  // Combinar todas las optimizaciones sugeridas
  const optimizacionesSugeridas = [
    ...optimizacionesInstalacion,
    ...sugerenciasPaquetesObsoletos
  ];
  
  return {
    compatibilidadNode,
    conflictos,
    actualizacionesPosibles,
    optimizacionesSugeridas
  };
};

/**
 * Verifica si Volta está instalado en el sistema
 * @returns Resultado de la verificación
 */
export const verificarVoltaInstalado = async (): Promise<ResultadoVerificacionVolta> => {
  return await verificarVolta();
};

/**
 * Configura un entorno encapsulado con Volta usando la versión recomendada de Node.js
 * @param versionNode - Versión de Node.js a usar
 * @param directorio - Directorio del proyecto
 * @param paquetesGlobales - Paquetes a instalar globalmente
 * @param instalarDependencias - Si se deben instalar las dependencias del proyecto
 * @returns Resultado de la configuración
 */
export const configurarEntornoVolta = async (
  versionNode: string,
  directorio: string = process.cwd(),
  paquetesGlobales: string[] = [],
  instalarDependencias: boolean = true
): Promise<ResultadoCreacionEntorno> => {
  try {
    // Verificar si Volta está instalado
    const verificacion = await verificarVolta();
    if (!verificacion.instalado) {
      const resultadoInstalacion = await instalarVolta();
      if (!resultadoInstalacion.exito) {
        return resultadoInstalacion;
      }
    }
    
    // Configurar la versión de Node.js
    const resultadoConfiguracion = await configurarVersionNodeConVolta(versionNode, directorio);
    if (!resultadoConfiguracion.exito) {
      return resultadoConfiguracion;
    }
    
    // Instalar paquetes globales si se especificaron
    if (paquetesGlobales.length > 0) {
      const resultadoGlobales = await instalarDependenciasGlobales(paquetesGlobales);
      if (!resultadoGlobales.exito) {
        return {
          exito: false,
          mensaje: `Se configuró Node.js ${versionNode}, pero hubo un error al instalar paquetes globales: ${resultadoGlobales.mensaje}`,
          error: resultadoGlobales.error
        };
      }
    }
    
    // Instalar dependencias del proyecto si se solicitó
    if (instalarDependencias) {
      const resultadoDependencias = await instalarDependenciasProyecto(directorio);
      if (!resultadoDependencias.exito) {
        return {
          exito: false,
          mensaje: `Se configuró Node.js ${versionNode} y los paquetes globales, pero hubo un error al instalar dependencias del proyecto: ${resultadoDependencias.mensaje}`,
          error: resultadoDependencias.error
        };
      }
    }
    
    return {
      exito: true,
      mensaje: `Entorno configurado correctamente con Node.js ${versionNode}${paquetesGlobales.length > 0 ? `, paquetes globales (${paquetesGlobales.join(', ')})` : ''}${instalarDependencias ? ' y dependencias del proyecto instaladas' : ''}.`
    };
  } catch (error) {
    return {
      exito: false,
      mensaje: 'Error al configurar el entorno con Volta',
      error: error instanceof Error ? error.message : String(error)
    };
  }
};

export default analizarProyecto;
