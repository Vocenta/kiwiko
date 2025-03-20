#!/usr/bin/env node
/**
 * Interfaz de línea de comandos para kiwiko
 */
import * as chalk from 'chalk';
import { Command } from 'commander';
import ora from 'ora'; // Corregir la importación de ora
import * as readline from 'readline';
import analizarProyecto, { verificarVoltaInstalado, configurarEntornoVolta } from './index';
import { ResultadoAnalisis } from './tipos/tipos-proyecto';

/**
 * Crea una interfaz de readline para hacer preguntas al usuario
 * @returns Interfaz de readline
 */
const crearInterfazPreguntas = (): readline.Interface => {
  return readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });
};

/**
 * Hace una pregunta al usuario y espera su respuesta
 * @param pregunta - Pregunta a realizar
 * @param rl - Interfaz de readline
 * @returns Promesa con la respuesta del usuario
 */
const preguntarUsuario = async (pregunta: string, rl: readline.Interface): Promise<string> => {
  return new Promise((resolve) => {
    rl.question(pregunta, (respuesta: string) => {
      resolve(respuesta.trim());
    });
  });
};

/**
 * Pregunta al usuario si desea configurar un entorno encapsulado con Volta
 * @param versionRecomendada - Versión de Node.js recomendada
 * @param directorio - Directorio del proyecto
 */
const preguntarConfigurarEntorno = async (
  versionRecomendada: string,
  directorio: string
): Promise<void> => {
  const rl = crearInterfazPreguntas();
  
  try {
    // Verificar si Volta está instalado
    const verificacionVolta = await verificarVoltaInstalado();
    
    if (!verificacionVolta.instalado) {
      console.log(chalk.yellow('\n🔧 Volta no está instalado en tu sistema.'));
      console.log(chalk.yellow('Volta es una herramienta que permite gestionar versiones de Node.js y paquetes globales por proyecto.'));
      
      const respuestaInstalar = await preguntarUsuario(
        chalk.cyan('¿Deseas instalar Volta para gestionar tu entorno de Node.js? (s/n): '),
        rl
      );
      
      if (respuestaInstalar.toLowerCase() !== 's' && respuestaInstalar.toLowerCase() !== 'si') {
        console.log(chalk.yellow('No se instalará Volta. Puedes instalarlo manualmente visitando https://volta.sh'));
        rl.close();
        return;
      }
    }
    
    console.log(chalk.yellow(`\n📦 Se recomienda usar Node.js ${versionRecomendada} para este proyecto.`));
    
    const respuestaConfigurar = await preguntarUsuario(
      chalk.cyan('¿Deseas configurar un entorno encapsulado con esta versión de Node.js? (s/n): '),
      rl
    );
    
    if (respuestaConfigurar.toLowerCase() !== 's' && respuestaConfigurar.toLowerCase() !== 'si') {
      console.log(chalk.yellow('No se configurará el entorno encapsulado.'));
      rl.close();
      return;
    }
    
    // Preguntar por paquetes globales
    console.log(chalk.yellow('\nPuedes instalar paquetes globales en este entorno encapsulado.'));
    console.log(chalk.yellow('Ejemplos: typescript, eslint, prettier, nodemon'));
    
    const paquetesGlobales = await preguntarUsuario(
      chalk.cyan('Ingresa los paquetes globales que deseas instalar (separados por espacios) o presiona Enter para omitir: '),
      rl
    );
    
    // Preguntar si instalar dependencias del proyecto
    const respuestaInstalarDeps = await preguntarUsuario(
      chalk.cyan('¿Deseas instalar las dependencias del proyecto? (s/n): '),
      rl
    );
    
    const instalarDependencias = respuestaInstalarDeps.toLowerCase() === 's' || respuestaInstalarDeps.toLowerCase() === 'si';
    
    // Configurar el entorno
    console.log(chalk.yellow('\nConfigurando entorno encapsulado...'));
    
    const spinner = ora('Configurando entorno con Volta...').start();
    
    const paquetesArray = paquetesGlobales.trim() ? paquetesGlobales.split(/\s+/) : [];
    
    const resultado = await configurarEntornoVolta(
      versionRecomendada,
      directorio,
      paquetesArray,
      instalarDependencias
    );
    
    if (resultado.exito) {
      spinner.succeed(chalk.green(resultado.mensaje));
    } else {
      spinner.fail(chalk.red(resultado.mensaje));
      if (resultado.error) {
        console.error(chalk.red(`Error: ${resultado.error}`));
      }
    }
  } catch (error) {
    console.error(chalk.red(`Error al configurar el entorno: ${error instanceof Error ? error.message : String(error)}`));
  } finally {
    rl.close();
  }
};

/**
 * Función principal del CLI
 */
const ejecutarCLI = async (): Promise<void> => {
  const programa = new Command();
  
  programa
    .name('kiwiko')
    .description('Analizador de proyectos Node.js para verificar compatibilidad, conflictos y optimizaciones')
    .version('1.0.0')
    .option('-d, --directorio <ruta>', 'Directorio del proyecto a analizar', process.cwd())
    .option('--no-volta', 'Desactiva la pregunta para configurar un entorno con Volta')
    .parse(process.argv);
  
  const opciones = programa.opts();
  
  // Mostrar spinner mientras se analiza el proyecto
  const spinner = ora('Analizando proyecto...').start();
  
  try {
    const resultadoAnalisis = await analizarProyecto(opciones.directorio);
    
    if (!resultadoAnalisis) {
      spinner.fail('No se pudo analizar el proyecto. Verifica que exista un archivo package.json válido.');
      process.exit(1);
      return;
    }
    
    const resultado: ResultadoAnalisis = resultadoAnalisis;
    
    spinner.succeed('Análisis completado');
    console.log('\n');
    
    // Mostrar resultados de compatibilidad de Node.js
    console.log(chalk.bold('📊 Compatibilidad de Node.js:'));
    const { compatibilidadNode } = resultado;
    if (compatibilidadNode.esCompatible) {
      console.log(chalk.green(`✓ La versión actual de Node.js (${compatibilidadNode.versionActual}) es compatible con la requerida (${compatibilidadNode.versionRequerida})`));
    } else {
      console.log(chalk.red(`✗ La versión actual de Node.js (${compatibilidadNode.versionActual}) NO es compatible con la requerida (${compatibilidadNode.versionRequerida})`));
      if (compatibilidadNode.recomendacion) {
        console.log(chalk.yellow(`  ℹ ${compatibilidadNode.recomendacion}`));
      }
    }
    console.log('\n');
    
    // Mostrar conflictos entre dependencias
    console.log(chalk.bold('🔄 Conflictos entre dependencias:'));
    if (resultado.conflictos.length === 0) {
      console.log(chalk.green('✓ No se encontraron conflictos entre dependencias'));
    } else {
      console.log(chalk.red(`✗ Se encontraron ${resultado.conflictos.length} conflictos:`));
      resultado.conflictos.forEach((conflicto, index) => {
        console.log(chalk.yellow(`  ${index + 1}. Conflicto con ${conflicto.paquete} (requerido: ${conflicto.versionRequerida}):`));
        conflicto.versionesConflictivas.forEach(v => {
          console.log(chalk.yellow(`     - ${v.dependencia} requiere: ${v.versionRequerida}`));
        });
        if (conflicto.solucionRecomendada) {
          console.log(chalk.green(`     ℹ Solución recomendada: ${conflicto.solucionRecomendada}`));
        }
      });
    }
    console.log('\n');
    
    // Mostrar actualizaciones posibles
    console.log(chalk.bold('🆙 Actualizaciones disponibles:'));
    if (resultado.actualizacionesPosibles.length === 0) {
      console.log(chalk.green('✓ Todas las dependencias están actualizadas'));
    } else {
      console.log(`ℹ Se encontraron ${resultado.actualizacionesPosibles.length} actualizaciones disponibles:`);
      
      // Primero mostrar actualizaciones seguras
      const actualizacionesSeguras = resultado.actualizacionesPosibles.filter(a => a.esSegura);
      if (actualizacionesSeguras.length > 0) {
        console.log(chalk.green('\n  Actualizaciones seguras (solo cambios de parche):'));
        actualizacionesSeguras.forEach(act => {
          console.log(chalk.green(`  ✓ ${act.paquete}: ${act.versionActual} → ${act.versionDisponible}`));
          if (act.cambios && act.cambios.length > 0) {
            console.log(chalk.gray(`    Cambios: ${act.cambios.join(', ')}`));
          }
        });
      }
      
      // Luego mostrar actualizaciones no seguras
      const actualizacionesNoSeguras = resultado.actualizacionesPosibles.filter(a => !a.esSegura);
      if (actualizacionesNoSeguras.length > 0) {
        console.log(chalk.yellow('\n  Actualizaciones que requieren revisión (cambios mayores o menores):'));
        actualizacionesNoSeguras.forEach(act => {
          console.log(chalk.yellow(`  ⚠ ${act.paquete}: ${act.versionActual} → ${act.versionDisponible}`));
          if (act.cambios && act.cambios.length > 0) {
            console.log(chalk.gray(`    Cambios: ${act.cambios.join(', ')}`));
          }
        });
      }
    }
    console.log('\n');
    
    // Mostrar optimizaciones sugeridas
    console.log(chalk.bold('🚀 Optimizaciones sugeridas:'));
    if (resultado.optimizacionesSugeridas.length === 0) {
      console.log(chalk.green('✓ No se encontraron optimizaciones adicionales para sugerir'));
    } else {
      resultado.optimizacionesSugeridas.forEach((sugerencia, index) => {
        console.log(chalk.blue(`  ${index + 1}. ${sugerencia}`));
      });
    }
    
    // Preguntar si desea configurar un entorno con Volta
    if (!opciones.noVolta && compatibilidadNode.versionRequerida) {
      await preguntarConfigurarEntorno(
        compatibilidadNode.versionRequerida,
        opciones.directorio
      );
    }
    
  } catch (error) {
    spinner.fail('Error al analizar el proyecto');
    console.error(error instanceof Error ? error.message : String(error));
    process.exit(1);
  }
};

// Ejecutar el CLI
ejecutarCLI().catch(error => {
  console.error('Error inesperado:', error);
  process.exit(1);
});
