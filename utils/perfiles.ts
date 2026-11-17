/**
 * Credenciales de los perfiles demo. Se leen del archivo .env (que nunca se sube al repositorio).
 *   Perfil A → PERFIL_A_EMAIL / PERFIL_A_CLAVE
 *   Perfil B → PERFIL_B_EMAIL / PERFIL_B_CLAVE
 */
export interface Perfil {
  correo: string;
  clave: string;
}

export function perfil(letra: string): Perfil {
  const id = letra.trim().toUpperCase();
  const correo = process.env[`PERFIL_${id}_EMAIL`];
  const clave = process.env[`PERFIL_${id}_CLAVE`];
  if (!correo || !clave) {
    throw new Error(`Faltan PERFIL_${id}_EMAIL o PERFIL_${id}_CLAVE en el archivo .env (ver .env.example).`);
  }
  return { correo, clave };
}
