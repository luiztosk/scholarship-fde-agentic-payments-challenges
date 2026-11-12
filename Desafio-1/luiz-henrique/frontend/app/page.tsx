'use client';

import { Authenticator } from '@aws-amplify/ui-react';
import '@aws-amplify/ui-react/styles.css';
import { useSignOut } from '@aws-amplify/auth-ui-react';
import { Amplify } from 'aws-amplify';
import outputs from '@/amplify_outputs.json';

Amplify.configure(outputs);

export default function Page() {
  const { signOut } = useSignOut();

  return (
    <Authenticator
      signOutOptions={{
        onComplete: () => {},
      }}
      formFields={{
        signUp: [
          {
            type: 'email',
            label: 'E-mail',
            required: true,
          },
          {
            type: 'password',
            label: 'Senha',
            required: true,
          },
        ],
        signIn: [
          {
            type: 'email',
            label: 'E-mail',
            required: true,
          },
          {
            type: 'password',
            label: 'Senha',
            required: true,
          },
        ],
      }}
    >
      {({ user, signOut }) => (
        <div style={{ padding: '2rem', maxWidth: 600, margin: '0 auto' }}>
          <h1>Bem-vindo, {user?.attributes.email}</h1>
          <p>Chat de pagamentos simulados — cartão de crédito e Pix.</p>
          <button
            onClick={signOut}
            style={{
              padding: '0.5rem 1rem',
              background: '#2563eb',
              color: '#fff',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
            }}
          >
            Sair
          </button>
        </div>
      )}
    </Authenticator>
  );
}
