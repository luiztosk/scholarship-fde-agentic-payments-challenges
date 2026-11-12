/**
 * Amplify Gen 2 backend definition.
 * O frontend Next.js usa o Amplify apenas para autenticação (Authenticator UI)
 * e hospedagem. O restante do backend (AgentCore, tool Lambdas, DynamoDB, API
 * Gateway) é provisionado pelo CDK em infra/.
 */
import { defineBackend } from '@aws-amplify/backend';
import { auth } from './auth';

export const backend = defineBackend({
  auth,
});
