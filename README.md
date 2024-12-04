# Initialisation project in local


## Start rabbitMQ with docker
```bash
docker run -d --name rabbitmq -p 5672:5672 -p 15672:15672 rabbitmq:management
```

## Start server.js (clients and commandes)

```bash
node server.js
```

