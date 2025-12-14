import React, { useState, useEffect } from 'react';
import {
  Card,
  Input,
  Button,
  Tag,
  Modal,
  Row,
  Col,
  Space,
  Typography,
  message,
  Spin,
  Image,
  InputNumber,
} from 'antd';
import {
  EditOutlined,
  DeleteOutlined,
  ShoppingCartOutlined,
  PlusOutlined,
  SearchOutlined,
} from '@ant-design/icons';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import type { Sweet, SweetSearch } from '../types/models';
import api from '../api/api';

const { Title } = Typography;
const { Meta } = Card;

const SweetsList: React.FC = () => {
  const [sweets, setSweets] = useState<Sweet[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState<SweetSearch>({});
  const [deleteModal, setDeleteModal] = useState<{ open: boolean; sweet: Sweet | null }>({ open: false, sweet: null });
  const [purchaseModal, setPurchaseModal] = useState<{ open: boolean; sweet: Sweet | null }>({ open: false, sweet: null });
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
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search.name) params.append('name', search.name);
      if (search.category) params.append('category', search.category);
      if (search.min_price) params.append('min_price', search.min_price.toString());
      if (search.max_price) params.append('max_price', search.max_price.toString());

      const response = await api.get(`/sweets${params.toString() ? `?${params.toString()}` : ''}`);
      setSweets(response.data);
    } catch (error: any) {
      message.error('Failed to fetch sweets');
    } finally {
      setLoading(false);
    }
  };

  const handlePurchaseQuantityChange = (sweetId: number, quantity: number) => {
    setPurchaseQuantities(prev => new Map(prev.set(sweetId, quantity)));
  };

  const handleSearchChange = (key: keyof SweetSearch, value: string | number) => {
    setSearch({ ...search, [key]: value === '' ? undefined : value });
  };

  const handlePurchase = async (sweet: Sweet) => {
    const quantity = purchaseQuantities.get(sweet.id) || 1;
    try {
      await api.post(`/sweets/${sweet.id}/purchase`, { quantity });
      message.success('Purchase successful!');
      fetchSweets();
    } catch (error: any) {
      message.error(error.response?.data?.detail || 'Purchase failed');
    }
  };

  const handleDelete = async () => {
    if (!deleteModal.sweet) return;
    try {
      await api.delete(`/sweets/${deleteModal.sweet.id}`);
      message.success('Sweet deleted');
      setDeleteModal({ open: false, sweet: null });
      fetchSweets();
    } catch (error: any) {
      message.error('Failed to delete sweet');
    }
  };

  return (
    <div style={{ 
      minHeight: '100vh', 
      padding: '24px',
      background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)'
    }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <Space direction="vertical" size="large" style={{ width: '100%' }}>
          <div style={{ textAlign: 'center' }}>
            <Title level={1} style={{ margin: 0, color: '#1890ff' }}>Sweet Delights</Title>
            <Typography.Text type="secondary" style={{ fontSize: '16px' }}>
              Discover and purchase your favorite sweets
            </Typography.Text>
          </div>

          {/* Search Section */}
          <Card 
            style={{ 
              borderRadius: '12px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
            }}
            hoverable
          >
            <Space direction="vertical" size="middle" style={{ width: '100%' }}>
              <Title level={4} style={{ margin: 0 }}>Search Sweets</Title>
              <Row gutter={16}>
                <Col xs={24} sm={12} md={6}>
                  <Input
                    placeholder="Search by name"
                    prefix={<SearchOutlined />}
                    onChange={(e) => handleSearchChange('name', e.target.value)}
                    style={{ borderRadius: '8px' }}
                  />
                </Col>
                <Col xs={24} sm={12} md={6}>
                  <Input
                    placeholder="Category"
                    onChange={(e) => handleSearchChange('category', e.target.value)}
                    style={{ borderRadius: '8px' }}
                  />
                </Col>
                <Col xs={24} sm={12} md={6}>
                  <InputNumber
                    placeholder="Min Price"
                    min={0}
                    onChange={(value) => handleSearchChange('min_price', value || 0)}
                    style={{ width: '100%', borderRadius: '8px' }}
                  />
                </Col>
                <Col xs={24} sm={12} md={6}>
                  <InputNumber
                    placeholder="Max Price"
                    min={0}
                    onChange={(value) => handleSearchChange('max_price', value || 0)}
                    style={{ width: '100%', borderRadius: '8px' }}
                  />
                </Col>
              </Row>
            </Space>
          </Card>

          {user?.is_admin && (
            <div style={{ textAlign: 'right' }}>
              <Button
                type="primary"
                icon={<PlusOutlined />}
                size="large"
                onClick={() => navigate('/sweets/add')}
                style={{ 
                  borderRadius: '8px',
                  fontWeight: 'bold'
                }}
              >
                Add Sweet
              </Button>
            </div>
          )}

          {loading ? (
            <div style={{ textAlign: 'center', padding: '50px' }}>
              <Spin size="large" />
            </div>
          ) : (
            <Row gutter={[24, 24]}>
              {sweets.map((sweet) => (
                <Col xs={24} sm={12} lg={8} xl={6} key={sweet.id}>
                  <Card
                    hoverable
                    style={{ 
                      borderRadius: '12px',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                      transition: 'all 0.3s ease',
                      height: '100%'
                    }}
                    cover={
                      <div style={{ 
                        height: '200px', 
                        overflow: 'hidden', 
                        borderRadius: '12px 12px 0 0',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        background: '#f5f5f5'
                      }}>
                        <Image
                          src={getImagePath(sweet.name)}
                          alt={sweet.name}
                          style={{
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover'
                          }}
                          preview={false}
                        />
                      </div>
                    }
                    actions={[
                      <Button
                        type="text"
                        icon={<ShoppingCartOutlined />}
                        onClick={() => setPurchaseModal({ open: true, sweet })}
                        disabled={sweet.quantity === 0}
                        style={{ color: sweet.quantity === 0 ? '#d9d9d9' : '#1890ff' }}
                      >
                        Buy
                      </Button>,
                      <Button
                        type="text"
                        onClick={() => navigate(`/sweets/${sweet.id}`)}
                        style={{ color: '#1890ff' }}
                      >
                        View
                      </Button>,
                      user?.is_admin && (
                        <Button
                          type="text"
                          icon={<EditOutlined />}
                          onClick={() => navigate(`/sweets/${sweet.id}/edit`)}
                          style={{ color: '#52c41a' }}
                        />
                      ),
                      user?.is_admin && (
                        <Button
                          type="text"
                          icon={<DeleteOutlined />}
                          onClick={() => setDeleteModal({ open: true, sweet })}
                          danger
                        />
                      ),
                    ].filter(Boolean)}
                  >
                    <Meta
                      title={<span style={{ fontSize: '18px', fontWeight: 'bold' }}>{sweet.name}</span>}
                      description={
                        <Space direction="vertical" size="small">
                          <Typography.Text ellipsis style={{ fontSize: '14px' }}>
                            {sweet.description}
                          </Typography.Text>
                          <Tag color="blue">{sweet.category}</Tag>
                          <div>
                            <Typography.Text strong style={{ fontSize: '16px', color: '#52c41a' }}>
                              Rs {sweet.price}
                            </Typography.Text>
                          </div>
                          <div>
                            <Typography.Text style={{ fontSize: '14px', color: sweet.quantity > 0 ? '#1890ff' : '#ff4d4f' }}>
                              Quantity: {sweet.quantity}
                            </Typography.Text>
                          </div>
                        </Space>
                      }
                    />
                  </Card>
                </Col>
              ))}
            </Row>
          )}

          {/* Delete Confirmation Modal */}
          <Modal
            title="Delete Sweet"
            open={deleteModal.open}
            onOk={handleDelete}
            onCancel={() => setDeleteModal({ open: false, sweet: null })}
            okText="Delete"
            okType="danger"
          >
            <p>Are you sure you want to delete "{deleteModal.sweet?.name}"?</p>
          </Modal>

          {/* Purchase Modal */}
          <Modal
            title={`Purchase ${purchaseModal.sweet?.name}`}
            open={purchaseModal.open}
            onCancel={() => setPurchaseModal({ open: false, sweet: null })}
            footer={null}
            width={600}
          >
            {purchaseModal.sweet && (() => {
              const sweet = purchaseModal.sweet;
              return (
                <Space direction="vertical" size="large" style={{ width: '100%' }}>
                  <div style={{ textAlign: 'center' }}>
                    <Image
                      src={getImagePath(sweet.name)}
                      alt={sweet.name}
                      style={{
                        width: '200px',
                        height: '150px',
                        objectFit: 'cover',
                        borderRadius: '8px'
                      }}
                      preview={false}
                    />
                  </div>
                  <Card size="small">
                    <Space direction="vertical" size="small">
                      <Title level={4}>{sweet.name}</Title>
                      <Typography.Text>{sweet.description}</Typography.Text>
                      <Tag color="blue">{sweet.category}</Tag>
                      <Typography.Text strong style={{ fontSize: '16px', color: '#52c41a' }}>
                        Price: Rs {sweet.price}
                      </Typography.Text>
                      <Typography.Text>
                        Available Quantity: {sweet.quantity}
                      </Typography.Text>
                    </Space>
                  </Card>
                  <Space>
                    <Typography.Text>Quantity to Purchase:</Typography.Text>
                    <InputNumber
                      min={1}
                      max={sweet.quantity}
                      value={purchaseQuantities.get(sweet.id) || 1}
                      onChange={(value) => handlePurchaseQuantityChange(sweet.id, value || 1)}
                      style={{ width: '100px' }}
                    />
                  </Space>
                  <Space style={{ width: '100%', justifyContent: 'flex-end' }}>
                    <Button onClick={() => setPurchaseModal({ open: false, sweet: null })}>
                      Cancel
                    </Button>
                    <Button
                      type="primary"
                      onClick={() => {
                        handlePurchase(sweet);
                        setPurchaseModal({ open: false, sweet: null });
                      }}
                      disabled={(purchaseQuantities.get(sweet.id) || 1) < 1 || (purchaseQuantities.get(sweet.id) || 1) > sweet.quantity}
                    >
                      Buy Now
                    </Button>
                  </Space>
                </Space>
              );
            })()}
          </Modal>
        </Space>
      </div>
    </div>
  );
};

export default SweetsList;
