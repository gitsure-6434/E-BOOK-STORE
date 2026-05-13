import { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { Alert, Button, Card, Descriptions, Spin, Typography } from "antd";
import { CheckCircleOutlined } from "@ant-design/icons";
import api from "../services/api";

const { Title, Paragraph } = Typography;

const PurchaseSuccess = () => {
  const [params] = useSearchParams();
  const sessionId = params.get("session_id");
  const [data, setData] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!sessionId) {
      setError("Missing session_id");
      setLoading(false);
      return;
    }
    (async () => {
      try {
        const { data: res } = await api.get("/api/stripe/receipt", { params: { session_id: sessionId } });
        setData(res);
      } catch (e) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    })();
  }, [sessionId]);

  if (loading) {
    return (
      <div className="flex justify-center py-24">
        <Spin size="large" />
      </div>
    );
  }

  if (error) {
    return <Alert type="error" message={error} showIcon />;
  }

  return (
    <Card className="max-w-xl mx-auto shadow-lg">
      <CheckCircleOutlined className="mb-4 text-5xl text-green-500" />
      <Title level={3}>Thank you for your purchase</Title>
      <Paragraph type="secondary">Your payment was processed by Stripe.</Paragraph>
      <Descriptions bordered column={1} size="small" className="mt-4">
        <Descriptions.Item label="Payment status">{data?.paymentStatus}</Descriptions.Item>
        <Descriptions.Item label="Book">{data?.bookTitle}</Descriptions.Item>
        <Descriptions.Item label="Amount">
          {data?.amountTotal != null ? `$${Number(data.amountTotal).toFixed(2)} ${(data.currency || "").toUpperCase()}` : "—"}
        </Descriptions.Item>
      </Descriptions>
      <div className="mt-6 flex flex-wrap gap-3">
        <Link to="/dashboard">
          <Button type="primary">Go to dashboard</Button>
        </Link>
        <Link to="/">
          <Button>Continue shopping</Button>
        </Link>
      </div>
    </Card>
  );
};

export default PurchaseSuccess;
