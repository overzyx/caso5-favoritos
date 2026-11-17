import { expect, type Locator, type Page } from '@playwright/test';

/** Página de inicio de sesión de practicesoftwaretesting.com (/auth/login). */
export class LoginPage {
  readonly campoCorreo: Locator;
  readonly campoClave: Locator;
  readonly botonIngresar: Locator;
  readonly menuUsuario: Locator;
  readonly opcionCerrarSesion: Locator;

  constructor(private readonly page: Page) {
    this.campoCorreo = page.getByTestId('email');
    this.campoClave = page.getByTestId('password');
    this.botonIngresar = page.getByTestId('login-submit');
    this.menuUsuario = page.getByTestId('nav-menu');
    this.opcionCerrarSesion = page.getByTestId('nav-sign-out');
  }

  async abrir(): Promise<void> {
    await this.page.goto('/auth/login');
  }

  /** Inicia sesión y espera a llegar a "Mi cuenta". */
  async iniciarSesion(correo: string, clave: string): Promise<void> {
    await this.abrir();
    await this.campoCorreo.fill(correo);
    await this.campoClave.fill(clave);
    await this.botonIngresar.click();
    try {
      await expect(this.page).toHaveURL(/\/account$/);
    } catch {
      // Muestra el motivo que da el sitio (clave incorrecta, cuenta bloqueada…) en vez de un simple "URL distinta"
      const motivo = await this.page.locator('.alert-danger, [data-test="login-error"]').allInnerTexts();
      throw new Error(`No se pudo iniciar sesión con ${correo}: ${motivo.join(' ').trim() || 'sin mensaje del sitio'}`);
    }
  }

  async cerrarSesion(): Promise<void> {
    await this.menuUsuario.click();
    await this.opcionCerrarSesion.click();
    // El sitio no siempre redirige al login: la señal de sesión cerrada es que vuelve a aparecer "Iniciar sesión"
    await expect(this.page.getByTestId('nav-sign-in')).toBeVisible();
  }
}
