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
exports.instalarDependenciasProyecto = exports.instalarDependenciasGlobales = exports.configurarVersionNodeConVolta = exports.instalarVolta = exports.verificarVolta = void 0;
/**
 * Utilidades para gestionar el entorno de Node.js utilizando Volta
 */
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const util_1 = require("util");
const child_process_1 = require("child_process");
const semver = __importStar(require("semver"));
// Promisificar exec para usar async/await
const exec = (0, util_1.promisify)(child_process_1.exec);
/**
 * Verifica si Volta está instalado en el sistema
 * @returns Resultado de la verificación
 */
const verificarVolta = async () => {
    try {
        const { stdout } = await exec('volta --version');
        return {
            instalado: true,
            version: stdout.trim()
        };
    }
    catch (error) {
        return {
            instalado: false,
            error: error instanceof Error ? error.message : String(error)
        };
    }
};
exports.verificarVolta = verificarVolta;
/**
 * Instala Volta en el sistema si no está instalado
 * @returns Resultado de la instalación
 */
const instalarVolta = async () => {
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
    }
    catch (error) {
        return {
            exito: false,
            mensaje: 'Error al instalar Volta',
            error: error instanceof Error ? error.message : String(error)
        };
    }
};
exports.instalarVolta = instalarVolta;
/**
 * Configura un proyecto para usar una versión específica de Node.js con Volta
 * @param versionNode - Versión de Node.js a usar
 * @param directorio - Directorio del proyecto
 * @returns Resultado de la configuración
 */
const configurarVersionNodeConVolta = async (versionNode, directorio = process.cwd()) => {
    try {
        // Verificar si Volta está instalado
        const verificacion = await (0, exports.verificarVolta)();
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
    }
    catch (error) {
        return {
            exito: false,
            mensaje: 'Error al configurar el proyecto con Volta',
            error: error instanceof Error ? error.message : String(error)
        };
    }
};
exports.configurarVersionNodeConVolta = configurarVersionNodeConVolta;
/**
 * Instala dependencias globales en el entorno encapsulado de Volta
 * @param paquetes - Lista de paquetes a instalar
 * @returns Resultado de la instalación
 */
const instalarDependenciasGlobales = async (paquetes) => {
    if (paquetes.length === 0) {
        return {
            exito: true,
            mensaje: 'No hay paquetes para instalar.'
        };
    }
    try {
        // Verificar si Volta está instalado
        const verificacion = await (0, exports.verificarVolta)();
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
    }
    catch (error) {
        return {
            exito: false,
            mensaje: 'Error al instalar dependencias globales',
            error: error instanceof Error ? error.message : String(error)
        };
    }
};
exports.instalarDependenciasGlobales = instalarDependenciasGlobales;
/**
 * Instala las dependencias locales del proyecto
 * @param directorio - Directorio del proyecto
 * @returns Resultado de la instalación
 */
const instalarDependenciasProyecto = async (directorio = process.cwd()) => {
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
    }
    catch (error) {
        return {
            exito: false,
            mensaje: 'Error al instalar las dependencias del proyecto',
            error: error instanceof Error ? error.message : String(error)
        };
    }
};
exports.instalarDependenciasProyecto = instalarDependenciasProyecto;
