import React, { useState, useEffect } from 'react';
import { Form, Input, Button, Card, message } from 'antd';
import { useTranslation } from 'react-i18next';
import { getApiKey, getApiSecret } from '../adaptor/biance/config';
import './styles/login.css';
import './styles/common.css';

interface LoginProps {
  onLogin: (apiKey: string, apiSecret: string) => void;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();

  // 设置表单默认值
  useEffect(() => {
    form.setFieldsValue({
      apiKey: getApiKey(),
      apiSecret: getApiSecret()
    });
  }, [form]);

  const handleSubmit = async (values: { apiKey: string; apiSecret: string }) => {
    setLoading(true);
    
    try {
      // 验证 API Key 和 Secret 格式（简单验证）
      if (!values.apiKey || !values.apiSecret) {
        message.error(t('login.invalidCredentials'));
        return;
      }

      // 存储到 localStorage
      localStorage.setItem('apiKey', values.apiKey);
      localStorage.setItem('apiSecret', values.apiSecret);

      // 调用登录回调
      onLogin(values.apiKey, values.apiSecret);
      
      message.success(t('login.success'));
    } catch (error: any) {
      message.error(t('login.failed') + ': ' + (error.message || '未知错误'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <Card className="login-card" title={t('login.title')}>
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          autoComplete="off"
        >
          <Form.Item
            label={t('login.apiKey')}
            name="apiKey"
            rules={[
              { required: true, message: t('login.apiKeyRequired') }
            ]}
          >
            <Input.Password
              placeholder={t('login.enterApiKey')}
              className="login-input"
            />
          </Form.Item>

          <Form.Item
            label={t('login.apiSecret')}
            name="apiSecret"
            rules={[
              { required: true, message: t('login.apiSecretRequired') }
            ]}
          >
            <Input.Password
              placeholder={t('login.enterApiSecret')}
              className="login-input"
            />
          </Form.Item>

          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              loading={loading}
              className="login-button"
              block
            >
              {t('login.connect')}
            </Button>
          </Form.Item>

          <Form.Item>
            <Button
              type="default"
              className="create-api-button"
              block
              onClick={() => window.open('https://testnet.binance.vision/', '_blank')}
            >
              {t('login.createNewCredentials')}
            </Button>
          </Form.Item>
        </Form>

        <div className="login-tips">
          <p>{t('login.tips')}</p>
        </div>
      </Card>
    </div>
  );
};

export default Login;

