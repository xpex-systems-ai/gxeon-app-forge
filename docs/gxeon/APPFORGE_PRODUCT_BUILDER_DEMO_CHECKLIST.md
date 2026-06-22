# APPFORGE Product Builder Demo Checklist

## Preparação

- Abrir a aplicação em ambiente de preview/deploy.
- Fazer hard refresh antes da apresentação.
- Confirmar shell GXEON compacto e Product Factory Mode visíveis.

## Fluxo principal

1. Abrir o Product Builder MVP.
2. Confirmar visual black/gold premium, sem faixa clara no cabeçalho.
3. Clicar em **Gerar Blueprint** sem preencher ideia, nicho, público e problema.
4. Confirmar aviso: "Preencha ideia, nicho, público e problema para um blueprint mais forte."
5. Preencher ideia, nicho, público-alvo e problema.
6. Clicar em **Gerar Blueprint**.
7. Confirmar prévia com seções: Nomes, Avatar, Oferta, Preço, Landing, Marketplace Pack, Conteúdo, Checklist Humano e Próximos Passos.
8. Confirmar selo: "Prévia local — nada enviado ao LLM".
9. Abrir o prompt bruto recolhível.
10. Clicar em **Enviar para Composer** e confirmar que o textarea real é preenchido e focado, sem auto-send.
11. Clicar em **Copiar Prompt**.
12. Clicar em **Copiar Markdown**.
13. Clicar em **Exportar JSON** e verificar que o arquivo não contém segredos, chaves, cookies, checkout real ou tokens.
14. Clicar em **Salvar Rascunho**, recarregar a página e clicar em **Carregar Rascunho**.

## Regressão obrigatória

- Product Factory quick buttons ainda preenchem o composer.
- Provider/model controls seguem acessíveis.
- UI de API key segue acessível e inalterada.
- Import Chat, Import Folder e Clone a repo continuam acessíveis.
- A aplicação não adiciona pagamentos, marketplace APIs, banco de dados, external API calls ou auto-publishing.

## Readiness

Se todos os itens passarem, o módulo está demo-ready para Founder Preview e pronto para a próxima missão: `APPFORGE-003_MARKETPLACE_PACK_GENERATOR_MVP`.
