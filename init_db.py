#!/usr/bin/env python3
"""
Database initialization script.
Creates an admin user and some sample data.
"""
from sqlalchemy.orm import Session
from app.db.session import SessionLocal, engine
from app.db.base import Base
from app.crud import user as crud_user
from app.crud import sweet as crud_sweet
from app.schemas.user import UserCreate
from app.schemas.sweet import SweetCreate
from app.core.config import settings


def init_db() -> None:
    """Initialize the database."""
    # Create tables
    Base.metadata.create_all(bind=engine)
    
    
    # Create admin user
    db = SessionLocal()
    try:
        # Check if admin user already exists
        user = crud_user.user.get_by_email(db, email=settings.admin_email)
        if not user:
            admin_user = UserCreate(
                email=settings.admin_email,
                password=settings.admin_password,
                full_name="System Administrator",
                is_active=True,
            )
            user = crud_user.user.create(db, obj_in=admin_user)
            # Make user admin
            user.is_admin = True
            db.add(user)
            db.commit()
            print(f"Admin user created with email: {settings.admin_email}")
        else:
            print("Admin user already exists")

        # Create some sample sweets
        sample_sweets = [
            SweetCreate(
                name="Chocolate Cake",
                description="Rich chocolate cake with chocolate frosting",
                category="Cakes",
                price=1599,
                quantity=10,
                image_url="https://example.com/chocolate-cake.jpg"
            ),
            SweetCreate(
                name="Strawberry Cupcake",
                description="Vanilla cupcake with strawberry frosting",
                category="Cupcakes",
                price=350,
                quantity=25,
                image_url="https://example.com/strawberry-cupcake.jpg"
            ),
            SweetCreate(
                name="Chocolate Chip Cookies",
                description="Classic homemade chocolate chip cookies",
                category="Cookies",
                price=225,
                quantity=50,
                image_url="https://example.com/choc-chip-cookies.jpg"
            ),
            SweetCreate(
                name="Apple Pie",
                description="Traditional apple pie with cinnamon",
                category="Pies",
                price=1299,
                quantity=5,
                image_url="https://example.com/apple-pie.jpg"
            ),
            SweetCreate(
                name="Lemon Tart",
                description="Tangy lemon tart with meringue topping",
                category="Tarts",
                price=850,
                quantity=8,
                image_url="https://example.com/lemon-tart.jpg"
            ),
        ]

        for sweet_data in sample_sweets:
            existing_sweet = db.query(crud_sweet.Sweet).filter(crud_sweet.Sweet.name == sweet_data.name).first()
            if not existing_sweet:
                crud_sweet.sweet.create(db, obj_in=sweet_data)
                print(f"Created sweet: {sweet_data.name}")
            else:
                print(f"Sweet already exists: {sweet_data.name}")

    finally:
        db.close()


if __name__ == "__main__":
    print("Creating initial data...")
    init_db()
    print("Initial data created successfully!")