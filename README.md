
## 📋 Prerequisites

### 1. Install Docker Desktop

Download and install Docker Desktop for your OS:

- **Windows** — https://docs.docker.com/desktop/install/windows-install/
- **Mac** — https://docs.docker.com/desktop/install/mac-install/
- **Linux** — https://docs.docker.com/desktop/install/linux-install/

After installing, verify Docker is running:

```bash
docker --version
docker compose version
```

---

### 2. Check Required Ports

Make sure the following ports are **not in use** on your machine before starting:

| Port | Service |
|------|---------|
| `8000` | API App |
| `3306` | MySQL Database |
| `8080` | phpMyAdmin |

**Windows (PowerShell):**
```powershell
netstat -ano | findstr :3000
netstat -ano | findstr :3306
netstat -ano | findstr :8080
```

**Mac/Linux:**
```bash
lsof -i :3000
lsof -i :3306
lsof -i :8080
```

If any port is in use, stop the process using it before continuing.

---

## 🚀 Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/jraay12/DG_Distribution_Backend.git
cd DG_Distribution_Backend
```

### 3. Make sure Docker Desktop is running

Open Docker Desktop and ensure it is running before proceeding.

### 4. Start the containers

```bash
docker compose up -d --build
```

This will automatically:
- Build the app image
- Start MySQL, the API, and phpMyAdmin
- Run Prisma migrations

### 5. Run the seeder
```bash
docker exec dg_distribution_backend node dist/script.js
```

This creates the default admin account:

| Field    | Value               |
|----------|---------------------|
| Email    | admin@example.com   |
| Password | admin123            |

---

## ✅ Verify It's Running

Once the containers are up, open your browser and visit:

```
http://localhost:8000/health
```

If you see a healthy response, the backend is up and running! 🎉

---

## 🌐 Available Services

| Service | URL |
|---------|-----|
| API | http://localhost:8000 |
| Health Check | http://localhost:8000/health |
| phpMyAdmin | http://localhost:8080 |

---

## 🧪 Testing with Postman

A Postman collection is included in the repository for testing all available endpoints.

### Import the collection

1. Open **Postman**
2. Click **Import**
3. Select the file: `./postman/RESTful Endpoints/DG_Distribution.postman_collection.json`
4. The collection will appear in your Postman sidebar ready to use

> Make sure the API is running at `http://localhost:8000` before sending requests.

---

## 🛠️ Useful Commands

### View logs
```bash
docker logs dg_distribution_backend
```

### Follow logs in real time
```bash
docker logs -f dg_distribution_backend
```

### Enter the container shell
```bash
docker exec -it dg_distribution_backend sh
```

### Stop all containers
```bash
docker compose down
```

### Stop and reset the database
```bash
docker compose down -v
```

### Rebuild after code changes
```bash
docker compose down
docker compose up -d --build
```

---

## ❓ Troubleshooting

**Docker command not found**
- Make sure Docker Desktop is installed and running

**Port already in use**
- Check and stop any process using ports `8000`, `3306`, or `8080`

**App can't connect to database**
- Make sure `DATABASE_HOST=db` in your `.env` (not `localhost`)
- Check logs: `docker logs dg_distribution_backend`

**Migration errors / database issues**
- Reset everything: `docker compose down -v && docker compose up -d --build`
