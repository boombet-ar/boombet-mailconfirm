window.onload = function () {
  console.log("Iniciando script...");

  // 1. OBTENER EL TOKEN DE LA URL
  const path = window.location.pathname;
  const partes = path.split("/");
  const token = partes[partes.length - 1];

  // Validación
  if (!token || token === "verificar" || token === "index.html" || token === "") {
    console.error("No se encontró un token válido");
    return;
  }

  console.log(`✅ Token capturado: ${token}`);

  // 2. LLAMAR A LA API
  const backendUrl = import.meta.env.VITE_BACKEND_URL;

  if (!backendUrl) {
    console.error("Error de configuración: Falta VITE_BACKEND_URL");
    return;
  }

  const endpoint = `${backendUrl}/api/users/auth/verify?token=${token}`;
  console.log(`📡 Consultando API...`);

  fetch(endpoint, { method: "GET" })
    .then((response) => {
      if (response.ok) {
        console.log("¡Cuenta verificada con éxito!");
      } else {
        console.error(`El enlace ha caducado o no es válido. Status: ${response.status}`);
      }
    })
    .catch((error) => {
      console.error("Error al conectar con el servidor:", error);
    });

  // 3. CONFIGURAR BOTÓN
  const btnReturnApp = document.getElementById("btnReturnApp");

  if (btnReturnApp) {
    btnReturnApp.addEventListener("click", function (e) {
      e.preventDefault();
      console.log("--- Botón presionado ---");

      // Leer variables de entorno
      const webUrl = import.meta.env.VITE_WEB_URL;
      const deepLink = import.meta.env.VITE_DEEP_LINK;

      console.log(`🔗 DeepLink Config: "${deepLink}"`);
      console.log(`🌐 WebUrl Config: "${webUrl}"`);

      // Detectar Android
      const userAgent = navigator.userAgent || navigator.vendor || window.opera;
      const isAndroid = /android/i.test(userAgent);

      console.log(`📱 Dispositivo: ${isAndroid ? "ANDROID" : "DESKTOP / IOS"}`);

      if (isAndroid) {
        console.log("🚀 Intentando abrir App Android...");

        if (!deepLink) {
          console.error("❌ ERROR: VITE_DEEP_LINK está vacío.");
          return;
        }

        try {
          console.log(`Navegando a: ${deepLink}`);
          
          // Usamos assign para el deep link
          window.location.assign(deepLink);

        } catch (err) {
          console.error(`❌ Excepción JS al redirigir: ${err.message}`);
        }

      } else {
        // Lógica Web
        console.log("🌍 Redirigiendo a versión Web...");
        if (webUrl) {
          window.location.href = webUrl;
        } else {
          console.error("❌ ERROR: VITE_WEB_URL está vacío.");
        }
      }
    });
  } else {
    console.error("Error DOM: No se encontró el botón 'btnReturnApp'.");
  }
};