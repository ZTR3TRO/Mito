// Salir de algo a medias (p. ej. una ronda del quiz). Sin dominio: quien tiene algo en curso
// registra una comprobación con setLeaveCheck(); quien navega envuelve su acción con guardLeave().
// La comprobación recibe `proceed` (la acción que se iba a hacer) y decide si la ejecuta ya o tras preguntar.

let check = null;

export function setLeaveCheck(fn){
  check = fn;
}

// target: a dónde se va (p. ej. el nombre de la vista), por si la comprobación lo necesita.
export function guardLeave(proceed, target){
  if(check) check(proceed, target);
  else proceed();
}
