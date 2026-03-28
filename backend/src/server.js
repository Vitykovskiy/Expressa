const { createApp, createConfigFromEnv } = require("./app");

const config = createConfigFromEnv(process.env);
const app = createApp({ config });
const port = Number(process.env.PORT ?? "80");

app.listen(port, () => {
  process.stdout.write(`Expressa backend is listening on port ${port}\n`);
});
