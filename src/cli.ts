#!/usr/bin/env node
/**
 * Interfaz de línea de comandos para kiwiko
 */
import * as chalk from 'chalk';
import { Command } from 'commander';
import ora from 'ora'; 
import * as readline from 'readline';
import analizarProyecto, { verificarVoltaInstalado, instalarVolta, configurarEntornoVolta } from './index';
import { ResultadoAnalisis } from './tipos/tipos-proyecto';

/**
 * Configura el comando principal
 */
const configurarComandoPrincipal = (program: Command): void => {
  program
    .description('Analiza un proyecto Node.js para verificar compatibilidad, conflictos y optimizaciones')
    .option('-d, --directorio <path>', 'Directorio del proyecto a analizar', process.cwd())
    .action(async (opts) => {
      const spinner = ora('Analizando proyecto...').start();
      
      try {
        const resultado = await analizarProyecto(opts.directorio);
        if (!resultado) {
          spinner.fail(chalk.red('No se pudo analizar el proyecto'));
          return;
        }

        spinner.succeed(chalk.green('Análisis completado'));
        
        // Mostrar resumen en la consola
        console.log('\nResumen del análisis:');
        console.log(chalk.green('Compatibilidad de Node.js:'), 
          resultado.compatibilidadNode.esCompatible ? '✅ Compatible' : '❌ No compatible');
        
        console.log(chalk.yellow('Conflictos encontrados:'), 
          resultado.conflictos.length > 0 ? 
            chalk.red(`${resultado.conflictos.length} conflictos`) : 
            chalk.green('No hay conflictos'));
        
        console.log(chalk.blue('Actualizaciones disponibles:'), 
          resultado.actualizacionesPosibles.length > 0 ? 
            chalk.yellow(`${resultado.actualizacionesPosibles.length} actualizaciones`) : 
            chalk.green('No hay actualizaciones'));
        
        console.log(chalk.magenta('Optimizaciones sugeridas:'), 
          resultado.optimizacionesSugeridas.length > 0 ? 
            chalk.yellow(`${resultado.optimizacionesSugeridas.length} optimizaciones`) : 
            chalk.green('No hay optimizaciones'));
      } catch (error) {
        spinner.fail(chalk.red('Error al analizar el proyecto'));
        console.error(error);
      }
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
  const spinner = ora('Verificando instalación de Volta...').start();
  
  try {
    const verificacion = await verificarVoltaInstalado();
    
    if (verificacion.instalado) {
      spinner.succeed(chalk.green('Volta ya está instalado'));
      return;
    }

    spinner.fail(chalk.yellow('Volta no está instalado'));
    
    const respuesta = await new Promise<string>((resolve) => {
      const rl = require('readline').createInterface({
        input: process.stdin,
        output: process.stdout
      });

      rl.question(chalk.cyan('¿Deseas instalar Volta para gestionar tus entornos de desarrollo? (s/n): '), (respuesta: string) => {
        rl.close();
        resolve(respuesta.trim().toLowerCase());
      });
    });

    if (respuesta === 's' || respuesta === 'si') {
      const spinnerInstalacion = ora('Instalando Volta...').start();
      
      try {
        const resultado = await instalarVolta();
        
        if (resultado.exito) {
          spinnerInstalacion.succeed(chalk.green(resultado.mensaje));
          
          // Configurar entorno después de instalar Volta
          const spinnerConfiguracion = ora('Configurando entorno...').start();
          
          try {
            const resultadoConfiguracion = await configurarEntornoVolta(versionRecomendada, directorio);
            
            if (resultadoConfiguracion.exito) {
              spinnerConfiguracion.succeed(chalk.green(resultadoConfiguracion.mensaje));
              console.log(chalk.green('¡Entorno configurado correctamente!'));
              console.log(chalk.yellow('Para usar el entorno, cierra y abre nuevamente tu terminal.'));
            } else {
              spinnerConfiguracion.fail(chalk.red(resultadoConfiguracion.mensaje));
              if (resultadoConfiguracion.error) {
                console.error(chalk.red(`Error: ${resultadoConfiguracion.error}`));
              }
            }
          } catch (error) {
            spinnerConfiguracion.fail(chalk.red('Error al configurar el entorno'));
            console.error(chalk.red(`Error: ${error instanceof Error ? error.message : String(error)}`));
          }
        } else {
          spinnerInstalacion.fail(chalk.red(resultado.mensaje));
          if (resultado.error) {
            console.error(chalk.red(`Error: ${resultado.error}`));
          }
        }
      } catch (error) {
        spinnerInstalacion.fail(chalk.red('Error al instalar Volta'));
        console.error(chalk.red(`Error: ${error instanceof Error ? error.message : String(error)}`));
      }
    } else {
      console.log(chalk.yellow('No se instalará Volta. Puedes instalarlo manualmente visitando https://volta.sh'));
    }
  } catch (error) {
    spinner.fail(chalk.red('Error al verificar Volta'));
    console.error(chalk.red(`Error: ${error instanceof Error ? error.message : String(error)}`));
  }
};

/**
 * Función principal que ejecuta la CLI
 */
export const ejecutarCLI = async (): Promise<void> => {
  const program = new Command('kiwiko');
  
  // Configurar comando principal
  configurarComandoPrincipal(program);
  
  // Configurar opciones globales
  program
    .version('1.0.0')
    .description('Analizador de proyectos Node.js para verificar compatibilidad, conflictos y optimizaciones')
    .usage('[opciones]')
    .helpOption('-h, --help', 'Muestra esta ayuda')
    .parse();
};

// Ejecutar el CLI
ejecutarCLI().catch(error => {
  console.error('Error inesperado:', error);
  process.exit(1);
});
