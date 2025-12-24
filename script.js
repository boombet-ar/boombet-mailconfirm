// Esta función se ejecuta apenas carga la página
window.onload = function() {
    
    // 1. OBTENER EL TOKEN DE LA URL
    // La URL actual es: https://tudominio.com/verificar/EL_TOKEN_AQUI
    const path = window.location.pathname; // Devuelve "/verificar/EL_TOKEN_AQUI"
    
    // Cortamos el string por las barras "/" y nos quedamos con la última parte
    const partes = path.split('/');
    const token = partes[partes.length - 1]; // "EL_TOKEN_AQUI"

    // Validación simple por si entraron sin token
    if (!token || token === "verificar" || token === "index.html" || token === "") {
        console.error('No se encontró un token válido en la URL');
        // Aquí podrías mostrar un mensaje de error en la UI si quieres
        return;
    }

    console.log("Token capturado:", token);

    // 2. LLAMAR A LA API
    // Endpoint: /api/users/auth/verify?token=XYZ
    
    fetch(`/api/users/auth/verify?token=${token}`, {
        method: 'GET'
    })
    .then(response => {
        if (response.ok) {
            // Si el código es 200
            console.log('¡Cuenta verificada con éxito!');
            
            // Opcional: Podrías actualizar el texto de la página
            // document.querySelector('h2').innerText = "¡Verificación Exitosa!";
            
            // Opcional: Redirigir a la app después de unos segundos
            // setTimeout(() => {
            //     window.location.href = 'https://boombetbackend.calmpebble-5d8daaab.brazilsouth.azurecontainerapps.io';
            // }, 3000);
        } else {
            // Si es 400, 401, 500, etc.
            console.error('El enlace ha caducado o no es válido');
            // Aquí podrías mostrar un mensaje de error en la UI
        }
    })
    .catch(error => {
        console.error('Error al conectar con el servidor:', error);
    });

    // 3. CONFIGURAR BOTÓN PARA DEEP LINK
    const btnReturnApp = document.getElementById('btnReturnApp');
    if (btnReturnApp) {
        btnReturnApp.addEventListener('click', function(e) {
            e.preventDefault();
            
            // Redirige al esquema de la app
            window.location.href = 'boombet://verified';
        });
    }
};
