# Database Init Scripts

Scripts in this directory run **once** on first container startup (empty data volume).

**Important:** Before first `docker compose up`, replace `POSTGRES_PASSWORD_PLACEHOLDER` in `00-init.sql` with your actual `POSTGRES_PASSWORD` value from `.env`:

```bash
sed -i "s/POSTGRES_PASSWORD_PLACEHOLDER/YOUR_ACTUAL_PASSWORD/g" 00-init.sql
```

To reset: stop the stack, delete `selfhost/volumes/db/data/`, then `docker compose up -d` again.
