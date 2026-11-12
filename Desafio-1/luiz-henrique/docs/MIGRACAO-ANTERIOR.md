# Referência: migração do projeto anterior (Squad 03 MCP)

Repositório anterior: https://github.com/luiztosk/squad-03-desafio-MCP-agentic
Entrega individual de Luiz Henrique Ferreira Silva (@luiztosk).

## Estrutura do projeto anterior

```
squad-03-desafio-MCP-agentic/
├── docs/           # screenshots de evidência + setup-ollama.md
├── ollama-chat/    # backend + frontend do chat (Node.js)
├── ollama-tools/   # servidor MCP (tools de pagamento)
├── postman/        # coleções de teste da API
├── AGENTS.md
├── README.md
└── .gitignore
```

## Stack do projeto anterior

- Modelo: Qwen3.5 2b rodando localmente via Ollama (`ollama pull qwen3.5:2b`)
- Protocolo: MCP (Model Context Protocol) — servidor em `ollama-tools/`
- Runtime: Node.js / npm (rodar em cada pasta, dois terminais simultâneos)
- Testes: Postman

## Mapeamento para AWS (este desafio)

| Componente anterior | Equivalente AWS neste desafio |
|---------------------|-------------------------------|
| `ollama-tools/` (servidor MCP com tools de pagamento) | `tools/` — Lambdas: `listar_catalogo`, `registrar_intencao`, `realizar_compra` |
| `ollama-chat/` (backend + frontend chat) | `api/` (API Gateway + autorizador JWT Cognito + Lambda chat) + `frontend/` (S3 + CloudFront) |
| Modelo Qwen via Ollama (local) | Amazon Bedrock — Claude Haiku via Agente Strands no AgentCore Runtime |
| Postman (testes manuais) | Evidências documentadas no `README.md` (login, 401, compra cartão/pix, limite excedido, `intencao_id` inválido) |
| Regras: compra cartão/pix, limite excedido, `intencao_id` inválido | Mesmas regras de negócio implementadas nas tools e validadas pelo agente Strands |

## Modelagem de dados a reaproveitar

Tabelas DynamoDB (prefixadas `luiz-henrique`):

- `Usuarios`: `usuario_id` (PK), dados do cadastro por convite.
- `Conversas`: `conversa_id` (PK), `usuario_id` (SK/GSI), histórico de mensagens.
- `Intencoes`: `intencao_id` (PK), `usuario_id`, produtos, valor, status, carimbo de tempo.

Escritas condicionais para pagamento e limite (sem duplicidade). `usuario_id` vem do `sub` do token JWT Cognito, nunca do corpo nem do modelo.
