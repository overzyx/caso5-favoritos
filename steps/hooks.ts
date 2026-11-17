import { Before, After } from './fixtures';
import { adjuntarCaptura } from '../utils/evidencias';

/**
 * Antes de cada escenario: el sitio en español.
 * La web guarda el idioma en localStorage ("language"), así que se fija antes de cargar cualquier página;
 * los mensajes que se verifican son los de la versión en español.
 */
Before(async ({ context }) => {
  await context.addInitScript(() => window.localStorage.setItem('language', 'es'));
});

/** Después de cada escenario: captura final como evidencia, con el nombre EV-AUT-<caso>. */
After(async ({ page, $testInfo, $tags }) => {
  const caso = $tags.find((t) => t.startsWith('@CP-'))?.slice(1) ?? 'sin-caso';
  await adjuntarCaptura(page, $testInfo, `EV-AUT-${caso}`);
});
