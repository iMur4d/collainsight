# Local n8n Setup Plan (Docker Compose)

As requested, we will use Docker to run n8n locally. Before we implement this, here is the architectural breakdown based on our Mentorship Rules.

## 1. The Purpose
We need a local instance of the n8n automation engine to build and test our Telegram -> AI pipeline. Docker allows us to spin up the exact same environment on your Windows machine that we would eventually run in a production Linux server.

## 2. Why Docker Compose was selected
Instead of running a long, messy `docker run` command in your terminal every time, we will create a `docker-compose.yml` file. This acts as "Infrastructure as Code." It explicitly defines the ports, the data storage, and the environment variables n8n needs in one single, readable file.

## 3. Common Beginner Mistakes
* **Losing Data on Restart:** If you run n8n in Docker without a **Volume**, every time you restart your computer, all your workflows disappear. We will configure a persistent Docker volume (`n8n_data`) so your workflows are saved safely on your hard drive.
* **Webhook URLs:** When testing locally, n8n will be running on `localhost:5678`. Telegram (which is out on the internet) cannot send messages to `localhost`. We will need to use n8n's built-in tunnel feature (`N8N_TUNNEL_SUBDOMAIN`) so Telegram can actually reach your local computer.
* **Running as Root:** Modern n8n Docker images run as a non-root user (`node`). If file permissions aren't set correctly on Linux, it crashes. On Docker for Windows, this is usually handled automatically, but it's something to remember when deploying.

## 4. How this scales later
Right now, this `docker-compose.yml` will only contain n8n. In Phase 2, we can simply add Supabase to this exact same file. In Phase 3, we can add your Python Backend to it. Eventually, one command (`docker compose up -d`) will spin up your entire platform simultaneously.

---

## Proposed Implementation

I will create a `docker-compose.yml` file in the root of your project with the following contents:

```yaml
version: '3.8'

services:
  n8n:
    image: docker.n8n.io/n8nio/n8n:latest
    container_name: collainsight_n8n
    restart: unless-stopped
    ports:
      - "5678:5678"
    environment:
      - GENERIC_TIMEZONE=Europe/Moscow # Adjust this if needed
      - TZ=Europe/Moscow
      # This enables the free, built-in n8n tunnel so Telegram can reach your localhost
      - N8N_TUNNEL_SUBDOMAIN=collainsight-mvp-dev 
      - WEBHOOK_URL=https://collainsight-mvp-dev.loca.lt/
    volumes:
      - n8n_data:/home/node/.n8n

volumes:
  n8n_data:
```

## User Review Required

> [!IMPORTANT]  
> Are you ready for me to create this `docker-compose.yml` file? 
> **Note:** You will need Docker Desktop installed and running on your Windows machine to start it.
