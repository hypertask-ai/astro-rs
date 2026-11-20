Hypertask is our top pick for a kanban tool with MCP because it gives AI agents a supported way to read tasks, update boards and leave work visible to human teammates. Its hosted MCP server, separate agent identities and first-party CLI suit small teams that want Claude or Cursor to work from the board, with a documented OpenAPI route for ChatGPT.

The problem is not another missing summary. It is copying a task into a chat, watching a terminal for progress, then copying the result back before anyone else can see it. A useful MCP connection removes that relay work without hiding who changed what.

This ranking is for teams sharing work with external agents, not a claim that Hypertask has the most features. We publish Hypertask, and this comparison uses official documentation checked on October 6, 2026, rather than a hands-on benchmark of every tool.

## What should a kanban MCP server actually do?

MCP, short for Model Context Protocol, lets an AI client discover and call a tool’s operations. For kanban work, look for read **and** write access: finding boards, reading task details and comments, creating cards, changing their workflow column and reporting results.

An API, a built-in AI assistant and an MCP server are different things. An API can support a custom integration; an official MCP server gives compatible clients a maintained connection. Neither means an agent automatically starts working whenever you assign a card.

Check authentication, permissions and your exact client before choosing. “Works with Claude” does not establish that the same setup works in ChatGPT, Claude Desktop and an unattended worker.

## The 5 best kanban tools for MCP

### 1. Hypertask: best for humans and external agents sharing one board

**Who it is for:** Small technical teams whose coding, research or operations agents need to work alongside people, with progress and results attached to the task.

**Strengths:** Hypertask’s [official MCP documentation](https://docs.hypertask.ai/mcp/overview/) describes a hosted server at `https://mcp.hypertask.ai/mcp`. Its tools can list boards, read and create tasks, update columns, assign work and add comments. Writes made with an agent’s own token are attributed to that agent, rather than its human owner.

The first-party CLI adds a supported terminal interface. That matters when some workers run in a coding client and others run from scripts. Humans can inspect the shared board instead of reconstructing work from separate chat sessions. See [AI agent task management](/blog/ai-agent-task-management/) for the workflow behind that choice.

**Limits:** MCP does not expose every product capability. The documentation lists task leases, service-account management and some history operations as REST-only. It also warns that plain-text mentions may not notify people reliably. ChatGPT’s documented connection uses OpenAPI custom actions, not the Claude or Cursor MCP configuration.

**Pricing:** The live [Hypertask pricing page](/pricing/) offers Free with CLI and MCP included. BYOK is $8 per user per month billed yearly; Pro is $16 on yearly billing. BYOK means bringing your own model keys. Your external AI client’s costs remain separate.

### 2. Trello: best for straightforward visual boards

**Who it is for:** Teams that want familiar cards and lists, especially when people already use Trello and only need an assistant to read and update their work.

**Strengths:** [Trello’s official MCP server](https://support.atlassian.com/trello/docs/connect-trello-to-ai-assistants-with-trello-mcp/) supports ChatGPT, Claude, Cursor and other compatible clients. It can read boards, create and move cards, manage checklists, post comments and search. Authorization uses OAuth and respects the user’s existing permissions.

Current documentation supports connecting multiple workspaces, so a team does not need to assume one workspace per connection. Trello is a credible MCP choice, not merely a board that requires a community adapter.

**Limits:** The server cannot permanently delete cards or lists, though it can archive them. Local attachment upload and some board-editing operations are listed as future capabilities. Test the exact actions you need rather than assuming complete UI parity.

**Pricing:** MCP works on every Trello plan. [Trello pricing](https://trello.com/en/pricing) lists Free, Standard at $5 per user per month billed annually and Premium at $10 annually. Certain operations, including creating Planner focus time, require higher plans.

### 3. Linear: best for software teams already tracking issues

**Who it is for:** Product and engineering teams that want agents to work with an existing issue workflow rather than adopt a new general-purpose board.

**Strengths:** [Linear’s hosted MCP server](https://linear.app/docs/mcp) can find, create and update issues, projects and comments. It supports OAuth, bearer tokens and API keys, with setup instructions for Claude and Cursor. Linear also provides a dedicated read-only endpoint, useful when an agent should inspect work but not change it.

Its [board layout](https://linear.app/docs/board-layout) gives the issue tracker a kanban-style view. That makes Linear a strong option when the source of truth is already an engineering backlog.

**Limits:** Linear is an issue tracker first, not a blank canvas for every business process. Multiple workspaces need separate authentication contexts. Read-only access is safer for exploration, but it will not satisfy a workflow that must move issues or post results.

**Pricing:** [Linear pricing](https://linear.app/pricing) offers Free with 250 issues and two teams. Basic is $10 per user per month billed yearly; Business is $16 yearly. Choose based on workspace limits as well as agent access.

### 4. Jira: best for teams committed to the Atlassian stack

**Who it is for:** Organizations whose delivery process already depends on Jira workflows and related Atlassian content.

**Strengths:** The [official Atlassian MCP setup guide](https://support.atlassian.com/atlassian-ai-gateway/docs/get-started-with-the-atlassian-remote-mcp-server/) documents searching and updating Jira work, including moving an item to review and adding a comment. The connection also reaches products such as Confluence and Bitbucket under the user’s existing permissions.

That cross-product context can matter more than the simplicity of a new board. An agent can consult the planning document and update its related work item without requiring a separate connector for each.

**Limits:** Connecting MCP does not simplify your Jira configuration. Status transitions and permissions still govern what an agent can change. Atlassian also documents Rovo credit consumption for enriched search and context calls, so do not assume every operation is cost-free.

**Pricing:** Check [Jira’s current pricing](https://www.atlassian.com/software/jira/pricing) for the selected Cloud plan and team size. Budget for applicable Rovo allowances and your external AI client, not just Jira seats.

### 5. Notion: best when tasks belong beside documents

**Who it is for:** Teams that keep specifications, notes and task databases together and want an agent to work across that material.

**Strengths:** [Notion’s official hosted MCP server](https://developers.notion.com/guides/mcp/overview) uses OAuth to let a compatible client search, read, create and update accessible content. Notion’s [board views](https://www.notion.com/help/boards) organize database pages into columns, so tasks can remain linked to the documents explaining them.

This suits research and editorial work where the card is only part of the context. There is less reason to move those workflows into a separate issue tracker.

**Limits:** A Notion board is a database view, not a dedicated agent execution process. Your team must define the status property, ownership rules and review convention. Workspace owners can restrict MCP client access, so confirm that the intended connection is permitted.

**Pricing:** [Notion pricing](https://www.notion.com/pricing) includes Free and paid per-member plans. Prices vary by currency and billing interval; its built-in AI and Custom Agents have their own plan or credit conditions. Do not confuse those products with access from an external MCP client.

## Kanban MCP comparison at a glance

| Rank | Tool | Official agent access | Best fit | Main tradeoff | Pricing note |
|---|---|---|---|---|---|
| 1 | Hypertask | Hosted MCP, CLI; OpenAPI for ChatGPT | Shared human-agent task execution | Some infrastructure remains REST-only | Free includes MCP; paid plans available |
| 2 | Trello | Hosted MCP with OAuth | Simple visual boards | Some UI operations unavailable through MCP | MCP on every plan |
| 3 | Linear | Hosted MCP; read-only option | Engineering issue workflows | Separate auth contexts for workspaces | Free has issue and team limits |
| 4 | Jira | Atlassian MCP | Existing Atlassian organizations | Workflow complexity and credit accounting | Verify Cloud plan and Rovo usage |
| 5 | Notion | Hosted MCP with OAuth | Documents and database boards | Team defines the execution conventions | Free and paid per-member plans |

If an existing tool already meets your needs, connect it before migrating. Hypertask earns the first position here for the shared human-agent workflow, not because the alternatives lack MCP.

## How to set up Hypertask for MCP

### 1. Prepare one board and get credentials

Create a small board with columns such as Ready, In progress, Review and Done. Put one low-risk task in Ready, including what success means and who reviews it.

Sign in to Hypertask, open **Settings**, then copy the API key from the **MCP** section. Alternatively, press **Ctrl+K** and search for MCP. The integration documentation warns that these user tokens expire after 30 days.

For ongoing autonomous work, use the documented agent credential process rather than impersonating a person. Never put real tokens in a repository or task comment.

### 2. Configure Claude Code or Cursor

For Claude Code, the documented HTTP configuration can go in `.mcp.json`. In Cursor, open MCP settings and add the server with the same endpoint and bearer header:

```json
{
  "mcpServers": {
    "hypertasks": {
      "type": "http",
      "url": "https://mcp.hypertask.ai/mcp",
      "headers": {
        "Authorization": "Bearer YOUR_API_KEY"
      }
    }
  }
}
```

Replace the placeholder locally, keep the configuration private and reconnect the client. Use the standard endpoint, not a feature-flagged experimental setup.

### 3. Prove reading and writing separately

The [MCP tools reference](https://docs.hypertask.ai/api/tools-reference/) recommends calling `hypertask_hello` first. Then ask:

> Read my accessible boards, find the pilot board and list its Ready tasks. Do not change anything yet.

After confirming the board and task, ask:

> Read the task and its comments. Move this one task to In progress, then add a comment describing the next action. Leave all other tasks unchanged.

The relevant tools include `hypertask_list_tasks`, `hypertask_get_tasks`, `hypertask_get_comments_for_task` and `hypertask_update_task`. Discover the section IDs instead of guessing them. Use `hypertask_add_comment_to_task` for the report; its text must be HTML, such as `<p>Started the agreed task.</p>`.

Check the board yourself. Reading successfully does not prove that the token can write.

### 4. Use the documented ChatGPT route

In a custom GPT you control, open **Actions**, import `https://mcp.hypertask.ai/openapi.json` and configure API-key authentication with the Authorization bearer header. This is an OpenAPI action connection, not native MCP. Confirm that your ChatGPT account provides the required custom GPT features.

Finally, require the agent to post its result and move finished work to Review. A human should verify the outcome before Done. For terminal workers, compare [CLI versus MCP access](/blog/cli-vs-mcp-ai-agent-project-data-access/) rather than forcing every job through chat.

## Frequently Asked Questions

### What is the best kanban tool for MCP?

Hypertask is our top pick for small teams sharing task execution between humans and external agents. Trello is a strong choice for simple visual boards; Linear suits engineering backlogs, Jira suits Atlassian organizations and Notion suits document-centered workflows.

### Can Claude and Cursor read and update Hypertask boards?

Yes. Hypertask documents a hosted MCP endpoint with bearer-token authentication and tools for reading tasks, creating work, updating columns and posting comments. Access depends on the connected identity’s permissions.

### Does Hypertask support ChatGPT through MCP?

Hypertask’s documented ChatGPT setup uses its OpenAPI schema through custom GPT actions. That is a separate integration route, not proof that the same native MCP configuration works in ChatGPT.

### Is MCP access free?

Hypertask’s Free plan includes MCP and CLI. Trello also makes its MCP server available on every plan. Workspace limits, paid product features and the external AI client’s charges still apply.

### Does connecting MCP make agents run automatically?

No. MCP exposes tools to a client; it does not by itself schedule or supervise an autonomous worker. Establish permissions, task ownership, progress reporting and human review before allowing unattended changes.
