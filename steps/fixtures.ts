import { test as base, createBdd } from 'playwright-bdd';
import { LoginPage } from '../pages/LoginPage';
import { ProductoPage } from '../pages/ProductoPage';
import { FavoritosPage } from '../pages/FavoritosPage';

/** Datos que un paso deja para un paso posterior del mismo escenario. */
export interface Contexto {
  productos: string[];
}

/** Fixtures: cada escenario recibe sus Page Objects ya creados y un contexto limpio. */
export const test = base.extend<{
  login: LoginPage;
  producto: ProductoPage;
  favoritos: FavoritosPage;
  contexto: Contexto;
}>({
  login: async ({ page }, use) => use(new LoginPage(page)),
  producto: async ({ page }, use) => use(new ProductoPage(page)),
  favoritos: async ({ page }, use) => use(new FavoritosPage(page)),
  contexto: async ({}, use) => use({ productos: [] }),
});

export const { Given, When, Then, Before, After } = createBdd(test);
