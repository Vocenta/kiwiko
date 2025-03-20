/**
 * Script de postinstalación que solicita al usuario instalar Volta
 */
import chalk from 'chalk';
import ora from 'ora';
import * as readline from 'readline';
import { verificarVolta, instalarVolta } from '../src/utilidades/gestor-entorno';

/**
 * Hace una pregunta al usuario y espera su respuesta
 * @param pregunta - Pregunta a realizar
 * @returns Promesa con la respuesta del usuario
 */
const preguntarUsuario = async (pregunta: string): Promise<string> => {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  return new Promise((resolve) => {
    rl.question(pregunta, (respuesta: string) => {
      rl.close();
      resolve(respuesta.trim().toLowerCase());
    });
  });
};

/**
 * Función principal del script de postinstalación
 */
const ejecutarPostInstalacion = async (): Promise<void> => {
  const spinner = ora('Verificando instalación de Volta...').start();

  try {
    const verificacion = await verificarVolta();
    
    if (verificacion.instalado) {
      spinner.succeed(chalk.green('Volta ya está instalado en tu sistema'));
      return;
    }

    spinner.fail(chalk.yellow('Volta no está instalado en tu sistema'));
    
    console.log('\n');
    console.log(chalk.yellow('Volta es una herramienta que permite gestionar versiones de Node.js y paquetes globales por proyecto.'));
    console.log(chalk.yellow('Con Volta, Kiwiko puede crear entornos de desarrollo encapsulados para cada proyecto, asegurando que uses la versión correcta de Node.js y sus dependencias.'));
    
    const respuesta = await preguntarUsuario(chalk.cyan('¿Deseas instalar Volta para gestionar tus entornos de desarrollo? (s/n): '));
    
    if (respuesta === 's' || respuesta === 'si') {
      const spinnerInstalacion = ora('Instalando Volta...').start();
      
      try {
        const resultado = await instalarVolta();
        
        if (resultado.exito) {
          spinnerInstalacion.succeed(chalk.green(resultado.mensaje));
          console.log(chalk.yellow('¡Listo! Ahora puedes usar Kiwiko para crear entornos de desarrollo encapsulados.'));
          console.log(chalk.yellow('Para usar Volta, cierra y abre nuevamente tu terminal.'));
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

// Ejecutar el script de postinstalación
ejecutarPostInstalacion().catch(error => {
  console.error('Error inesperado:', error);
  process.exit(1);
});
