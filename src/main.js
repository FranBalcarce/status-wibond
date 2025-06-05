// main.js
const REGION = "us-east-2";
const USER_POOL_DOMAIN =
  "https://us-east-2irsusw7ld.auth.us-east-2.amazoncognito.com";
const CLIENT_ID = "6vn8g1jf6o3ir970ku0kn57okv";
const REDIRECT_URI = "http://localhost:3000";

function redirectToCognitoLogin() {
  const scope = encodeURIComponent("email openid phone");
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

  const data = await response.json();
  return data.id_token;
}

function mostrarContenidoParaUsuario(token) {
  const decoded = parseJwt(token);
  document.getElementById("login-status").innerText = `Hola, ${decoded.email}`;

  // Datos de ejemplo
  const events = [
    { service: "S3", statusCode: "OK" },
    { service: "EC2", statusCode: "IMPAIRED" },
    { service: "Lambda", statusCode: "OK" },
    { service: "RDS", statusCode: "UNKNOWN" },
  ];
  actualizarKPI(events);
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

async function iniciarApp() {
  const code = getCodeFromUrl();
  if (!code) {
    redirectToCognitoLogin();
    return;
  }

  try {
    const token = await exchangeCodeForToken(code);
    mostrarContenidoParaUsuario(token);
  } catch (err) {
    console.error("Error al intercambiar el código por el token:", err);
    document.getElementById("login-status").innerText =
      "Error de autenticación.";
  }
}

iniciarApp();
