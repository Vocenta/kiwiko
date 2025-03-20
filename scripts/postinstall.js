"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Script de postinstalación que solicita al usuario instalar Volta
 */
const chalk = __importStar(require("chalk"));
const ora = __importStar(require("ora"));
const readline = __importStar(require("readline"));
const gestor_entorno_1 = require("../src/utilidades/gestor-entorno");
/**
 * Hace una pregunta al usuario y espera su respuesta
 * @param pregunta - Pregunta a realizar
 * @returns Promesa con la respuesta del usuario
 */
const preguntarUsuario = async (pregunta) => {
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });
    return new Promise((resolve) => {
        rl.question(pregunta, (respuesta) => {
            rl.close();
            resolve(respuesta.trim().toLowerCase());
        });
    });
};
/**
 * Función principal del script de postinstalación
 */
const ejecutarPostInstalacion = async () => {
    const spinner = ora('Verificando instalación de Volta...').start();
    try {
        const verificacion = await (0, gestor_entorno_1.verificarVolta)();
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
                const resultado = await (0, gestor_entorno_1.instalarVolta)();
                if (resultado.exito) {
                    spinnerInstalacion.succeed(chalk.green(resultado.mensaje));
                    console.log(chalk.yellow('¡Listo! Ahora puedes usar Kiwiko para crear entornos de desarrollo encapsulados.'));
                    console.log(chalk.yellow('Para usar Volta, cierra y abre nuevamente tu terminal.'));
                }
                else {
                    spinnerInstalacion.fail(chalk.red(resultado.mensaje));
                    if (resultado.error) {
                        console.error(chalk.red(`Error: ${resultado.error}`));
                    }
                }
            }
            catch (error) {
                spinnerInstalacion.fail(chalk.red('Error al instalar Volta'));
                console.error(chalk.red(`Error: ${error instanceof Error ? error.message : String(error)}`));
            }
        }
        else {
            console.log(chalk.yellow('No se instalará Volta. Puedes instalarlo manualmente visitando https://volta.sh'));
        }
    }
    catch (error) {
        spinner.fail(chalk.red('Error al verificar Volta'));
        console.error(chalk.red(`Error: ${error instanceof Error ? error.message : String(error)}`));
    }
};
// Ejecutar el script de postinstalación
ejecutarPostInstalacion().catch(error => {
    console.error('Error inesperado:', error);
    process.exit(1);
});
