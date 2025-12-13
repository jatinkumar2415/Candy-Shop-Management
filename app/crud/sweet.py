from sqlalchemy.orm import Session
from sqlalchemy import or_, and_
from typing import List, Optional
from ..models.sweet import Sweet
from ..schemas.sweet import SweetCreate, SweetUpdate, SweetSearch


class CRUDSweet:
    def get(self, db: Session, id: int) -> Optional[Sweet]:
        return db.query(Sweet).filter(Sweet.id == id).first()

    def get_multi(self, db: Session, skip: int = 0, limit: int = 100) -> List[Sweet]:
        return db.query(Sweet).offset(skip).limit(limit).all()

    def create(self, db: Session, obj_in: SweetCreate) -> Sweet:
        db_obj = Sweet(
            name=obj_in.name,
            description=obj_in.description,
            category=obj_in.category,
            price=obj_in.price,
            quantity=obj_in.quantity,
            image_url=obj_in.image_url,
        )
        db.add(db_obj)
        db.commit()
        db.refresh(db_obj)
        return db_obj

    def update(self, db: Session, db_obj: Sweet, obj_in: SweetUpdate) -> Sweet:
        update_data = obj_in.dict(exclude_unset=True)
        for field, value in update_data.items():
            setattr(db_obj, field, value)
        
        db.add(db_obj)
        db.commit()
        db.refresh(db_obj)
        return db_obj

    def remove(self, db: Session, id: int) -> Optional[Sweet]:
        obj = db.query(Sweet).get(id)
        if obj:
            db.delete(obj)
            db.commit()
        return obj

    def search(self, db: Session, search_params: SweetSearch, skip: int = 0, limit: int = 100) -> List[Sweet]:
        query = db.query(Sweet)
        
        # Filter by name (case-insensitive)
        if search_params.name:
            query = query.filter(Sweet.name.ilike(f"%{search_params.name}%"))
        
        # Filter by category (case-insensitive)
        if search_params.category:
            query = query.filter(Sweet.category.ilike(f"%{search_params.category}%"))
        
        # Filter by price range
        if search_params.min_price is not None:
            query = query.filter(Sweet.price >= search_params.min_price)
        
        if search_params.max_price is not None:
            query = query.filter(Sweet.price <= search_params.max_price)
        
        return query.offset(skip).limit(limit).all()

    def purchase(self, db: Session, sweet_id: int, quantity: int) -> Optional[Sweet]:
        sweet = self.get(db, sweet_id)
        if not sweet:
            return None
        
        if sweet.quantity < quantity:
            raise ValueError("Insufficient quantity in stock")
        
        sweet.quantity -= quantity
        db.add(sweet)
        db.commit()
        db.refresh(sweet)
        return sweet

    def restock(self, db: Session, sweet_id: int, quantity: int) -> Optional[Sweet]:
        sweet = self.get(db, sweet_id)
        if not sweet:
            return None
        
        sweet.quantity += quantity
        db.add(sweet)
        db.commit()
        db.refresh(sweet)
        return sweet


sweet = CRUDSweet()