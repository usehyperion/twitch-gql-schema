import { createYoga, createSchema } from "graphql-yoga";
import { Hono } from "hono";
import typeDefs from "./schema.graphql" with { type: "text" };

const app = new Hono();

const schema = createSchema({ typeDefs });
const yoga = createYoga({ schema });

app.options(yoga.graphqlEndpoint, (ctx) => yoga.fetch(ctx.req.raw));
app.get(yoga.graphqlEndpoint, (ctx) => yoga.fetch(ctx.req.raw));
app.post(yoga.graphqlEndpoint, (ctx) => yoga.fetch(ctx.req.raw));

export default app;
