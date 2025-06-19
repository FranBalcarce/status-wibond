import { CognitoIdentityClient } from "@aws-sdk/client-cognito-identity";
import { fromCognitoIdentityPool } from "@aws-sdk/credential-provider-cognito-identity";
import { HealthClient, DescribeEventsCommand } from "@aws-sdk/client-health";

const REGION = "us-east-2";
const IDENTITY_POOL_ID = "us-east-2:65f9a571-693e-407a-86b8-85a5d86546b5"; // <-- Reemplazar con el real

export async function obtenerEventosDeSalud(idToken) {
  const client = new HealthClient({
    region: REGION,
    credentials: fromCognitoIdentityPool({
      client: new CognitoIdentityClient({ region: REGION }),
      identityPoolId: IDENTITY_POOL_ID,
      logins: {
        [`https://cognito-idp.${REGION}.amazonaws.com/us-east-2_irsusw7ld`]:
          idToken,
      },
    }),
  });

  const comando = new DescribeEventsCommand({
    filter: {
      eventStatusCodes: ["open", "upcoming", "closed"],
    },
  });

  const respuesta = await client.send(comando);
  return respuesta.events || [];
}
