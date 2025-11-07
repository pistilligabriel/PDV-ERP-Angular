# PDV-ERP-Angular

Este projeto é uma aplicação desenvolvida com Angular, que serve como um sistema de PDV (Ponto de Venda) e ERP (Enterprise Resource Planning). O projeto foi gerado com Angular CLI versão 16.2.6.

## Sobre o projeto

Projeto desenvolvido para gerenciamento de Usuários, Clientes, Produtos e realização de vendas, com foco em ter total registro de movimentos referente a vendas que podem ser consultados ou gerado relatórios para controle.

Features futuras:
-- Controle detalhado de movimentações de estoque (Hoje o sistema controla o estoque apenas com quantidade do produto, diminuindo quando vende e aumenta quando da entrada, mas não consigo visualizar as movimentações de estoque)

-- Controle financeiro


## Tecnologias utilizadas

- Angular (CLI versão 16.2.6)
- TypeScript
- HTML
- CSS

## Como executar o projeto

### Servidor de desenvolvimento

Execute o comando abaixo para iniciar um servidor de desenvolvimento:
ng serve

Depois, acesse a aplicação no navegador em:
http://localhost:4200/

A aplicação recarregará automaticamente ao fazer alterações nos arquivos fontes.

### Gerar componentes, diretivas, serviços, etc.

Para criar novos componentes ou outros elementos do Angular, utilize:
ng generate component nome-do-componente

ou outros comandos de geração:
ng generate directive|pipe|service|class|guard|interface|enum|module

### Build do projeto

Para construir a versão otimizada do projeto, execute:
ng build
Os artefatos de build serão armazenados na pasta `dist/`.
