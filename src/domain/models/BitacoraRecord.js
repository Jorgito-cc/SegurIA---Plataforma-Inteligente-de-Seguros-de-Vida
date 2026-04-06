export class BitacoraRecord {
  constructor(raw = {}) {
    this.id = raw.id ?? null;
    this.usuario = raw.usuario ?? null;
    this.accion = raw.accion ?? '';
    this.detalle = raw.detalle ?? '';
    this.fecha = raw.fecha ?? null;
    this.ip = raw.ip ?? '';
  }
}