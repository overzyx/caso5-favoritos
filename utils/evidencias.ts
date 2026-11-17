import type { Page, TestInfo } from '@playwright/test';
 
import { writeFile, unlink } from 'node:fs/promises';
 
/**
 * EVIDENCIAS EN ARCHIVO
 * Cada evidencia se escribe como archivo y se adjunta POR RUTA. Playwright la copia a
 *   reportes/<ejecución>/evidencias/<prueba>/attachments/
 * y la muestra en el reporte HTML. Así queda en el proyecto aunque no se abra el
 * reporte, y el JSON solo guarda la ruta (no la imagen completa).
 */
 
/** Convierte un texto en un nombre de archivo válido en Windows, con un consecutivo por prueba. */
function nombreArchivo(testInfo: TestInfo, nombre: string, extension: string): string {
  const consecutivo = testInfo.attachments.length + 1;
  const limpio = nombre
    .normalize('NFD').replace(/[̀-ͯ]/g, '') // quita tildes
    .replace(/[^a-zA-Z0-9]+/g, '-').replace(/^-|-$/g, '')
    .toLowerCase().slice(0, 60);
  return `${String(consecutivo).padStart(2, '0')}-${limpio}.${extension}`;
}
 
/** Guarda una captura de pantalla y la adjunta al reporte. */
export async function adjuntarCaptura(page: Page, testInfo: TestInfo, nombre: string): Promise<void> {
  const ruta = testInfo.outputPath(nombreArchivo(testInfo, nombre, 'png'));
  const paginaCompleta = process.env.CAPTURA_PAGINA_COMPLETA === 'true';
  await page.screenshot({ path: ruta, fullPage: paginaCompleta });
  await testInfo.attach(nombre, { path: ruta, contentType: 'image/png' });
  await unlink(ruta); // Playwright ya guardó su copia en attachments/
}
 
/** Guarda un texto o un JSON (por ejemplo, la respuesta de una API) y lo adjunta al reporte. */
export async function adjuntarDatos(testInfo: TestInfo, nombre: string, datos: unknown): Promise<void> {
  const esTexto = typeof datos === 'string';
  const ruta = testInfo.outputPath(nombreArchivo(testInfo, nombre, esTexto ? 'txt' : 'json'));
  await writeFile(ruta, esTexto ? (datos as string) : JSON.stringify(datos, null, 2), 'utf8');
  await testInfo.attach(nombre, { path: ruta, contentType: esTexto ? 'text/plain' : 'application/json' });
  await unlink(ruta); // Playwright ya guardó su copia en attachments/
}
 