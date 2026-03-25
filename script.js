window.onload = function () {

  const path = window.location.pathname;
  const partes = path.split("/").filter(Boolean);
  const token = partes[partes.length - 1];

  // Elementos del DOM
  const title = document.getElementById("pageTitle");
  const desc = document.getElementById("pageDescription");
  const btn = document.getElementById("btnAction");
  const iconContainer = document.getElementById("iconWrapper");

  const svgCheck = `
    <svg class="checkmark" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 52 52">
      <circle class="checkmark__circle" cx="26" cy="26" r="25" fill="none" />
      <path class="checkmark__check" fill="none" d="M14.1 27.2l7.1 7.2 16.7-16.8" />
    </svg>`;

  const svgError = `
    <svg class="checkmark" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 52 52">
      <circle class="checkmark__circle" cx="26" cy="26" r="25" fill="none" />
      <path class="checkmark__check" fill="none" d="M16 16 l20 20 M36 16 l-20 20" />
    </svg>`;

  // --- LÓGICA 1: VERIFICACIÓN DE CORREO ---
  if (path.includes("/verificar/")) {

    if (!token || token === "verificar") {
      iconContainer.innerHTML = svgError;
      iconContainer.style.filter = "grayscale(100%)";
      title.innerText = "Enlace inválido";
      desc.innerText = "El link no contiene un código de seguridad.";
      return;
    }

    const backendUrl = import.meta.env.VITE_BACKEND_URL;

    if (!backendUrl) {
      console.error("VITE_BACKEND_URL no está configurado");
      iconContainer.innerHTML = svgError;
      iconContainer.style.filter = "grayscale(100%)";
      title.innerText = "Error de configuración";
      desc.innerText = "No pudimos procesar tu solicitud. Intentá de nuevo más tarde.";
      return;
    }

    const endpoint = `${backendUrl}/api/users/auth/verify?token=${token}`;

    fetch(endpoint, { method: "GET" })
      .then((response) => {
        if (response.ok) {
          iconContainer.innerHTML = svgCheck;
          title.innerText = "¡Email verificado!";
          desc.innerText = "Tu cuenta fue verificada correctamente. Ya podés volver a la app.";
        } else {
          console.error(`Error API. Status: ${response.status}`);
          iconContainer.innerHTML = svgError;
          iconContainer.style.filter = "grayscale(100%)";
          title.innerText = "Enlace Caducado";
          desc.innerText = "Este enlace ya no es válido o ha expirado.";
        }
      })
      .catch((error) => {
        console.error("Error de conexión:", error);
        iconContainer.innerHTML = svgError;
        iconContainer.style.filter = "grayscale(100%)";
        title.innerText = "Error de conexión";
        desc.innerText = "No pudimos procesar tu solicitud. Intentá de nuevo más tarde.";
      });

  // --- LÓGICA 2: CAMBIO DE CONTRASEÑA ---
  } else if (path.includes("/restablecer/")) {

    if (!token || token === "restablecer") {
      iconContainer.innerHTML = svgError;
      iconContainer.style.filter = "grayscale(100%)";
      title.innerText = "Enlace inválido";
      desc.innerText = "El link no contiene un código de seguridad.";
      return;
    }

    iconContainer.innerHTML = svgCheck;
    title.innerText = "Restablecer Clave";
    desc.innerText = "Para crear tu nueva contraseña, continuá desde la App o la Web.";
    btn.style.display = "inline-block";

    btn.addEventListener("click", function (e) {
      e.preventDefault();

      const webBaseUrl = import.meta.env.VITE_WEB_BASE_URL;
      const resetPath = import.meta.env.VITE_RESET_PATH;
      const userAgent = navigator.userAgent || navigator.vendor || window.opera;
      const isAndroid = /android/i.test(userAgent);

      if (isAndroid) {
        const deepLink = import.meta.env.VITE_RESET_DEEP_LINK;
        if (!deepLink) {
          console.error("VITE_RESET_DEEP_LINK no está configurado");
          return;
        }
        window.location.assign(deepLink + token);
      } else {
        if (!webBaseUrl || !resetPath) {
          console.error("Variables de entorno de reset no configuradas");
          return;
        }
        const targetUrl = `${webBaseUrl}${resetPath}`.includes("?")
          ? `${webBaseUrl}${resetPath}&token=${token}`
          : `${webBaseUrl}${resetPath}?token=${token}`;
        window.location.href = targetUrl;
      }
    });

  } else {
    console.warn("Ruta no reconocida");
  }
};
