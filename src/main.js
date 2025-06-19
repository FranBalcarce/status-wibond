import { obtenerEventosDeSalud } from "./awsHealthClient.js";

const REGION = "us-east-2";
const USER_POOL_DOMAIN =
  "https://us-east-2irsusw7ld.auth.us-east-2.amazoncognito.com";
const CLIENT_ID = "6vn8g1jf6o3ir970ku0kn57okv";
const REDIRECT_URI = "http://localhost:3000";

function redirectToCognitoLogin() {
  const scope = encodeURIComponent("openid email phone");
  const loginUrl = `${USER_POOL_DOMAIN}/login?client_id=${CLIENT_ID}&response_type=code&scope=${scope}&redirect_uri=${encodeURIComponent(
    REDIRECT_URI
  )}`;
  window.location.href = loginUrl;
}

function getCodeFromUrl() {
  const params = new URLSearchParams(window.location.search);
  return params.get("code");
}

function parseJwt(token) {
  try {
    const base64Payload = token.split(".")[1];
    const payload = atob(base64Payload);
    return JSON.parse(payload);
  } catch (err) {
    console.error("Error al parsear el token:", err);
    return {};
  }
}

async function exchangeCodeForToken(code) {
  const response = await fetch(`${USER_POOL_DOMAIN}/oauth2/token`, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      grant_type: "authorization_code",
      client_id: CLIENT_ID,
      redirect_uri: REDIRECT_URI,
      code,
    }),
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`Error al obtener el token: ${err}`);
  }

  const data = await response.json();
  console.log("Tokens recibidos:", data);
  return data.id_token;
}

function renderGrafico(data) {
  const ctx = document.getElementById("grafico").getContext("2d");
  new Chart(ctx, {
    type: "pie",
    data: {
      labels: Object.keys(data),
      datasets: [
        {
          data: Object.values(data),
          backgroundColor: ["#facc15", "#16a34a", "#ef4444"],
        },
      ],
    },
  });
}

function actualizarKPI(events) {
  const contenedor = document.getElementById("servicios");
  contenedor.innerHTML = "";
  const estados = {};

  events.forEach((evt) => {
    const estado = evt.statusCode || "UNKNOWN";
    estados[estado] = (estados[estado] || 0) + 1;

    const div = document.createElement("div");
    div.innerHTML = `<strong>${evt.service}</strong> - ${estado}`;
    contenedor.appendChild(div);
  });

  renderGrafico(estados);
}

async function mostrarContenidoParaUsuario(token) {
  const decoded = parseJwt(token);
  document.getElementById("login-status").innerText = `Hola, ${
    decoded.email || "usuario"
  }`;

  try {
    const eventos = await obtenerEventosDeSalud(token);
    const formateados = eventos.map((e) => ({
      service: e.service || e.eventTypeCategory || "Desconocido",
      statusCode: e.statusCode || "UNKNOWN",
    }));
    actualizarKPI(formateados);
  } catch (error) {
    console.error("Error al obtener eventos de servicios:", error);
    document.getElementById("servicios").innerText =
      "No se pudieron obtener los eventos de servicios.";
  }
}

async function iniciarApp() {
  const code = getCodeFromUrl();
  if (!code) {
    redirectToCognitoLogin();
    return;
  }

  try {
    const token = await exchangeCodeForToken(code);
    if (!token) {
      throw new Error("El token recibido está vacío o indefinido.");
    }
    await mostrarContenidoParaUsuario(token);
  } catch (err) {
    console.error("Error en la autenticación:", err);
    document.getElementById("login-status").innerText =
      "Error de autenticación.";
  }
}

iniciarApp();
