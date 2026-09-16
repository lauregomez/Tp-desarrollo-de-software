# Propuesta TP DSW

## Grupo
### Integrantes
* 54690 - Fiorillo Fernandez, Agustin
* 54291 - Gomez,Laureano Blas
* 54745 - Poy, Santiago

### Repositorios
* [fullstack app](https://github.com/lauregomez/Tp-desarrollo-de-software)

## Tema
### Descripción
Sistema web de venta de entradas para partidos de fútsal de la Asociación Rosarina. Permite consultar la programación de partidos y comprar entradas generales de forma online, generando un código QR por cada entrada para el acceso al evento. Busca reemplazar la venta presencial en efectivo, agilizando el ingreso a los partidos.

### Modelo
![DER](docs/img/DER%20TP%20DSW.drawio.png)

## Alcance Funcional

### Alcance Mínimo

Regularidad:
|Req|Detalle|
|:-|:-|
|CRUD simple|1. CRUD Club<br>2. CRUD Cancha<br>3. CRUD Usuario|
|CRUD dependiente|1. CRUD Partido {depende de} CRUD Club (local y visitante) y CRUD Cancha<br>2. CRUD Entrada {depende de} CRUD Partido y CRUD Usuario|
|Listado<br>+<br>detalle|1. Listado de partidos filtrado por fecha y categoría, muestra clubes, hora, cancha y si está agotado => detalle muestra información completa del partido<br>2. Listado de entradas del usuario filtrado por estado (pendiente/activa/usada), muestra partido y fecha => detalle muestra datos completos de la entrada con QR|
|CUU/Epic|1. Comprar entrada para un partido (selección de cantidad, máximo 5 por usuario → reserva temporal de 15 minutos → pago con MercadoPago → generación de un QR por entrada)<br>2. Validar entrada en cancha (escaneo de QR por operador, que marca la entrada como usada e impide su reutilización)|

Adicionales para Aprobación:
|Req|Detalle|
|:-|:-|
|CRUD|1. CRUD Club<br>2. CRUD Cancha<br>3. CRUD Usuario<br>4. CRUD Partido<br>5. CRUD Entrada|
|CUU/Epic|1. Comprar entrada para un partido (selección de cantidad, máximo 5 por usuario → reserva temporal de 15 minutos → pago con MercadoPago → generación de un QR por entrada)<br>2. Validar entrada en cancha (escaneo de QR por operador, que marca la entrada como usada e impide su reutilización)<br>3. Gestionar programación de partidos (el administrador carga los partidos en borrador y los publica para que puedan comprarse)|

### Alcance Adicional Voluntario

|Req|Detalle|
|:-|:-|
|Listados|1. Reporte de recaudación filtrado por partido, muestra ingresos y entradas vendidas|
|CUU/Epic|1. Chatbot de consultas con IA (el usuario puede consultar la programación en lenguaje natural; las respuestas se basan en datos reales obtenidos de la base de datos)|
|Otros|1. Notificación por email al comprar una entrada|
