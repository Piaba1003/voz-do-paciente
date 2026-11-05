# Voz do Paciente

Aplicativo web que permite comunicar ao dentista, por um toque e uma mensagem falada, como o paciente está se sentindo.

- **Estou sem dor. Pode continuar.**
- **Estou sentindo dor, mas pode continuar.**
- **Estou com dor. Pare, por favor!**

## Clínica Serena

Identidade em verde-petróleo e branco-gelo, tipografia humanista Source Sans 3 e ícones SVG consistentes. As ações usam texto, ícone e cor; a pausa tem contorno vermelho mais forte. Os cartões ficam empilhados no celular. Em telas amplas e horizontais, a mensagem e os controles ocupam uma coluna secundária.

O arquivo `style.css` está organizado em tokens, base, componentes, layouts responsivos e preferências do usuário, sem as camadas antigas de sobrescritas.

## Funcionamento

Os MP3 em `audio/` continuam sendo a voz principal. Se um áudio não carregar, o aplicativo tenta uma voz em português do aparelho. Cada nova escolha interrompe a reprodução anterior. A mensagem escolhida continua visível em caso de falha.

O paciente também pode testar a voz e ajustar o volume e o ritmo. Essas preferências são salvas no próprio navegador quando o armazenamento está disponível. O botão de tela cheia aparece quando a API é suportada e informa uma recusa sem apagar a mensagem do paciente.

Teste o som no aparelho antes de iniciar o atendimento.

## Estrutura canônica

- `index.html`, `style.css`, `app.js`, `icon.svg`: aplicativo ativo na raiz.
- `audio/`: quatro MP3 originais, preservados.
- `fonts/`: fontes locais e suas licenças SIL Open Font License. A interface atual usa Source Sans 3; as fontes Nunito originais foram preservadas.
- `Voz_do_Paciente_GitHub/index.html`: encaminha o endereço antigo para `../`. Os outros arquivos legados permanecem preservados, mas não são carregados por essa entrada.
- `tests/app.test.cjs`: regressões de áudio, preferências, acessibilidade e roteamento.
- `docs/rebranding-verification.md`: resultados e limites da verificação.

A raiz é a única fonte ativa do frontend. Faça as próximas alterações nela, em vez de manter duas implementações.

## Executar e verificar

Sem frameworks, backend ou dependências de aplicação. Para servir localmente, execute na raiz:

```sh
python -m http.server 8000
```

Abra `http://localhost:8000`. Para executar os testes, use Node.js com o executor de testes nativo:

```sh
node --test tests/app.test.cjs
node --check app.js
```

## Publicação

O workflow existente `.github/workflows/static.yml` publica o conteúdo do repositório no GitHub Pages quando há push na `main`, ou quando é executado manualmente. Ele não foi alterado por este rebranding.

O trabalho de redesign permanece em `design/clinica-serena` para revisão. A demonstração é separada do site atual. Publicar no GitHub Pages exige uma decisão posterior de integrar as mudanças na `main`; criar a branch ou o pull request não substitui o site atual.
