# Desafio 1 — Agente de Pagamentos na AWS (luiz-henrique)

Sprint 2 · Trilha Pagamentos Agênticos · Trabalho individual

Branch: `fellow/luiz-henrique-desafio-1`

Região: `us-east-1` · Prefixo de recursos: `luiz-henrique`

## Estrutura

```
Desafio-1/luiz-henrique/
├── frontend/   # Chatbot estático (login Cognito + compras simuladas)
├── api/        # API Gateway + Lambda do chat (autorizador JWT Cognito)
├── agent/      # Agente Strands no Bedrock AgentCore Runtime (Claude Haiku)
├── tools/      # Lambdas das tools: listar_catalogo, registrar_intencao, realizar_compra
├── infra/      # IaC (único comando de deploy: backend, agente, frontend S3 + CloudFront)
├── docs/       # TODO.md
└── README.md   # este arquivo
```

## Diagrama implementado

```
CloudFront + S3 (frontend estático, login Cognito, OAC, bucket privado)
        │  HTTPS + Authorization: Bearer <JWT>
        ▼
API Gateway (autorizador JWT Cognito · streaming/WebSocket)
        ▼
Lambda do chat ───► Agente Strands no AgentCore Runtime (Bedrock · Claude Haiku)
                          ▼
                   Lambdas das tools ───► DynamoDB (usuários, conversas, intenções/transações)
```

## Passo a passo de deploy

Pré-requisitos: AWS CLI v2, perfil SSO `desafio-1` configurado, `aws sso login` feito, `export AWS_PROFILE=desafio-1`.

```bash
# Confirmar conta
aws sts get-caller-identity

# Entrar na pasta de infra
cd Desafio-1/luiz-henrique/infra

# Rodar o único comando de deploy (backend, agente, build/upload frontend S3 + invalidação CloudFront)
# Exemplo (ajuste conforme o IaC escolhido):
# cdk deploy luiz-henrique-desafio-1 --require-approval never
# ou: terraform apply -auto-approve
# ou: cloudformation deploy ...
```

Verificar criação de: bucket S3, distribuição CloudFront, runtime do AgentCore, imagens no ECR, tabelas DynamoDB, logs CloudWatch.

Aplicação acessível via domínio do CloudFront.

## Modelo usado

- Amazon Bedrock — Claude Haiku
- Agente Strands rodando no Bedrock AgentCore Runtime

## Modelagem do DynamoDB

Tabelas (prefixadas com `desafio-1`):

- `Usuarios`: `usuario_id` (PK, = sub do Cognito), dados do cadastro por convite.
- `Conversas`: `conversa_id` (PK), `usuario_id` (SK/GSI), histórico de mensagens.
- `Intencoes`: `intencao_id` (PK), `usuario_id`, produtos, valor, status, carimbo de tempo.

Escritas condicionais para pagamento e limite (sem duplicidade). `usuario_id` vem do `sub` do token JWT, nunca do corpo nem do modelo.

## Resumo do IAM

- IAM de menor privilégio; nenhum curinga `*`; nenhum `AdministratorAccess`.
- Lambda do chat: invocação do AgentCore Runtime + leitura DynamoDB.
- Lambdas das tools: escrita condicional nas tabelas DynamoDB correspondentes.
- API Gateway: autorizador JWT Cognito.
- AgentCore Runtime: execução do agente Strands com Bedrock.
- CloudFront: OAC para acesso ao bucket S3 privado.
- Nenhum segredo no Git.

## Evidências

| Caso | Resultado esperado | Evidência |
|------|-------------------|-----------|
| Login com usuário válido | JWT obtido; acesso liberado | pendente |
| Requisição sem token | `401` | pendente |
| Compra com cartão de crédito | Sucesso; intenção registrada e paga | pendente |
| Compra com Pix | Sucesso; intenção registrada e paga | pendente |
| Limite excedido | Compra rejeitada | pendente |
| `intencao_id` inválido | Erro; intenção não encontrada | pendente |

Adicionar screenshots/logs de cada evidência nesta seção.

## Instruções de remoção (após a correção)

```bash
cd Desafio-1/luiz-henrique/infra

# Destruir a stack (único comando)
# cdk destroy luiz-henrique-desafio-1 --force
# ou: terraform destroy -auto-approve
```

Confirmar no console AWS que não restou: bucket S3, distribuição CloudFront, runtime do AgentCore, imagens no ECR, tabelas DynamoDB, logs CloudWatch.

## Regras essenciais

- Tudo em `us-east-1`.
- Bucket S3 privado, servido só pelo CloudFront (OAC).
- CORS da API aceita apenas o domínio do CloudFront.
- Cognito sem auto cadastro (`AllowAdminCreateUserOnly`); usuários entram por convite.
- `usuario_id` vem do `sub` do token, nunca do corpo nem do modelo.
- Valor da compra vem da intenção salva; pagamento e limite usam escritas condicionais (sem duplicidade).
- Manter a aplicação no ar até a correção.
- Criar no Cognito um usuário com o e-mail do instrutor.
