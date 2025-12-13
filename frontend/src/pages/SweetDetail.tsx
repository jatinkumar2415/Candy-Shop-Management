import React, { useState, useEffect } from 'react';
import { Container, Typography, Box, Button, Chip, Card, CardContent, TextField } from '@mui/material';
import { ShoppingCart, Edit } from '@mui/icons-material';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import type { Sweet } from '../types/models';
import api from '../api/api';
import { toast } from 'react-toastify';

const SweetDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [sweet, setSweet] = useState<Sweet | null>(null);
  const [purchaseQuantity, setPurchaseQuantity] = useState(1);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (id) {
      fetchSweet();
    }
  }, [id]);

  const fetchSweet = async () => {
    try {
      const response = await api.get(`/sweets/${id}`);
      setSweet(response.data);
    } catch (error: any) {
      toast.error('Failed to fetch sweet');
    }
  };

  const handlePurchase = async () => {
    if (!sweet) return;
    try {
      await api.post(`/sweets/${sweet.id}/purchase`, { quantity: purchaseQuantity });
      toast.success('Purchase successful!');
      fetchSweet();
    } catch (error: any) {
      toast.error(error.response?.data?.detail || 'Purchase failed');
    }
  };

  const handleRestock = async () => {
    if (!sweet) return;
    try {
      await api.post(`/sweets/${sweet.id}/restock`);
      toast.success('Restock successful!');
      fetchSweet();
    } catch (error: any) {
      toast.error(error.response?.data?.detail || 'Restock failed');
    }
  };

  if (!sweet) return <div>Loading...</div>;

  return (
    <Container maxWidth="md" sx={{ mt: 4 }}>
      <Card>
        <CardContent>
          <Typography variant="h4" gutterBottom>
            {sweet.name}
          </Typography>
          <Chip label={sweet.category} sx={{ mb: 2 }} />
          <Typography variant="body1" sx={{ mb: 2 }}>
            {sweet.description}
          </Typography>
          <Typography variant="h5" sx={{ mb: 1 }}>
            Price: ${sweet.price}
          </Typography>
          <Typography variant="body1" sx={{ mb: 2 }}>
            Quantity: {sweet.quantity}
          </Typography>
          {sweet.image_url && (
            <Box sx={{ mb: 2 }}>
              <img src={sweet.image_url} alt={sweet.name} style={{ maxWidth: '100%', height: 'auto' }} />
            </Box>
          )}
          <Typography variant="body2" color="text.secondary">
            Created: {new Date(sweet.created_at).toLocaleDateString()}
          </Typography>
          {sweet.updated_at && (
            <Typography variant="body2" color="text.secondary">
              Updated: {new Date(sweet.updated_at).toLocaleDateString()}
            </Typography>
          )}
        </CardContent>
      </Card>

      <Box sx={{ mt: 2, display: 'flex', alignItems: 'center', gap: 2 }}>
        <TextField
          label="Quantity"
          type="number"
          value={purchaseQuantity}
          onChange={(e) => setPurchaseQuantity(Number(e.target.value))}
          inputProps={{ min: 1, max: sweet.quantity }}
          sx={{ width: 100 }}
        />
        <Button
          variant="contained"
          startIcon={<ShoppingCart />}
          onClick={handlePurchase}
          disabled={sweet.quantity === 0 || purchaseQuantity < 1 || purchaseQuantity > sweet.quantity}
        >
          Purchase
        </Button>
        {user?.is_admin && (
          <>
            <Button variant="outlined" startIcon={<Edit />} onClick={() => navigate(`/sweets/${id}/edit`)}>
              Edit
            </Button>
            <Button variant="outlined" onClick={handleRestock}>
              Restock
            </Button>
          </>
        )}
      </Box>
    </Container>
  );
};

export default SweetDetail;