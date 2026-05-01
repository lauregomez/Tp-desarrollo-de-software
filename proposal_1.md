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
Sistema web de venta de entradas para partidos de fútsal de la Asociación Rosarina. Permite consultar la programación de partidos y comprar entradas de forma online, generando un código QR para el acceso al evento. Busca reemplazar la venta presencial en efectivo, agilizando el ingreso a los partidos.

### Modelo
![imagen del modelo]()

## Alcance Funcional

### Alcance Mínimo

Regularidad:
|Req|Detalle|
|:-|:-|
|CRUD simple|1. CRUD Club<br>2. CRUD Cancha<br>3. CRUD Equipo|
|CRUD dependiente|1. CRUD Partido {depende de} CRUD Equipo y CRUD Cancha<br>2. CRUD Entrada {depende de} CRUD Partido y Usuario|
|Listado<br>+<br>detalle|1. Listado de partidos filtrado por fecha, muestra equipos, hora y cancha => detalle muestra información completa del partido<br>2. Listado de entradas del usuario filtrado por estado (activa/usada/cancelada), muestra partido y fecha => detalle muestra datos completos de la entrada con QR|
|CUU/Epic|1. Comprar entrada para un partido (selección → pago con MercadoPago → generación de QR)<br>2. Validar entrada en cancha (escaneo de QR por operador)|

Adicionales para Aprobación:
|Req|Detalle|
|:-|:-|
|CRUD|1. CRUD Club<br>2. CRUD Cancha<br>3. CRUD Equipo<br>4. CRUD Partido<br>5. CRUD Entrada<br>6. CRUD Usuario<br>7. CRUD Rol|
|CUU/Epic|1. Comprar entrada para un partido (selección → pago con MercadoPago → generación de QR)<br>2. Validar entrada en cancha (escaneo de QR por operador)<br>3. Gestionar programación de partidos (el administrador carga los partidos que luego pueden comprarse)|

### Alcance Adicional Voluntario

|Req|Detalle|
|:-|:-|
|Listados|1. Reporte de recaudación filtrado por partido, muestra ingresos y entradas vendidas|
|CUU/Epic|1. Cancelación de entrada<br>2. Chatbot de consultas con IA (el usuario puede consultar la programación en lenguaje natural)|
|Otros|1. Notificación por email al comprar una entrada|
