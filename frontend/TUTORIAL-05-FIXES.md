# Tutorial 05 — malas prácticas encontradas y cómo las corregí

El tutorial advierte que trae varias malas prácticas y la tarea final pide "ordenar el
desastre de código". Implementé las tres funcionalidades que pedía el tutorial
(formateo de precios, filtro por categoría y sistema de reseñas), pero escribiendo la
versión ordenada. Esta es la lista de lo que encontré.

## Bugs reales (la aplicación se comporta mal)

### 1. El filtro de categorías se queda desactualizado

El tutorial arma el filtro así:

```ts
const books = BookService.getBooks();
const filteredBooks = ref(books);

watch(selectedCategory, (newCategory) => {
  if (newCategory) {
    filteredBooks.value = books.filter((book) => book.category === newCategory);
  } else {
    filteredBooks.value = books;
  }
});
```

El `watch` solo escucha `selectedCategory`. Si estoy viendo una categoría filtrada y
creo o borro un libro, la lista en pantalla no se entera porque nada volvió a
disparar el `watch`.

**Corrección:** un `computed`, que sí depende de las dos cosas (la categoría elegida y
la lista de libros del store) y se recalcula solo:

```ts
const filteredBooks = computed(() =>
  selectedCategory.value
    ? books.filter((book) => book.category === selectedCategory.value)
    : books,
);
```

### 2. Las categorías nuevas no aparecen en el filtro

`const selectorCategories = OtherService.getUniqueBookCategories()` se ejecuta una sola
vez, cuando se monta la vista. Si creo un libro con una categoría que no existía, esa
categoría nunca aparece en el selector.

**Corrección:** también un `computed`. Lo verifiqué creando un libro de categoría
"Science" y comprobando que la opción aparece en el filtro sin recargar.

### 3. El mensaje de "no hay libros" quedó revisando la lista equivocada

Quedaba `v-if="books.length === 0"` mientras la grilla ya mostraba `filteredBooks`.
Si un filtro no daba resultados, la pantalla quedaba en blanco sin ningún mensaje.

**Corrección:** el mensaje ahora revisa `filteredBooks`.

## Código repetido

### 4. La función de formatear precios estaba copiada en dos vistas

`formatToCOP` aparece idéntica en `BooksIndexView.vue` y en `BooksShowView.vue`. Si
mañana cambia el formato hay que acordarse de cambiarlo en los dos lados.

**Corrección:** la moví a `src/utils/format.ts`, junto con `formatDate` (que estaba
metida dentro del componente de reseñas por la misma razón).

### 5. El formateador se creaba de nuevo en cada llamada

`new Intl.NumberFormat(...)` estaba dentro de la función, así que se construía un
formateador por cada libro, en cada renderizado.

**Corrección:** se crea una sola vez a nivel del módulo.

### 6. Se quitaba el símbolo de moneda para volverlo a poner a mano

El tutorial pide moneda a `Intl` y después le borra el signo con una expresión regular:

```ts
return formatter.format(price).replace(/^\s*\$\s?/, '');
```

...para que la plantilla lo vuelva a escribir: `${{ formatToCOP(book.price) }} COP`.

**Corrección:** la función devuelve el precio ya completo y la plantilla solo lo
muestra. Así el formato del precio está definido en un solo lugar.

## Nombres y estructura

### 7. "OtherService" no dice nada

Un servicio llamado "otros" que solo saca las categorías de los libros. Además usaba
`export default` mientras el resto del proyecto usa exportaciones con nombre, e
importaba con ruta relativa (`'./BookService.js'`) mientras el resto usa el alias `@/`.

**Corrección:** eliminé el archivo y puse `getCategories()` dentro de `BookService`,
que es donde vive todo lo relacionado con libros.

### 8. Método muerto en ReviewService

`getReviews()` no se usa en ninguna parte. Lo quité.

### 9. Importaciones inconsistentes

`reviewseeder.ts` y `ReviewService.ts` importaban sin `.js` y `reviewstore.ts` con
`.js`. Dejé todas con `.js`, como el resto del proyecto.

## Código defensivo que no defiende de nada

### 10. Un estado de "enviando" que nunca se ve

```ts
const isSubmitting = ref(false);
isSubmitting.value = true;
// ...guardar...
isSubmitting.value = false;
```

Las dos líneas están en la misma función y no hay nada asíncrono en el medio, así que
la pantalla nunca alcanza a ver el `true`. El `:disabled="isSubmitting || ..."` es una
condición que jamás se cumple. Lo eliminé.

### 11. La calificación se recortaba entre 1 y 5

`Math.min(5, Math.max(1, form.value.rating))` sobre un valor que sale de un `<select>`
cuyas únicas opciones son 1, 2, 3, 4 y 5. Lo quité.

### 12. El comentario se validaba tres veces

El tutorial lo revisa en el `if` de la función, en el `required` del `textarea` y en el
`:disabled` del botón. Dejé una sola: el botón se deshabilita mientras el comentario
esté vacío, que además es la que el usuario alcanza a ver.

## Modelo de datos

### 13. El autor pasaba por tres capas de "puede no estar"

`author?: string` en la interfaz, `|| undefined` al guardar y `|| 'Anonymous'` al
mostrar. Ahora `author` es obligatorio y, si el usuario no escribe nombre, se guarda
`'Anonymous'` una sola vez, al crear la reseña.

### 14. Las reseñas de ejemplo no tenían fecha

`createdAt` es opcional en la interfaz, pero `createReview` siempre la pone. El
resultado es que las reseñas creadas por el usuario muestran fecha y las del seeder no,
sin ninguna razón. La hice obligatoria y le puse fechas al seeder.

### 15. El id siguiente se calculaba de una forma frágil

```ts
const nextId = store.reviews.length > 0
  ? Math.max(...store.reviews.map((r) => r.id), 0) + 1
  : 1;
```

El ternario sobra, porque `Math.max(..., 0) + 1` ya da 1 con la lista vacía. Y el
`...` de `Math.max` pasa un argumento por reseña, así que con una lista larga la
llamada revienta.

**Corrección:** el mismo `reduce` que ya usaba `BookService.createBook`, así los dos
servicios calculan el id de la misma manera.

### 16. Faltaba el DTO de creación

`BookService.createBook` recibe un `CreateBookDTO`, pero `createReview` recibía un
`Omit<ReviewInterface, 'id'>` escrito ahí mismo. Creé `CreateReviewDTO` para que las
dos partes del proyecto se vean igual.

## Presentación

### 17. El selector de categorías tenía clases que se contradicen

Iba dentro de un `div` con `flex justify-end` pero con `w-full`, así que ocupaba todo
el ancho y el "justify-end" no hacía nada. Lo puse en la misma barra de los botones:
filtro a la izquierda, acciones a la derecha.

## Una nota sobre los precios

Los libros del seeder tienen precios como 12.99 o 45.00, que son precios en dólares, y
el tutorial los muestra rotulados como pesos colombianos. Mantuve el formato COP porque
es lo que pedía el tutorial, y con 0 decimales, que es lo correcto para esa moneda.
Vale la pena anotar que los datos y la etiqueta no coinciden.
