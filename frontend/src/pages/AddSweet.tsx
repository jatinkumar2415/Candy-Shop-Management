import React, { useState } from 'react';
import { Container, TextField, Button, Typography, Box, Paper } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import type { SweetCreate } from '../types/models';
import api from '../api/api';
import { toast } from 'react-toastify';

const AddSweet: React.FC = () => {
  const [sweetData, setSweetData] = useState<SweetCreate>({
    name: '',
    description: '',
    category: '',
    price: 0,
    quantity: 0,
    image_url: '',
  });
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setSweetData({ ...sweetData, [name]: name === 'price' || name === 'quantity' ? Number(value) : value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/sweets', sweetData);
      toast.success('Sweet added successfully!');
      navigate('/');
    } catch (error: any) {
      toast.error(error.response?.data?.detail || 'Failed to add sweet');
    }
  };

  return (
    <Container maxWidth="sm">
      <Box sx={{ mt: 8, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <Paper elevation={3} sx={{ p: 4, width: '100%' }}>
          <Typography component="h1" variant="h4" align="center" gutterBottom>
            Add New Sweet
          </Typography>
          <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1 }}>
            <TextField
              margin="normal"
              required
              fullWidth
              id="name"
              label="Name"
              name="name"
              autoFocus
              value={sweetData.name}
              onChange={handleChange}
            />
            <TextField
              margin="normal"
              fullWidth
              id="description"
              label="Description"
              name="description"
              multiline
              rows={3}
              value={sweetData.description}
              onChange={handleChange}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              id="category"
              label="Category"
              name="category"
              value={sweetData.category}
              onChange={handleChange}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              id="price"
              label="Price"
              name="price"
              type="number"
              inputProps={{ min: 0, step: 0.01 }}
              value={sweetData.price}
              onChange={handleChange}
            />
            <TextField
              margin="normal"
              fullWidth
              id="quantity"
              label="Quantity"
              name="quantity"
              type="number"
              inputProps={{ min: 0 }}
              value={sweetData.quantity}
              onChange={handleChange}
            />
            <TextField
              margin="normal"
              fullWidth
              id="image_url"
              label="Image URL"
              name="image_url"
              value={sweetData.image_url}
              onChange={handleChange}
            />
            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2 }}
            >
              Add Sweet
            </Button>
            <Button
              fullWidth
              variant="outlined"
              onClick={() => navigate('/')}
            >
              Cancel
            </Button>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
};

export default AddSweet;