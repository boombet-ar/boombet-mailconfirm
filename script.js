// Función para escribir en la pantalla del celular
function logToUI(msg, type = 'info') {
  const consoleDiv = document.getElementById("debugConsole");
  if (!consoleDiv) return;
  
  const color = type === 'error' ? 'red' : '#0f0';
  const timestamp = new Date().toLocaleTimeString();
  consoleDiv.innerHTML += `<span style="color:${color}">[${timestamp}] ${msg}</span><br>`;
  
  // Auto-scroll al final
  consoleDiv.scrollTop = consoleDiv.scrollHeight;
  
  // También mantenemos el log normal
  if (type === 'error') console.error(msg);
  else console.log(msg);
}

window.onload = function () {
  logToUI("--- INICIO DE SCRIPT ---");
  logToUI(`UserAgent: ${navigator.userAgent}`);

  const path = window.location.pathname;
  logToUI(`Path detectado: ${path}`);

  const partes = path.split("/");
  const token = partes[partes.length - 1];
  logToUI(`Token extraído: "${token}"`);

  // Elementos DOM
  const title = document.getElementById("pageTitle");
  const desc = document.getElementById("pageDescription");
  const btn = document.getElementById("btnAction");
  const iconContainer = document.getElementById("iconWrapper");

  const backendUrl = import.meta.env.VITE_BACKEND_URL;
  logToUI(`Backend URL: ${backendUrl}`);

  let config = {
    webUrl: "",
    deepLink: "",
    iconHtml: "" 
  };

  // --- DETERMINAR MODO ---
  if (path.includes("/verificar/")) {
    logToUI("MODO: VERIFICAR");

    // Validar token
    if (!token || token === "verificar" || token === "index.html") {
      logToUI("❌ Token inválido", "error");
      title.innerText = "Error Token";
      return;
    }

    // Llamada API
    const endpoint = `${backendUrl}/api/users/auth/verify?token=${token}`;
    logToUI(`Fetch a: ${endpoint}`);

    fetch(endpoint, { method: "GET" })
      .then((response) => {
        logToUI(`API Response Status: ${response.status}`);
        if (response.ok) {
          logToUI("✅ API OK");
        } else {
          logToUI("❌ API Error o Token Vencido", "error");
          title.innerText = "Enlace Caducado";
          iconContainer.style.filter = "grayscale(100%)";
        }
      })
      .catch((error) => {
        logToUI(`❌ Fetch Exception: ${error.message}`, "error");
      });

    config.webUrl = import.meta.env.VITE_VERIFY_WEB_URL;
    config.deepLink = import.meta.env.VITE_VERIFY_DEEP_LINK;
    
    title.innerText = "¡Cuenta Verificada!";
    desc.innerText = "Revisá los logs abajo si no redirige.";
    
    config.iconHtml = `<svg class="checkmark" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 52 52"><circle class="checkmark__circle" cx="26" cy="26" r="25" fill="none" /><path class="checkmark__check" fill="none" d="M14.1 27.2l7.1 7.2 16.7-16.8" /></svg>`;

  } else if (path.includes("/restablecer/")) {
    logToUI("MODO: RESTABLECER");

    config.webUrl = import.meta.env.VITE_RESET_WEB_URL;
    config.deepLink = import.meta.env.VITE_RESET_DEEP_LINK;

    title.innerText = "Restablecer Clave";
    desc.innerText = "Hacé click para abrir la App.";
    
    config.iconHtml = `<svg class="checkmark" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 52 52"><circle class="checkmark__circle" cx="26" cy="26" r="25" fill="none" stroke="#4ce68b"/><path class="checkmark__check" fill="none" d="M16 26 h20 M26 16 v20" stroke-width="3"/></svg>`;
  } else {
    logToUI("⚠️ Ruta desconocida / index directo", "error");
  }

  // Mostrar variables cargadas
  logToUI(`Config DeepLink: ${config.deepLink}`);
  logToUI(`Config WebUrl: ${config.webUrl}`);

  iconContainer.innerHTML = config.iconHtml;
  btn.style.display = "inline-block";

  // --- EVENTO CLICK ---
  btn.addEventListener("click", function (e) {
    e.preventDefault();
    logToUI("--- CLICK DETECTADO ---");

    const userAgent = navigator.userAgent || navigator.vendor || window.opera;
    const isAndroid = /android/i.test(userAgent);
    logToUI(`Es Android? ${isAndroid}`);

    if (isAndroid) {
      logToUI("🤖 Intentando abrir DEEP LINK...");
      
      if (!config.deepLink) {
        logToUI("❌ Error: DeepLink vacío", "error");
        return;
      }

      const finalLink = config.deepLink + token;
      logToUI(`Target: ${finalLink}`);

      try {
        // Probamos location.assign primero
        window.location.assign(finalLink);
        logToUI("✅ window.location.assign ejecutado");
        
        // Fallback por si assign falla silenciosamente (raro en Android, pero posible)
        setTimeout(() => {
           logToUI("⏳ Timeout ejecutado (¿No se abrió la app?)");
        }, 2000);

      } catch (err) {
        logToUI(`❌ Error fatal en redirección: ${err.message}`, "error");
      }

    } else {
      logToUI("🌍 Redirigiendo a WEB...");
      if (config.webUrl) {
        const separator = config.webUrl.includes("?") ? "&" : "?";
        const finalUrl = `${config.webUrl}${separator}token=${token}`;
        logToUI(`Target Web: ${finalUrl}`);
        window.location.href = finalUrl;
      } else {
        logToUI("❌ Error: WebUrl vacío", "error");
      }
    }
  });
};