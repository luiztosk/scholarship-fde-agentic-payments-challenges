# Stack de tecnologia — Desafio 1 (luiz-henrique)

Decisões tomadas antes de iniciar a implementação.

## 1. IaC: AWS CDK (TypeScript)

- Linguagem: TypeScript.
- CLI: `cdk` (v2).
- Comando único de deploy: `cdk deploy --require-approval never` (pasta `infra/`).
- Comando único de destroy: `cdk destroy --force`.
- Motivo: o time já trabalha com TypeScript; o CDK gera CloudFormation sob o panos
  e permite definir DynamoDB, API Gateway, Lambda, Cognito, S3, CloudFront, ECR e
  AgentCore Runtime em uma só stack, com tipos e testes (`cdk synth`/`cdk diff`).

## 2. Frontend: Next.js (App Router) + AWS Amplify Gen 2

- Framework: Next.js (App Router), TypeScript.
- Estilização: Tailwind CSS.
- Geração estática: `next build` + `next export` (output: 'export') → pasta `out/`, enviada ao bucket S3 privado via `aws s3 sync` ou CDK `s3-deployment`.
- Autenticação: Amplify Gen 2 + componente `Authenticator` (UI pronta de login/Cognito).
- Hospedagem: S3 + CloudFront (não Amplify Hosting, pois o front é estático e servido pelo bucket).

## 3. Serviços AWS por camada

| Camada | Serviço | Detalhes |
|--------|---------|----------|
| Autenticação | Cognito User Pool | Sem auto-cadastro (`allowSignUp: false`); usuários entram por convite; `usuario_id` vem do `sub` do JWT |
| Frontend | S3 + CloudFront (OAC) | Bucket privado servido apenas pelo CloudFront |
| API | API Gateway REST | Autorizador JWT Cognito; resposta `401` sem token válido |
| Chat | Lambda (Node 20) | Chama o agente Strands no AgentCore Runtime |
| Agente | Bedrock AgentCore Runtime | Modelo Claude Haiku (Strands); imagem de container no ECR |
| Tools | 3 Lambdas (Node 20) | `listar_catalogo`, `registrar_intencao`, `realizar_compra`; IAM de menor privilégio |
| Banco | DynamoDB | Tabelas prefixadas `luiz-henrique`: `usuarios`, `conversas`, `intencoes`; escritas condicionais |

## 4. Regras do desafio mantidas

- Região: `us-east-1`.
- Prefixo de recursos: `luiz-henrique`.
- IAM de menor privilégio; nenhum `*` nem `AdministratorAccess`.
- `usuario_id` vem do `sub` do token JWT, nunca do corpo nem do modelo.
- CORS da API aceita apenas o domínio do CloudFront.
- Nenhum segredo no Git (sem `.env`, chaves de acesso ou tokens commitados).

## 5. Mapeamento com o projeto anterior (Squad 03 MCP)

Veja `docs/MIGRACAO-ANTERIOR.md` para a estrutura, stack e partes reaproveitáveis do
repositório https://github.com/luiztosk/squad-03-desafio-MCP-agentic.
