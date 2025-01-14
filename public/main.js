const socket = io();
const desnormalize = normalizr.denormalize;
const schemaNormalizr = normalizr.schema;

socket.on('mensajeNuevo', data =>{
    let objDiv = document.getElementById("chat-history");
    let oldScrolltop = objDiv.scrollHeight-objDiv.offsetHeight;
    data = JSON.parse(data);
    document.getElementById('cajaChat').innerHTML = document.getElementById('cajaChat').innerHTML+ `<li>
    <div class="message-data">
    <span class="message-data-name"><i class="fa fa-circle online"></i> ${data.autor.mail}</span>
    <span class="message-data-time">${data.fecha}</span>
    </div>
    <div class="message my-message">
    ${data.mensaje}
    </div>
    </li>` ;
    if(oldScrolltop<objDiv.scrollTop){
        objDiv.scrollTop = objDiv.scrollHeight;
    }
})

socket.on('mensajesAnteriores', data =>{
    const schemaAutor = new schemaNormalizr.Entity('autor',{},{idAttribute:'mail'});
    const schemaMensaje = new schemaNormalizr.Entity('mensaje',{autor: schemaAutor});
    const schemaMensajes = new schemaNormalizr.Entity('mensajes',{mensajes: [schemaMensaje]});

    const denormalizedData = desnormalize(data.result, schemaMensajes, data.entities);

    let longitudNormalizado = JSON.stringify(data).length;
    let longitudDesnormalizado = JSON.stringify(denormalizedData).length;
    document.getElementById('compresion_chat').innerHTML = parseInt((longitudNormalizado/longitudDesnormalizado)*100);
    let objDiv = document.getElementById("chat-history");
    let oldScrolltop = objDiv.scrollHeight-objDiv.offsetHeight;
    for (let value of denormalizedData.mensajes) {
        let hora = moment(value.fecha).format('DD/MM/YYYY HH:mm:ss');
        document.getElementById('cajaChat').innerHTML = document.getElementById('cajaChat').innerHTML+ `<li>
        <div class="message-data">
        <span class="message-data-name"><i class="fa fa-circle online"></i> ${value.autor.mail}</span>
        <span class="message-data-time">${hora}</span>
        </div>
        <div class="message my-message">
        ${value.mensaje}
        </div>
        </li>` ;
        if(oldScrolltop<objDiv.scrollTop){
            objDiv.scrollTop = objDiv.scrollHeight;
        }
      }
})

socket.on('errorGrabarProducto', data =>{
    alert('ocurrio un error al tratar de guardar el producto, vuelva a intentarlo')
})

function validateEmail(email) {
    const re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(String(email).toLowerCase());
}

const enviar = () => {
    if(validateEmail(document.getElementById('mailMsj').value)){
        if(document.getElementById('mensaje').value && !/^\s*$/.test(document.getElementById('mensaje').value)){
            socket.emit('grabarMensaje', 
                `{ 
                    "autor":{
                        "mail":"${document.getElementById('mailMsj').value}",
                        "nombre": "${document.getElementById('nombreMsj').value}", 
                        "apellido": "${document.getElementById('apellidoMsj').value}", 
                        "edad": "${document.getElementById('edadMsj').value}", 
                        "alias": "${document.getElementById('aliasMsj').value}",
                        "avatar": "${document.getElementById('avatarMsj').value}"
                    },
                    "mensaje":"${document.getElementById('mensaje').value.replace(/(\r\n|\n|\r)/gm, "")}"
                }`
            );
            document.getElementById('mensaje').value='';
        }else{
            alert('No puede enviar un mensaje vacio.')
        }
    }else{
        alert('Ingrese un email valido.')
    }
}

const borrarProd = (id) => {
    if (confirm(`Esta seguro de borrar el producto ${id} ?`)) {
        fetch("/api/productos/"+id, {method: "DELETE"})
        .then(response => response.text())
        .then(data => {
            const json = JSON.parse(data);
            if(!json.mensajeError){
                alert(`Producto eliminado.`);
                window.location.reload();
            }else{
                console.log(json.mensajeError);
                alert(`no se pudo borrar el producto, consulte la consola para ver el error.`);
            }
        })
      }
}

const agregarCarrito = (id) =>{
    if(!document.getElementById('cantidad_'+id).value || isNaN(document.getElementById('cantidad_'+id).value) || document.getElementById('cantidad_'+id).value<=0){
        alert('La cantidad a agregar no puede ser 0!');
        return null;
    }
    let body = '{ "id":"'+id+'","cantidad":'+document.getElementById('cantidad_'+id).value+'}';
    fetch("/api/carrito/"+document.getElementById('carritoId').value+"/productos", {method: "POST",headers: {"Content-Type": "application/json"},body: body})
    .then(response => response.text())
    .then(data => {
        const json = JSON.parse(data);
        if(!json.mensajeError){
            alert(`Producto agregado!`);
        }else{
            console.log(json.mensajeError);
            alert(`no se pudo agregar el producto al carrito, consulte la consola para ver el error`);
        }
    });
}

const borrarProdCarrito = (id) => {
    if (confirm(`Esta seguro de borrar el producto ${id} ?`)) {
            fetch("/api/carrito/"+document.getElementById('carritoId').value+"/productos/"+id, {method: "DELETE"})
            .then(response => response.text())
            .then(data => {
                const json = JSON.parse(data);
                if(!json.mensajeError){
                    alert(`Producto eliminado.`);
                    window.location.reload();
                }else{
                    console.log(json.mensajeError);
                    alert(`no se pudo borrar el producto, consulte la consola para ver el error.`);
                }
            })
      } else {
        console.log('Thing was not saved to the database.');
      }
}

const finalizarCarrito = () =>{
    fetch("/FinalizarCarrito", {method: "GET"})
            .then(response => response.text())
            .then(data => {
                const json = JSON.parse(data);
                if(json.status=='ok'){
                    alert(`Compra completada!`);
                    window.location.replace("/");
                }else{
                    console.log(json.msg);
                    alert(`No se pudo completar la compra.`);
                }
            })
}

window.onload = function() {
    const formAgregarProductos = document.getElementById('agregarProductos');
    if(formAgregarProductos){
        formAgregarProductos.addEventListener('submit', e =>{
            e.preventDefault();
            if(!document.getElementById('codigo').value || /^\s*$/.test(document.getElementById('codigo').value)){
                alert('El campo codigo no puede estar vacio!');
                return null;
            }
            if(!document.getElementById('nombre').value || /^\s*$/.test(document.getElementById('nombre').value)){
                alert('El campo nombre no puede estar vacio!');
                return null;
            }
            if(!document.getElementById('precio').value || isNaN(document.getElementById('precio').value)){
                alert('Ingrese un precio valido!');
                return null;
            }
            if(isNaN(document.getElementById('stock').value)){
                alert('Ingrese un stock valido!');
                return null;
            }
            if(!document.getElementById('foto').value || /^\s*$/.test(document.getElementById('foto').value)){
                alert('El campo foto no puede estar vacio!');
                return null;
            }
            let body = '{ "codigo":"'+document.getElementById('codigo').value+'","nombre":"'+document.getElementById('nombre').value+'","precio":"'+document.getElementById('precio').value+'","foto":"'+document.getElementById('foto').value+'","stock":"'+document.getElementById('stock').value+'"}';
            fetch("/api/productos", {method: "POST",headers: {"Content-Type": "application/json"},body: body})
                .then(response => response.text())
                .then(data => {
                    const json = JSON.parse(data);
                    if(json.itemNuevo){
                        fetch("/api/productos/"+json.itemNuevo, {method: "GET"})
                        .then(response => response.text())
                        .then(data => {
                            const jsonProd = JSON.parse(data);
                            alert(`se creo el producto ${jsonProd.nombre} con el id ${jsonProd.id}`);
                            window.location.reload();
                        })
                    }else{
                        console.log(json.mensajeError);
                        alert(`no se pudo crear el producto, consulte la consola para ver el error`);
                    }
                });
        })
    }

    const formModificarProd = document.getElementById('modificarProd');
    if(formModificarProd){
        formModificarProd.addEventListener('submit', e =>{
            e.preventDefault();
            if(!document.getElementById('codigo').value || /^\s*$/.test(document.getElementById('codigo').value)){
                alert('El campo codigo no puede estar vacio!');
                return null;
            }
            if(!document.getElementById('nombre').value || /^\s*$/.test(document.getElementById('nombre').value)){
                alert('El campo nombre no puede estar vacio!');
                return null;
            }
            if(!document.getElementById('precio').value || isNaN(document.getElementById('precio').value)){
                alert('Ingrese un precio valido!');
                return null;
            }
            if(isNaN(document.getElementById('stock').value)){
                alert('Ingrese un stock valido!');
                return null;
            }
            if(!document.getElementById('foto').value || /^\s*$/.test(document.getElementById('foto').value)){
                alert('El campo foto no puede estar vacio!');
                return null;
            }

            let body = '{ "codigo":"'+document.getElementById('codigo').value+'","nombre":"'+document.getElementById('nombre').value+'","precio":"'+document.getElementById('precio').value+'","foto":"'+document.getElementById('foto').value+'","stock":"'+document.getElementById('stock').value+'"}';
            fetch("/api/productos/"+document.getElementById('id').value, {method: "PUT",headers: {"Content-Type": "application/json"},body: body})
                .then(response => response.text())
                .then(data => {
                    const json = JSON.parse(data);
                    if(!json.mensajeError){
                        alert(`se modifico el producto ${json.nombre} con el id ${json.id}`);
                        window.location.replace("/");
                    }else{
                        console.log(json.mensajeError);
                        alert(`no se pudo modificar el producto, consulte la consola para ver el error`);
                    }
                });
        })
    }
    const formLogin = document.getElementById('loginForm');
    const formLoginSubmit = document.getElementById('loginFormSubmit');
    if(formLoginSubmit){
        formLoginSubmit.addEventListener('click', e =>{
            e.preventDefault();
            if(!document.getElementById('username').value || /^\s*$/.test(document.getElementById('username').value)){
                alert('El campo usuario no puede estar vacio!');
                return null;
            }

            if(!document.getElementById('password').value || /^\s*$/.test(document.getElementById('password').value)){
                alert('El campo contraseña no puede estar vacio!');
                return null;
            }
            
            formLogin.submit();
        })
    }
    const formRegistroUsuario = document.getElementById('registroUsuario');
    const formRegistroUsuarioSubmit = document.getElementById('registroUsuarioSubmit');
    if(formRegistroUsuarioSubmit){
        formRegistroUsuarioSubmit.addEventListener('click', e =>{
            e.preventDefault();
            if(!document.getElementById('usernameRegistro').value || /^\s*$/.test(document.getElementById('usernameRegistro').value)){
                alert('El E-mail no puede estar vacio!');
                return null;
            }
            if(!document.getElementById('passwordRegistro').value || /^\s*$/.test(document.getElementById('passwordRegistro').value)){
                alert('La contraseña no puede estar vacia!');
                return null;
            }
            if(!document.getElementById('repass').value || String(document.getElementById('repass').value)!=String(document.getElementById('passwordRegistro').value)){
                alert('Las contraseñas deben coincidir!');
                return null;
            }
            if(!document.getElementById('nombreRegistro').value || /^\s*$/.test(document.getElementById('nombreRegistro').value)){
                alert('El Nombre no puede estar vacio!');
                return null;
            }
            if(!document.getElementById('apellidoRegistro').value || /^\s*$/.test(document.getElementById('apellidoRegistro').value)){
                alert('El apellido no puede estar vacio!');
                return null;
            }
            if(!document.getElementById('direccionRegistro').value || /^\s*$/.test(document.getElementById('direccionRegistro').value)){
                alert('La direccion no puede estar vacia!');
                return null;
            }
            if(!document.getElementById('edadRegistro').value || /^\s*$/.test(document.getElementById('edadRegistro').value)){
                alert('La edad no puede estar vacia!');
                return null;
            }
            if(!document.getElementById('telefonoRegistro').value || /^\s*$/.test(document.getElementById('telefonoRegistro').value)){
                alert('El Telefono no puede estar vacio!');
                return null;
            }
            if(!document.getElementById('fotoRegistro').value || /^\s*$/.test(document.getElementById('fotoRegistro').value)){
                alert('La foto de perfil no puede estar vacia!');
                return null;
            }
            
            const formData  = new FormData(formRegistroUsuario);
            
            fetch("/subirImagen/", {method: "POST",body: formData})
            .then(response => response.text())
            .then(data => {
                const json = JSON.parse(data);
                console.log(json);
                if(json.status == 'ok'){
                    document.getElementById("foto").value = json.image;
                    formRegistroUsuario.submit();
                }else{
                    window.location.replace(`/users/falloRegistro?msg=${json.msg}`);
                }
                
                
            });
        })
    }

    const cajaChat = document.getElementById('chat-history');
    if(cajaChat){
        socket.emit('recuperarMensajes');
    }

    if(document.querySelector("#telefonoRegistro")){
        const phoneInputField = document.querySelector("#telefonoRegistro");
        const phoneInput = window.intlTelInput(phoneInputField, {
            preferredCountries: ["ar"],
            utilsScript:
            "https://cdnjs.cloudflare.com/ajax/libs/intl-tel-input/17.0.8/js/utils.js",
        });

        phoneInputField.addEventListener('change', e =>{
            const info = document.querySelector(".alert-info");
            const phoneNumber = phoneInput.getNumber();
        
            info.style.display = "";
            info.innerHTML = `Su numero Internacional es: <strong>${phoneNumber}</strong>`;
            document.getElementById("telefonoRegistroInt").value = phoneNumber.replace(/[-+()\s]/g, '');
        })
    }
  };
