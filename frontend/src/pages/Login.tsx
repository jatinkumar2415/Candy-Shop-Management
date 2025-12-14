import React, { useState } from 'react';
import { Form, Input, Button, Card, Typography, Space, message } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import type { UserLogin } from '../types/models';

const { Title } = Typography;

const Login: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const onFinish = async (values: UserLogin) => {
    setLoading(true);
    try {
      await login(values);
      message.success('Login successful!');
      navigate('/');
    } catch (error) {
      // Error handled in context
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ 
      minHeight: '100vh', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
    }}>
      <Card 
        style={{ 
          width: 400, 
          boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
          borderRadius: '12px',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
        }}
        hoverable
      >
        <Space direction="vertical" size="large" style={{ width: '100%', textAlign: 'center',background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
          <Title level={2} style={{ margin: 0, color: '#1890ff' }}>Login</Title>
          <Form
            name="login"
            onFinish={onFinish}
            autoComplete="off"
            layout="vertical"
          >
            <Form.Item
              name="email"
              rules={[{ required: true, message: 'Please input your email!' }, { type: 'email', message: 'Please enter a valid email!' }]}
            >
              <Input 
                prefix={<UserOutlined />} 
                placeholder="Email Address" 
                size="large"
                style={{ borderRadius: '8px' }}
              />
            </Form.Item>

            <Form.Item
              name="password"
              rules={[{ required: true, message: 'Please input your password!' }]}
            >
              <Input.Password
                prefix={<LockOutlined />}
                placeholder="Password"
                size="large"
                style={{ borderRadius: '8px' }}
              />
            </Form.Item>

            <Form.Item>
              <Button 
                type="primary" 
                htmlType="submit" 
                loading={loading}
                size="large"
                block
                style={{ 
                  borderRadius: '8px',
                  height: '48px',
                  fontSize: '16px',
                  fontWeight: 'bold'
                }}
              >
                Sign In
              </Button>
            </Form.Item>
          </Form>

          <div>
            <Link to="/register" style={{ color: '#1890ff', textDecoration: 'none' }}>
              Don't have an account? Sign Up
            </Link>
          </div>
        </Space>
      </Card>
    </div>
  );
};

export default Login;
