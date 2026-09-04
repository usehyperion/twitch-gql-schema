# twitch-gql-schema

Tiny app to host Twitch's GraphQL schema so tools like [gql.tada](https://gql-tada.0no.co/) can introspect the schema without needing to pull down the full file.

## Schema sources

`schema.graphql` is generated, so don't edit it directly. The SDL lives in
[`schema/`](schema/), split by definition kind and then alphabetically by name:

```txt
schema/
  roots.graphql        Query, Mutation
  scalars.graphql
  interfaces.graphql
  unions.graphql
  types/<letter>.graphql
  inputs/<letter>.graphql
  enums/<letter>.graphql
```

After editing anything under `schema/`, rebuild the bundle:

```sh
bun run build
```

which concatenates every `schema/**/*.graphql` file (in sorted path order) into
`schema.graphql`.
