import { Question } from "@/types/question";

export const mockQuestions: Question[] = [
  {
    id: "1",
    topic: "JavaScript",
    keywords: ["closures", "scope", "functions"],
    question: "What are closures in JavaScript?",
    answer: `## Closures

A **closure** is a function that has access to variables in its outer (enclosing) lexical scope, even after the outer function has returned.

### How it works

When a function is created, it retains a reference to its lexical environment. This means inner functions can access variables from the outer function.

\`\`\`javascript
function createCounter() {
  let count = 0;
  return {
    increment: () => ++count,
    getCount: () => count
  };
}

const counter = createCounter();
counter.increment(); // 1
counter.increment(); // 2
counter.getCount(); // 2
\`\`\`

### Key Points

- Closures allow **data encapsulation** and privacy
- They are fundamental to patterns like **module pattern** and **currying**
- Each closure has access to three scopes: own scope, outer function scope, and global scope
- Be careful with closures in loops — use \`let\` or IIFEs to avoid common pitfalls

### Common Use Cases

1. **Event handlers** with preserved state
2. **Factory functions** that generate configured functions
3. **Memoization** and caching
4. **Partial application** and currying`,
  },
  {
    id: "2",
    topic: "React",
    keywords: ["hooks", "useState", "useEffect", "lifecycle"],
    question: "Explain the React component lifecycle with Hooks",
    answer: `## React Lifecycle with Hooks

React Hooks provide a way to use lifecycle features in functional components.

### Mounting Phase

Use \`useEffect\` with an empty dependency array:

\`\`\`jsx
useEffect(() => {
  console.log('Component mounted');
  return () => console.log('Component unmounted');
}, []);
\`\`\`

### Updating Phase

Use \`useEffect\` with dependencies:

\`\`\`jsx
useEffect(() => {
  console.log('count changed:', count);
}, [count]);
\`\`\`

### Key Hooks for Lifecycle

| Hook | Purpose |
|------|---------|
| \`useState\` | Manage local state |
| \`useEffect\` | Side effects (data fetching, subscriptions) |
| \`useLayoutEffect\` | Synchronous DOM measurements |
| \`useRef\` | Persist values across renders |
| \`useMemo\` | Memoize expensive computations |

### Best Practices

- Always include proper dependencies in \`useEffect\`
- Clean up subscriptions and timers in the return function
- Use \`useCallback\` to prevent unnecessary re-renders
- Avoid setting state in \`useLayoutEffect\` unless necessary`,
  },
  {
    id: "3",
    topic: "System Design",
    keywords: ["caching", "redis", "performance", "scalability"],
    question: "How would you design a caching strategy for a web application?",
    answer: `## Caching Strategy Design

A well-designed caching strategy significantly improves performance and reduces database load.

### Cache Layers

1. **Browser Cache** — HTTP headers (\`Cache-Control\`, \`ETag\`)
2. **CDN Cache** — Static assets at edge locations
3. **Application Cache** — In-memory (Redis, Memcached)
4. **Database Cache** — Query result caching

### Cache Invalidation Strategies

- **TTL (Time-To-Live):** Set expiry time on cached data
- **Write-through:** Update cache on every write
- **Write-behind:** Async cache updates after writes
- **Cache-aside (Lazy loading):** Load into cache on first read

\`\`\`
Client → CDN → App Server → Redis → Database
                    ↑                    ↑
              Check cache          On cache miss
\`\`\`

### Redis Example

\`\`\`python
def get_user(user_id):
    # Check cache first
    cached = redis.get(f"user:{user_id}")
    if cached:
        return json.loads(cached)
    
    # Cache miss - fetch from DB
    user = db.query("SELECT * FROM users WHERE id = %s", user_id)
    redis.setex(f"user:{user_id}", 3600, json.dumps(user))
    return user
\`\`\`

### Key Considerations

- **Cache hit ratio** — aim for > 90%
- **Consistency vs Performance** tradeoff
- **Memory management** — eviction policies (LRU, LFU)
- **Thundering herd** — use cache locks or request coalescing`,
  },
  {
    id: "4",
    topic: "CSS",
    keywords: ["flexbox", "grid", "layout", "responsive"],
    question: "When should you use CSS Grid vs Flexbox?",
    answer: `## CSS Grid vs Flexbox

Both are powerful layout tools, but they excel in different scenarios.

### Flexbox — One-Dimensional

Best for layouts in a **single direction** (row OR column).

\`\`\`css
.navbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
\`\`\`

**Use for:**
- Navigation bars
- Card rows
- Centering content
- Distributing space between items

### CSS Grid — Two-Dimensional

Best for layouts in **both directions** (rows AND columns).

\`\`\`css
.dashboard {
  display: grid;
  grid-template-columns: 250px 1fr 300px;
  grid-template-rows: auto 1fr auto;
  gap: 1rem;
}
\`\`\`

**Use for:**
- Page layouts
- Dashboard grids
- Image galleries
- Complex form layouts

### Quick Decision Guide

> **Flexbox** when content dictates layout
> **Grid** when layout dictates content placement

### They work great together!

\`\`\`css
.page { display: grid; }        /* Overall layout */
.header { display: flex; }      /* Navbar items */
.sidebar { display: flex; }     /* Sidebar links */
.content { display: grid; }     /* Content cards */
\`\`\``,
  },
  {
    id: "5",
    topic: "TypeScript",
    keywords: ["generics", "types", "type-safety"],
    question: "How do generics work in TypeScript?",
    answer: `## TypeScript Generics

Generics allow you to write **reusable, type-safe** code that works with multiple types.

### Basic Syntax

\`\`\`typescript
function identity<T>(arg: T): T {
  return arg;
}

const num = identity(42);       // type: number
const str = identity("hello");  // type: string
\`\`\`

### Generic Interfaces

\`\`\`typescript
interface ApiResponse<T> {
  data: T;
  status: number;
  message: string;
}

type UserResponse = ApiResponse<User>;
type ProductResponse = ApiResponse<Product[]>;
\`\`\`

### Constraints

Limit what types can be passed:

\`\`\`typescript
interface HasLength {
  length: number;
}

function logLength<T extends HasLength>(arg: T): void {
  console.log(arg.length);
}

logLength("hello");  // ✅
logLength([1, 2]);   // ✅
logLength(42);       // ❌ number has no length
\`\`\`

### Generic Utility Types

| Type | Description |
|------|-------------|
| \`Partial<T>\` | All properties optional |
| \`Required<T>\` | All properties required |
| \`Pick<T, K>\` | Select specific properties |
| \`Omit<T, K>\` | Exclude specific properties |
| \`Record<K, V>\` | Key-value type map |

### Real-World Pattern

\`\`\`typescript
async function fetchData<T>(url: string): Promise<T> {
  const res = await fetch(url);
  return res.json() as Promise<T>;
}

const users = await fetchData<User[]>('/api/users');
\`\`\``,
  },
  {
    id: "6",
    topic: "Databases",
    keywords: ["SQL", "indexing", "performance", "optimization"],
    question: "How do database indexes work and when should you use them?",
    answer: `## Database Indexes

An index is a **data structure** that improves the speed of data retrieval at the cost of additional storage and write overhead.

### How They Work

Think of it like a book's index — instead of scanning every page, you look up the topic and jump to the right page.

\`\`\`sql
-- Without index: Full table scan O(n)
SELECT * FROM users WHERE email = 'john@example.com';

-- With index: B-tree lookup O(log n)
CREATE INDEX idx_users_email ON users(email);
\`\`\`

### Types of Indexes

- **B-Tree** — Default, good for range queries and equality
- **Hash** — Fast equality lookups only
- **GIN** — Full-text search, JSONB queries
- **BRIN** — Large tables with natural ordering

### When to Index

✅ **Do index:**
- Columns used in \`WHERE\` clauses frequently
- Foreign key columns
- Columns used in \`ORDER BY\` or \`GROUP BY\`
- Columns with high cardinality (many unique values)

❌ **Don't index:**
- Small tables (full scan is fast enough)
- Columns with low cardinality (e.g., boolean)
- Tables with heavy write operations
- Columns rarely used in queries

### Composite Indexes

\`\`\`sql
-- Order matters! (leftmost prefix rule)
CREATE INDEX idx_name_date ON orders(customer_id, order_date);

-- ✅ Uses index
SELECT * FROM orders WHERE customer_id = 5;
SELECT * FROM orders WHERE customer_id = 5 AND order_date > '2024-01-01';

-- ❌ Cannot use index (missing leftmost column)
SELECT * FROM orders WHERE order_date > '2024-01-01';
\`\`\``,
  },
  {
    id: "7",
    topic: "React",
    keywords: ["state management", "context", "redux", "zustand"],
    question: "Compare different state management approaches in React",
    answer: `## React State Management

Choosing the right state management depends on your app's complexity and requirements.

### 1. useState / useReducer

Best for **local component state**.

\`\`\`jsx
const [count, setCount] = useState(0);
\`\`\`

### 2. Context API

Best for **shared state** across a few components (theme, auth).

\`\`\`jsx
const ThemeContext = createContext('light');

// Caveat: All consumers re-render on any change
\`\`\`

### 3. Zustand

**Lightweight** and simple. No boilerplate.

\`\`\`typescript
const useStore = create((set) => ({
  count: 0,
  increment: () => set((s) => ({ count: s.count + 1 })),
}));
\`\`\`

### 4. Redux Toolkit

Best for **large apps** with complex state logic.

\`\`\`typescript
const counterSlice = createSlice({
  name: 'counter',
  initialState: { value: 0 },
  reducers: {
    increment: (state) => { state.value += 1; },
  },
});
\`\`\`

### Decision Matrix

| Need | Solution |
|------|----------|
| Simple local state | \`useState\` |
| Complex local state | \`useReducer\` |
| Theme / Auth sharing | Context API |
| Medium app, minimal boilerplate | Zustand / Jotai |
| Large app, dev tools, middleware | Redux Toolkit |
| Server state | TanStack Query |

> **Pro tip:** Don't reach for global state until you need it. Start with \`useState\`, lift state up, then add a library if needed.`,
  },
  {
    id: "8",
    topic: "Networking",
    keywords: ["HTTP", "REST", "API", "status codes"],
    question: "Explain HTTP methods and status codes for REST APIs",
    answer: `## HTTP Methods & Status Codes

### HTTP Methods (CRUD Operations)

| Method | Purpose | Idempotent | Safe |
|--------|---------|------------|------|
| \`GET\` | Read data | ✅ | ✅ |
| \`POST\` | Create resource | ❌ | ❌ |
| \`PUT\` | Replace resource | ✅ | ❌ |
| \`PATCH\` | Partial update | ❌ | ❌ |
| \`DELETE\` | Remove resource | ✅ | ❌ |

### Status Code Categories

- **1xx** — Informational
- **2xx** — Success
- **3xx** — Redirection
- **4xx** — Client Error
- **5xx** — Server Error

### Common Status Codes

\`\`\`
200 OK           — Request successful
201 Created      — Resource created (POST)
204 No Content   — Success, no body (DELETE)
301 Moved        — Permanent redirect
304 Not Modified — Cached version is valid

400 Bad Request  — Invalid syntax
401 Unauthorized — Not authenticated
403 Forbidden    — Not authorized
404 Not Found    — Resource doesn't exist
409 Conflict     — Resource state conflict
422 Unprocessable — Validation failed
429 Too Many     — Rate limited

500 Internal     — Server error
502 Bad Gateway  — Upstream server error
503 Unavailable  — Server overloaded
\`\`\`

### REST Best Practices

\`\`\`
GET    /api/users          — List users
GET    /api/users/123      — Get user 123
POST   /api/users          — Create user
PUT    /api/users/123      — Replace user 123
PATCH  /api/users/123      — Update user 123
DELETE /api/users/123      — Delete user 123
\`\`\`

> Use **nouns** for resources, **HTTP methods** for actions. Avoid verbs in URLs like \`/api/getUsers\`.`,
  },
];
