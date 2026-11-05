# Verificação — Clínica Serena

## Escopo

Direção A recomendada adotada após o pedido para continuar. A imagem conceitual orientou a identidade; tipografia, escala e composição foram ajustadas para uso real, com uma coluna secundária no desktop e em orientação horizontal.

O 12ui foi consultado, mas permaneceu bloqueado por vinculação de conta. A exploração visual seguiu com os recursos disponíveis, conforme autorizado. Nenhum arquivo de referência Figma foi exigido ou inventado.

## Automatizado

Comando: `node --test tests/app.test.cjs` — 12 testes, todos aprovados.

Cobertura: mensagens e caminhos relativos, interrupção e callbacks antigos, repetição a partir de zero, preparação/reprodução/conclusão/erro, teste de voz, volume, ritmo, persistência, voz alternativa em português, timeout, ausência de voz, armazenamento bloqueado, saída da página, API de tela cheia, seleção acessível e encaminhamento da entrada legada.

`node --check app.js` aprovado. Os quatro MP3 têm os mesmos hashes do início da branch. O workflow de produção permanece sem alterações.

## Navegador Chromium

- Celulares: 320 × 568 e 390 × 844. As três ações ficam visíveis antes da área de ajustes; os documentos não apresentam rolagem horizontal.
- Tablet: 768 × 1024. Três ações amplas em uma coluna.
- Desktop: 1366 × 900 e viewport de aproximadamente 1363 px. Ações em uma coluna e comunicação ao lado, sem rolagem horizontal interna.
- Horizontal: 844 × 390. Após ajuste, a borda inferior da ação de pausa fica em 384 px, dentro da altura de 390 px.
- Texto ampliado: raiz em 200%, em viewport de 390 × 844. Os cartões crescem e há rolagem vertical, preservando o texto; a largura do documento e das mensagens permanece igual à área disponível, sem corte horizontal.
- Reprodução dos MP3 e alternância rápida entre as três escolhas confirmadas no navegador; conclusão exibida.
- Teste de voz confirmado. Volume alterado para 95% e ritmo para “Mais devagar”; ambos permaneceram após recarregar a página.
- Navegação por teclado e foco visível confirmados no controle de volume.
- Falha de reprodução e voz indisponível simuladas em uma página temporária de QA: o estado de erro apareceu e “Estou com dor. Pare, por favor!” permaneceu visível.
- O endereço legado encaminhou para a raiz corretamente.

As páginas e scripts temporários de QA não fazem parte da entrega ou da demonstração publicada.

## Limitações

Este Chromium recusou a solicitação de tela cheia; foi verificado o aviso de indisponibilidade. Entrada e saída bem-sucedidas da API foram verificadas com stub nos testes, mas precisam ser confirmadas em um aparelho real.

A voz alternativa foi verificada com simulação de uma voz pt-BR; a disponibilidade e a pronúncia dependem das vozes instaladas no aparelho. Os testes não substituem a conferência em Safari/iPhone, Android, tablet físico ou com leitores de tela reais. O CSS inclui suporte a `prefers-reduced-motion` e cores forçadas; essas preferências do sistema não foram alteradas no navegador de teste.

A escala de texto foi verificada por ampliação da fonte raiz, sem afirmar equivalência a todas as combinações de zoom de navegador e configurações de fonte do sistema.

## Revisão independente do código

Revisão da implementação em `251cfb1` contra a base `653946b`: nenhum achado Critical ou Important. Os 12 testes e a sintaxe foram confirmados pelo revisor, que não repetiu a inspeção em navegador.

Melhoria menor registrada para revisão futura: no modo de cores forçadas, o contorno do cartão selecionado pode dificultar a distinção entre seleção e foco. O foco normal foi conferido visualmente; cores forçadas não foram ativadas neste ambiente. Convém diferenciar `.choice.selected:focus-visible` antes de uma validação formal desse modo.

## Entrega no GitHub

A integração recusou a criação da branch remota com HTTP 403, “Resource not accessible by integration”. A branch local `design/clinica-serena` foi preservada em um Git bundle completo. Não foi criado pull request, não houve merge e a main permaneceu em `653946b382071a858e4dade902deee0eab05d8c7`.
