window.onload = function () {
  // --- FUNCIÓN DE DEBUG EN PANTALLA ---
  // Escribe los logs en el div negro para verlos desde el celular
  function logToScreen(mensaje) {
    const consola = document.getElementById("debug-console");
    if (consola) {
      consola.innerHTML += `> ${mensaje}<br>`;
    }
    console.log(mensaje);
  }

  logToScreen("Iniciando script...");

  // 1. OBTENER EL TOKEN DE LA URL
  const path = window.location.pathname;
  const partes = path.split("/");
  const token = partes[partes.length - 1];

  // Validación
  if (!token || token === "verificar" || token === "index.html" || token === "") {
    logToScreen("❌ Error: No se encontró un token válido en la URL.");
    console.error("No se encontró un token válido");
    return;
  }

  logToScreen(`✅ Token capturado: ${token}`);

  // 2. LLAMAR A LA API
  const backendUrl = import.meta.env.VITE_BACKEND_URL;
  
  if (!backendUrl) {
      logToScreen("❌ ERROR CRÍTICO: Falta variable VITE_BACKEND_URL");
      console.error("Error de configuración: Falta VITE_BACKEND_URL");
      return;
  }

  const endpoint = `${backendUrl}/api/users/auth/verify?token=${token}`;
  logToScreen(`📡 Consultando API...`);

  fetch(endpoint, { method: "GET" })
    .then((response) => {
      if (response.ok) {
        logToScreen("✅ ¡API respondió 200 OK! Cuenta verificada.");
        console.log("¡Cuenta verificada con éxito!");
      } else {
        logToScreen(`⚠️ API respondió con error: Status ${response.status}`);
        console.error("El enlace ha caducado o no es válido");
      }
    })
    .catch((error) => {
      logToScreen(`❌ Error de conexión (Fetch): ${error.message}`);
      console.error("Error al conectar con el servidor:", error);
    });

  // 3. CONFIGURAR BOTÓN CON LÓGICA CONDICIONAL Y DEBUG
  const btnReturnApp = document.getElementById("btnReturnApp");
  
  if (btnReturnApp) {
    btnReturnApp.addEventListener("click", function (e) {
      e.preventDefault();
      logToScreen("<br>--- Botón presionado ---");

      // Leer variables de entorno
      const webUrl = import.meta.env.VITE_WEB_URL;
      const deepLink = import.meta.env.VITE_DEEP_LINK;
      
      // Imprimir configuración para verificar que los Secrets de GitHub funcionaron
      logToScreen(`🔗 DeepLink Config: "${deepLink}"`);
      logToScreen(`🌐 WebUrl Config: "${webUrl}"`);

      // Detectar Android
      const userAgent = navigator.userAgent || navigator.vendor || window.opera;
      const isAndroid = /android/i.test(userAgent);
      
      logToScreen(`📱 Dispositivo: ${isAndroid ? "ANDROID" : "DESKTOP / IOS"}`);

      if (isAndroid) {
        logToScreen("🚀 Intentando abrir App Android...");
        
        if (!deepLink) {
            logToScreen("❌ ERROR: VITE_DEEP_LINK está vacío.");
            return;
        }

        // INTENTO DE REDIRECCIÓN CON DIAGNÓSTICO
        try {
            logToScreen(`Navegando a: ${deepLink}`);
            
            // Usamos assign que suele ser más agresivo para deep links
            window.location.assign(deepLink);
            
            // Si el usuario sigue viendo este mensaje después de 2 seg, falló
            setTimeout(() => {
                logToScreen("<br>⚠️ <b>ALERTA:</b> Si lees esto, la App no se abrió.");
                logToScreen("Posibles causas:");
                logToScreen("1. La App no está instalada.");
                logToScreen("2. El esquema 'boombet://' no está configurado en el AndroidManifest.");
            }, 2500);

        } catch (err) {
            logToScreen(`❌ Excepción JS al redirigir: ${err.message}`);
        }

      } else {
        // Lógica Web
        logToScreen("🌍 Redirigiendo a versión Web...");
        if (webUrl) {
            window.location.href = webUrl;
        } else {
            logToScreen("❌ ERROR: VITE_WEB_URL está vacío.");
        }
      }
    });
  } else {
      logToScreen("❌ Error DOM: No se encontró el botón 'btnReturnApp'.");
  }
};