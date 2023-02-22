import "reflect-metadata";
import { MikroORM } from "@mikro-orm/core";
import { __prod__ } from "./constants";
import microConfig from './mikro-orm.config';
import express from "express";
import { ApolloServer } from "apollo-server-express";
import { buildSchema } from "type-graphql";
import { HelloResolver } from "./resolvers/hello";
import { PostResolver } from "./resolvers/post";
import UserResolver from "./resolvers/user";
import cors from "cors";

const main = async () => {
    const orm = await MikroORM.init(microConfig);
    await orm.getMigrator().up();

    const generator = orm.getSchemaGenerator();
    await generator.updateSchema();

    const app = express();

    app.use(cors({
        origin: "http://localhost:3000",
        credentials: true,
    }))

    const apolloServer = new ApolloServer({
        schema: await buildSchema({
            resolvers: [HelloResolver, PostResolver, UserResolver],
            validate: false,
        }),
        context: (() => ({ em: orm.em }))
    });

    await apolloServer.start()

    apolloServer.applyMiddleware({
        app,
        cors: false,
    });

    app.get("/", (_, res) => {
        res.send("hello!")
    })
    app.listen(4000, () => {
        console.log("listening on port 4000")
    })
}

main().catch((err) => {
    console.error(err)
});

console.log('hello world hey');

