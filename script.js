
window.onload = function () {
  const path = window.location.pathname; // Ej: "/verificar/123" o "/restablecer/abc"
  
  // Elementos del DOM
  const title = document.getElementById("pageTitle");
  const desc = document.getElementById("pageDescription");
  const btn = document.getElementById("btnAction");
  const iconContainer = document.getElementById("iconWrapper");

  // Configuración por defecto
  let config = {
    webUrl: "",
    deepLink: "",
    titleText: "Error",
    descText: "Enlace no reconocido.",
    iconHtml: "" // SVG de error
  };

  // 1. DETECTAR EL MODO SEGÚN LA RUTA
  if (path.includes("/verificar/")) {
    // --- MODO VERIFICACIÓN ---
    config.webUrl = import.meta.env.VITE_VERIFY_WEB_URL;
    config.deepLink = import.meta.env.VITE_VERIFY_DEEP_LINK;
    config.titleText = "¡Cuenta Verificada!";
    config.descText = "Gracias por confiar en el club. Ya sos parte oficial.";
    
    // Aquí ponés el SVG del check verde que tenías
    config.iconHtml = `<svg class="checkmark" ...> ... </svg>`; 
    
    // (Opcional) Llamada a API de verificar aquí mismo si querés que el backend valide antes
    
  } else if (path.includes("/restablecer/")) {
    // --- MODO CHANGE PASSWORD ---
    config.webUrl = import.meta.env.VITE_RESET_WEB_URL;
    config.deepLink = import.meta.env.VITE_RESET_DEEP_LINK;
    config.titleText = "Restablecer Clave";
    config.descText = "Para cambiar tu contraseña, continuá desde la App o la Web.";
    
    // Aquí podrías poner un SVG de un candado o llave
    config.iconHtml = `<svg class="lock-icon" ...> ... </svg>`;
  }

  // 2. EXTRAER TOKEN
  const partes = path.split("/");
  const token = partes[partes.length - 1];

  if (!token) {
    title.innerText = "Enlace inválido";
    desc.innerText = "No se encontró el código de seguridad.";
    return;
  }

  // 3. RENDERIZAR LA UI
  title.innerText = config.titleText;
  desc.innerText = config.descText;
  iconContainer.innerHTML = config.iconHtml;
  btn.style.display = "inline-block"; // Mostrar botón

  // 4. LÓGICA DEL BOTÓN (Universal)
  btn.addEventListener("click", (e) => {
    e.preventDefault();
    
    const isAndroid = /android/i.test(navigator.userAgent);

    if (isAndroid) {
      // Redirección Android (Deep Link + Token)
      window.location.assign(config.deepLink + token);
    } else {
      // Redirección Web (Web URL + Token como query param)
      const targetUrl = config.webUrl.includes("?") 
        ? `${config.webUrl}&token=${token}` 
        : `${config.webUrl}?token=${token}`;
      window.location.href = targetUrl;
    }
  });
};