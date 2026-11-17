/**
 * =====================================================================
 *  CONFIGURACIÓN DE PLAYWRIGHT · ATM Toolshop (Curso USB Cali)
 * =====================================================================
 *  Todo lo que cambia entre ejecuciones se lee del archivo .env o de
 *  variables de entorno. Así el código de las pruebas nunca cambia para
 *  apuntar a otro ambiente, ver el navegador o guardar más evidencias.
 * =====================================================================
 */
import path from 'node:path';
import { defineConfig, devices, type ReporterDescription } from '@playwright/test';
import { defineBddConfig } from 'playwright-bdd';
import dotenv from 'dotenv';
 
// 1) Carga el archivo .env (si existe). Las variables definidas en la terminal tienen prioridad.
dotenv.config({ quiet: true });
 
// 2) Funciones auxiliares para leer parámetros con valor por defecto
const texto = (nombre: string, porDefecto: string): string => process.env[nombre] || porDefecto;
const numero = (nombre: string, porDefecto: number): number => Number(process.env[nombre] || porDefecto);
const booleano = (nombre: string, porDefecto: boolean): boolean =>
  (process.env[nombre] || String(porDefecto)).toLowerCase() === 'true';
 
const enCI = !!process.env.CI;
 
// 3) Valores permitidos para las evidencias (se validan para evitar errores de escritura)
type ModoCaptura = 'off' | 'on' | 'only-on-failure';
type ModoVideo = 'off' | 'on' | 'retain-on-failure' | 'on-first-retry';
type ModoTraza = 'off' | 'on' | 'retain-on-failure' | 'on-first-retry' | 'on-all-retries';
 
// 4) Conexión Gherkin → Steps (playwright-bdd)
const testDir = defineBddConfig({
  features: 'features/**/*.feature',
  steps: ['steps/**/*.ts'],
  language: 'es',
});
 
// 5) Carpeta de la ejecución: reportes/AAAA-MM-DD_HH-mm-ss
//    Cada ejecución guarda sus evidencias aparte, así ninguna borra a la anterior.
//    Se calcula una sola vez en el proceso principal y los workers la heredan por variable de entorno.
function marcaDeTiempo(): string {
  const d = new Date();
  const dos = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${dos(d.getMonth() + 1)}-${dos(d.getDate())}_${dos(d.getHours())}-${dos(d.getMinutes())}-${dos(d.getSeconds())}`;
}
process.env.EJECUCION_ID ||= marcaDeTiempo();
const carpetaEjecucion = path.join(texto('CARPETA_REPORTES', 'reportes'), process.env.EJECUCION_ID);
 
// 6) Reportes: siempre lista en consola + HTML + JUnit + JSON
const reportes: ReporterDescription[] = [
  [enCI ? 'dot' : 'list'],
  ['html', { open: texto('ABRIR_REPORTE', 'never'), outputFolder: path.join(carpetaEjecucion, 'html') }],
  ['junit', { outputFile: path.join(carpetaEjecucion, 'junit', 'resultados.xml') }],
  ['json', { outputFile: path.join(carpetaEjecucion, 'json', 'resultados.json') }],
];
 
export default defineConfig({
  testDir,
  outputDir: path.join(carpetaEjecucion, 'evidencias'), // capturas, videos, trazas y adjuntos de cada prueba
 
  // ---------------- Tiempos máximos ----------------
  timeout: numero('TEST_TIMEOUT', 60_000), // escenario completo
  expect: { timeout: numero('EXPECT_TIMEOUT', 10_000) }, // cada assert web-first
 
  // ---------------- Ejecución ----------------
  fullyParallel: true,
  forbidOnly: enCI,
  retries: numero('RETRIES', enCI ? 2 : 0),
  workers: process.env.WORKERS ? Number(process.env.WORKERS) : undefined,
 
  // Los escenarios @antipatron son solo educativos: no se ejecutan salvo que se pida
  grepInvert: booleano('INCLUIR_ANTIPATRONES', false) ? undefined : /@antipatron/,
 
  reporter: reportes,
 
  // ---------------- Opciones comunes a todos los navegadores ----------------
  use: {
    baseURL: texto('BASE_URL', 'https://practicesoftwaretesting.com'),
    testIdAttribute: 'data-test', // el sitio identifica sus elementos con data-test
    locale: texto('LOCALE', 'en-US'), // el sitio cambia de idioma según el navegador
    timezoneId: texto('TIMEZONE', 'America/Bogota'),
    headless: booleano('HEADLESS', true),
    actionTimeout: numero('ACTION_TIMEOUT', 15_000),
    navigationTimeout: numero('NAVIGATION_TIMEOUT', 30_000),
    screenshot: texto('SCREENSHOT', 'only-on-failure') as ModoCaptura,
    video: texto('VIDEO', 'retain-on-failure') as ModoVideo,
    trace: texto('TRACE', 'retain-on-failure') as ModoTraza,
    launchOptions: { slowMo: numero('SLOW_MO', 0) },
  },
 
  // ---------------- Navegadores (se eligen con --project=nombre) ----------------
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'firefox', use: { ...devices['Desktop Firefox'] } },
    { name: 'webkit', use: { ...devices['Desktop Safari'] } },
    // Navegador instalado en el equipo (Microsoft Edge). Úsalo con --project=edge
    { name: 'edge', use: { ...devices['Desktop Edge'], channel: 'msedge' } },
  ],
});
 