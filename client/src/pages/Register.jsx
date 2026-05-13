import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button, Card, Form, Input, Typography } from "antd";
import { toast } from "react-toastify";
import { useAuth } from "../context/AuthContext";

const { Title, Text } = Typography;

const Register = () => {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const onFinish = async (values) => {
    setLoading(true);
    try {
      await register(values.name, values.email, values.password);
      toast.success("Account created!");
      navigate("/", { replace: true });
    } catch (e) {
      toast.error(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-md pt-8">
      <Card className="shadow-lg">
        <Title level={3} className="!text-center">
          Create account
        </Title>
        <Form layout="vertical" onFinish={onFinish} requiredMark={false}>
          <Form.Item name="name" label="Name" rules={[{ required: true }]}>
            <Input size="large" placeholder="Your name" />
          </Form.Item>
          <Form.Item name="email" label="Email" rules={[{ required: true, type: "email" }]}>
            <Input size="large" placeholder="you@example.com" />
          </Form.Item>
          <Form.Item name="password" label="Password" rules={[{ required: true, min: 6 }]}>
            <Input.Password size="large" />
          </Form.Item>
          <Button type="primary" htmlType="submit" block size="large" loading={loading}>
            Register
          </Button>
        </Form>
        <div className="mt-4 text-center">
          <Text type="secondary">Already have an account? </Text>
          <Link to="/login">Login</Link>
        </div>
      </Card>
    </div>
  );
};

export default Register;
