# React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some Oxlint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the Oxlint configuration

If you are developing a production application, we recommend enabling type-aware lint rules by installing `oxlint-tsgolint` and editing `.oxlintrc.json`:

```json
{
  "$schema": "./node_modules/oxlint/configuration_schema.json",
  "plugins": ["react", "typescript", "oxc"],
  "options": {
    "typeAware": true
  },
  "rules": {
    "react/rules-of-hooks": "error",
    "react/only-export-components": ["warn", { "allowConstantExport": true }]
  }
}
```

See the [Oxlint rules documentation](https://oxc.rs/docs/guide/usage/linter/rules) for the full list of rules and categories.

---

## 🚀 Conexão com Supabase (Login & Persistência)

O LinkHub está preparado para autenticação e persistência na nuvem com o **Supabase**.

### 1. Configurar credenciais no `.env`
Crie ou edite o arquivo `.env` na raiz do projeto com as credenciais do seu projeto Supabase:

```env
VITE_SUPABASE_URL=https://seu-projeto.supabase.co
VITE_SUPABASE_ANON_KEY=sua-chave-anon-publica
```

> **Onde encontrar**: No dashboard do Supabase em **Project Settings** > **API** (Project URL e `anon public` key).

### 2. Criar as Tabelas e Políticas de Segurança (RLS)
1. Acesse o **SQL Editor** no painel do seu projeto Supabase.
2. Abra o arquivo [`supabase/schema.sql`](supabase/schema.sql) deste repositório.
3. Copie todo o conteúdo, cole no SQL Editor do Supabase e clique em **Run**.

Isso criará automaticamente:
- A tabela `categories` com Row Level Security (RLS)
- A tabela `links` com Row Level Security (RLS)
- Índices de performance e regras de integridade referencial com `auth.users`

### 3. Utilização
- **Com Supabase configurado**: Os usuários podem criar contas, fazer login, redefinir senhas e seus links e categorias ficarão salvos na nuvem e isolados por usuário.
- **Modo Convidado / Fallback**: Se as chaves não forem configuradas ou a rede estiver indisponível, o sistema funciona perfeitamente utilizando o armazenamento local (`localStorage`).

