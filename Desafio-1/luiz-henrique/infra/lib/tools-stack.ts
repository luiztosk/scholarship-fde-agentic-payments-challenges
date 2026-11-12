import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import * as iam from 'aws-cdk-lib/aws-iam';

export interface ToolsStackProps extends cdk.StackProps {
  stackPrefix: string;
  intencoesTable: dynamodb.Table;
  usuariosTable: dynamodb.Table;
}

export interface ToolLambdaArns {
  listarCatalogo: string;
  registrarIntencao: string;
  realizarCompra: string;
}

export class ToolsStack extends cdk.Stack {
  public readonly toolLambdaArns: ToolLambdaArns;
  public readonly listarCatalogoFn: lambda.Function;
  public readonly registrarIntencaoFn: lambda.Function;
  public readonly realizarCompraFn: lambda.Function;

  constructor(scope: Construct, id: string, props: ToolsStackProps) {
    super(scope, id, props);

    const { stackPrefix, intencoesTable, usuariosTable } = props;
    const prefix = `${stackPrefix}-`;

    const commonEnv = {
      USUARIOS_TABLE: usuariosTable.tableName,
      INTENCOES_TABLE: intencoesTable.tableName,
    };

    this.listarCatalogoFn = new lambda.Function(this, 'ListarCatalogoFn', {
      functionName: `${prefix}listar-catalogo`,
      runtime: lambda.Runtime.NODEJS_20_X,
      handler: 'index.handler',
      code: lambda.Code.fromInline(`
        exports.handler = async () => ({
          statusCode: 200,
          body: JSON.stringify([
            { id: 'prod-1', nome: 'Produto A', preco: 100.00 },
            { id: 'prod-2', nome: 'Produto B', preco: 250.00 },
            { id: 'prod-3', nome: 'Produto C', preco: 500.00 },
          ]),
        });
      `),
      environment: commonEnv,
    });

    this.registrarIntencaoFn = new lambda.Function(this, 'RegistrarIntencaoFn', {
      functionName: `${prefix}registrar-intencao`,
      runtime: lambda.Runtime.NODEJS_20_X,
      handler: 'index.handler',
      code: lambda.Code.fromInline(`
        exports.handler = async () => ({ statusCode: 200, body: JSON.stringify({ ok: true }) });
      `),
      environment: commonEnv,
    });

    this.realizarCompraFn = new lambda.Function(this, 'RealizarCompraFn', {
      functionName: `${prefix}realizar-compra`,
      runtime: lambda.Runtime.NODEJS_20_X,
      handler: 'index.handler',
      code: lambda.Code.fromInline(`
        exports.handler = async () => ({ statusCode: 200, body: JSON.stringify({ ok: true }) });
      `),
      environment: commonEnv,
    });

    // Least-privilege IAM: DynamoDB conditional writes on own tables only
    const ddbWritePolicy = new iam.PolicyStatement({
      actions: ['dynamodb:PutItem', 'dynamodb:UpdateItem', 'dynamodb:GetItem', 'dynamodb:Query'],
      resources: [intencoesTable.tableArn, intencoesTable.tableArn + '/index/*', usuariosTable.tableArn],
    });

    [this.listarCatalogoFn, this.registrarIntencaoFn, this.realizarCompraFn].forEach((fn) => {
      fn.addToRolePolicy(ddbWritePolicy);
    });

    this.toolLambdaArns = {
      listarCatalogo: this.listarCatalogoFn.functionArn,
      registrarIntencao: this.registrarIntencaoFn.functionArn,
      realizarCompra: this.realizarCompraFn.functionArn,
    };

    new cdk.CfnOutput(this, 'ListarCatalogoArn', { value: this.listarCatalogoFn.functionArn });
    new cdk.CfnOutput(this, 'RegistrarIntencaoArn', { value: this.registrarIntencaoFn.functionArn });
    new cdk.CfnOutput(this, 'RealizarCompraArn', { value: this.realizarCompraFn.functionArn });
  }
}
