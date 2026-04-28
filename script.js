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

    fetch(endpoint, { method: "GET", headers: { "ngrok-skip-browser-warning": "true" } })
      .then((response) => {
        if (response.ok) {
          return response.json();
        }
        return Promise.reject(response.status);
      })
      .then((data) => {
        const loginToken = data.accessToken;

        iconContainer.innerHTML = svgCheck;
        title.innerText = "¡Email verificado!";
        desc.innerText = "Tu cuenta fue verificada correctamente. Para ingresar, apretá el botón de abajo.";
        btn.innerText = "Ir a BoomBet";
        btn.style.display = "inline-block";

        btn.addEventListener("click", function (e) {
          e.preventDefault();
          const redirectBase = import.meta.env.VITE_AFFILIATE_REDIRECT_URL || "https://app.boombet-ar.bet";
          window.location.href = `${redirectBase}/auth/callback?token=${loginToken}&redirect=not-affiliated`;
        });
      })
      .catch((error) => {
        if (typeof error === "number") {
          console.error(`Error API. Status: ${error}`);
          iconContainer.innerHTML = svgError;
          iconContainer.style.filter = "grayscale(100%)";
          title.innerText = "Enlace Caducado";
          desc.innerText = "Este enlace ya no es válido o ha expirado.";
        } else {
          console.error("Error de conexión:", error);
          iconContainer.innerHTML = svgError;
          iconContainer.style.filter = "grayscale(100%)";
          title.innerText = "Error de conexión";
          desc.innerText = "No pudimos procesar tu solicitud. Intentá de nuevo más tarde.";
        }
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

  // --- LÓGICA 3: CONFIRMACIÓN DE AFILIACIÓN (verificar2) ---
  // Distinto de /verificar/: no verifica email, confirma el proceso de afiliación completo
  // y redirige al sitio principal tras llamar al endpoint de afiliación.
  } else if (path.includes("/verificar2")) {

    const params = new URLSearchParams(window.location.search);
    const jugadorId = params.get("jugadorId");
    const formId = params.get("formId");

    if (!jugadorId || !formId) {
      iconContainer.innerHTML = svgError;
      iconContainer.style.filter = "grayscale(100%)";
      title.innerText = "Enlace inválido";
      desc.innerText = "El link no contiene un código de seguridad.";
      return;
    }

    const backendUrl = import.meta.env.VITE_BACKEND_URL;
    const endpointPath = import.meta.env.VITE_AFFILIATE_ENDPOINT_PATH ?? "/api/jugadores/activar";
    const headerKey = import.meta.env.VITE_HEADER_KEY;

    fetch(`${backendUrl}${endpointPath}?jugadorId=${jugadorId}&formId=${formId}`, {
      method: "POST",
      headers: { key: headerKey, "ngrok-skip-browser-warning": "true" },
    })
      .then((response) => {
        if (response.ok) {
          return response.json();
        }
        return Promise.reject(response.status);
      })
      .then((data) => {
        const loginToken = data.login_token;
        return fetch(`${backendUrl}/api/users/auth/direct-login?token=${loginToken}`, {
          method: "GET",
          headers: { key: headerKey, "ngrok-skip-browser-warning": "true" },
        }).then((res) => {
          if (res.ok) return res.json();
          return Promise.reject(res.status);
        });
      })
      .then((data) => {
        const accessToken = data.accessToken;

        iconContainer.innerHTML = svgCheck;
        title.innerText = "¡Tu proceso de afiliación a BoomBet está completo!";
        desc.innerText = "Para completar tu registro, apretá el botón de abajo. Es el último paso.";
        btn.innerText = "Ir a BoomBet";
        btn.style.display = "inline-block";

        btn.addEventListener("click", function (e) {
          e.preventDefault();
          const redirectBase = import.meta.env.VITE_AFFILIATE_REDIRECT_URL || "https://app.boombet-ar.bet";
          window.location.href = `${redirectBase}/auth/callback?token=${accessToken}`;
        });
      })
      .catch((error) => {
        if (typeof error === "number") {
          console.error(`Error API. Status: ${error}`);
          iconContainer.innerHTML = svgError;
          iconContainer.style.filter = "grayscale(100%)";
          title.innerText = "Enlace Caducado";
          desc.innerText = "Este enlace ya no es válido o ha expirado.";
        } else {
          console.error("Error de conexión:", error);
          iconContainer.innerHTML = svgError;
          iconContainer.style.filter = "grayscale(100%)";
          title.innerText = "Error de conexión";
          desc.innerText = "No pudimos procesar tu solicitud. Intentá de nuevo más tarde.";
        }
      });

  } else {
    console.warn("Ruta no reconocida");
  }
};
