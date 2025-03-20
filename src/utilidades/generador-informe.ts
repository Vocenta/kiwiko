/**
 * Genera un informe HTML detallado con los resultados del análisis
 */
import * as fs from 'fs';
import * as path from 'path';
import * as base64 from 'base64-js';
import { ResultadoAnalisis } from '../tipos/tipos-proyecto';

/**
 * Genera un ID único para el informe basado en la fecha y hora
 * @returns ID único en formato YYYYMMDD_HHMMSS
 */
const generarIdInforme = (): string => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  const seconds = String(now.getSeconds()).padStart(2, '0');
  
  return `${year}${month}${day}_${hours}${minutes}${seconds}`;
};

/**
 * Convierte un archivo SVG a base64
 * @param ruta - Ruta al archivo SVG
 * @returns String base64 del SVG
 */
const convertirSvgABase64 = (ruta: string): string => {
  const contenido = fs.readFileSync(ruta, 'utf-8');
  return base64.fromByteArray(Buffer.from(contenido));
};

/**
 * Genera un informe HTML con los resultados del análisis
 * @param resultado - Resultado del análisis a incluir en el informe
 * @returns Ruta del archivo del informe generado
 */
export const generarInformeHTML = async (resultado: ResultadoAnalisis): Promise<string> => {
  const idInforme = generarIdInforme();
  const rutaInforme = path.join(process.cwd(), `kiwiko-${idInforme}.html`);
  
  // Leer la plantilla
  const plantilla = await fs.promises.readFile(
    path.join(__dirname, 'plantilla-informe.html'),
    'utf-8'
  );
  
  // Leer y convertir el logo a base64
  const logoBase64 = convertirSvgABase64(path.join(__dirname, '../../src/assets/logo/kiwilko.svg'));
  
  // Determinar estatus para cada sección
  const compatibilidadStatus = resultado.compatibilidadNode.esCompatible 
    ? 'success' 
    : 'warning';
  
  const conflictosStatus = resultado.conflictos.length > 0 
    ? 'danger' 
    : 'success';
  
  const actualizacionesStatus = resultado.actualizacionesPosibles.length > 0 
    ? 'info' 
    : 'success';
  
  const optimizacionesStatus = resultado.optimizacionesSugeridas.length > 0 
    ? 'info' 
    : 'success';
  
  // Reemplazar placeholders en la plantilla
  const contenido = plantilla
    .replace('{{logoBase64}}', logoBase64)
    .replace('{{fecha}}', new Date().toLocaleString('es-ES'))
    .replace('{{version}}', '1.0.0')
    .replace('{{compatibilidadStatus}}', compatibilidadStatus)
    .replace('{{compatibilidadStatusText}}', 
      resultado.compatibilidadNode.esCompatible 
        ? 'Compatible' 
        : 'Incompatible')
    .replace('{{versionRequerida}}', resultado.compatibilidadNode.versionRequerida)
    .replace('{{versionActual}}', resultado.compatibilidadNode.versionActual)
    .replace('{{recomendacion}}', resultado.compatibilidadNode.recomendacion || '')
    .replace('{{conflictosStatus}}', conflictosStatus)
    .replace('{{conflictosStatusText}}', 
      resultado.conflictos.length > 0 
        ? `Hay ${resultado.conflictos.length} conflictos` 
        : 'No hay conflictos')
    .replace('{{actualizacionesStatus}}', actualizacionesStatus)
    .replace('{{actualizacionesStatusText}}', 
      resultado.actualizacionesPosibles.length > 0 
        ? `Hay ${resultado.actualizacionesPosibles.length} actualizaciones disponibles` 
        : 'No hay actualizaciones disponibles')
    .replace('{{optimizacionesStatus}}', optimizacionesStatus)
    .replace('{{optimizacionesStatusText}}', 
      resultado.optimizacionesSugeridas.length > 0 
        ? `Hay ${resultado.optimizacionesSugeridas.length} optimizaciones sugeridas` 
        : 'No hay optimizaciones sugeridas');
  
  // Escribir el archivo
  await fs.promises.writeFile(rutaInforme, contenido);
  
  return rutaInforme;
};
