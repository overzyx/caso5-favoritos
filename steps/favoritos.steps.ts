import { expect } from '@playwright/test';
import type { DataTable } from 'playwright-bdd';
import { Given, When, Then } from './fixtures';
import { perfil } from '../utils/perfiles';

// ============================ Dado (preparar el estado) ============================
// Cada escenario prepara su propio estado: no depende de que otro se haya ejecutado antes (DEF-E4-01/02).

Given('que el perfil {word} inició sesión con la lista de favoritos vacía', async ({ login, favoritos }, letra: string) => {
  const p = perfil(letra);
  await login.iniciarSesion(p.correo, p.clave);
  await favoritos.vaciar();
});

Given('que el perfil {word} inició sesión con {string} en favoritos', async ({ login, favoritos, producto }, letra: string, nombre: string) => {
  const p = perfil(letra);
  await login.iniciarSesion(p.correo, p.clave);
  await favoritos.vaciar();
  await producto.abrirPorNombre(nombre);
  await producto.marcarFavorito();
});

Given('que el perfil {word} inició sesión con {string} y {string} en favoritos',
  async ({ login, favoritos, producto }, letra: string, primero: string, segundo: string) => {
    const p = perfil(letra);
    await login.iniciarSesion(p.correo, p.clave);
    await favoritos.vaciar();
    for (const nombre of [primero, segundo]) {
      await producto.abrirPorNombre(nombre);
      await producto.marcarFavorito();
    }
  });

Given('que el perfil {word} tiene la lista de favoritos vacía', async ({ login, favoritos }, letra: string) => {
  const p = perfil(letra);
  await login.iniciarSesion(p.correo, p.clave);
  await favoritos.vaciar();
  await login.cerrarSesion();
});

Given('que no hay una sesión iniciada', async ({ page }) => {
  // Cada escenario abre un navegador nuevo, sin token guardado; se comprueba que se ve "Iniciar sesión".
  await page.goto('/');
  await expect(page.getByTestId('nav-sign-in')).toBeVisible();
});

// ============================ Cuando (acciones) ============================

When('marca {string} como favorito', async ({ producto }, nombre: string) => {
  await producto.abrirPorNombre(nombre);
  await producto.marcarFavorito();
});

When('marca como favoritos los productos:', async ({ producto, contexto }, tabla: DataTable) => {
  contexto.productos = tabla.hashes().map((fila) => fila.producto.trim());
  for (const nombre of contexto.productos) {
    await producto.abrirPorNombre(nombre);
    await producto.marcarFavorito();
  }
});

When('elimina {string} de su lista de favoritos', async ({ favoritos }, nombre: string) => {
  await favoritos.eliminar(nombre);
});

When('recarga la página', async ({ favoritos }) => {
  await favoritos.recargar();
});

When('abre su lista de favoritos', async ({ favoritos }) => {
  await favoritos.abrir();
});

When('cierra sesión e inicia sesión con el perfil {word}', async ({ login }, letra: string) => {
  const p = perfil(letra);
  await login.cerrarSesion();
  await login.iniciarSesion(p.correo, p.clave);
});

// ============================ Entonces (verificaciones) ============================

Then('ve el mensaje {string}', async ({ page }, mensaje: string) => {
  // Mensaje emergente (toast) que muestra el sitio
  await expect(page.getByText(mensaje).first()).toBeVisible();
});

Then('ve el mensaje de lista vacía {string}', async ({ favoritos, page }, mensaje: string) => {
  await expect(favoritos.tarjetas).toHaveCount(0);
  await expect(page.getByText(mensaje)).toBeVisible();
});

Then('su lista de favoritos contiene solo {string}', async ({ favoritos }, nombre: string) => {
  await favoritos.abrir();
  await expect(favoritos.nombres).toHaveText([nombre]);
});

Then('{string} aparece {int} vez en su lista de favoritos', async ({ favoritos }, nombre: string, veces: number) => {
  await favoritos.abrir();
  await expect(favoritos.tarjeta(nombre)).toHaveCount(veces);
});

Then('su lista de favoritos no contiene {string}', async ({ favoritos }, nombre: string) => {
  await favoritos.abrir();
  await expect(favoritos.tarjeta(nombre)).toHaveCount(0);
});

Then('su lista de favoritos contiene exactamente esos {int} productos', async ({ favoritos, contexto }, cantidad: number) => {
  await favoritos.abrir();
  await expect(favoritos.tarjetas).toHaveCount(cantidad);
  const enLista = (await favoritos.nombresEnLista()).sort();
  expect(enLista).toEqual([...contexto.productos].sort());
});
