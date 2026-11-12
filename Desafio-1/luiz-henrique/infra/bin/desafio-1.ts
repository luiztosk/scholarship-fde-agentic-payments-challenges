import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { Desafio1Stack } from '../lib/desafio-1-stack';

const app = new cdk.App();

new Desafio1Stack(app, 'Desafio1Stack', {
  stackPrefix: 'luiz-henrique',
  env: {
    account: process.env.CDK_DEFAULT_ACCOUNT,
    region: 'us-east-1',
  },
  description: 'Desafio 1 - Agente de Pagamentos na AWS (luiz-henrique)',
});
