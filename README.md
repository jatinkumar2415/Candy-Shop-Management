# Sweet Shop API

A production-level FastAPI backend server for managing a sweet shop with authentication, inventory management, and CRUD operations.

## Features

- **Authentication**: JWT-based authentication with register and login endpoints
- **Sweet Management**: Full CRUD operations for sweets with search functionality
- **Inventory Management**: Purchase and restock operations with admin controls
- **Role-based Access**: Admin-only endpoints for sensitive operations
- **Production Ready**: Proper folder structure, error handling, and validation

## API Endpoints

### Authentication
- `POST /api/v1/auth/register` - Register a new user
- `POST /api/v1/auth/login` - Login and get access token

### Sweets (Protected)
- `POST /api/v1/sweets` - Add a new sweet (Admin only)
- `GET /api/v1/sweets` - View all available sweets
- `GET /api/v1/sweets/search` - Search sweets by name, category, or price range
- `GET /api/v1/sweets/{id}` - Get sweet by ID
- `PUT /api/v1/sweets/{id}` - Update sweet details (Admin only)
- `DELETE /api/v1/sweets/{id}` - Delete a sweet (Admin only)

### Inventory (Protected)
- `POST /api/v1/sweets/{id}/purchase` - Purchase a sweet (decreases quantity)
- `POST /api/v1/sweets/{id}/restock` - Restock a sweet (Admin only, increases quantity)

## Setup

1. **Install dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

2. **Configure environment:**
   - Copy `.env` file and update the database URL and other settings
   - Default admin credentials: admin@sweetshop.com / admin123

3. **Initialize database:**
   ```bash
   python init_db.py
   ```

4. **Run the server:**
   ```bash
   python run.py
   ```

The server will be available at `http://localhost:8000`

## API Documentation

Once the server is running, you can access:
- **Swagger UI**: `http://localhost:8000/docs`
- **ReDoc**: `http://localhost:8000/redoc`

## Database

The application uses PostgreSQL by default. Configure the `DATABASE_URL` in your `.env` file:

```
DATABASE_URL=postgresql://username:password@localhost:5432/sweet_shop
```

## Project Structure

```
app/
├── api/
│   └── v1/
│       ├── endpoints/
│       │   ├── auth.py      # Authentication endpoints
│       │   └── sweets.py    # Sweet management endpoints
│       └── api.py           # API router
├── core/
│   ├── config.py            # Configuration settings
│   ├── security.py          # JWT and password utilities
│   └── deps.py              # FastAPI dependencies
├── crud/
│   ├── user.py              # User CRUD operations
│   └── sweet.py             # Sweet CRUD operations
├── db/
│   ├── base.py              # Database base
│   └── session.py           # Database session
├── models/
│   ├── user.py              # User SQLAlchemy model
│   └── sweet.py             # Sweet SQLAlchemy model
├── schemas/
│   ├── user.py              # User Pydantic schemas
│   └── sweet.py             # Sweet Pydantic schemas
└── main.py                  # FastAPI application
```

## Testing

Run tests with pytest:

```bash
pytest tests/
```

## Admin Operations

The system creates a default admin user during initialization. Admins can:
- Add, update, and delete sweets
- Restock inventory
- Manage all aspects of the system

Regular users can:
- View and search sweets
- Purchase sweets (reducing inventory)

## Security Features

- JWT token-based authentication
- Password hashing with bcrypt
- Role-based access control
- Input validation with Pydantic
- SQL injection protection with SQLAlchemy ORM