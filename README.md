# UrbanDelivery 🚚

UrbanDelivery é uma plataforma moderna e completa de gestão de logística e "last-mile delivery", desenvolvida para otimizar as operações diárias de empresas de estafetagem. A aplicação permite gerir encomendas, frota, equipas e rotas através de um painel de controlo profissional e altamente responsivo.

## ✨ Principais Funcionalidades

- **Painel de Gestor (Dashboard):** Visualização em tempo real de KPIs críticos como volume de entregas, taxa de sucesso no prazo (On-Time Rate) e distribuição gráfica do estado das encomendas (via Recharts).
- **Gestão de Encomendas:** Criação e monitorização do ciclo de vida das encomendas. Inclui ferramentas ágeis para cancelamentos, atualizações de estado e registo de incidentes (avisos de atraso e reagendamentos).
- **Quadro de Despacho (Dispatch Board):** Interface interativa baseada em arrastar e largar (Drag & Drop) para atribuição e organização rápida de entregas pelas diferentes equipas/estafetas de serviço.
- **Planeamento de Rotas:** Agrupamento inteligente de encomendas por Código Postal e Zona. Possibilidade de geração de guias de rota limpas, prontas a imprimir (exportação para PDF) e listagens de dados crus em CSV para integração com Excel.
- **Gestão de Entidades:** Interfaces dedicadas para administrar:
  - **Estafetas:** Gestão da equipa, horários de turno e estado de disponibilidade.
  - **Veículos:** Controlo de frota, matrículas e limites de capacidade.
  - **Clientes:** Registo de clientes regulares e histórico de interações.
- **Design UI/UX Profissional:** Interface moderna (*glassmorphism*, sombras suaves, paleta de cores consistente e animações de estado) focada em produtividade operacional.

## 🛠️ Tecnologias Utilizadas

- **Framework:** [Next.js](https://nextjs.org/) (App Router)
- **Biblioteca UI:** [React](https://reactjs.org/)
- **Estilização:** [Tailwind CSS](https://tailwindcss.com/) com CSS puro modular (efeitos e animações customizadas).
- **Gráficos:** [Recharts](https://recharts.org/)
- **Base de Dados / Estado:** A aplicação utiliza atualmente a API `localStorage` do browser combinada com um motor de *seeding* (geração de dados automáticos) para simular um ambiente persistente e real de base de dados.

## 🚀 Como Iniciar o Projeto

### Pré-requisitos
- [Node.js](https://nodejs.org/) (versão 18.x ou superior recomendada)
- `npm`, `yarn` ou `pnpm`

### Instalação

1. Clone o repositório ou faça download dos ficheiros.
2. Na raiz do projeto, instale as dependências:
   ```bash
   npm install
   ```
3. Inicie o servidor de desenvolvimento:
   ```bash
   npm run dev
   ```
4. Abra o seu navegador web no endereço [http://localhost:3000](http://localhost:3000).

*Nota:* No primeiro acesso, a aplicação irá automaticamente gerar ("seed") dados fictícios (150 encomendas, frota, estafetas e clientes) para que possa interagir e explorar imediatamente todas as funcionalidades da plataforma.

## 📦 Estrutura do Projeto

- `/app` - Rotas, layouts e páginas da aplicação Next.js.
  - `/dashboard` - Painel analítico de gestão.
  - `/orders` - Gestão central de encomendas.
  - `/dispatch` - Quadro operacional de distribuição.
  - `/routes` - Motor de rotas e exportações.
  - `/components` - Componentes partilhados (modais, tabelas, seeding).
  - `/lib` - Lógica de negócio e acesso a dados (Models e Services).
  - `/types` - Tipagens e interfaces de TypeScript.

## 📝 Desenvolvido para Excelência Operacional
Este projeto foi refinado até ao detalhe, garantindo consistência no alinhamento de componentes, estabilidade em fluxos e otimização para impressões, estando "production-ready" e apto para ambiente de demonstração profissional.
