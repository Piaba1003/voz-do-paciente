# Voz do Paciente

Aplicativo web para comunicar três mensagens ao dentista com botões grandes e voz em português brasileiro.

## Publicar no GitHub Pages

1. Extraia este ZIP no computador.
2. Crie um repositório chamado `voz-do-paciente` no GitHub. Para publicar com GitHub Pages no plano gratuito, escolha **Public** (o código também ficará público).
3. Envie todos os arquivos e as pastas extraídos, mantendo a estrutura. O arquivo `index.html` deve ficar diretamente na raiz do repositório. Não envie o ZIP inteiro nem uma pasta externa que contenha tudo.
4. Clique em **Commit changes** para salvar.
5. Abra **Settings > Pages**. Em **Source**, selecione **Deploy from a branch**. Em **Branch**, selecione **main** e **/(root)**; clique em **Save**.
6. Aguarde a publicação. O GitHub mostrará o endereço do site na mesma tela de Pages.

Não é necessário executar npm, instalar dependências ou configurar servidor. O site usa HTML, CSS, JavaScript e arquivos de áudio incluídos neste pacote.

## Arquivos

- `index.html`: tela do aplicativo.
- `style.css`: layout e responsividade.
- `app.js`: reprodução, interrupção de mensagens, volume e ritmo.
- `audio/`: áudios das três mensagens e teste de voz.
- `fonts/`: fontes Nunito e licença SIL Open Font License.
- `icon.svg`: ícone.
- `.nojekyll`: indica publicação estática sem processamento Jekyll.

O botão vermelho interrompe a mensagem que estiver tocando. A voz do aparelho serve de alternativa se um arquivo de áudio não carregar. Teste o áudio no aparelho antes do atendimento.

## Testar localmente

Abra `index.html` em um navegador. Para testar com servidor local, se houver Python instalado, use `python -m http.server 8000` nesta pasta e abra `http://localhost:8000`.

## Referências

- https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site
