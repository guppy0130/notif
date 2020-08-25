# notif

## Project setup

```bash
npm install
```

### Compiles and hot-reloads for development

You'll want an instance of RabbitMQ.

```bash
docker run -it --rm --name rabbitmq -p 5672:5672 -p 15672:15672 rabbitmq:management-alpine
```

Then start as usual.

```bash
npm run serve
npx electron index.js
```

### Lints and fixes files

```bash
npm run lint
```
