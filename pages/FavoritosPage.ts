import { expect, type Locator, type Page } from '@playwright/test';

/** Mi cuenta → Mis favoritos (/account/favorites). */
export class FavoritosPage {
  readonly titulo: Locator;
  readonly tarjetas: Locator;
  readonly nombres: Locator;

  constructor(private readonly page: Page) {
    this.titulo = page.getByTestId('page-title');
    this.tarjetas = page.locator('[data-test^="favorite-"]');
    this.nombres = this.tarjetas.getByTestId('product-name');
  }

  /** Espera a que llegue la lista desde la API (antes de eso la página muestra el mensaje de vacía). */
  private esperarLista() {
    return this.page.waitForResponse(
      (r) => r.request().method() === 'GET' && new URL(r.url()).pathname.endsWith('/favorites'),
    );
  }

  /**
   * Espera a que la página termine de dibujar la lista antes de contar tarjetas.
   * (Contar justo al llegar la respuesta da 0, porque Angular todavía no las ha pintado.)
   */
  private async esperarTarjetas(respuesta: Promise<import('@playwright/test').Response>): Promise<void> {
    await respuesta;
    // Sin peticiones pendientes durante 0,5 s = Angular ya pintó la lista
    await this.page.waitForLoadState('networkidle');
    await expect(this.titulo).toBeVisible();
  }

  async abrir(): Promise<void> {
    const lista = this.esperarLista();
    await this.page.goto('/account/favorites');
    await this.esperarTarjetas(lista);
  }

  async recargar(): Promise<void> {
    const lista = this.esperarLista();
    await this.page.reload();
    await this.esperarTarjetas(lista);
  }

  /** Tarjeta cuyo nombre es exactamente el indicado. */
  tarjeta(nombre: string): Locator {
    const exacto = new RegExp(`^\\s*${nombre.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\s*$`);
    return this.tarjetas.filter({ has: this.page.getByTestId('product-name').filter({ hasText: exacto }) });
  }

  /**
   * Pulsa el botón de borrar de una tarjeta y espera a que el SERVIDOR confirme el borrado (DELETE /favorites/…).
   * No se confía en que la página se refresque sola: después se recarga y se cuenta lo que dice el servidor.
   */
  private async borrarTarjeta(tarjeta: Locator): Promise<void> {
    const respuesta = this.page.waitForResponse(
      (r) => r.request().method() === 'DELETE' && new URL(r.url()).pathname.includes('/favorites'),
    );
    await tarjeta.getByTestId('delete').click();
    const r = await respuesta;
    expect(r.ok(), `El servidor rechazó el borrado (HTTP ${r.status()})`).toBeTruthy();
  }

  async eliminar(nombre: string): Promise<void> {
    await this.abrir();
    // Primero se espera a que la tarjeta esté pintada; solo entonces se cuenta cuántas hay
    const objetivo = this.tarjeta(nombre).first();
    await expect(objetivo).toBeVisible();
    const antes = await this.tarjetas.count();
    await this.borrarTarjeta(objetivo);
    await this.recargar();
    await expect(this.tarjetas).toHaveCount(antes - 1);
  }

  /** Deja la lista vacía (preparación de cada escenario). */
  async vaciar(): Promise<void> {
    await this.abrir();
    let restantes = await this.tarjetas.count();
    while (restantes > 0) {
      await this.borrarTarjeta(this.tarjetas.first());
      await this.recargar();
      restantes = await this.tarjetas.count();
    }
    // Comprobación final: al recargar, el servidor confirma que la lista quedó vacía
    await this.recargar();
    await expect(this.tarjetas, 'La lista de favoritos debía quedar vacía antes del escenario').toHaveCount(0);
  }

  async nombresEnLista(): Promise<string[]> {
    return (await this.nombres.allTextContents()).map((n) => n.trim());
  }
}
