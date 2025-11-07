# PDV-ERP-Angular

Este projeto é uma aplicação desenvolvida com Angular, que serve como um sistema de PDV (Ponto de Venda) e ERP (Enterprise Resource Planning). O projeto foi gerado com Angular CLI versão 16.2.6.

## Sobre o projeto

Mais detalhes sobre o objetivo e funcionalidades específicas do sistema podem ser adicionados aqui, caso haja documentação adicional ou informações específicas do desenvolvedor.

## Estrutura do projeto
PDV-ERP-Angular/
├── src/
│ ├── app/
│ │ ├── components/ # Componentes reutilizáveis do Angular
│ │ ├── services/ # Serviços para lógica de negócio e comunicação
│ │ ├── models/ # Modelos (interfaces/classes) do TypeScript
│ │ ├── app.module.ts # Módulo principal do Angular
│ │ └── app.component.ts # Componente raiz da aplicação
│ ├── assets/ # Imagens, ícones e outros recursos estáticos
│ ├── environments/ # Configurações de ambiente (dev, prod)
│ ├── index.html # Entrada HTML da aplicação
│ └── styles.css # Estilos globais
├── angular.json # Arquivo de configuração Angular CLI
├── package.json # Dependências e scripts do projeto
└── README.md # Este arquivo de documentação 

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
