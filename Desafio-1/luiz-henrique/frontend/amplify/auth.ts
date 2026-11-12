/**
 * Amplify Gen 2 auth resource.
 * Configura o Amazon Cognito User Pool usado pelo Amplify Authenticator no frontend.
 * Usuários entram por convite (sem auto-cadastro).
 */
import { defineAuth } from '@aws-amplify/backend';

export const auth = defineAuth({
  loginWith: {
    email: true,
  },
  userAttributes: {
    email: { required: true },
  },
});
