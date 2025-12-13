from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import Any, List, Optional

from app.db.session import get_db
from app.crud import sweet as crud_sweet
from app.schemas.sweet import Sweet, SweetCreate, SweetUpdate, SweetSearch, InventoryResponse, PurchaseRequest, RestockRequest
from app.models.user import User
from app.core.deps import get_current_user, get_current_admin_user

router = APIRouter()


@router.post("/", response_model=Sweet, status_code=status.HTTP_201_CREATED)
def create_sweet(
    *,
    db: Session = Depends(get_db),
    sweet_in: SweetCreate,
    current_user: User = Depends(get_current_admin_user),
) -> Any:
    """
    Create new sweet. Admin only.
    """
    sweet = crud_sweet.sweet.create(db, obj_in=sweet_in)
    return sweet


@router.get("/", response_model=List[Sweet])
def read_sweets(
    db: Session = Depends(get_db),
    skip: int = 0,
    limit: int = 100,
    current_user: User = Depends(get_current_user),
) -> Any:
    """
    Retrieve sweets.
    """
    sweets = crud_sweet.sweet.get_multi(db, skip=skip, limit=limit)
    return sweets


@router.get("/search", response_model=List[Sweet])
def search_sweets(
    *,
    db: Session = Depends(get_db),
    name: Optional[str] = Query(None, description="Search by sweet name"),
    category: Optional[str] = Query(None, description="Search by category"),
    min_price: Optional[float] = Query(None, ge=0, description="Minimum price"),
    max_price: Optional[float] = Query(None, ge=0, description="Maximum price"),
    skip: int = 0,
    limit: int = 100,
    current_user: User = Depends(get_current_user),
) -> Any:
    """
    Search sweets by name, category, or price range.
    """
    search_params = SweetSearch(
        name=name,
        category=category,
        min_price=min_price,
        max_price=max_price
    )
    sweets = crud_sweet.sweet.search(db, search_params=search_params, skip=skip, limit=limit)
    return sweets


@router.get("/{id}", response_model=Sweet)
def read_sweet(
    *,
    db: Session = Depends(get_db),
    id: int,
    current_user: User = Depends(get_current_user),
) -> Any:
    """
    Get sweet by ID.
    """
    sweet = crud_sweet.sweet.get(db, id=id)
    if not sweet:
        raise HTTPException(status_code=404, detail="Sweet not found")
    return sweet


@router.put("/{id}", response_model=Sweet)
def update_sweet(
    *,
    db: Session = Depends(get_db),
    id: int,
    sweet_in: SweetUpdate,
    current_user: User = Depends(get_current_admin_user),
) -> Any:
    """
    Update sweet. Admin only.
    """
    sweet = crud_sweet.sweet.get(db, id=id)
    if not sweet:
        raise HTTPException(status_code=404, detail="Sweet not found")
    sweet = crud_sweet.sweet.update(db, db_obj=sweet, obj_in=sweet_in)
    return sweet


@router.delete("/{id}", response_model=Sweet)
def delete_sweet(
    *,
    db: Session = Depends(get_db),
    id: int,
    current_user: User = Depends(get_current_admin_user),
) -> Any:
    """
    Delete sweet. Admin only.
    """
    sweet = crud_sweet.sweet.get(db, id=id)
    if not sweet:
        raise HTTPException(status_code=404, detail="Sweet not found")
    sweet = crud_sweet.sweet.remove(db, id=id)
    return sweet


@router.post("/{id}/purchase", response_model=InventoryResponse)
def purchase_sweet(
    *,
    db: Session = Depends(get_db),
    id: int,
    purchase_data: PurchaseRequest,
    current_user: User = Depends(get_current_user),
) -> Any:
    """
    Purchase a sweet, decreasing its quantity.
    """
    try:
        sweet = crud_sweet.sweet.purchase(db, sweet_id=id, quantity=purchase_data.quantity)
        if not sweet:
            raise HTTPException(status_code=404, detail="Sweet not found")
        
        return InventoryResponse(
            message=f"Successfully purchased {purchase_data.quantity} units",
            sweet_id=sweet.id,
            new_quantity=sweet.quantity
        )
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/{id}/restock", response_model=InventoryResponse)
def restock_sweet(
    *,
    db: Session = Depends(get_db),
    id: int,
    restock_data: RestockRequest,
    current_user: User = Depends(get_current_admin_user),
) -> Any:
    """
    Restock a sweet, increasing its quantity. Admin only.
    """
    sweet = crud_sweet.sweet.restock(db, sweet_id=id, quantity=restock_data.quantity)
    if not sweet:
        raise HTTPException(status_code=404, detail="Sweet not found")
    
    return InventoryResponse(
        message=f"Successfully restocked {restock_data.quantity} units",
        sweet_id=sweet.id,
        new_quantity=sweet.quantity
    )