# DevZappi WhatsApp API

A simple API to manage and send messages through WhatsApp WEB (using QR Code)

## Running

1. Run the following command:

```bash
docker compose up -d
```

2. Go to container's logs and you should see something like this:

```
[Nest] 1  - 04/29/2025, 4:01:10 PM     LOG [NestApplication] Validating application environment configuration...
[Nest] 1  - 04/29/2025, 4:01:10 PM     LOG [NestApplication] Application environment configuration successfully validated
[Nest] 1  - 04/29/2025, 4:01:10 PM     LOG [NestApplication] Getting application enabled log levels...
[Nest] 1  - 04/29/2025, 4:01:10 PM     LOG [NestApplication] Application enabled log levels successfully got. Enabled levels: [fatal, error, warn, log]
[Nest] 1  - 04/29/2025, 4:01:10 PM     LOG [NestFactory] Starting Nest application...
[Nest] 1  - 04/29/2025, 4:01:10 PM     LOG [InstanceLoader] AppModule dependencies initialized +18ms
[Nest] 1  - 04/29/2025, 4:01:10 PM     LOG [InstanceLoader] WhatsAppsModule dependencies initialized +0ms
[Nest] 1  - 04/29/2025, 4:01:10 PM     LOG [NestApplication] Configuring application query parser...
[Nest] 1  - 04/29/2025, 4:01:10 PM     LOG [NestApplication] Application query parser successfully configured
[Nest] 1  - 04/29/2025, 4:01:10 PM     LOG [NestApplication] Configuring application versioning...
[Nest] 1  - 04/29/2025, 4:01:10 PM     LOG [NestApplication] Application versioning successfully configured. Default version: 1
[Nest] 1  - 04/29/2025, 4:01:10 PM     LOG [NestApplication] Configuring application global prefix...
[Nest] 1  - 04/29/2025, 4:01:10 PM     LOG [NestApplication] No global prefix is set. Ignoring...
[Nest] 1  - 04/29/2025, 4:01:10 PM     LOG [NestApplication] Application global prefix successfully configured. Global prefix: none
[Nest] 1  - 04/29/2025, 4:01:10 PM     LOG [NestApplication] Configuring application CORS...
[Nest] 1  - 04/29/2025, 4:01:10 PM     LOG [NestApplication] Application CORS successfully configured
[Nest] 1  - 04/29/2025, 4:01:10 PM     LOG [NestApplication] Initializing Swagger UI...
[Nest] 1  - 04/29/2025, 4:01:10 PM     LOG [NestApplication] Swagger UI successfully initialized
[Nest] 1  - 04/29/2025, 4:01:10 PM     LOG [NestApplication] Initializing application...
[Nest] 1  - 04/29/2025, 4:01:10 PM     LOG [RoutesResolver] WhatsAppsController {/whatsapps} (version: 1): +41ms
[Nest] 1  - 04/29/2025, 4:01:10 PM     LOG [RouterExplorer] Mapped {/whatsapps, POST} (version: 1) route +5ms
[Nest] 1  - 04/29/2025, 4:01:10 PM     LOG [RouterExplorer] Mapped {/whatsapps, GET} (version: 1) route +1ms
[Nest] 1  - 04/29/2025, 4:01:10 PM     LOG [RouterExplorer] Mapped {/whatsapps/:id, GET} (version: 1) route +1ms
[Nest] 1  - 04/29/2025, 4:01:10 PM     LOG [RouterExplorer] Mapped {/whatsapps/:id/qr-code, GET} (version: 1) route +2ms
[Nest] 1  - 04/29/2025, 4:01:10 PM     LOG [RouterExplorer] Mapped {/whatsapps/:id, PATCH} (version: 1) route +1ms
[Nest] 1  - 04/29/2025, 4:01:10 PM     LOG [RouterExplorer] Mapped {/whatsapps/:id, DELETE} (version: 1) route +1ms
[Nest] 1  - 04/29/2025, 4:01:10 PM     LOG [RouterExplorer] Mapped {/whatsapps/:id/send-message, POST} (version: 1) route +0ms
[Nest] 1  - 04/29/2025, 4:01:10 PM     LOG [NestApplication] Nest application successfully started +34ms
[Nest] 1  - 04/29/2025, 4:01:10 PM     LOG [NestApplication] Application successfully initialized
[Nest] 1  - 04/29/2025, 4:01:10 PM     LOG [NestApplication] Application is listening at http://[::1]:80 and documentation is available at http://[::1]:80/docs
```

3. You can see that documentation is available at 'http://[::1]:80/docs'. Access this address on your browser and you will be able to see all supported operations.

- Obs.: If you need to change any configuration, just edit '.docker/.env.api' and re-run the command from step 1.
