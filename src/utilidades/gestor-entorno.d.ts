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
export declare const verificarVolta: () => Promise<ResultadoVerificacionVolta>;
/**
 * Instala Volta en el sistema si no está instalado
 * @returns Resultado de la instalación
 */
export declare const instalarVolta: () => Promise<ResultadoCreacionEntorno>;
/**
 * Configura un proyecto para usar una versión específica de Node.js con Volta
 * @param versionNode - Versión de Node.js a usar
 * @param directorio - Directorio del proyecto
 * @returns Resultado de la configuración
 */
export declare const configurarVersionNodeConVolta: (versionNode: string, directorio?: string) => Promise<ResultadoCreacionEntorno>;
/**
 * Instala dependencias globales en el entorno encapsulado de Volta
 * @param paquetes - Lista de paquetes a instalar
 * @returns Resultado de la instalación
 */
export declare const instalarDependenciasGlobales: (paquetes: string[]) => Promise<ResultadoCreacionEntorno>;
/**
 * Instala las dependencias locales del proyecto
 * @param directorio - Directorio del proyecto
 * @returns Resultado de la instalación
 */
export declare const instalarDependenciasProyecto: (directorio?: string) => Promise<ResultadoCreacionEntorno>;
