import { User } from "./User";

export class Client extends User {
  constructor(raw = {}) {
    super(raw);
    this.direccion = raw.direccion ?? '';
    this.fechaNacimiento = raw.fecha_nacimiento ?? null;
    this.profesionOficio = raw.profesion_oficio ?? '';
    this.esFumador = Boolean(raw.es_fumador);
    this.ingresosMensuales = raw.ingresos_mensuales ?? null;
  }
}


