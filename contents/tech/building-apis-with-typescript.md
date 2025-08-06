# Building Better APIs with TypeScript

TypeScript has revolutionized how we build APIs by bringing type safety to JavaScript backends. Whether you're using Node.js with Express, Fastify, or newer frameworks like Deno, TypeScript can significantly improve your API development experience.

## Why TypeScript for APIs?

### Type Safety

The most obvious benefit is catching errors at compile time rather than runtime:

```typescript
interface User {
  id: number;
  email: string;
  name: string;
  createdAt: Date;
}

// This will catch type errors before deployment
function getUser(id: string): Promise<User> {
  // TypeScript ensures we return the correct shape
}
```

### Better Documentation

Types serve as living documentation:

```typescript
interface CreateUserRequest {
  email: string;
  name: string;
  password: string;
}

interface CreateUserResponse {
  user: Omit<User, 'password'>;
  token: string;
}
```

### Enhanced IDE Support

- Intelligent autocomplete
- Refactoring capabilities
- Inline error detection

## Best Practices

### 1. Use Strict Type Checking

Enable strict mode in your `tsconfig.json`:

```json
{
  "compilerOptions": {
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true
  }
}
```

### 2. Define Request/Response Types

Create clear interfaces for all API endpoints:

```typescript
// API contracts
interface GetPostsQuery {
  page?: number;
  limit?: number;
  category?: string;
}

interface PostsResponse {
  posts: Post[];
  pagination: {
    page: number;
    totalPages: number;
    totalItems: number;
  };
}
```

### 3. Use Validation Libraries

Combine TypeScript with runtime validation:

```typescript
import { z } from 'zod';

const CreateUserSchema = z.object({
  email: z.string().email(),
  name: z.string().min(2),
  password: z.string().min(8)
});

type CreateUserRequest = z.infer<typeof CreateUserSchema>;
```

### 4. Leverage Utility Types

TypeScript's utility types help create derived types:

```typescript
// Create types from existing ones
type UpdateUserRequest = Partial<Pick<User, 'name' | 'email'>>;
type UserResponse = Omit<User, 'password'>;
```

## Framework-Specific Tips

### Express with TypeScript

```typescript
import express, { Request, Response } from 'express';

interface AuthenticatedRequest extends Request {
  user?: User;
}

app.get('/profile', (req: AuthenticatedRequest, res: Response) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  res.json({ user: req.user });
});
```

### Fastify with TypeScript

```typescript
import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';

interface GetUserParams {
  id: string;
}

fastify.get<{
  Params: GetUserParams;
  Reply: UserResponse;
}>('/users/:id', async (request, reply) => {
  const { id } = request.params;
  // Type-safe parameter access
});
```

## Testing with TypeScript

TypeScript also improves your testing experience:

```typescript
import { describe, it, expect } from 'vitest';
import { createUser } from './userService';

describe('User Service', () => {
  it('should create a user with valid data', async () => {
    const userData: CreateUserRequest = {
      email: 'test@example.com',
      name: 'Test User',
      password: 'securepassword'
    };
    
    const result = await createUser(userData);
    expect(result).toMatchObject({
      user: expect.objectContaining({
        email: userData.email,
        name: userData.name
      }),
      token: expect.any(String)
    });
  });
});
```

## Conclusion

TypeScript transforms API development by providing type safety, better tooling, and improved maintainability. While there's a learning curve, the benefits far outweigh the initial investment, especially for larger projects and teams.

Start small by adding TypeScript to new endpoints, then gradually migrate existing code. Your future self (and your team) will thank you!