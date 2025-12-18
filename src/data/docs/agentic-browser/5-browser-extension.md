# Browser Extension

The Browser Extension is a WXT-based TypeScript extension providing frontend browser automation capabilities. It operates independently from the main Python API server with its own Flask backend for secure credential management. The extension features a sidepanel chat interface, a background service worker with 26+ browser automation tools, and content scripts for DOM manipulation.

The extension architecture consists of three main components:

* **Frontend UI**: React-based sidepanel for user interaction (see [Extension Architecture Overview](5.1-extension-architecture-overview))
* **Background Script**: Message router and browser automation engine (see [Background Script and Message Handling](5.2-background-script-and-message-handling) and [Browser Automation Tools](5.3-browser-automation-tools))
* **Backend Service**: Python Flask server for OAuth flows and Gemini API integration (see [Extension Backend Service](5.4-extension-backend-service))

For information about the main Python backend API that can also be used independently, see [Python Backend API](3-python-backend-api). For details on the agent intelligence system, see [Agent Intelligence System](4-agent-intelligence-system).

## High-Level Architecture

The extension implements a message-passing architecture where the React UI communicates with the background script, which orchestrates browser automation and external API calls.

![Architecture Diagram](images/5-browser-extension_diagram_1.png)

**Key Design Decisions:**

* **Dual Backend Model**: The extension has its own Flask backend (`backend_service.py`) separate from the main FastAPI server. This handles OAuth token exchange securely without exposing client secrets to the extension code.
* **Message-Based Communication**: All communication between UI and background uses `browser.runtime.sendMessage()` with typed message payloads.
* **Script Injection Pattern**: DOM operations use `browser.scripting.executeScript()` rather than persistent content scripts for better security and isolation.

**Sources:** [extension/entrypoints/background.ts17-156](https://github.com/tashifkhan/agentic-browser/blob/e94826c4/extension/entrypoints/background.ts#L17-L156) [extension/backend\_service.py1-229](https://github.com/tashifkhan/agentic-browser/blob/e94826c4/extension/backend_service.py#L1-L229)

## Component Directory Structure

The extension follows the WXT framework's entrypoint-based structure:

```
extension/
├── entrypoints/
│   ├── sidepanel/           # React UI components
│   │   ├── AgentExecutor.tsx
│   │   ├── UnifiedSettingsMenu.tsx
│   │   └── lib/
│   │       └── agent-map.ts
│   ├── utils/               # Shared utilities
│   │   ├── parseAgentCommand.ts
│   │   └── executeAgent.ts
│   ├── background.ts        # Service worker
│   └── content.ts          # Content script
├── backend_service.py       # Flask backend server
└── wxt.config.ts           # WXT configuration
```

| Entrypoint Type | File | Purpose |
| --- | --- | --- |
| Sidepanel | `sidepanel/AgentExecutor.tsx` | Main chat interface (see [Extension Architecture Overview](5.1-extension-architecture-overview)) |
| Background | `background.ts` | Message routing and 26+ browser tools (see [Background Script and Message Handling](5.2-background-script-and-message-handling)) |
| Content Script | `content.ts` | DOM manipulation (injected on demand) |
| Backend Service | `backend_service.py` | OAuth and Gemini API proxy (see [Extension Backend Service](5.4-extension-backend-service)) |

**Sources:** [extension/entrypoints/background.ts1-50](https://github.com/tashifkhan/agentic-browser/blob/e94826c4/extension/entrypoints/background.ts#L1-L50) [extension/backend\_service.py1-50](https://github.com/tashifkhan/agentic-browser/blob/e94826c4/extension/backend_service.py#L1-L50)

## Integration with Backend APIs

The extension integrates with two separate backend services:

### Main Python API (FastAPI)

The extension can call the main FastAPI server for agent operations. Connection details are stored in `browser.storage.local` under the `baseUrl` key. The UI constructs HTTP requests to endpoints like:

* `/api/genai/react` - React Agent with tool use
* `/api/gmail/*` - Gmail operations
* `/api/calendar/*` - Calendar operations
* `/api/genai/youtube` - YouTube analysis
* `/api/genai/website` - Website analysis

The `executeAgent()` utility at [extension/entrypoints/utils/executeAgent.ts17-127](https://github.com/tashifkhan/agentic-browser/blob/e94826c4/extension/entrypoints/utils/executeAgent.ts#L17-L127) handles request construction, credential injection, and response formatting. See [Extension Architecture Overview](5.1-extension-architecture-overview) for details on the command system and request flow.

### Extension Flask Backend

The extension includes a standalone Flask backend at [extension/backend\_service.py](https://github.com/tashifkhan/agentic-browser/blob/e94826c4/extension/backend_service.py) that provides:

* **OAuth Token Exchange**: `/exchange-code`, `/refresh-token` for Google OAuth (lines 36-112)
* **GitHub OAuth**: `/github/exchange-code` for GitHub authentication (lines 115-159)
* **Gemini Chat API**: `/chat` endpoint proxying requests to Google Gemini API (lines 162-202)

This separation ensures OAuth client secrets never leak to the extension code. The Flask server must be started separately: `python backend_service.py`.

**Environment Variables Required:**

| Variable | Purpose | Used By |
| --- | --- | --- |
| `GOOGLE_CLIENT_SECRET` | Google OAuth client secret | `/exchange-code`, `/refresh-token` |
| `GITHUB_CLIENT_ID` | GitHub OAuth app ID | `/github/exchange-code` |
| `GITHUB_CLIENT_SECRET` | GitHub OAuth app secret | `/github/exchange-code` |
| `GEMINI_API_KEY` | Google Gemini API key | `/chat` |

**Sources:** [extension/backend\_service.py1-229](https://github.com/tashifkhan/agentic-browser/blob/e94826c4/extension/backend_service.py#L1-L229) [extension/entrypoints/utils/executeAgent.ts17-127](https://github.com/tashifkhan/agentic-browser/blob/e94826c4/extension/entrypoints/utils/executeAgent.ts#L17-L127)

## Browser Automation Capabilities

The extension provides 26+ browser automation tools implemented in the background script. These tools can be invoked via the `EXECUTE_AGENT_TOOL` message type. The tools fall into several categories:

### DOM Interaction Tools

* **GET\_PAGE\_INFO**: Extract page metadata (URL, title, media, forms)
* **EXTRACT\_DOM**: Build recursive DOM tree structure
* **CLICK**: Click elements by selector
* **TYPE**: Type text into inputs, textareas, or contenteditable elements
* **FILL\_FORM**: Fill multiple form fields and optionally submit
* **SELECT\_DROPDOWN**: Select dropdown options by value, text, or index
* **HOVER**: Trigger hover events on elements

### Element Query Tools

* **WAIT\_FOR\_ELEMENT**: Poll until element exists/visible/hidden
* **FIND\_ELEMENTS**: Find all elements matching selector with metadata
* **GET\_ELEMENT\_TEXT**: Extract text content from element
* **GET\_ELEMENT\_ATTRIBUTES**: Get all attributes of an element

### Navigation Tools

* **NAVIGATE**: Navigate to URL and wait for page load
* **GO\_BACK**: Navigate backward in history
* **GO\_FORWARD**: Navigate forward in history
* **RELOAD\_TAB**: Reload current tab
* **SCROLL**: Scroll page or to specific element

### Tab Management Tools

* **OPEN\_TAB**: Open new tab with URL
* **CLOSE\_TAB**: Close specified tab
* **SWITCH\_TAB**: Switch to tab by ID or direction (next/previous)
* **DUPLICATE\_TAB**: Duplicate current tab
* **GET\_ALL\_TABS**: List all open tabs

### Data Extraction Tools

* **SCREENSHOT**: Capture visible page area
* **GET\_COOKIES**: Retrieve session/auth cookies
* **SET\_COOKIE**: Set cookie value
* **GET\_LOCAL\_STORAGE**: Read localStorage keys
* **SET\_LOCAL\_STORAGE**: Write localStorage keys

### Advanced Tools

* **EXECUTE\_SCRIPT**: Execute arbitrary JavaScript in page context

All tools are implemented at [extension/entrypoints/background.ts893-1700](https://github.com/tashifkhan/agentic-browser/blob/e94826c4/extension/entrypoints/background.ts#L893-L1700) and use either `browser.scripting.executeScript()` for DOM operations or `browser.tabs.*` APIs for browser-level operations. See [Browser Automation Tools](5.3-browser-automation-tools) for detailed implementation of each tool.

**Sources:** [extension/entrypoints/background.ts893-1026](https://github.com/tashifkhan/agentic-browser/blob/e94826c4/extension/entrypoints/background.ts#L893-L1026) [extension/entrypoints/background.ts1030-1700](https://github.com/tashifkhan/agentic-browser/blob/e94826c4/extension/entrypoints/background.ts#L1030-L1700)

## Communication Patterns

The extension implements two primary communication patterns:

### Extension to Backend Communication

User commands flow from the UI to external APIs:

**Title: Extension to Backend API Flow**

![Architecture Diagram](images/5-browser-extension_diagram_2.png)

The `executeAgent()` function at [extension/entrypoints/utils/executeAgent.ts17-127](https://github.com/tashifkhan/agentic-browser/blob/e94826c4/extension/entrypoints/utils/executeAgent.ts#L17-L127) handles credential injection, URL extraction, and payload construction. See [Extension Architecture Overview](5.1-extension-architecture-overview) for detailed request flow.

### Internal Message Passing

Background script handles messages from UI and content scripts:

**Title: Internal Extension Message Flow**

![Architecture Diagram](images/5-browser-extension_diagram_3.png)

The background script's message router at [extension/entrypoints/background.ts24-128](https://github.com/tashifkhan/agentic-browser/blob/e94826c4/extension/entrypoints/background.ts#L24-L128) supports 8 message types. See [Background Script and Message Handling](5.2-background-script-and-message-handling) for complete message type documentation.

**Sources:** [extension/entrypoints/utils/executeAgent.ts17-127](https://github.com/tashifkhan/agentic-browser/blob/e94826c4/extension/entrypoints/utils/executeAgent.ts#L17-L127) [extension/entrypoints/background.ts24-128](https://github.com/tashifkhan/agentic-browser/blob/e94826c4/extension/entrypoints/background.ts#L24-L128) [extension/entrypoints/background.ts516-539](https://github.com/tashifkhan/agentic-browser/blob/e94826c4/extension/entrypoints/background.ts#L516-L539)

## Storage Schema

The extension uses `browser.storage.local` for persistent state. Key storage keys:

| Storage Key | Type | Purpose | Set By |
| --- | --- | --- | --- |
| `chatHistory` | `ChatMessage[]` | Conversation messages | AgentExecutor |
| `googleUser` | `{token, email, name, picture}` | Google OAuth state | Settings UI |
| `baseUrl` | `string` | Python backend URL | Settings UI |
| `jportalId` | `string` | JIIT portal username | Settings UI |
| `jportalPass` | `string` | JIIT portal password | Settings UI |
| `jportalData` | `object` | JIIT session data | Settings UI after login |
| `tabsData` | `TabsData` | Current tab information | background.ts |
| `allTabsUrls` | `TabInfo[]` | All open tabs | background.ts |
| `activeTabUrl` | `TabInfo` | Currently active tab | background.ts |
| `totalTabs` | `number` | Tab count | background.ts |

Chat history persistence logic at [extension/Extension/entrypoints/sidepanel/AgentExecutor.tsx53-77](https://github.com/tashifkhan/agentic-browser/blob/e94826c4/extension/Extension/entrypoints/sidepanel/AgentExecutor.tsx#L53-L77):

* Loads on component mount
* Saves on every `chatHistory` update via `useEffect`
* Cleared by "New Chat" button at [extension/Extension/entrypoints/sidepanel/AgentExecutor.tsx352-362](https://github.com/tashifkhan/agentic-browser/blob/e94826c4/extension/Extension/entrypoints/sidepanel/AgentExecutor.tsx#L352-L362)

**Sources:** [extension/Extension/entrypoints/sidepanel/AgentExecutor.tsx53-77](https://github.com/tashifkhan/agentic-browser/blob/e94826c4/extension/Extension/entrypoints/sidepanel/AgentExecutor.tsx#L53-L77) [extension/Extension/entrypoints/utils/executeAgent.ts29-54](https://github.com/tashifkhan/agentic-browser/blob/e94826c4/extension/Extension/entrypoints/utils/executeAgent.ts#L29-L54) [extension/Extension/entrypoints/background.ts867-882](https://github.com/tashifkhan/agentic-browser/blob/e94826c4/extension/Extension/entrypoints/background.ts#L867-L882)

## UI Rendering

The `AgentExecutor` component renders a modern chat interface with three main sections:

### Empty State

At [extension/Extension/entrypoints/sidepanel/AgentExecutor.tsx429-434](https://github.com/tashifkhan/agentic-browser/blob/e94826c4/extension/Extension/entrypoints/sidepanel/AgentExecutor.tsx#L429-L434) shown when `chatHistory.length === 0`:

* Displays "Mention tabs to add context" message
* Shows example mention card at [extension/Extension/entrypoints/sidepanel/AgentExecutor.tsx415-425](https://github.com/tashifkhan/agentic-browser/blob/e94826c4/extension/Extension/entrypoints/sidepanel/AgentExecutor.tsx#L415-L425) with rotated styling

### Chat Container

At [extension/Extension/entrypoints/sidepanel/AgentExecutor.tsx435-466](https://github.com/tashifkhan/agentic-browser/blob/e94826c4/extension/Extension/entrypoints/sidepanel/AgentExecutor.tsx#L435-L466) displays conversation:

* Maps over `chatHistory` array
* Renders user messages with `.chat-message.user` class
* Renders assistant messages with `.chat-message.assistant` class
* Shows typing indicator during execution at [extension/Extension/entrypoints/sidepanel/AgentExecutor.tsx453-464](https://github.com/tashifkhan/agentic-browser/blob/e94826c4/extension/Extension/entrypoints/sidepanel/AgentExecutor.tsx#L453-L464)
* Auto-scrolls to bottom via ref at [extension/Extension/entrypoints/sidepanel/AgentExecutor.tsx79-84](https://github.com/tashifkhan/agentic-browser/blob/e94826c4/extension/Extension/entrypoints/sidepanel/AgentExecutor.tsx#L79-L84)

### Composer

At [extension/Extension/entrypoints/sidepanel/AgentExecutor.tsx480-550](https://github.com/tashifkhan/agentic-browser/blob/e94826c4/extension/Extension/entrypoints/sidepanel/AgentExecutor.tsx#L480-L550) handles input:

* Quick action pills: "Summarize", "Explain", "Analyze" at [extension/Extension/entrypoints/sidepanel/AgentExecutor.tsx470-478](https://github.com/tashifkhan/agentic-browser/blob/e94826c4/extension/Extension/entrypoints/sidepanel/AgentExecutor.tsx#L470-L478)
* Slash menu for command suggestions at [extension/Extension/entrypoints/sidepanel/AgentExecutor.tsx482-497](https://github.com/tashifkhan/agentic-browser/blob/e94826c4/extension/Extension/entrypoints/sidepanel/AgentExecutor.tsx#L482-L497)
* Mention menu for quick actions at [extension/Extension/entrypoints/sidepanel/AgentExecutor.tsx499-515](https://github.com/tashifkhan/agentic-browser/blob/e94826c4/extension/Extension/entrypoints/sidepanel/AgentExecutor.tsx#L499-L515)
* Input field with left/right icon buttons at [extension/Extension/entrypoints/sidepanel/AgentExecutor.tsx517-549](https://github.com/tashifkhan/agentic-browser/blob/e94826c4/extension/Extension/entrypoints/sidepanel/AgentExecutor.tsx#L517-L549)
* Send button with arrow icon, disabled when executing or input empty

All styling is inline at [extension/Extension/entrypoints/sidepanel/AgentExecutor.tsx552-676](https://github.com/tashifkhan/agentic-browser/blob/e94826c4/extension/Extension/entrypoints/sidepanel/AgentExecutor.tsx#L552-L676) using dark gradient theme with blur effects.

**Sources:** [extension/Extension/entrypoints/sidepanel/AgentExecutor.tsx407-676](https://github.com/tashifkhan/agentic-browser/blob/e94826c4/extension/Extension/entrypoints/sidepanel/AgentExecutor.tsx#L407-L676)

## Environment Configuration

The extension reads configuration from environment variables via Vite:

* `VITE_API_URL`: Base URL for Python backend, used at [extension/Extension/entrypoints/utils/executeAgent.ts38](https://github.com/tashifkhan/agentic-browser/blob/e94826c4/extension/Extension/entrypoints/utils/executeAgent.ts#L38-L38)
* Falls back to empty string if not set

The `.gitignore` at [extension/.gitignore42-44](https://github.com/tashifkhan/agentic-browser/blob/e94826c4/extension/.gitignore#L42-L44) excludes `.env` files from version control to protect secrets.

**Sources:** [extension/Extension/entrypoints/utils/executeAgent.ts38](https://github.com/tashifkhan/agentic-browser/blob/e94826c4/extension/Extension/entrypoints/utils/executeAgent.ts#L38-L38) [extension/.gitignore42-44](https://github.com/tashifkhan/agentic-browser/blob/e94826c4/extension/.gitignore#L42-L44)
