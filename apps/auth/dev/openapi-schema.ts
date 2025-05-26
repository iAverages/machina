import { auth } from "../src/auth";

const openAPISchema = await auth.api.generateOpenAPISchema();
console.log(JSON.stringify(openAPISchema));
