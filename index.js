const express = require('express');

const app = express();

const PORT = 8080;

const productos = require('./clases/Productos.js');

const prod = new productos();

app.get('/',(peticion, respuesta) => {
    respuesta.send(`<h1>Bienvenido!</h1>
    <h2>utilice alguna de las siguientes direcciones para probar las distintas funciones</h2>
    <h3><a href="/productos">/productos</a> uselo para ver todos los productos</h3>
    <h3><a href="/productoRandom">/productoRandom</a> trae un producto random de los productos</h3>
    <h3><a href="/producto?id=N">/producto?id=N</a> trae un producto especifico de los productos, cambie el parametro ID para buscar otro distinto</h3>
    <h3><a href="/agregarProducto?nombre=xxxxx&precio=N">/agregarProducto?nombre=xxxxx&precio=N</a> agrega un prducto seteando el parametro nombre y precio en la url</h3>
    <h3><a href="/eliminarProducto?id=N">/eliminarProducto?id=N</a> elimina un producto especifico mandando su ID</h3>
    <h3><a href="/eliminarTodos">/eliminarTodos</a> elimina todos los productos</h3>
    <h3><a href="/productosReset">/productosReset</a> setea los productos originales</h3>`);
})

app.get('/productos',(peticion, respuesta) => {

    (async() => {
        let todos = await prod.getAll();
        if(todos){
            var string = todos.map(function(obj){
                return `<li> Nombre: ${obj.title}, Precio: ${obj.price}, Thumbnail: ${obj.thumbnail} </li>`
            }).join('</br>');
            respuesta.send(`<a href="/">Volver</a></br></br><ul>${string}</ul>`);
        }else{
            respuesta.send(`<a href="/">Volver</a></br></br>no hay productos`);
        }
      })();
})

app.get('/productoRandom',(peticion, respuesta) => {
    (async() => {
        let todos = await prod.getAll();
        let item = todos[Math.floor(Math.random()*todos.length)];
        
        if(item){
            let itemFormateado = `<li> Nombre: ${item.title}, Precio: ${item.price}, Thumbnail: ${item.thumbnail} </li>`;
            respuesta.send(`<a href="/">Volver</a></br></br><ul>${itemFormateado}</ul>`);
        }else{
            respuesta.send('<a href="/">Volver</a></br></br>no se encontraron productos');
        }
      })();
})

app.get('/producto',(peticion, respuesta) => {
    let id = peticion.query.id;

    if(id === 'N'){
        respuesta.send('<a href="/">Volver</a></br></br>Reemplace la letra <b>N</b> en el parametro <b>id</b> de la url para obtener un producto');
    }else{
        (async() => {
            let buscado = await prod.getById(id);
            if(buscado){
                let itemFormateado = `<li> Nombre: ${buscado.title}, Precio: ${buscado.price}, Thumbnail: ${buscado.thumbnail} </li>`;
                respuesta.send(`<a href="/">Volver</a></br></br><ul>${itemFormateado}</ul>`);
            }else{
                respuesta.send(`<a href="/">Volver</a></br></br>no se encontro dicho producto`);
            }
          })();
    }
})

app.get('/agregarProducto',(peticion, respuesta) => {
    let nombre = peticion.query.nombre;
    let precio = peticion.query.precio;

    if(nombre === 'xxxxx' || precio === 'N'){
        respuesta.send('<a href="/">Volver</a></br></br>Reemplace <b>xxxxx</b> en el parametro <b>nombre</b> y <b>N</b> en el parametro <b>precio</b> de la url para agregar un producto');
    }else{
        (async() => {
            let nuevo = await prod.save({title:nombre,price:precio,thumbnail:'https://st4.depositphotos.com/14953852/24787/v/600/depositphotos_247872612-stock-illustration-no-image-available-icon-vector.jpg'});
            if(nuevo){
                respuesta.send(`<a href="/">Volver</a></br></br>El producto <b>${nombre}</b> se grabo con el id <b>${nuevo}</b>`);
            }else{
                respuesta.send(`<a href="/">Volver</a></br></br>no se pudo grabar el producto`);
            }
          })();
    }
})

app.get('/eliminarProducto',(peticion, respuesta) => {
    let id = peticion.query.id;

    if(id === 'N'){
        respuesta.send('<a href="/">Volver</a></br></br>Reemplace la letra <b>N</b> en el parametro <b>id</b> de la url para borrar un producto');
    }else{
        (async() => {
            let buscado = await prod.getById(id);
            if(buscado){
                await prod.deleteById(id);
                respuesta.send(`<a href="/">Volver</a></br></br>El producto ${id} fue borrado`);
            }else{
                respuesta.send(`<a href="/">Volver</a></br></br>no se encontro dicho producto`);
            }
          })();
    }
})

app.get('/eliminarTodos',(peticion, respuesta) => {

    (async() => {
        await prod.deleteAll();
        respuesta.send(`<a href="/">Volver</a></br></br>Se borraron todos los productos`);
      })();
})

app.get('/eliminarProductos',(peticion, respuesta) => {

    (async() => {
        await prod.deleteAll();
        respuesta.send(`<a href="/">Volver</a></br></br>Se borraron todos los productos`);
      })();
})

app.get('/productosReset',(peticion, respuesta) => {

    (async() => {
        await prod.deleteAll();
        await prod.save({title:`Escuadra`,price:123.45,thumbnail:'https://cdn3.iconfinder.com/data/icons/education-209/64/ruler-triangle-stationary-school-256.png'});
        await prod.save({title:`Calculadora`,price:234.56,thumbnail:'https://cdn3.iconfinder.com/data/icons/education-209/64/calculator-math-tool-school-256.png'});
        await prod.save({title:`Globo Terraqueo`,price:345.67,thumbnail:'https://cdn3.iconfinder.com/data/icons/education-209/64/globe-earth-geograhy-planet-school-256.png'});
        respuesta.send(`<a href="/">Volver</a></br></br>Se resetearon los productos a los defaults`);
      })();
})

const server = app.listen(PORT, () => {
    console.log(`test en el puesto ${server.address().port}`);
});