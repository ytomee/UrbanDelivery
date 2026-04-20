# Product Backlog — UrbanDelivery

## Épico 1 — Gestão de Clientes

### US01 — Registar clientes particulares e empresas

**Como** operador,
**Quero** registar clientes particulares e empresas
**Para que** possa associá-los a encomendas.

**Critérios de aceitação:**
- O formulário recolhe nome, NIF, tipo (particular/empresa), email e telefone.
- Validação dos campos obrigatórios.
- A lista de clientes é consultável.

**Prioridade:** MUST | **Story Points:** 5 | **Sprint:** 1

---

### US02 — Gerir múltiplas moradas de entrega por cliente

**Como** operador,
**Quero** gerir múltiplas moradas de entrega por cliente
**Para que** as encomendas possam ser enviadas para diferentes localizações.

**Critérios de aceitação:**
- É possível adicionar/editar/eliminar moradas.
- Marcar uma morada como predefinida.
- Cada morada tem rua, cidade, código postal e zona.

**Prioridade:** MUST | **Story Points:** 3 | **Sprint:** 1

---

### US03 — Consultar histórico de encomendas

**Como** cliente,
**Quero** consultar o histórico das minhas encomendas
**Para que** possa acompanhar as minhas compras anteriores.

**Critérios de aceitação:**
- A lista mostra data, ID da encomenda, estado e total.
- Pode ser ordenada por data.

**Prioridade:** SHOULD | **Story Points:** 3 | **Sprint:** 2

---

## Épico 2 — Gestão de Encomendas

### US04 — Criar nova encomenda

**Como** operador,
**Quero** criar uma nova encomenda associada a um cliente
**Para que** possa iniciar o fluxo de entrega.

**Critérios de aceitação:**
- Seleção de cliente, morada, artigos e data prevista.
- O sistema gera um ID único para a encomenda.

**Prioridade:** MUST | **Story Points:** 5 | **Sprint:** 1

---

### US05 — Atualizar estado da encomenda

**Como** operador,
**Quero** atualizar o estado da encomenda (pendente, em distribuição, entregue, cancelada)
**Para que** todos os intervenientes vejam o progresso em tempo real.

**Critérios de aceitação:**
- Cada mudança de estado fica registada com data/hora.
- Só são permitidas transições válidas.
- Distintivo visual por estado.

**Prioridade:** MUST | **Story Points:** 3 | **Sprint:** 2

---

### US06 — Cancelar encomenda com motivo

**Como** operador,
**Quero** cancelar uma encomenda com um motivo
**Para que** possa manter a rastreabilidade das exceções.

**Critérios de aceitação:**
- O cancelamento exige um motivo.
- As encomendas canceladas permanecem visíveis mas assinaladas.

**Prioridade:** SHOULD | **Story Points:** 2 | **Sprint:** 2

---

## Épico 3 — Planeamento de Entregas

### US07 — Atribuir encomendas a estafetas

**Como** dispatcher,
**Quero** atribuir encomendas a estafetas
**Para que** as entregas possam ser executadas.

**Critérios de aceitação:**
- Atribuição por drag-and-drop ou dropdown.
- O estafeta vê as encomendas atribuídas.
- A reatribuição é permitida.

**Prioridade:** MUST | **Story Points:** 5 | **Sprint:** 2

---

### US08 — Agrupar encomendas por zona ou rota

**Como** dispatcher,
**Quero** agrupar encomendas por zona ou rota
**Para que** possa otimizar o tempo de deslocação.

**Critérios de aceitação:**
- As encomendas são filtráveis por código postal.
- A vista de rota mostra a sequência.
- Formato apto para impressão/exportação.

**Prioridade:** SHOULD | **Story Points:** 8 | **Sprint:** 2

---

### US09 — Atualizar estado da entrega (estafeta)

**Como** estafeta,
**Quero** atualizar o estado da entrega a partir da minha interface
**Para que** o sistema reflita a realidade.

**Critérios de aceitação:**
- Botões pensados para mobile — "Recolhida", "Entregue", "Falhou".
- Marca de GPS simulada.

**Prioridade:** MUST | **Story Points:** 5 | **Sprint:** 2

---

## Épico 4 — Gestão de Estafetas

### US10 — Registar estafetas

**Como** operador,
**Quero** registar estafetas
**Para que** lhes possa atribuir trabalho.

**Critérios de aceitação:**
- Campos: nome, identificação, contacto, veículo atribuído, zona preferida.

**Prioridade:** MUST | **Story Points:** 3 | **Sprint:** 1

---

### US11 — Marcar disponibilidade e horários

**Como** estafeta,
**Quero** marcar a minha disponibilidade e os meus horários
**Para que** só receba encomendas durante os turnos ativos.

**Critérios de aceitação:**
- Grelha semanal de horário.
- Toggle disponível/indisponível.
- Reflete-se na vista de atribuição.

**Prioridade:** SHOULD | **Story Points:** 5 | **Sprint:** 3

---

### US12 — Ver distribuição da carga de trabalho

**Como** gestor,
**Quero** ver a distribuição da carga de trabalho dos estafetas
**Para que** possa equilibrar as atribuições de forma justa.

**Critérios de aceitação:**
- Gráfico de barras por estafeta com as encomendas de hoje/semana.
- Destaca os estafetas sobrecarregados.

**Prioridade:** COULD | **Story Points:** 3 | **Sprint:** 3

---

## Épico 5 — Gestão de Recursos

### US13 — Registar veículos

**Como** operador,
**Quero** registar veículos (motorizadas, carrinhas, bicicletas)
**Para que** os possa atribuir aos estafetas.

**Critérios de aceitação:**
- Campos: matrícula, tipo, capacidade, estado (ativo/em manutenção).

**Prioridade:** SHOULD | **Story Points:** 3 | **Sprint:** 1

---

### US14 — Alertas de manutenção preventiva

**Como** gestor,
**Quero** receber alertas de manutenção preventiva
**Para que** possa evitar avarias de veículos.

**Critérios de aceitação:**
- Alerta quando o limite de quilómetros ou a data é atingida.
- Widget no dashboard lista os veículos com manutenção pendente.

**Prioridade:** COULD | **Story Points:** 5 | **Sprint:** 3

---

## Épico 6 — Monitorização de Indicadores

### US15 — Ver número de entregas por período

**Como** gestor,
**Quero** ver o número de entregas por período
**Para que** possa medir o volume operacional.

**Critérios de aceitação:**
- Filtro por dia/semana/mês.
- Cartão numérico e linha de tendência.

**Prioridade:** MUST | **Story Points:** 5 | **Sprint:** 3

---

### US16 — Ver taxa de entregas no prazo

**Como** gestor,
**Quero** ver a taxa de entregas no prazo
**Para que** possa avaliar a qualidade do serviço.

**Critérios de aceitação:**
- Percentagem calculada.
- Indicador colorido (verde >90%, amarelo 70–90%, vermelho <70%).

**Prioridade:** MUST | **Story Points:** 3 | **Sprint:** 3

---

### US17 — Ver tempo médio de entrega

**Como** gestor,
**Quero** ver o tempo médio de entrega
**Para que** possa identificar estrangulamentos.

**Critérios de aceitação:**
- Apresentado em minutos/horas.
- Detalhe por zona.

**Prioridade:** SHOULD | **Story Points:** 3 | **Sprint:** 3

---

## Épico 7 — Análise de Dados

### US18 — Dashboard com gráficos operacionais

**Como** gestor,
**Quero** um dashboard com gráficos que resumam as operações
**Para que** possa tomar decisões baseadas em dados.

**Critérios de aceitação:**
- Pelo menos 3 gráficos (barras, linhas, circular).
- Layout responsivo.

**Prioridade:** MUST | **Story Points:** 8 | **Sprint:** 3

---

### US19 — Exportar relatórios para CSV/PDF

**Como** gestor,
**Quero** exportar relatórios para CSV/PDF
**Para que** os possa partilhar externamente.

**Critérios de aceitação:**
- Botões de exportação no dashboard.
- O ficheiro descarrega corretamente.

**Prioridade:** COULD | **Story Points:** 3 | **Sprint:** 3

---

## Épico 8 — Gestão de Comunicação com o Cliente

### US20 — Notificações de mudança de estado

**Como** cliente,
**Quero** receber notificações quando o estado da minha encomenda mudar
**Para que** me possa manter informado.

**Critérios de aceitação:**
- Registo simulado de email/SMS a cada mudança de estado.
- Visível no portal do cliente.

**Prioridade:** MUST | **Story Points:** 5 | **Sprint:** 2

---

### US21 — Avisos de atraso ou reagendamento

**Como** cliente,
**Quero** receber avisos de atraso ou reagendamento
**Para que** possa ajustar os meus planos.

**Critérios de aceitação:**
- O operador pode desencadear um aviso de atraso.
- A mensagem fica registada no histórico de comunicações.

**Prioridade:** MUST | **Story Points:** 3 | **Sprint:** 2

---

### US22 — Confirmar receção da entrega

**Como** cliente,
**Quero** confirmar a receção da entrega
**Para que** possa fechar o ciclo da encomenda.

**Critérios de aceitação:**
- Botão de confirmação na vista do cliente.
- Data/hora registada.

**Prioridade:** SHOULD | **Story Points:** 2 | **Sprint:** 2

---

### US23 — Definir preferências de comunicação

**Como** cliente,
**Quero** definir as minhas preferências de comunicação (email/SMS)
**Para que** possa receber atualizações do modo que prefiro.

**Critérios de aceitação:**
- Toggle por canal.
- Guardado por cliente.

**Prioridade:** SHOULD | **Story Points:** 3 | **Sprint:** 3

---

### US24 — Consultar histórico de comunicações

**Como** operador,
**Quero** consultar o histórico de comunicações por cliente
**Para que** tenha rastreabilidade completa.

**Critérios de aceitação:**
- Lista cronológica por cliente.
- Inclui canal, mensagem e data/hora.

**Prioridade:** MUST | **Story Points:** 3 | **Sprint:** 3

---

## Épico 9 — Não Funcional (Usabilidade)

### US25 — Navegação consistente e intuitiva

**Como** utilizador,
**Quero** uma navegação consistente e intuitiva
**Para que** possa utilizar o sistema sem formação prévia.

**Critérios de aceitação:**
- Barra lateral/cabeçalho persistentes.
- Iconografia idêntica em todos os ecrãs.
- Contraste WCAG AA.
- Aplica-se a todas as sprints.

**Prioridade:** MUST | **Story Points:** 5 | **Sprint:** 1–3