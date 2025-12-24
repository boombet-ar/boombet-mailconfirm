// Esta función se ejecuta apenas carga la página
window.onload = function () {
  // 1. OBTENER EL TOKEN DE LA URL
  // La URL actual es: https://tudominio.com/verificar/EL_TOKEN_AQUI
  const path = window.location.pathname; // Devuelve "/verificar/EL_TOKEN_AQUI"

  // Cortamos el string por las barras "/" y nos quedamos con la última parte
  const partes = path.split("/");
  const token = partes[partes.length - 1]; // "EL_TOKEN_AQUI"

  console.log(token)
  // Validación simple por si entraron sin token
  if (
    !token ||
    token === "verificar" ||
    token === "index.html" ||
    token === ""
  ) {
    console.error("No se encontró un token válido en la URL");
    // Aquí podrías mostrar un mensaje de error en la UI si quieres
    return;
  }

  console.log("Token capturado:", token);

  // 2. LLAMAR A LA API
  // Endpoint: /api/users/auth/verify?token=XYZ

  const backendUrl = import.meta.env.VITE_BACKEND_URL;
  if (!backendUrl) {
      console.error("Error de configuración: Falta VITE_BACKEND_URL");
      return;
  }

  const endpoint = `${backendUrl}/api/users/auth/verify?token=${token}`;

  fetch(endpoint, {
    method: "GET",
  })
    .then((response) => {
      if (response.ok) {
        // Si el código es 200
        console.log("¡Cuenta verificada con éxito!");

        // Opcional: Podrías actualizar el texto de la página
        // document.querySelector('h2').innerText = "¡Verificación Exitosa!";

        // Opcional: Redirigir a la app después de unos segundos
        // setTimeout(() => {
        // }, 3000);
      } else {
        // Si es 400, 401, 500, etc.
        console.error("El enlace ha caducado o no es válido");
        // Aquí podrías mostrar un mensaje de error en la UI
      }
    })
    .catch((error) => {
      console.error("Error al conectar con el servidor:", error);
    });

  // 3. CONFIGURAR BOTÓN CON LÓGICA CONDICIONAL
  const btnReturnApp = document.getElementById("btnReturnApp");
  
  if (btnReturnApp) {
    btnReturnApp.addEventListener("click", function (e) {
      e.preventDefault();

      // Leer variables de entorno inyectadas por Vite
      const webUrl = import.meta.env.VITE_WEB_URL;
      const deepLink = import.meta.env.VITE_DEEP_LINK;

      // Detectar si es Android
      const userAgent = navigator.userAgent || navigator.vendor || window.opera;
      const isAndroid = /android/i.test(userAgent);

      if (isAndroid) {
        // Si es Android, usamos el Deep Link
        console.log("Dispositivo Android detectado. Abriendo App...");
        if(deepLink) window.location.href = deepLink;
        else console.error("Falta definir VITE_DEEP_LINK");
      } else {
        // Si es Desktop (o iOS/otros), mandamos a la Web
        console.log("Escritorio detectado. Yendo a la Web...");
        if(webUrl) window.location.href = webUrl;
        else console.error("Falta definir VITE_WEB_URL");
      }
    });
  }
};
