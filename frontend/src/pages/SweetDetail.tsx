import React, { useState, useEffect } from 'react';
import { Card, Typography, Button, Tag, InputNumber, Space, Descriptions, Image, Spin, message } from 'antd';
import { ShoppingCartOutlined, EditOutlined, ReloadOutlined } from '@ant-design/icons';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import type { Sweet } from '../types/models';
import api from '../api/api';

const { Title, Text } = Typography;

const SweetDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [sweet, setSweet] = useState<Sweet | null>(null);
  const [loading, setLoading] = useState(true);
  const [purchaseQuantity, setPurchaseQuantity] = useState(1);
  const [purchaseLoading, setPurchaseLoading] = useState(false);
  const [restockLoading, setRestockLoading] = useState(false);
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
      message.error('Failed to fetch sweet');
    } finally {
      setLoading(false);
    }
  };

  const handlePurchase = async () => {
    if (!sweet) return;
    setPurchaseLoading(true);
    try {
      await api.post(`/sweets/${sweet.id}/purchase`, { quantity: purchaseQuantity });
      message.success('Purchase successful!');
      fetchSweet();
    } catch (error: any) {
      message.error(error.response?.data?.detail || 'Purchase failed');
    } finally {
      setPurchaseLoading(false);
    }
  };

  const handleRestock = async () => {
    if (!sweet) return;
    setRestockLoading(true);
    try {
      await api.post(`/sweets/${sweet.id}/restock`);
      message.success('Restock successful!');
      fetchSweet();
    } catch (error: any) {
      message.error(error.response?.data?.detail || 'Restock failed');
    } finally {
      setRestockLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <Spin size="large" />
      </div>
    );
  }

  if (!sweet) return <div>Sweet not found</div>;

  return (
    <div style={{ 
      minHeight: '100vh', 
      padding: '24px',
      background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)'
    }}>
      <div style={{ maxWidth: '800px', margin: '0 auto' }}>
        <Card 
          style={{ 
            boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
            borderRadius: '12px'
          }}
          hoverable
        >
          <Space direction="vertical" size="large" style={{ width: '100%' }}>
            <div style={{ textAlign: 'center' }}>
              <Title level={1} style={{ margin: 0, color: '#1890ff' }}>{sweet.name}</Title>
              <Tag color="blue" style={{ fontSize: '14px', padding: '4px 12px' }}>{sweet.category}</Tag>
            </div>

            {sweet.image_url && (
              <div style={{ textAlign: 'center' }}>
                <Image
                  src={sweet.image_url}
                  alt={sweet.name}
                  style={{ 
                    maxWidth: '300px', 
                    borderRadius: '12px',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
                  }}
                  preview={false}
                />
              </div>
            )}

            <Descriptions 
              bordered 
              column={1}
              size="middle"
              style={{ background: 'white', borderRadius: '8px' }}
            >
              <Descriptions.Item label="Description">
                <Text style={{ fontSize: '16px' }}>{sweet.description}</Text>
              </Descriptions.Item>
              <Descriptions.Item label="Price">
                <Text strong style={{ fontSize: '18px', color: '#52c41a' }}>Rs {sweet.price}</Text>
              </Descriptions.Item>
              <Descriptions.Item label="Available Quantity">
                <Text style={{ fontSize: '16px', color: sweet.quantity > 0 ? '#1890ff' : '#ff4d4f' }}>
                  {sweet.quantity}
                </Text>
              </Descriptions.Item>
              <Descriptions.Item label="Created">
                <Text>{new Date(sweet.created_at).toLocaleDateString()}</Text>
              </Descriptions.Item>
              {sweet.updated_at && (
                <Descriptions.Item label="Last Updated">
                  <Text>{new Date(sweet.updated_at).toLocaleDateString()}</Text>
                </Descriptions.Item>
              )}
            </Descriptions>

            <Card 
              size="small" 
              style={{ 
                background: '#f6ffed', 
                border: '1px solid #b7eb8f',
                borderRadius: '8px'
              }}
            >
              <Space direction="vertical" size="middle" style={{ width: '100%' }}>
                <Text strong>Purchase Options</Text>
                <Space>
                  <Text>Quantity:</Text>
                  <InputNumber
                    min={1}
                    max={sweet.quantity}
                    value={purchaseQuantity}
                    onChange={(value) => setPurchaseQuantity(value || 1)}
                    style={{ width: '80px' }}
                  />
                </Space>
                <Space>
                  <Button
                    type="primary"
                    icon={<ShoppingCartOutlined />}
                    onClick={handlePurchase}
                    loading={purchaseLoading}
                    disabled={sweet.quantity === 0 || purchaseQuantity < 1 || purchaseQuantity > sweet.quantity}
                    size="large"
                    style={{ 
                      borderRadius: '8px',
                      fontWeight: 'bold'
                    }}
                  >
                    Purchase
                  </Button>
                  {user?.is_admin && (
                    <>
                      <Button
                        icon={<EditOutlined />}
                        onClick={() => navigate(`/sweets/${id}/edit`)}
                        size="large"
                        style={{ borderRadius: '8px' }}
                      >
                        Edit
                      </Button>
                      <Button
                        icon={<ReloadOutlined />}
                        onClick={handleRestock}
                        loading={restockLoading}
                        size="large"
                        style={{ borderRadius: '8px' }}
                      >
                        Restock
                      </Button>
                    </>
                  )}
                </Space>
              </Space>
            </Card>
          </Space>
        </Card>
      </div>
    </div>
  );
};

export default SweetDetail;
