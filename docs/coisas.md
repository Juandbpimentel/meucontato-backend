# Planejamento da Apresentação: Refatoração no Rocket.Chat

**Tema:** Qualidade de Software e Refatoração de Code Smells em React/TypeScript

**Objeto de Estudo:** Rocket.Chat (Fork)

**Base Teórica:** Engenharia de Software (Fowler) & Guia Prático de Refatoração

---

## Seção 1: Contextualização e Objeto de Estudo

### Slide 1: Capa
**Título:** Refatoração de Code Smells no Sistema Rocket.Chat
**Autores:** Juan Pimentel & Gabriel Alves
**Disciplina:** Qualidade de Software
**Instituição:** [Nome da Universidade]

> **Roteiro de Fala:** Apresentar a dupla e o tema. Enfatizar que o trabalho une a teoria acadêmica de qualidade de software com a prática em um projeto *open source* real e complexo.
> **Roteiro de Fala:** Apresentar a dupla e o tema. Mostrar que o trabalho junta o que aprendemos na faculdade com a prática em um projeto grande e aberto, igual ao que existe no mercado.

---

### Slide 2: O Objeto de Estudo (Rocket.Chat)
**Elementos Visuais:** Logo do Rocket.Chat + Print da Interface.
**Tópicos:**
* **O que é:** Plataforma de comunicação *open source* (concorrente do Slack).
* **Stack:** React, TypeScript, Node.js, Meteor.
* **Desafio:** Código antigo e grande, difícil de mexer.
* **Objetivo:** Diminuir os problemas acumulados no código.

> **Roteiro de Fala:** Explicar que escolhemos um projeto robusto para simular um ambiente real de trabalho, onde o código não é novo e possui dívidas técnicas acumuladas ao longo dos anos.
> **Roteiro de Fala:** Escolhemos um projeto grande e real para mostrar como é trabalhar com código antigo, cheio de problemas que foram se acumulando com o tempo.
> **Roteiro de Fala:** Explicar como encontramos os problemas. A análise automática do código ajudou a achar rapidamente os pontos que precisavam de ajuste.

---

## Seção 2: Diagnóstico

### Slide 3.0: Ajustes na Ferramente de Análise Estática
Elementos Visuais: Print do snifftsx padrão e comparação ao lado com ele ajustado identificando quantidade por tipo de smell no total e em arquivos.
**Tópicos:**
* **Desafio Inicial:** Ferramenta `snifftsx` não identificava todos os smells relevantes.
* **Ajustes Realizados:** Configuração personalizada para o contexto do Rocket.Chat.
* **Resultado:** Maior Facilidade na identificação da quantidade de smells por tipo e por arquivo durante o processo.(Que era feito manualmente antes).


### Slide 3: Diagnóstico e Métricas
**Elementos Visuais:** Print da tabela gerada pelo ajuste do `snifftsx` mostrando a quantidade de smells por tipo.
**Tópicos:**
* **Ferramenta:** `snifftsx` (Análise Estática para React + TS).
* **Total de Smells:** 408 detectados inicialmente.
* **Distribuição dos Smells:**
  - **Any Type (ANY):** 315 (Crítico)
  - **Missing Union Type (MUT):** 62
  - **Overly Flexible Props (OFP):** 11
  - **Enum Implicit Values (EIV):** 9
  - *Outros:* 11
* **Foco:** Smells específicos de React e TypeScript.

> **Roteiro de Fala:** Após ajustar a ferramenta, conseguimos visualizar diretamente a quantidade de cada tipo de smell através da tabela gerada. Isso facilitou a priorização dos problemas mais críticos, como o uso excessivo de `any` e a ausência de union types. O print da tabela mostra claramente onde estavam os principais focos de refatoração.
> **Roteiro de Fala:** Depois de ajustar a ferramenta, ficou fácil ver quantos problemas de cada tipo existiam. Assim, deu para escolher o que resolver primeiro. O print da tabela mostra onde estavam os principais pontos de atenção.
> **Roteiro de Fala:** Mostramos como estavam distribuídos os problemas. O foco foi resolver os 4 tipos mais comuns, deixando o código mais seguro e estável.

---

## Seção 3: Fundamentação e Metodologia

### Slide 5: Metodologia de Trabalho
**Elementos Visuais:** Diagrama de Ciclo (Identificar -> Refatorar -> Compilar -> Testar).
**Tópicos:**
* **Definição (Fowler):** Alterar a estrutura interna sem mudar o comportamento observável.
* **Estratégia:**
    1.  **Rede de Segurança:** Compilador TypeScript como validador.
    2.  **Atomicidade:** Mudanças pequenas e isoladas.
    3.  **Priorização:** Arquivos críticos (`packages/livechat`, `apps/meteor`).

> **Roteiro de Fala:** Explicar que não saímos mudando código aleatoriamente. Seguimos um guia prático e usamos os conceitos de Martin Fowler para garantir que o *software* continuasse funcionando.
> **Roteiro de Fala:** Não saímos mudando tudo de qualquer jeito. Usamos um passo a passo e boas práticas para garantir que o sistema continuasse funcionando.

---

## Seção 4: Deep Dive - Os Code Smells

### Slide 6: Smell #1 - Any Type (ANY)
**Elementos Visuais:** Ícone de alerta ou sinal de perigo.
**Tópicos:**
* **O Problema:** Uso de `any` desliga a verificação de tipos.
* **Categoria Teórica:** *Primitive Obsession* / *Dispensables*.
* **Risco:** Mascara erros de *runtime* (crash em produção).

> **Roteiro de Fala:** O `any` é o maior inimigo do TypeScript. Ele indica "preguiça" em modelar o dado (Primitive Obsession), permitindo que erros passem despercebidos até o usuário usar o sistema.
> **Roteiro de Fala:** O `any` é perigoso no TypeScript porque deixa passar erro que só aparece quando o sistema já está rodando. Usar `any` é como dizer "aceito qualquer coisa", o que pode esconder problemas.

---

### Slide 7: Refatoração ANY (Antes vs. Depois)
**Layout:** Código lado a lado.

❌ **Antes (Inseguro):**
```typescript
// Aceita qualquer coisa. Se 'nmae' for erro de digitação, quebra.
function displayUser(user: any) {
  return <div>{user.nmae}</div>;
}

```

✅ **Depois (Seguro):**

```typescript
interface User { name: string; }

// Compilador garante que a propriedade existe.
function displayUser(user: User) {
  return <div>{user.name}</div>;
}

```

> **Roteiro de Fala:** No exemplo à esquerda, um erro de digitação passaria. À direita, o VS Code avisa o erro antes mesmo de rodar. Aplicamos isso em eventos de UI e respostas de API.
> **Roteiro de Fala:** No exemplo ruim, um erro de digitação passaria sem ninguém perceber. No exemplo bom, o próprio editor já mostra o erro antes de rodar. Fizemos isso em eventos de tela e respostas de API.

---

### Slide 8: Smell #2 - Enum Implicit Values (EIV)

**Elementos Visuais:** Ícone de quebra-cabeça ou banco de dados.
**Tópicos:**

* **O Problema:** Enums dependentes de índices automáticos (0, 1, 2).
* **Categoria Teórica:** *Change Preventers* (Fragilidade).
* **Risco:** Inserir um novo item altera os valores de todos os outros, corrompendo dados salvos.

> **Roteiro de Fala:** Se você tem um Enum `A, B, C`, eles valem `0, 1, 2`. Se você mudar para `A, Novo, B, C`, o `B` vira `2`. Isso quebra todo o histórico do banco de dados.
> **Roteiro de Fala:** Se você tem um Enum `A, B, C`, eles valem `0, 1, 2`. Se mudar a ordem ou colocar um novo no meio, os valores mudam e pode dar problema nos dados já salvos.

---

### Slide 9: Refatoração EIV (Antes vs. Depois)

**Layout:** Código lado a lado.

❌ **Antes (Frágil):**

```typescript
enum Status {
  Active,   // 0
  Inactive, // 1
  Archived  // 2
}

```

✅ **Depois (Robusto):**

```typescript
enum Status {
  Active = 0,
  Inactive = 1,
  Archived = 2
}

```

> **Roteiro de Fala:** A solução foi atribuir valores literais explícitos em todo o projeto (especialmente no `uikit-playground`). Agora a ordem não importa mais. Eliminamos 100% desse smell.

---

### Slide 10: Smell #3 - Overly Flexible Props (OFP)

**Elementos Visuais:** Ícone de componente inchado.
**Tópicos:**

* **O Problema:** Componentes aceitando objetos genéricos ou combinações inválidas.
* **Categoria Teórica:** *Bloaters* (Baixa Coesão / Long Parameter List).
* **Risco:** Componentes difíceis de entender e manter.

> **Roteiro de Fala:** Componentes que aceitam "tudo" violam o princípio da responsabilidade única. Isso é comum em bibliotecas de UI antigas, mas gera confusão para quem vai dar manutenção.
> **Roteiro de Fala:** Componentes que aceitam qualquer coisa ficam difíceis de entender e de arrumar depois. Isso era comum em códigos antigos, mas hoje sabemos que atrapalha quem precisa mexer neles.

---

### Slide 11: Refatoração OFP (Antes vs. Depois)

**Layout:** Código lado a lado.

❌ **Antes (Confuso):**

```typescript
// O que tem dentro de props? Ninguém sabe.
const Button = (props: any) => {
  return <button>{props.label || props.text}</button>;
}

```

✅ **Depois (Estrito):**

```typescript
interface ButtonProps {
  label: string;
  onClick: () => void;
}
// Contrato claro de uso.
const Button = ({ label, onClick }: ButtonProps) => ...

```

> **Roteiro de Fala:** Usamos *Discriminated Unions* no Livechat para garantir que cada bloco de mensagem receba exatamente os dados que precisa, e nada mais. Também eliminamos 100% desse smell.
> **Roteiro de Fala:** No Livechat, usamos tipos diferentes para cada mensagem, garantindo que cada uma receba só o que precisa. Assim, eliminamos esse problema.

---

### Slide 12: Smell #4 - Missing Union Type (MUT)

**Elementos Visuais:** Ícone de repetição (copy-paste).
**Tópicos:**

* **O Problema:** Repetição de *strings mágicas* pelo código.
* **Categoria Teórica:** *Duplicated Code*.
* **Risco:** Erros de digitação (typos) e dificuldade de alteração em massa.

> **Roteiro de Fala:** Se a string `'pending'` aparece em 50 arquivos, mudar o nome desse status é um pesadelo. Isso é duplicação de conhecimento.
> **Roteiro de Fala:** Se a palavra `'pending'` aparece em vários arquivos, mudar o nome dela dá muito trabalho e pode causar erro. Isso é repetir informação desnecessária.

---

### Slide 13: Refatoração MUT (Antes vs. Depois)

**Layout:** Código lado a lado.

❌ **Antes (Repetitivo):**

```typescript
// Repetido em 10 arquivos diferentes
function filter(status: 'open' | 'closed' | 'pending') { ... }

```

✅ **Depois (Abstraído):**

```typescript
// Definido em um lugar único (Single Source of Truth)
type TicketStatus = 'open' | 'closed' | 'pending';

function filter(status: TicketStatus) { ... }

```

> **Roteiro de Fala:** Centralizamos essas definições em *Type Aliases*. Agora temos uma fonte única de verdade (Single Source of Truth).
> **Roteiro de Fala:** Juntamos essas definições em um só lugar. Agora, se precisar mudar, é só alterar em um arquivo só.

---

### Slide Extra: Arquivos Resolvidos por Tipo de Smell
**Elementos Visuais:** Tabela ou quadro com os arquivos modificados, separados por tipo de smell (igual ao slide "Smells Resolvidos").
**Tópicos:**

#### Enum Implicit Values (EIV)
**Arquivos resolvidos:**
* apps/uikit-playground/src/Context/index.tsx
* apps/uikit-playground/src/Components/Draggable/DraggableList.tsx
* apps/uikit-playground/src/Components/Preview/Display/Surface/Surface.tsx
* apps/uikit-playground/src/Components/Preview/Display/Surface/SurfaceRender.tsx
* apps/uikit-playground/src/Components/Preview/Editor/EditorPanel.tsx
* apps/uikit-playground/src/Components/PrototypeRender/PrototypeRender.tsx
* apps/uikit-playground/src/Components/RenderPayload/RenderPayload.tsx
* apps/uikit-playground/src/Components/Templates/Container/Payload.tsx
* apps/meteor/client/providers/OmnichannelProvider.tsx

#### Overly Flexible Props (OFP)
**Arquivos resolvidos:**
* packages/livechat/src/components/uiKit/message/index.tsx (Linhas 19-25, 27-33, 35-41, 43-49, 51-57, 59-69, 71-81, 83-89, 91-97, 99-105, 107-113)

#### Any Type (ANY)
**Arquivos resolvidos:**
* apps/meteor/client/apps/gameCenter/GameCenterInvitePlayersModal.tsx
* apps/meteor/client/components/GazzodownText.spec.tsx
* apps/meteor/client/components/MarkdownText.spec.tsx
* apps/meteor/client/components/MarkdownText.tsx
* apps/meteor/client/components/RoomIcon/RoomIcon.tsx
* apps/meteor/client/components/UserCard/UserCard.stories.tsx
* apps/meteor/client/components/message/content/ThreadMetrics.spec.tsx
* apps/meteor/client/components/message/content/attachments/AttachmentsItem.tsx
* apps/meteor/client/components/message/content/attachments/DefaultAttachment.tsx

#### Missing Union Type Abstraction (MUT)

**Arquivos resolvidos:**
* apps/meteor/client/router/index.tsx
* apps/meteor/client/startup/routes.tsx
* apps/meteor/client/views/admin/engagementDashboard/EngagementDashboardPage.tsx
* apps/meteor/client/views/admin/routes.tsx
* apps/meteor/client/views/marketplace/AppsPage/AppsPageContentBody.tsx
* apps/meteor/client/views/teams/contextualBar/channels/TeamsChannels.tsx
* apps/meteor/client/views/omnichannel/agents/AgentsTable/AgentsTable.tsx (Linhas 28, 33)
* apps/meteor/tests/mocks/client/RouterContextMock.tsx (Linhas 19, 26)


> **Roteiro de Fala:** Aqui estão os arquivos que passaram por refatoração para eliminar os principais code smells do projeto Rocket.Chat, separados por tipo. Essa visualização facilita entender o impacto direto das mudanças e a abrangência das correções realizadas.
> **Roteiro de Fala:** Estes são os arquivos que foram melhorados para tirar os principais problemas do projeto, separados por tipo. Assim dá para ver o quanto as mudanças ajudaram.

---

---

## Seção 5: Resultados e Conclusão

### Slide 14: Impacto Quantitativo

**Elementos Visuais:** Tabela Final Comparativa.

| Code Smell | Inicial | Final | Status |
| --- | --- | --- | --- |
| **Enum Implicit Values** | 9 | **0** | Totalmente Removido |
| **Overly Flexible Props** | 11 | **0** | Totalmente Eliminado |
| **Any Type** | 315 | 247 | 📉 Reduzido |
| **Missing Union Type** | 62 | 47 | 📉 Diminuído |
| **Total** | **408** | **305** | **-25%** |

> **Roteiro de Fala:** Conseguimos eliminar completamente duas categorias de problemas e reduzir significativamente as outras duas, totalizando uma redução de 25% na dívida técnica analisada.
> **Roteiro de Fala:** Conseguimos acabar totalmente com dois tipos de problemas e diminuir bastante outros dois, reduzindo em 25% os pontos que precisavam de melhoria no código.

---

### Slide 15: O Efeito Osmose

**Elementos Visuais:** Gráfico ou Ilustração de Raiz/Árvore.
**Tópicos:**

* **Fato:** 40 correções diretas resultaram em 103 smells resolvidos.
* **Causa:** Correção na "Raiz" (Interfaces Base / Definições de Tipo).
* **Efeito:** Arquivos dependentes foram corrigidos automaticamente sem edição manual.

> **Roteiro de Fala:** Um dado interessante foi a "Osmose". Ao corrigir a tipagem de uma função utilitária central, todos os arquivos que a usavam pararam de dar erro. Isso prova que refatorar a base arquitetural tem alto retorno sobre o investimento.

---

### Slide 16: Conclusão

**Tópicos:**

* **Confiabilidade:** Código mais protegido contra erros inesperados.
* **Clareza:** O código ficou mais fácil de entender e de usar como exemplo.
* **Facilidade de manutenção:** Mais simples de atualizar e melhorar no futuro.
* **Lição:** Usar tipos bem definidos traz benefícios claros e duradouros.
> **Roteiro de Fala:** Um ponto legal foi o efeito em cadeia: ao arrumar um arquivo base, todos os outros que dependiam dele também ficaram certos, sem precisar mexer neles. Isso mostra que melhorar a base do sistema vale muito a pena.

> **Roteiro de Fala:** Concluímos que a refatoração, embora trabalhosa, elevou a maturidade do projeto. Transformamos um código frágil em um código que guia o desenvolvedor a fazer a coisa certa.
> **Roteiro de Fala:** Vimos que melhorar o código, mesmo dando trabalho, deixou o sistema mais confiável e fácil de entender. Agora, o próprio código ajuda quem for mexer nele a não errar.

---
