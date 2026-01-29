window.onload = function () {

  const path = window.location.pathname;
  const partes = path.split("/");
  const token = partes[partes.length - 1];

  // Elementos del DOM
  const title = document.getElementById("pageTitle");
  const desc = document.getElementById("pageDescription");
  const btn = document.getElementById("btnAction");
  const iconContainer = document.getElementById("iconWrapper");

  // Variables de entorno generales
  const backendUrl = import.meta.env.VITE_BACKEND_URL;
  const webBaseUrl = import.meta.env.VITE_WEB_BASE_URL;
  const verifyPath = import.meta.env.VITE_VERIFY_PATH;
  const resetPath = import.meta.env.VITE_RESET_PATH;

  // Configuración por defecto
  let config = {
    webUrl: "",
    deepLink: "",
    iconHtml: "" 
  };

  // --- LÓGICA 1: VERIFICACIÓN DE CORREO ---
  if (path.includes("/verificar/")) {

    // 1. Validar Token básico
    if (!token || token === "verificar" || token === "index.html" || token === "") {
      console.error("❌ No se encontró un token válido");
      title.innerText = "Enlace inválido";
      desc.innerText = "El link no contiene un código de seguridad.";
      return;
    }

    // 2. LLAMADA A LA API (Igual a mailconfirm)
    const endpoint = `${backendUrl}/api/users/auth/verify?token=${token}`;

    fetch(endpoint, { method: "GET" })
      .then((response) => {
        if (response.ok) {
          // Si todo está bien, mostramos el botón
          btn.style.display = "inline-block";
        } else {
          console.error(`❌ Error API. Status: ${response.status}`);
          title.innerText = "Enlace Caducado";
          desc.innerText = "Este enlace ya no es válido o ha expirado.";
          iconContainer.style.filter = "grayscale(100%)"; 
          btn.style.display = "none";
        }
      })
      .catch((error) => {
        console.error("❌ Error de conexión:", error);
        btn.style.display = "none";
      });

    // 3. Configuración UI
    config.webUrl = `${webBaseUrl}${verifyPath}`;
    config.deepLink = import.meta.env.VITE_VERIFY_DEEP_LINK;
    
    title.innerText = "¡Cuenta Verificada!";
    desc.innerText = "Gracias por confiar en el club. Ya sos parte oficial de la comunidad.";
    
    config.iconHtml = `
      <svg class="checkmark" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 52 52">
        <circle class="checkmark__circle" cx="26" cy="26" r="25" fill="none" />
        <path class="checkmark__check" fill="none" d="M14.1 27.2l7.1 7.2 16.7-16.8" />
      </svg>`;

  // --- LÓGICA 2: CAMBIO DE CONTRASEÑA ---
  } else if (path.includes("/restablecer/")) {

    if (!token) {
       title.innerText = "Enlace inválido";
       btn.style.display = "none";
       return;
    }
    
    config.webUrl = `${webBaseUrl}${resetPath}`;
    config.deepLink = import.meta.env.VITE_RESET_DEEP_LINK;

    title.innerText = "Restablecer Clave";
    desc.innerText = "Para crear tu nueva contraseña, continuá desde la App o la Web.";

    config.iconHtml = `
      <svg class="checkmark" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 52 52">
         <circle class="checkmark__circle" cx="26" cy="26" r="25" fill="none" stroke="#4ce68b"/>
         <path class="checkmark__check" fill="none" d="M16 26 h20 M26 16 v20" stroke-width="3"/> 
      </svg>`; 

    btn.style.display = "inline-block";
  } else {
      console.warn("Ruta no reconocida");
      return; 
  }

  // Renderizar
  iconContainer.innerHTML = config.iconHtml;

  // --- LÓGICA BOTÓN (Con detección de User Agent explícita) ---
  btn.addEventListener("click", function (e) {
    e.preventDefault();


    // Detección detallada (igual a tu archivo original)
    const userAgent = navigator.userAgent || navigator.vendor || window.opera;
    const isAndroid = /android/i.test(userAgent);

    console.log(`📱 Dispositivo: ${isAndroid ? "ANDROID" : "DESKTOP / IOS"}`);

    if (isAndroid) {
      console.log("🚀 Intentando abrir App Android...");

      if (!config.deepLink) {
        console.error("❌ ERROR: Variable DEEP_LINK está vacía.");
        return;
      }

      try {
        window.location.assign(config.deepLink + token);
      } catch (err) {
        console.error(`❌ Excepción JS al redirigir: ${err.message}`);
      }

    } else {
      if (config.webUrl) {
        const targetUrl = config.webUrl.includes("?") 
          ? `${config.webUrl}&token=${token}` 
          : `${config.webUrl}?token=${token}`;
        window.location.href = targetUrl;
      } else {
        console.error("❌ ERROR: Variable WEB_URL está vacía.");
      }
    }
  });
};