import React, { useState, useEffect } from 'react';
import {
  Container,
  Card,
  CardContent,
  CardActions,
  Typography,
  Button,
  TextField,
  Box,
  Chip,
  IconButton,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from '@mui/material';
import { Edit, Delete, ShoppingCart, Add } from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import type { Sweet, SweetSearch } from '../types/models';
import api from '../api/api';
import { toast } from 'react-toastify';

const SweetsList: React.FC = () => {
  const [sweets, setSweets] = useState<Sweet[]>([]);
  const [search, setSearch] = useState<SweetSearch>({});
  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; sweet: Sweet | null }>({ open: false, sweet: null });
  const [purchaseDialog, setPurchaseDialog] = useState<{ open: boolean; sweet: Sweet | null }>({ open: false, sweet: null });
  const [purchaseQuantities, setPurchaseQuantities] = useState<Map<number, number>>(new Map());
  const { user } = useAuth();
  const navigate = useNavigate();

  // Function to get image path based on sweet name
  const getImagePath = (sweetName: string): string => {
    // Direct mapping for known sweets with exact filename matches
    const imageMap: { [key: string]: string } = {
      'Apple Pie': '/Apple_Pie.webp',
      'Chocolate Cake': '/Chocolate Cake.webp',
      'Strawberry Cupcake': '/Strawberry Cupcake.webp',
      'Chocolate Chip Cookies': '/Chocolate Chip Cookies.webp',
      'Lemon Tart': '/Lemon Tart.webp',
    };
    
    return imageMap[sweetName] || '/vite.svg'; // fallback to vite logo
  };

  useEffect(() => {
    fetchSweets();
  }, [search]);

  const fetchSweets = async () => {
    try {
      const params = new URLSearchParams();
      if (search.name) params.append('name', search.name);
      if (search.category) params.append('category', search.category);
      if (search.min_price) params.append('min_price', search.min_price.toString());
      if (search.max_price) params.append('max_price', search.max_price.toString());

      const response = await api.get(`/sweets${params.toString() ? `?${params.toString()}` : ''}`);
      setSweets(response.data);
    } catch (error: any) {
      toast.error('Failed to fetch sweets');
    }
  };

  const handlePurchaseQuantityChange = (sweetId: number, quantity: number) => {
    setPurchaseQuantities(prev => new Map(prev.set(sweetId, quantity)));
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setSearch({ ...search, [name]: value === '' ? undefined : (name.includes('price') ? Number(value) : value) });
  };

  const handlePurchase = async (sweet: Sweet) => {
    const quantity = purchaseQuantities.get(sweet.id) || 1;
    try {
      await api.post(`/sweets/${sweet.id}/purchase`, { quantity });
      toast.success('Purchase successful!');
      fetchSweets();
    } catch (error: any) {
      toast.error(error.response?.data?.detail || 'Purchase failed');
    }
  };

  const handleDelete = async () => {
    if (!deleteDialog.sweet) return;
    try {
      await api.delete(`/sweets/${deleteDialog.sweet.id}`);
      toast.success('Sweet deleted');
      setDeleteDialog({ open: false, sweet: null });
      fetchSweets();
    } catch (error: any) {
      toast.error('Failed to delete sweet');
    }
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4 }}>
      <Typography variant="h4" gutterBottom>
        Sweets
      </Typography>

      {/* Search */}
      <Box sx={{ mb: 4, display: 'flex', gap: 2, flexWrap: 'wrap' }}>
        <TextField
          label="Name"
          name="name"
          value={search.name || ''}
          onChange={handleSearchChange}
          variant="outlined"
        />
        <TextField
          label="Category"
          name="category"
          value={search.category || ''}
          onChange={handleSearchChange}
          variant="outlined"
        />
        <TextField
          label="Min Price"
          name="min_price"
          type="number"
          value={search.min_price || ''}
          onChange={handleSearchChange}
          variant="outlined"
        />
        <TextField
          label="Max Price"
          name="max_price"
          type="number"
          value={search.max_price || ''}
          onChange={handleSearchChange}
          variant="outlined"
        />
      </Box>

      {user?.is_admin && (
        <Box sx={{ mb: 2 }}>
          <Button variant="contained" startIcon={<Add />} onClick={() => navigate('/sweets/add')}>
            Add Sweet
          </Button>
        </Box>
      )}

      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
        {sweets.map((sweet) => (
          <Box key={sweet.id} sx={{ flex: '1 1 300px', maxWidth: '400px' }}>
            <Card>
              <CardContent>
                <Box sx={{ mb: 2, display: 'flex', justifyContent: 'center' }}>
                  <img
                    src={ getImagePath(sweet.name)}
                    alt={sweet.name}
                    style={{
                      width: '100%',
                      maxWidth: '200px',
                      height: '150px',
                      objectFit: 'cover',
                      borderRadius: '8px'
                    }}
                  />
                </Box>
                <Typography variant="h5" component="div">
                  {sweet.name}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {sweet.description}
                </Typography>
                <Chip label={sweet.category} sx={{ mt: 1 }} />
                <Typography variant="h6" sx={{ mt: 1 }}>
                  Rs{sweet.price}
                </Typography>
                <Typography variant="body2">
                  Quantity: {sweet.quantity}
                </Typography>
              </CardContent>
              <CardActions>
                <Button size="small" onClick={() => navigate(`/sweets/${sweet.id}`)}>
                  View
                </Button>
                {user?.is_admin && (
                  <>
                    <IconButton size="small" onClick={() => navigate(`/sweets/${sweet.id}/edit`)}>
                      <Edit />
                    </IconButton>
                    <IconButton size="small" onClick={() => setDeleteDialog({ open: true, sweet })}>
                      <Delete />
                    </IconButton>
                  </>
                )}
                <Button
                  size="small"
                  startIcon={<ShoppingCart />}
                  onClick={() => setPurchaseDialog({ open: true, sweet })}
                  disabled={sweet.quantity === 0}
                >
                  Purchase
                </Button>
              </CardActions>
            </Card>
          </Box>
        ))}
      </Box>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialog.open} onClose={() => setDeleteDialog({ open: false, sweet: null })}>
        <DialogTitle>Delete Sweet</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete "{deleteDialog.sweet?.name}"?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialog({ open: false, sweet: null })}>Cancel</Button>
          <Button onClick={handleDelete} color="error">
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* Purchase Dialog */}
      <Dialog open={purchaseDialog.open} onClose={() => setPurchaseDialog({ open: false, sweet: null })} maxWidth="sm" fullWidth>
        <DialogTitle>Purchase {purchaseDialog.sweet?.name}</DialogTitle>
        {purchaseDialog.sweet && (() => {
          const sweet = purchaseDialog.sweet;
          return (
            <>
              <DialogContent>
                <Box sx={{ pt: 2 }}>
                  <Box sx={{ mb: 2, display: 'flex', justifyContent: 'center' }}>
                    <img
                      src={ getImagePath(sweet.name)}
                      alt={sweet.name}
                      style={{
                        width: '100%',
                        maxWidth: '250px',
                        height: '200px',
                        objectFit: 'cover',
                        borderRadius: '8px'
                      }}
                    />
                  </Box>
                  <Typography variant="h6" gutterBottom>
                    {sweet.name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    {sweet.description}
                  </Typography>
                  <Chip label={sweet.category} sx={{ mb: 2 }} />
                  <Typography variant="h6" sx={{ mb: 1 }}>
                    Price: RS {sweet.price}
                  </Typography>
                  <Typography variant="body2" sx={{ mb: 2 }}>
                    Available Quantity: {sweet.quantity}
                  </Typography>
                  <TextField
                    fullWidth
                    type="number"
                    label="Quantity to Purchase"
                    value={purchaseQuantities.get(sweet.id) || 1}
                    onChange={(e) => handlePurchaseQuantityChange(sweet.id, Number(e.target.value))}
                    inputProps={{ min: 1, max: sweet.quantity }}
                    sx={{ mt: 2 }}
                  />
                </Box>
              </DialogContent>
              <DialogActions>
                <Button onClick={() => setPurchaseDialog({ open: false, sweet: null })}>Cancel</Button>
                <Button
                  onClick={() => {
                    handlePurchase(sweet);
                    setPurchaseDialog({ open: false, sweet: null });
                  }}
                  variant="contained"
                  disabled={(purchaseQuantities.get(sweet.id) || 1) < 1 || (purchaseQuantities.get(sweet.id) || 1) > sweet.quantity}
                >
                  Buy
                </Button>
              </DialogActions>
            </>
          );
        })()}
      </Dialog>
    </Container>
  );
};

export default SweetsList;