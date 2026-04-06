export class User {
  constructor(raw = {}) {
    this.id = raw.id ?? null;
    this.email = raw.email ?? '';
    this.username = raw.username ?? '';
    this.firstName = raw.first_name ?? '';
    this.lastName = raw.last_name ?? '';
    this.fullName = `${this.firstName} ${this.lastName}`.trim();
    this.role = raw.rol ?? 'Sin rol';
    this.ci = raw.ci ?? '';
    this.telefono = raw.telefono ?? '';
  }
}