/**
 * Utilidad para ejecutar comandos del sistema
 */
import * as child_process from 'child_process';

/**
 * Ejecuta un comando del sistema y devuelve su salida
 * @param comando - Comando a ejecutar
 * @param opciones - Opciones adicionales para la ejecución
 * @returns Promesa con el resultado de la ejecución
 */
export const ejecutarComando = async (
  comando: string,
  opciones: child_process.SpawnSyncOptions = {}
): Promise<{ exito: boolean, stdout: string, stderr: string, error?: string }> => {
  try {
    const resultado = child_process.spawnSync(
      comando.split(' ')[0],
      comando.split(' ').slice(1),
      {
        ...opciones,
        encoding: 'utf-8',
        shell: true
      }
    );

    if (resultado.error) {
      return {
        exito: false,
        stdout: '',
        stderr: '',
        error: resultado.error.message
      };
    }

    return {
      exito: resultado.status === 0,
      stdout: resultado.stdout.trim(),
      stderr: resultado.stderr.trim(),
      error: undefined
    };
  } catch (error) {
    return {
      exito: false,
      stdout: '',
      stderr: '',
      error: error instanceof Error ? error.message : String(error)
    };
  }
};
