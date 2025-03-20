/**
 * Script de prueba para la biblioteca Kiwiko
 */
import analizarProyecto, { verificarVoltaInstalado, configurarEntornoVolta } from '../src/index';
import { sonRangosCompatibles, esVersionCompatible, esActualizacionSegura } from '../src/utilidades/version-utilidades';

/**
 * Prueba las utilidades de versiones
 */
const probarUtilidadesVersiones = (): void => {
  console.log('=== Prueba de utilidades de versiones ===');
  
  // Probar sonRangosCompatibles
  const pruebas = [
    { rango1: '^1.0.0', rango2: '^1.2.0', esperado: true },
    { rango1: '^1.0.0', rango2: '^2.0.0', esperado: false },
    { rango1: '>=1.0.0', rango2: '<2.0.0', esperado: true },
    { rango1: '1.x', rango2: '1.5.x', esperado: true }
  ];
  
  pruebas.forEach(({ rango1, rango2, esperado }) => {
    const resultado = sonRangosCompatibles(rango1, rango2);
    console.log(`¿Son compatibles ${rango1} y ${rango2}? ${resultado} (Esperado: ${esperado})`);
  });
  
  // Probar esVersionCompatible
  console.log('\n--- Prueba de esVersionCompatible ---');
  const pruebasVersiones = [
    { version: '1.2.3', rango: '^1.0.0', esperado: true },
    { version: '2.0.0', rango: '^1.0.0', esperado: false },
    { version: '1.5.0', rango: '1.x', esperado: true }
  ];
  
  pruebasVersiones.forEach(({ version, rango, esperado }) => {
    const resultado = esVersionCompatible(version, rango);
    console.log(`¿Es compatible ${version} con ${rango}? ${resultado} (Esperado: ${esperado})`);
  });
  
  // Probar esActualizacionSegura
  console.log('\n--- Prueba de esActualizacionSegura ---');
  const pruebasActualizaciones = [
    { actual: '1.2.3', nueva: '1.2.5', esperado: true },
    { actual: '1.2.3', nueva: '1.3.0', esperado: false },
    { actual: '1.2.3', nueva: '2.0.0', esperado: false }
  ];
  
  pruebasActualizaciones.forEach(({ actual, nueva, esperado }) => {
    const resultado = esActualizacionSegura(actual, nueva);
    console.log(`¿Es segura la actualización de ${actual} a ${nueva}? ${resultado} (Esperado: ${esperado})`);
  });
};

/**
 * Prueba el análisis de proyecto
 */
const probarAnalisisProyecto = async (): Promise<void> => {
  console.log('\n=== Prueba de análisis de proyecto ===');
  
  try {
    // Analizar el proyecto actual
    const resultado = await analizarProyecto();
    
    if (!resultado) {
      console.log('No se pudo analizar el proyecto');
      return;
    }
    
    console.log('Compatibilidad de Node.js:');
    console.log(resultado.compatibilidadNode);
    
    console.log('\nConflictos encontrados:');
    console.log(resultado.conflictos.length > 0 
      ? resultado.conflictos 
      : 'No se encontraron conflictos');
    
    console.log('\nActualizaciones posibles:');
    console.log(resultado.actualizacionesPosibles.length > 0 
      ? resultado.actualizacionesPosibles 
      : 'No hay actualizaciones disponibles');
    
    console.log('\nOptimizaciones sugeridas:');
    console.log(resultado.optimizacionesSugeridas.length > 0 
      ? resultado.optimizacionesSugeridas 
      : 'No hay optimizaciones sugeridas');
  } catch (error) {
    console.error('Error al analizar el proyecto:', error);
  }
};

/**
 * Prueba la verificación de Volta
 */
const probarVerificacionVolta = async (): Promise<void> => {
  console.log('\n=== Prueba de verificación de Volta ===');
  
  try {
    const resultado = await verificarVoltaInstalado();
    console.log('Resultado de la verificación de Volta:');
    console.log(resultado);
  } catch (error) {
    console.error('Error al verificar Volta:', error);
  }
};

/**
 * Función principal que ejecuta todas las pruebas
 */
const ejecutarPruebas = async (): Promise<void> => {
  console.log('Iniciando pruebas de la biblioteca Kiwiko...\n');
  
  // Probar utilidades de versiones
  probarUtilidadesVersiones();
  
  // Probar análisis de proyecto
  await probarAnalisisProyecto();
  
  // Probar verificación de Volta
  await probarVerificacionVolta();
  
  console.log('\nPruebas completadas.');
};

// Ejecutar las pruebas
ejecutarPruebas().catch(error => {
  console.error('Error durante la ejecución de las pruebas:', error);
});
