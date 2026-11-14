# Aplikace pro orientační běh

Třívrstvá webová aplikace pro správu a vyhodnocování závodů v orientačním běhu.

---

## Popis projektu
- **Veřejná sekce**: Prohlížení ukončených závodů, oficiálních výsledkových listin a tisk výsledků.
- **Administrátorská sekce (zabezpečená JWT)**:
  - Tvorba a správa závodů a jejich parametrů.
  - Definice kategorií (délka trati, převýšení).
  - Centrální evidence závodníků a oddílů/klubů.
  - Správa startovních listin
  - **Časomíra / stopky**: Zaznamenávání časů startu a cíle v reálném čase, interaktivní stopky přímo v prohlížeči, ruční korekce časů a řešení nestandardních stavů (`REGISTERED`, `RUNNING`, `FINISHED`, `DNF`, `DISQ`, `DNS`).
- **Architektura**:
  - **Prezentační vrstva (Frontend)**: TypeScript, React 18, Vite, Tailwind CSS.
  - **Aplikační vrstva (Backend)**: Python 3.12, Flask, Flask-SQLAlchemy, Flask-CORS, PyJWT.
  - **Datová vrstva (Databáze)**: PostgreSQL 16.
  - **Infrastruktura**: Docker Compose s oddělenými sítěmi pro síťovou izolaci databáze; automatický CI/CD build do GitHub Container Registry (GHCR).

---

## Spuštění aplikace v Dockeru

Projekt je kontejnerizován a předpřipravené obrazy jsou publikovány v GitHub Container Registry (GHCR).

### 1. Spuštění kontejnerů
V kořenovém adresáři projektu spusťte:

```bash
docker compose up
```

Příkaz automaticky stáhne obrazy, nastartuje databázi PostgreSQL, inicializační služba `setup` vytvoří databázové schéma a vloží ukázková data, spustí backend API a následně frontend.

### 2. Dostupné adresy a služby
- **Frontend (Webová aplikace)**: [http://localhost:3000](http://localhost:3000)
- **Backend API**: [http://localhost:5000](http://localhost:5000)
- **Healthcheck endpoint**: [http://localhost:5000/api/health](http://localhost:5000/api/health)
- **PostgreSQL databáze**: `localhost:5433` (uživatel: `postgres`, heslo: `postgres`, db: `orienteering`)

### 3. Přihlašovací údaje administrátora
- **Uživatelské jméno**: `admin`
- **Heslo**: `admin123`
*(Konfigurováno v souboru `.env`)*

### 4. Zastavení aplikace
```bash
docker compose down
```
---

## Architektura a síťová izolace

Systém využívá oddělení kontejnerů do dvou samostatných Docker sítí (`bridge`):
- **`frontend_network`**: propojuje pouze `frontend` a `backend` - nemá přímý přístup do DB.
- **`backend_network`**: propojuje pouze `backend` a `db` (databázi).
---

## 📋 Přehled klíčových REST API endpointů

| Metoda | Endpoint | Oprávnění | Popis |
|---|---|---|---|
| `GET` | `/api/health` | Veřejné | Healthcheck stavu API |
| `POST` | `/api/auth/login` | Veřejné | Přihlášení admina (vrací JWT token) |
| `GET` | `/api/auth/me` | Admin | Ověření přihlášeného admina |
| `GET` | `/api/races` | Veřejné / Admin | Seznam závodů (veřejnost: pouze FINISHED, admin: všechny) |
| `POST` | `/api/races` | Admin | Založení nového závodu |
| `GET` | `/api/races/<id>` | Veřejné / Admin | Detail závodu a jeho kategorií |
| `PUT` | `/api/races/<id>/status`| Admin | Změna stavu závodu (`DRAFT`, `IN_PROGRESS`, `FINISHED`) |
| `POST` | `/api/races/<id>/categories` | Admin | Přidání kategorie do závodu |
| `GET` | `/api/competitors` | Admin | Centrální evidence závodníků (filtrace `?q=`) |
| `POST` | `/api/competitors` | Admin | Vytvoření nového závodníka |
| `POST` | `/api/categories/<id>/entries` | Admin | Přihlášení závodníka do kategorie (přiřazení st. čísla) |
| `POST` | `/api/entries/<id>/start` | Admin | Spuštění stopky pro závodníka (čas startu, stav RUNNING) |
| `POST` | `/api/entries/<id>/finish` | Admin | Zastavení stopky závodníka (dopočet výsledného času, stav FINISHED) |
| `PUT` | `/api/entries/<id>` | Admin | Ruční úprava času, st. čísla nebo nastavení DNF / DISK / DNS |
| `GET` | `/api/races/<id>/results` | Veřejné | Kompletní oficiální výsledková listina seřazená dle časů s odstupy |