const REGION = "us-east-2";
const USER_POOL_DOMAIN =
  "http://us-east-2irsusw7ld.auth.us-east-2.amazoncognito.com";
const CLIENT_ID = "6vn8g1jf6o3ir970ku0kn57okv";
const REDIRECT_URI = "http://localhost:5173";

function redirectToCognitoLogin() {
  const loginUrl = `${USER_POOL_DOMAIN}/login?response_type=token&client_id=${CLIENT_ID}&redirect_uri=${encodeURIComponent(
    REDIRECT_URI
  )}`;
  window.location.href = loginUrl;
}

function getIdTokenFromUrl() {
  const hash = window.location.hash;
  const params = new URLSearchParams(hash.slice(1));
  return params.get("id_token");
}

function mostrarContenidoParaUsuario(token) {
  const decoded = parseJwt(token);
  document.getElementById("login-status").innerText = `Hola, ${decoded.email}`;

  // Ejemplo de eventos simulados
  const events = [
    { service: "S3", statusCode: "OK" },
    { service: "EC2", statusCode: "IMPAIRED" },
    { service: "Lambda", statusCode: "OK" },
    { service: "RDS", statusCode: "UNKNOWN" },
  ];
  actualizarKPI(events);
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

function iniciarApp() {
  const token = getIdTokenFromUrl();
  if (!token) {
    redirectToCognitoLogin();
    return;
  }

  mostrarContenidoParaUsuario(token);
}

iniciarApp();

// import {
//   CognitoIdentityClient,
//   GetIdCommand,
//   GetCredentialsForIdentityCommand,
// } from "https://cdn.jsdelivr.net/npm/@aws-sdk/client-cognito-identity/+esm";

// import {
//   HealthClient,
//   DescribeEventsCommand,
// } from "https://cdn.jsdelivr.net/npm/@aws-sdk/client-health/+esm";

// // Región de tu configuración Cognito
// const REGION = "us-east-2";

// // ID del Identity Pool (debe tener usuarios autenticados habilitados)
// const IDENTITY_POOL_ID = "us-east-2irsusw7ld.auth.us-east-2.amazoncognito.com"; // ← Reemplazar con el real

// // URL del dominio del User Pool de Cognito (¡NO es localhost!)
// // Esto es lo que Cognito te da como dominio: algo como
// // https://your-domain.auth.us-east-2.amazoncognito.com
// const USER_POOL_DOMAIN =
//   "https://us-east-2irsusw7ld.auth.us-east-2.amazoncognito.com"; // ← Este sí es válido

// // ID del cliente de la App configurada en Cognito (App client)
// const CLIENT_ID = "6vn8g1jf6o3ir970ku0kn57okv"; // ← Reemplazar si cambia

// // URL donde redirige Cognito después del login (tiene que estar en la consola configurada)
// const REDIRECT_URI = "http://localhost:5173/"; // ← Debe coincidir exactamente con lo cargado en Cognito

// // Tu User Pool ID (para federar con el Identity Pool)
// const USER_POOL_ID = "us-east-2_XXXXXXXXX"; // ← Reemplazar con el real
// const COGNITO_PROVIDER = `cognito-idp.${REGION}.amazonaws.com/${USER_POOL_ID}`;

// function redirectToCognitoLogin() {
//   const loginUrl = `${USER_POOL_DOMAIN}/login?response_type=token&client_id=${CLIENT_ID}&redirect_uri=${encodeURIComponent(
//     REDIRECT_URI
//   )}`;
//   window.location.href = loginUrl;
// }

// function getTokenFromURL() {
//   const hash = window.location.hash;
//   const params = new URLSearchParams(hash.slice(1));
//   return params.get("id_token");
// }

// async function obtenerEventos(credentials) {
//   const healthClient = new HealthClient({
//     region: REGION,
//     credentials: {
//       accessKeyId: credentials.AccessKeyId,
//       secretAccessKey: credentials.SecretKey,
//       sessionToken: credentials.SessionToken,
//     },
//   });

//   const result = await healthClient.send(new DescribeEventsCommand({}));
//   return result.events || [];
// }

// function renderGrafico(data) {
//   const ctx = document.getElementById("grafico").getContext("2d");
//   new Chart(ctx, {
//     type: "pie",
//     data: {
//       labels: Object.keys(data),
//       datasets: [
//         {
//           data: Object.values(data),
//           backgroundColor: ["#facc15", "#16a34a", "#ef4444"],
//         },
//       ],
//     },
//   });
// }

// function actualizarKPI(events) {
//   const contenedor = document.getElementById("servicios");
//   contenedor.innerHTML = "";
//   const estados = {};

//   events.forEach((evt) => {
//     const estado = evt.statusCode || "UNKNOWN";
//     estados[estado] = (estados[estado] || 0) + 1;

//     const div = document.createElement("div");
//     div.innerHTML = `<strong>${evt.service}</strong> - ${estado}`;
//     contenedor.appendChild(div);
//   });

//   renderGrafico(estados);
// }

// async function federarConIdentityPool(idToken) {
//   const identityClient = new CognitoIdentityClient({ region: REGION });

//   const { IdentityId } = await identityClient.send(
//     new GetIdCommand({
//       IdentityPoolId: IDENTITY_POOL_ID,
//       Logins: {
//         [COGNITO_PROVIDER]: idToken,
//       },
//     })
//   );

//   const { Credentials } = await identityClient.send(
//     new GetCredentialsForIdentityCommand({
//       IdentityId,
//       Logins: {
//         [COGNITO_PROVIDER]: idToken,
//       },
//     })
//   );

//   return Credentials;
// }

// async function iniciarApp() {
//   const token = getTokenFromURL();

//   if (!token) {
//     redirectToCognitoLogin();
//     return;
//   }

//   document.getElementById("login-status").innerText = "Logueado con Cognito.";

//   try {
//     const credentials = await federarConIdentityPool(token);
//     const events = await obtenerEventos(credentials);
//     actualizarKPI(events);

//     // Actualizar cada 5 minutos
//     setInterval(async () => {
//       const nuevosEventos = await obtenerEventos(credentials);
//       actualizarKPI(nuevosEventos);
//     }, 5 * 60 * 1000);
//   } catch (err) {
//     console.error("Error al obtener eventos:", err);
//   }
// }

// iniciarApp();

// import {
//   CognitoIdentityClient,
//   GetIdCommand,
//   GetCredentialsForIdentityCommand,
// } from "https://cdn.jsdelivr.net/npm/@aws-sdk/client-cognito-identity/+esm";

// import {
//   HealthClient,
//   DescribeEventsCommand,
// } from "https://cdn.jsdelivr.net/npm/@aws-sdk/client-health/+esm";

// // Región de AWS
// const REGION = "us-east-2";

// // ← PONÉ TU Identity Pool ID (formato: us-east-2:xxxx-xxxx-xxxx)
// const IDENTITY_POOL_ID = "us-east-2:xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx";

// // ← URL del dominio de tu User Pool
// const USER_POOL_DOMAIN =
//   "https://us-east-2irsusw7ld.auth.us-east-2.amazoncognito.com";

// // ← Client ID de tu app en el User Pool
// const CLIENT_ID = "6vn8g1jf6o3ir970ku0kn57okv";

// // URL de redirección (debe coincidir con lo cargado en Cognito)
// const REDIRECT_URI = "http://localhost:3000/";

// // ← User Pool ID (formato: us-east-2_xxxxxxxx)
// const USER_POOL_ID = "us-east-2_XXXXXXXXX";
// const COGNITO_PROVIDER = `cognito-idp.${REGION}.amazonaws.com/${USER_POOL_ID}`;

// function redirectToCognitoLogin() {
//   const loginUrl = `${USER_POOL_DOMAIN}/login?response_type=token&client_id=${CLIENT_ID}&redirect_uri=${encodeURIComponent(
//     REDIRECT_URI
//   )}`;
//   window.location.href = loginUrl;
// }

// function getTokenFromURL() {
//   const hash = window.location.hash;
//   const params = new URLSearchParams(hash.slice(1));
//   return params.get("id_token");
// }

// async function obtenerEventos(credentials) {
//   const healthClient = new HealthClient({
//     region: REGION,
//     credentials: {
//       accessKeyId: credentials.AccessKeyId,
//       secretAccessKey: credentials.SecretKey,
//       sessionToken: credentials.SessionToken,
//     },
//   });

//   const result = await healthClient.send(new DescribeEventsCommand({}));
//   return result.events || [];
// }

// function renderGrafico(data) {
//   const ctx = document.getElementById("grafico").getContext("2d");
//   new Chart(ctx, {
//     type: "pie",
//     data: {
//       labels: Object.keys(data),
//       datasets: [
//         {
//           data: Object.values(data),
//           backgroundColor: ["#facc15", "#16a34a", "#ef4444"],
//         },
//       ],
//     },
//   });
// }

// function actualizarKPI(events) {
//   const contenedor = document.getElementById("servicios");
//   contenedor.innerHTML = "";
//   const estados = {};

//   events.forEach((evt) => {
//     const estado = evt.statusCode || "UNKNOWN";
//     estados[estado] = (estados[estado] || 0) + 1;

//     const div = document.createElement("div");
//     div.innerHTML = `<strong>${evt.service}</strong> - ${estado}`;
//     contenedor.appendChild(div);
//   });

//   renderGrafico(estados);
// }

// async function federarConIdentityPool(idToken) {
//   const identityClient = new CognitoIdentityClient({ region: REGION });

//   const { IdentityId } = await identityClient.send(
//     new GetIdCommand({
//       IdentityPoolId: IDENTITY_POOL_ID,
//       Logins: {
//         [COGNITO_PROVIDER]: idToken,
//       },
//     })
//   );

//   const { Credentials } = await identityClient.send(
//     new GetCredentialsForIdentityCommand({
//       IdentityId,
//       Logins: {
//         [COGNITO_PROVIDER]: idToken,
//       },
//     })
//   );

//   return Credentials;
// }

// async function iniciarApp() {
//   const token = getTokenFromURL();

//   if (!token) {
//     redirectToCognitoLogin();
//     return;
//   }

//   document.getElementById("login-status").innerText = "Logueado con Cognito.";

//   try {
//     const credentials = await federarConIdentityPool(token);
//     const events = await obtenerEventos(credentials);
//     actualizarKPI(events);

//     setInterval(async () => {
//       const nuevosEventos = await obtenerEventos(credentials);
//       actualizarKPI(nuevosEventos);
//     }, 5 * 60 * 1000);
//   } catch (err) {
//     console.error("Error al obtener eventos:", err);
//   }
// }

// iniciarApp();
