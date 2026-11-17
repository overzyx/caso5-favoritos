# Caso 5 – Play&Learn · Automatización de Favoritos

Automatización de la prueba de regresión de **Favoritos** (historias US-615 y US-616) del Caso 5 – Play&Learn, curso Calidad de Pruebas – USB.
Los escenarios se ejecutan sobre [practicesoftwaretesting.com](https://practicesoftwaretesting.com), la plataforma sustituta usada en la Etapa 4.

**Stack:** Playwright · [playwright-bdd](https://vitalets.github.io/playwright-bdd) (Gherkin en español) · TypeScript · Page Object Model.

## Estructura

```
features/favoritos/favoritos.feature   10 escenarios Gherkin (CP-615-01…06, CP-616-01, 02, 03, 05)
steps/favoritos.steps.ts               Implementación de cada frase Dado / Cuando / Entonces
steps/fixtures.ts                      Page Objects y contexto entregados a cada paso
steps/hooks.ts                         Idioma español antes de cada escenario; captura EV-AUT después
pages/                                 Page Objects: LoginPage, ProductoPage, FavoritosPage
utils/perfiles.ts                      Lee las credenciales de los perfiles desde .env
utils/evidencias.ts                    Adjunta capturas al reporte
playwright.config.ts                   Configuración (navegadores, reportes, tiempos)
```

## Cómo ejecutar

1. Instalar dependencias y el navegador:
   ```bash
   npm install
   npx playwright install chromium
   ```
2. Copiar `.env.example` como `.env` y completar las credenciales de dos cuentas demo del sitio (perfil A y perfil B).
   El archivo `.env` no se sube al repositorio.
3. Ejecutar la suite (en serie, porque los escenarios comparten las cuentas):
   ```bash
   npm run test:favoritos
   ```
   Otras opciones: `npm run test:smoke` (3 escenarios de humo) o `npm test -- --grep "@CP-615-02"` (un caso).
4. Ver el reporte HTML:
   ```bash
   npx playwright show-report reportes/<fecha-hora>/html
   ```

## Notas

- Cada escenario prepara y **verifica** su propio estado (vacía la lista de favoritos y lo comprueba con el servidor), así que no depende del orden de ejecución.
- Las cuentas demo son públicas: si otra persona las usa al mismo tiempo, los resultados pueden variar. Para ejecutar en paralelo con otra persona, usen cuentas distintas en el `.env`.
- Resultado de referencia: 10 de 10 escenarios aprobados en ~2 min 10 s (16/11/2026).

**Equipo:** Santiago Armero · Sebastián Carrera · Juan Jose Arango
