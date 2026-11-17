import type { Locator, Page } from '@playwright/test';

/** Catálogo (búsqueda) y detalle de producto: donde se marca un favorito. */
export class ProductoPage {
  readonly campoBusqueda: Locator;
  readonly botonBuscar: Locator;
  readonly botonFavorito: Locator;

  constructor(private readonly page: Page) {
    this.campoBusqueda = page.getByTestId('search-query');
    this.botonBuscar = page.getByTestId('search-submit');
    this.botonFavorito = page.getByTestId('add-to-favorites');
  }

  /**
   * Busca el producto por su nombre y abre su detalle.
   * Se navega por nombre (no por id) porque los id del sitio cambian cuando se reinicia la base de datos.
   */
  async abrirPorNombre(nombre: string): Promise<void> {
    await this.page.goto('/');
    await this.campoBusqueda.fill(nombre);
    await this.botonBuscar.click();
    const exacto = new RegExp(`^\\s*${nombre.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\s*$`);
    await this.page
      .locator('a[data-test^="product-"]')
      .filter({ has: this.page.getByTestId('product-name').filter({ hasText: exacto }) })
      .first()
      .click();
    await this.page.getByRole('heading', { level: 1, name: nombre }).waitFor();
  }

  /** Pulsa "Añadir a favoritos" y espera la respuesta del servidor (aceptada o rechazada). */
  async marcarFavorito(): Promise<void> {
    const respuesta = this.page.waitForResponse(
      (r) => r.request().method() === 'POST' && new URL(r.url()).pathname.endsWith('/favorites'),
    );
    await this.botonFavorito.click();
    await respuesta;
  }
}
