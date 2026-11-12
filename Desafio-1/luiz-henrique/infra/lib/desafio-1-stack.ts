import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { DatabaseStack } from './database-stack';
import { ToolsStack } from './tools-stack';
import { AgentStack } from './agent-stack';
import { ApiStack } from './api-stack';
import { FrontendStack } from './frontend-stack';

export interface Desafio1StackProps extends cdk.StackProps {
  stackPrefix: string;
}

export class Desafio1Stack extends cdk.Stack {
  constructor(scope: Construct, id: string, props: Desafio1StackProps) {
    super(scope, id, props);

    const { stackPrefix } = props;

    // 1. DynamoDB tables (usuarios, conversas, intencoes)
    const database = new DatabaseStack(this, 'DatabaseStack', { stackPrefix });

    // 2. Tool Lambdas: listar_catalogo, registrar_intencao, realizar_compra
    const tools = new ToolsStack(this, 'ToolsStack', {
      stackPrefix,
      intencoesTable: database.intencoesTable,
      usuariosTable: database.usuariosTable,
    });

    // 3. AgentCore Runtime + Strands agent (Bedrock Claude Haiku) + ECR image
    const agent = new AgentStack(this, 'AgentStack', {
      stackPrefix,
      toolsLambdaArns: tools.toolLambdaArns,
    });

    // 4. Cognito user pool + API Gateway + Lambda chat + JWT authorizer
    const api = new ApiStack(this, 'ApiStack', {
      stackPrefix,
      agentRuntimeArn: agent.agentRuntimeArn,
      usuariosTable: database.usuariosTable,
    });

    // 5. Frontend: S3 bucket (privado) + CloudFront (OAC)
    new FrontendStack(this, 'FrontendStack', {
      stackPrefix,
      apiDomain: api.apiDomain,
    });

    // Outputs
    new cdk.CfnOutput(this, 'ApiUrl', { value: api.apiUrl, description: 'API Gateway URL' });
    new cdk.CfnOutput(this, 'CloudFrontUrl', {
      value: `https://${api.apiDomain}`,
      description: 'CloudFront distribution domain (frontend)',
    });
    new cdk.CfnOutput(this, 'CognitoUserPoolId', {
      value: api.userPool.userPoolId,
      description: 'Cognito User Pool ID',
    });
    new cdk.CfnOutput(this, 'CognitoUserPoolClientId', {
      value: api.userPoolClient.userPoolClientId,
      description: 'Cognito User Pool Client ID',
    });
  }
}
