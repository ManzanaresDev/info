# dossier helper/index.ts avec foction de formattage d'une date internationale

```javascript
type FormatoPais = "es-ES" | "fr-FR" | "en-US";

interface Fecha {
fecha: string;
formato_pais: FormatoPais;
}

export const convertirFecha = ({
fecha,
formato_pais,
}: Fecha): string => {
const fechaNueva = new Date(fecha);

const opciones: Intl.DateTimeFormatOptions = {
year: "numeric",
month: "long",
day: "2-digit",
};

return fechaNueva.toLocaleDateString(formato_pais, opciones);
};
```
