import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as cognito from 'aws-cdk-lib/aws-cognito';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as apigw from 'aws-cdk-lib/aws-apigateway';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import * as ssm from 'aws-cdk-lib/aws-ssm';

export interface ApiStackProps extends cdk.StackProps {
  stackPrefix: string;
  agentRuntimeArn: string;
  usuariosTable: dynamodb.Table;
}

export class ApiStack extends cdk.Stack {
  public readonly userPool: cognito.UserPool;
  public readonly userPoolClient: cognito.UserPoolClient;
  public readonly chatFn: lambda.Function;
  public readonly api: apigw.RestApi;
  public readonly apiUrl: string;
  public readonly apiDomain: string;

  constructor(scope: Construct, id: string, props: ApiStackProps) {
    super(scope, id, props);

    const { stackPrefix, agentRuntimeArn, usuariosTable } = props;
    const prefix = `${stackPrefix}-`;

    // Cognito User Pool (no self sign-up; users invited by admin)
    this.userPool = new cognito.UserPool(this, 'UserPool', {
      userPoolName: `${prefix}users`,
      selfSignUpEnabled: false,
      signInAliases: { email: true },
      autoVerifiedAttributes: [cognito.AutoVerifiedAttrs.EMAIL],
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });

    this.userPoolClient = new cognito.UserPoolClient(this, 'UserPoolClient', {
      userPool: this.userPool,
      userPoolClientName: `${prefix}client`,
      authFlows: {
        userPassword: true,
        userSrp: true,
      },
      generateSecret: false,
    });

    // Lambda do chat: chama o agente Strands no AgentCore Runtime
    this.chatFn = new lambda.Function(this, 'ChatFn', {
      functionName: `${prefix}chat`,
      runtime: lambda.Runtime.NODEJS_20_X,
      handler: 'index.handler',
      code: lambda.Code.fromInline(`
        exports.handler = async (event) => {
          const token = event.headers?.Authorization || event.headers?.authorization;
          if (!token) {
            return { statusCode: 401, body: JSON.stringify({ error: 'missing token' }) };
          }
          return { statusCode: 200, body: JSON.stringify({ ok: true, agentRuntime: process.env.AGENT_RUNTIME_ARN }) };
        };
      `),
      environment: {
        AGENT_RUNTIME_ARN: agentRuntimeArn,
        USUARIOS_TABLE: usuariosTable.tableName,
      },
    });

    // API Gateway com autorizador JWT Cognito
    this.api = new apigw.RestApi(this, 'Api', {
      restApiName: `${prefix}api`,
      description: 'Desafio 1 - API do chat de pagamentos',
      defaultCorsPreflightOptions: {
        allowOrigins: ['*'], // restringir ao domínio CloudFront após deploy do frontend
        allowMethods: ['GET', 'POST', 'OPTIONS'],
        allowHeaders: ['Content-Type', 'Authorization'],
      },
      deployOptions: {
        stageName: 'prod',
      },
    });

    const authorizer = new apigw.CfnAuthorizer(this, 'JwtAuthorizer', {
      restApiId: this.api.restApiId,
      name: `${prefix}cognito-authorizer`,
      type: 'COGNITO_USER_POOLS',
      providerArns: [this.userPool.userPoolArn],
      identitySource: 'method.request.header.Authorization',
    });

    const chatResource = this.api.root.addResource('chat');
    chatResource.addMethod('POST', new apigw.LambdaIntegration(this.chatFn), {
      authorizer: new apigw.CfnAuthorizer(this.api, 'RefAuthorizer', {
        restApiId: this.api.restApiId,
        name: `${prefix}cognito-authorizer-ref`,
        type: 'COGNITO_USER_POOLS',
        providerArns: [this.userPool.userPoolArn],
        identitySource: 'method.request.header.Authorization',
      }),
      authorizationType: apigw.AuthorizationType.COGNITO,
    });

    this.apiUrl = this.api.url;
    this.apiDomain = this.api.url.replace('https://', '').replace(/\/.*$/, '');

    new cdk.CfnOutput(this, 'UserPoolId', { value: this.userPool.userPoolId });
    new cdk.CfnOutput(this, 'UserPoolClientId', { value: this.userPoolClient.userPoolClientId });
    new cdk.CfnOutput(this, 'ApiUrl', { value: this.apiUrl });
  }
}
