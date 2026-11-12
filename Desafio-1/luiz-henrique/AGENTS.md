# AGENTS.md — Desafio 1 (luiz-henrique)

Este documento define as restrições de trabalho para este desafio. Siga rigorosamente para não cometer fora da pasta ou fora da branch correta.

## 1. Pasta de trabalho exclusiva

Trabalhe **somente** dentro desta pasta:

```
Desafio-1/luiz-henrique/
├── frontend/
├── api/
├── agent/
├── tools/
├── infra/
├── docs/
├── README.md
└── AGENTS.md  (este arquivo)
```

Não crie, edite, mova ou remova arquivos fora de `Desafio-1/luiz-henrique/`.

## 2. Branch exclusiva

Trabalhe **somente** na branch:

```
fellow/luiz-henrique-desafio-1
```

Crie-a a partir de `main`:

```bash
git checkout -b fellow/luiz-henrique-desafio-1
```

Não faça commit em `main`, `develop`, `master` ou qualquer outra branch.

## 3. Nunca commitar fora desta pasta

Antes de qualquer `git add` / `git commit`:

1. Confirme a branch: `git branch --show-current` deve retornar `fellow/luiz-henrique-desafio-1`.
2. Confirme os arquivos: `git status` deve listar apenas arquivos dentro de `Desafio-1/luiz-henrique/`.
3. Nunca faça `git add .` na raiz do repositório. Adicione apenas esta pasta:

```bash
git add Desafio-1/luiz-henrique/
```

Se houver alterações fora de `Desafio-1/luiz-henrique/` no `git status`, **não as inclua** no commit. Descarte ou deixe de lado.

## 4. Regras do desafio (resumo)

- Região: `us-east-1`.
- Prefixo de recursos/stack: `luiz-henrique` (para não colidir com os demais fellows).
- Bucket S3 privado, servido só pelo CloudFront (OAC).
- Cognito sem auto cadastro (`AllowAdminCreateUserOnly`); usuários entram por convite.
- `usuario_id` vem do `sub` do token JWT, nunca do corpo nem do modelo.
- API responde `401` sem token válido.
- CORS da API aceita apenas o domínio do CloudFront.
- IAM de menor privilégio, sem `*` e sem `AdministratorAccess`.
- Nenhum segredo no Git (sem `.env`, sem chaves de acesso, sem tokens).
- Modelo: Amazon Bedrock (Claude Haiku) via Agente Strands no AgentCore Runtime.

## 5. Checklist antes de commitar

- [ ] Branch é `fellow/luiz-henrique-desafio-1`.
- [ ] `git status` mostra apenas arquivos em `Desafio-1/luiz-henrique/`.
- [ ] Nenhum arquivo com segredos/credenciais foi adicionado.
- [ ] Nenhum `git add` na raiz do repo (somente `Desafio-1/luiz-henrique/`).
- [ ] Commit mensage é claro e refere-se ao desafio.

## 6. Limpeza (após a correção)

Destrua a stack e confirme no console que não restou bucket, distribuição CloudFront, runtime do AgentCore, imagens no ECR, tabelas DynamoDB ou logs.

## 7. Convenção de documentação

- O `docs/TODO.md` é exclusivamente para a lista de tarefas (TODO list). Não acrescente informações extras nele.
- Informações adicionais (ex.: referência de projetos anteriores, notas de migração) devem ir em novos arquivos dentro de `docs/`, por exemplo `docs/MIGRACAO-ANTERIOR.md`.
