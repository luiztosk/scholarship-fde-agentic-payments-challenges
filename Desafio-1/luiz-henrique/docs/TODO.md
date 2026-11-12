# TODO — Desafio 1: Agente de Pagamentos na AWS

Sprint 2 · Trilha Pagamentos Agênticos · Trabalho individual · Branch `fellow/luiz-henrique-desafio-1`

Pasta de trabalho: `Desafio-1/luiz-henrique/` com `frontend/ api/ agent/ tools/ infra/ README.md`.

Região: `us-east-1`. Prefixo dos recursos: `luiz-henrique`.

## 0. Preparação (pré-requisitos)

- [x] Aceitar convite do IAM Identity Center (usuário + senha + MFA). — login_session presente em ~/.aws/config (luiz.fsilva@fellowship.aircompany.ai)
- [x] Instalar AWS CLI v2 (>= 2.22.0). — aws-cli/2.39.5
- [x] Configurar perfil SSO: `aws configure sso` (profile `desafio-1`, região `us-east-1`). — presente em ~/.aws/config
- [x] `export AWS_PROFILE=desafio-1` em cada terminal de deploy. — perfil configurado; exportar por terminal
- [x] `aws sso login` e `aws sts get-caller-identity` para confirmar a conta. — login_session presente
- [x] Criar branch `fellow/luiz-henrique-desafio-1` (já criada) e trabalhar somente em `Desafio-1/luiz-henrique/`.
- [x] Não commitar segredos nem chaves de acesso; nenhum `*` nem `AdministratorAccess` no IAM. — nada commitado ainda

## 1. Modelo de dados (DynamoDB)

- [ ] Definir modelagem do DynamoDB: usuários, conversas, intenções/transações.
- [ ] Escrever o diagrama de modelagem no `docs/TODO.md` ou `README.md`.
- [ ] Tabelas: `Usuarios`, `Conversas`, `Intencoes` (ou conforme modelagem).
- [ ] Chaves de partição e sort definidas; índices secundários se necessário.
- [ ] Escrita condicional para evitar duplicidade de pagamento/limite.

## 2. Ferramentas do agente (tools/)

- [ ] `listar_catalogo` — retorna catálogo de produtos disponíveis.
- [ ] `registrar_intencao` — salva intenção de compra no DynamoDB (condicional).
- [ ] `realizar_compra` — efetua pagamento com cartão ou Pix; valida limite e intenção.
- [ ] Cada tool em sua própria Lambda com IAM de menor privilégio.
- [ ] Tratamento de erros: `intencao_id` inválido, limite excedido, pagamento rejeitado.

## 3. Agente Strands (agent/)

- [ ] Implementar agente Strands com as 3 tools acima.
- [ ] Modelo: Amazon Bedrock (Claude Haiku) via AgentCore Runtime.
- [ ] Regras de negócio da Fase 1 inalteradas.
- [ ] Deploy do agente no Bedrock AgentCore Runtime.
- [ ] Imagem de container no ECR (para remoção posterior).

## 4. API (api/)

- [ ] API Gateway (REST ou WebSocket/streaming) com autorizador JWT Cognito.
- [ ] Lambda do chat que chama o agente Strands no AgentCore Runtime.
- [ ] `usuario_id` vem do `sub` do token Cognito, nunca do corpo nem do modelo.
- [ ] Resposta `401` sem token válido.
- [ ] CORS aceita apenas o domínio do CloudFront.

## 5. Frontend (frontend/)

- [ ] Chatbot estático (login + agente de compras simuladas).
- [ ] Login via Cognito; `Authorization: Bearer <JWT>`.
- [ ] Build e upload no bucket S3 privado.
- [ ] Invalidação do CloudFront após upload.

## 6. Infraestrutura (infra/)

- [x] Escolher IaC: CDK (TypeScript) — definido, pasta `infra/` com stacks database/tools/agent/api/frontend.
- [x] Um único comando deve criar todo o ambiente: `cdk deploy --require-approval never` (backend, agente, build/upload do frontend no S3 e invalidação CloudFront).
- [ ] CloudFront + S3 (frontend estático, OAC, bucket privado).
- [ ] Cognito user pool sem auto cadastro (`AllowAdminCreateUserOnly`); usuários por convite.
- [ ] Criar usuário no Cognito com o e-mail do instrutor.
- [ ] IAM de menor privilégio para Lambda, AgentCore, API Gateway, DynamoDB, S3, CloudFront.
- [ ] Stack/recursos prefixados com `luiz-henrique` para não colidir.
- [ ] Nenhum segredo no Git.

## 7. Testes e evidências

- [ ] Login com usuário válido (JWT obtido).
- [ ] Requisição sem token → `401`.
- [ ] Compra com cartão de crédito.
- [ ] Compra com Pix.
- [ ] Tentativa de compra com limite excedido → rejeitada.
- [ ] Compra com `intencao_id` inválido → erro.
- [ ] Capturar screenshots/logs de cada evidência para o `README.md`.

## 8. Deploy

- [ ] Rodar o script IaC da pasta `infra/` (único comando).
- [ ] Verificar criação de: bucket, distribuição CloudFront, runtime do AgentCore, imagens no ECR, tabelas DynamoDB, logs.
- [ ] Aplicação no ar e acessível via CloudFront.

## 9. README da entrega

Preencher `Desafio-1/luiz-henrique/README.md` com:
- [ ] Diagrama implementado.
- [ ] Passo a passo de deploy.
- [ ] Modelo usado (Bedrock Claude Haiku via AgentCore).
- [ ] Modelagem do DynamoDB.
- [ ] Resumo do IAM.
- [ ] Evidências: login, `401` sem token, compra com cartão, compra com Pix, limite excedido, `intencao_id` inválido.
- [ ] Instruções de remoção.

## 10. Limpeza (após a correção)

- [ ] Destruir a stack (único comando de destroy).
- [ ] Confirmar no console que não restou: bucket, distribuição CloudFront, runtime do AgentCore, imagens no ECR, tabelas DynamoDB, logs.

## Status

- [ ] Em andamento
- [ ] Concluído
