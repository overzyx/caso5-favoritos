/**
 * Abre el reporte HTML de la última ejecución (o de la indicada).
 *   npm run report                          → la más reciente
 *   npm run report -- 2026-11-10_04-20-00   → una ejecución específica
 *   npm run reportes                        → lista las ejecuciones guardadas
 */
import { existsSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { spawnSync } from 'node:child_process';

const base = process.env.CARPETA_REPORTES || 'reportes';
const ejecuciones = existsSync(base)
  ? readdirSync(base).filter((n) => existsSync(join(base, n, 'html', 'index.html'))).sort()
  : [];

if (process.argv.includes('--listar')) {
  if (!ejecuciones.length) console.log('Aún no hay ejecuciones guardadas.');
  ejecuciones.forEach((n) => console.log(`  ${n}`));
  process.exit(0);
}

const elegida = process.argv[2] || ejecuciones.at(-1);
if (!elegida || !existsSync(join(base, elegida, 'html', 'index.html'))) {
  console.error(`No se encontró el reporte "${elegida ?? ''}". Ejecute primero las pruebas o revise: npm run reportes`);
  process.exit(1);
}
const carpeta = join(base, elegida, 'html');
console.log(`Abriendo reporte: ${carpeta}`);
spawnSync('npx', ['playwright', 'show-report', carpeta], { stdio: 'inherit', shell: true });
 