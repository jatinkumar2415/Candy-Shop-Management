from pydantic import BaseModel, Field
from datetime import datetime
from typing import Optional


class SweetBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=100)
    description: Optional[str] = None
    category: str = Field(..., min_length=1, max_length=50)
    price: float = Field(..., gt=0)
    quantity: int = Field(default=0, ge=0)
    image_url: Optional[str] = None


class SweetCreate(SweetBase):
    pass


class SweetUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=100)
    description: Optional[str] = None
    category: Optional[str] = Field(None, min_length=1, max_length=50)
    price: Optional[float] = Field(None, gt=0)
    quantity: Optional[int] = Field(None, ge=0)
    image_url: Optional[str] = None


class SweetInDBBase(SweetBase):
    id: int
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class Sweet(SweetInDBBase):
    pass


class SweetInDB(SweetInDBBase):
    pass


# Search and filter schemas
class SweetSearch(BaseModel):
    name: Optional[str] = None
    category: Optional[str] = None
    min_price: Optional[float] = Field(None, ge=0)
    max_price: Optional[float] = Field(None, ge=0)


# Inventory management schemas
class PurchaseRequest(BaseModel):
    quantity: int = Field(..., gt=0)


class RestockRequest(BaseModel):
    quantity: int = Field(..., gt=0)


class InventoryResponse(BaseModel):
    message: str
    sweet_id: int
    new_quantity: int