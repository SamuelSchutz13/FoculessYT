# FoculessYT — Front-end

Interface em Vue 3 para a API do FoculessYT.

## Stack

- **Vue 3** + **Vite** + TypeScript
- **Tailwind CSS 4** + **shadcn-vue** (componentes em `src/components/ui`)
- **axios** (progresso do download), **vue-sonner** (toasts), **vue-i18n** (português e inglês)
- **Vitest** para testes

## Começando

A API precisa estar rodando (veja o README da raiz).

```bash
npm install
cp .env.example .env    # opcional: o padrão já aponta para http://localhost:3000/api/v1
npm run dev             # http://localhost:5173
```

## Scripts

| Script               | Descrição                       |
| -------------------- | ------------------------------- |
| `npm run dev`        | Servidor de desenvolvimento     |
| `npm run build`      | Type-check + build para `dist/` |
| `npm run type-check` | Só o type-check (`vue-tsc`)     |
| `npm test`           | Testes (Vitest)                 |

## Estrutura

```
src/
├── main.ts               # monta o app e os estilos
├── App.vue               # layout: cabeçalho, conteúdo e toasts
├── i18n/
│   ├── index.ts          # idioma inicial (salvo ou do navegador) e troca de idioma
│   ├── pt-BR.ts          # textos em português
│   └── en.ts             # textos em inglês (tipado contra o pt-BR: chave faltando não compila)
├── lib/
│   ├── api.ts            # formatos/qualidades, chamada à API, nome do arquivo e erros
│   └── download.ts       # salvar o arquivo
├── views/
│   └── HomeView.vue      # formulário: link, formato, qualidade e download
└── components/
    ├── LanguageToggle.vue # bandeiras para trocar o idioma
    ├── ThemeToggle.vue   # modo claro/escuro
    ├── GithubLink.vue    # link para o repositório
    └── ui/               # componentes do shadcn-vue
```

## Adicionando um formato ou qualidade

1. Adicione o valor em `formats` ou `qualities` em `src/lib/api.ts` (e no enum da API, em `src/modules/download/dto/download.dto.ts`).
2. Adicione o texto em `src/i18n/pt-BR.ts` e `src/i18n/en.ts`, em `form.formats` ou `form.qualities`.
3. `npm test` confere se toda opção tem texto nos dois idiomas.
