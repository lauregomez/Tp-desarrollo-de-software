# Propuesta TP DSW

## Grupo
### Integrantes
* 54690 - Fiorillo Fernandez, Agustin
* 54291 - Gomez, Laureano Blas
* 54745 - Poy, Santiago

### Repositorios
* [fullstack app](https://github.com/lauregomez/Tp-desarrollo-de-software)

## Tema
### Descripción
Sistema web de venta de entradas para partidos de fútsal de la Asociación Rosarina. Permite consultar la programación de partidos y comprar entradas generales de forma online, generando un código alfanumérico por cada entrada que el asistente presenta para acceder al evento. Busca reemplazar la venta presencial en efectivo, agilizando el ingreso a los partidos.

### Modelo
![DER](docs/img/DER%20TP%20DSW.drawio.png)

## Alcance Funcional

### Alcance Mínimo

Regularidad:
|Req|Detalle|
|:-|:-|
|CRUD simple|1. CRUD Club<br>2. CRUD Usuario|
|CRUD dependiente|1. CRUD Cancha {depende de} CRUD Club<br>2. CRUD Partido {depende de} CRUD Club (local y visitante) y CRUD Cancha<br>3. CRUD Entrada {depende de} CRUD Partido y CRUD Usuario|
|Listado<br>+<br>detalle|1. Listado de partidos filtrado por club, cancha y búsqueda por texto, muestra clubes, hora, cancha y si está agotado => detalle muestra información completa del partido<br>2. Listado de entradas del usuario filtrado por estado (activa/vencida/usada), muestra partido y fecha => detalle muestra datos completos de la entrada con su código|
|CUU/Epic|1. Comprar entrada para un partido (selección de cantidad, máximo 5 por usuario → pago con MercadoPago → generación de un código por entrada una vez confirmado el pago)<br>2. Validar entrada en cancha (el operador ingresa el código que le indica el asistente, el sistema marca la entrada como usada e impide su reutilización)|

Adicionales para Aprobación:
|Req|Detalle|
|:-|:-|
|CRUD|1. CRUD Club<br>2. CRUD Cancha<br>3. CRUD Usuario<br>4. CRUD Partido<br>5. CRUD Entrada|
|CUU/Epic|1. Comprar entrada para un partido (selección de cantidad, máximo 5 por usuario → pago con MercadoPago → generación de un código por entrada una vez confirmado el pago)<br>2. Validar entrada en cancha (el operador ingresa el código que le indica el asistente, el sistema marca la entrada como usada e impide su reutilización)<br>3. Gestionar programación de partidos (el administrador carga los partidos en borrador, los publica para que puedan comprarse y luego los finaliza o suspende)|

### Alcance Adicional Voluntario

|Req|Detalle|
|:-|:-|
|Listados|1. Historial de partidos finalizados y suspendidos, muestra clubes, categoría, fecha, cancha y el administrador que realizó el cambio|
|Otros|1. Pronóstico del clima del día del partido, obtenido de una API externa y mostrado en el detalle del partido|
