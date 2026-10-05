# Clareza — Simulador de pagamentos

Aplicativo estático, sem servidor, banco de dados ou etapa de compilação. A página principal simula condições e prepara a impressão; a aba **IPTU e taxas** reúne estimativas municipais em uma área própria.

## Arquivos

- `index.html` — estrutura e navegação.
- `styles.css` — identidade visual, adaptação para celular e folha de impressão.
- `app.js` — cálculos, cenários, impostos, impressão e configurações locais.

## Uso

Abra `index.html` em um navegador moderno. Preencha os dados da apresentação e o valor; escolha uma condição ou clique em um cenário para usá-lo. A impressão oferece o plano selecionado ou a comparação das quatro opções. No diálogo do navegador, escolha **Salvar como PDF** para gerar um arquivo.

O número da proposta é criado ao abrir uma simulação e muda ao selecionar **Nova simulação**. A sequência diária é guardada neste navegador. Os campos em reais formatam pontos e vírgula durante a digitação; os botões − e + ajustam a quantidade de parcelas.

O catálogo de taxas parte do material fornecido para Porto Velho, exercício 2026. A UPF é editável, e a tela identifica os valores como estimativas que precisam ser conferidas no DAM ou na tabela oficial antes da apresentação. As despesas entram na impressão apenas quando essa opção for marcada.

Os dados da simulação ficam na página enquanto ela está aberta. As configurações da marca e do profissional são salvas no armazenamento local do navegador e podem ser exportadas para JSON. Telefone e e-mail começam vazios e podem ser preenchidos em **Marca e impressão**. O aplicativo não envia dados a um servidor.

## Publicação

O projeto funciona como site estático: não precisa de servidor, dependências ou etapa de build. Para publicar no GitHub Pages:

1. Crie um repositório separado e envie os arquivos `index.html`, `styles.css`, `app.js`, `README.md` e `.nojekyll` para a raiz.
2. No repositório, abra **Settings → Pages**.
3. Em **Build and deployment**, escolha **Deploy from a branch**, selecione `main` e a pasta `/(root)`, e salve.
4. Aguarde o GitHub Pages concluir a publicação; o endereço aparecerá na mesma tela.

A página carrega as fontes DM Sans e Manrope do Google Fonts quando há conexão; usa fontes de sistema como alternativa. O navegador guarda as configurações profissionais localmente e o aplicativo não envia simulações a um servidor.
