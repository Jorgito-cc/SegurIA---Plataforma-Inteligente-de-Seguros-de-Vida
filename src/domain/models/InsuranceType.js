export class InsuranceType{
    constructor(raw = {}) {
        this.id = raw.id ?? null ;
        this.nombre = raw.nombre ?? '' ;
        this.descripcion = raw.descripcion ?? '' ;
        this.estado = raw.estado ?? '' ; 
        this.codigoInterno = raw.codigo_interno ?? '' ; 
        
    }
}