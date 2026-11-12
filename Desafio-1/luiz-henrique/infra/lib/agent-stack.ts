import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as ecr from 'aws-cdk-lib/aws-ecr';

export interface AgentStackProps extends cdk.StackProps {
  stackPrefix: string;
  toolsLambdaArns: {
    listarCatalogo: string;
    registrarIntencao: string;
    realizarCompra: string;
  };
}

export class AgentStack extends cdk.Stack {
  public readonly agentRuntimeArn: string;
  public readonly repository: ecr.Repository;

  constructor(scope: Construct, id: string, props: AgentStackProps) {
    super(scope, id, props);

    const { stackPrefix } = props;
    const prefix = `${stackPrefix}-`;

    // ECR repository for the Strands agent container image
    this.repository = new ecr.Repository(this, 'AgentRepository', {
      repositoryName: `${prefix}agent`,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      emptyOnDelete: true,
      imageScanOnPush: true,
    });

    // Placeholder for Bedrock AgentCore Runtime + Strands agent (Claude Haiku).
    // The AgentCore Runtime resource is defined once the agent image is built and
    // the runtime API is available in this region.
    new cdk.CfnOutput(this, 'AgentRepositoryUri', { value: this.repository.repositoryUri });

    this.agentRuntimeArn = `arn:aws:bedrock-agentcore:${cdk.Aws.REGION}:${cdk.Aws.ACCOUNT_ID}:agent-runtime/${prefix}agent`;

    new cdk.CfnOutput(this, 'AgentRuntimeArn', { value: this.agentRuntimeArn });
  }
}
