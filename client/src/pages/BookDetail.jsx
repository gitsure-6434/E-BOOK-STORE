import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Button,
  Card,
  Descriptions,
  Space,
  Spin,
  Tag,
  Typography,
  Image,
  Alert
} from "antd";
import { BookOutlined, EditOutlined, ShoppingCartOutlined } from "@ant-design/icons";
import { toast } from "react-toastify";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";
import { assetUrl } from "../utils/url";

const { Title, Paragraph, Text } = Typography;

const BookDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const [book, setBook] = useState(null);
  const [loading, setLoading] = useState(true);
  const [buying, setBuying] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const { data } = await api.get(`/api/books/${id}`);
        if (!cancelled) setBook(data);
      } catch (e) {
        if (!cancelled) {
          toast.error(e.message);
          setBook(null);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [id]);

  const sellerId = book?.seller?._id || book?.seller;
  const isOwner = user && sellerId && String(sellerId) === String(user._id || user.id);

  const handleBuy = async () => {
    if (!isAuthenticated) {
      toast.info("Please login to purchase");
      navigate("/login", { state: { from: { pathname: `/books/${id}` } } });
      return;
    }
    setBuying(true);
    try {
      const { data } = await api.post("/api/stripe/create-checkout-session", { bookId: id });
      if (data.url) {
        window.location.href = data.url;
      } else {
        toast.error("No checkout URL returned");
      }
    } catch (e) {
      toast.error(e.message);
    } finally {
      setBuying(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-24">
        <Spin size="large" />
      </div>
    );
  }

  if (!book) {
    return <Alert type="error" message="Book not found" showIcon />;
  }

  return (
    <div className="grid gap-8 lg:grid-cols-3">
      <div className="lg:col-span-1">
        <Card className="overflow-hidden shadow-md">
          {book.coverImageUrl ? (
            <Image
              alt={book.title}
              src={assetUrl(book.coverImageUrl)}
              className="w-full object-cover"
              style={{ maxHeight: 360 }}
            />
          ) : (
            <div className="flex aspect-[3/4] max-h-80 items-center justify-center bg-gradient-to-br from-brand-100 to-slate-100">
              <BookOutlined className="text-8xl text-brand-500/60" />
            </div>
          )}
        </Card>
      </div>
      <div className="lg:col-span-2">
        <Space direction="vertical" size="large" className="w-full">
          <div>
            <Title level={2} className="!mb-2 !text-brand-900">
              {book.title}
            </Title>
            <Space wrap>
              <Tag color="geekblue">${Number(book.price).toFixed(2)} USD</Tag>
              {book.isPublished === false && <Tag color="orange">Draft</Tag>}
              <Text type="secondary">Seller: {book.seller?.name || "Unknown"}</Text>
            </Space>
          </div>
          <Paragraph className="whitespace-pre-wrap text-base text-slate-700">
            {book.description || "No description provided."}
          </Paragraph>
          {book.pdfUrl && (
            <Text type="secondary">
              PDF is attached to this listing. After purchase, find the download link in your dashboard purchase
              history (open the PDF URL from the book record).
            </Text>
          )}
          <Space wrap>
            {isOwner && (
              <Button type="default" icon={<EditOutlined />} onClick={() => navigate(`/books/${id}/edit`)}>
                Edit listing
              </Button>
            )}
            {!isOwner && book.isPublished && (
              <Button type="primary" size="large" icon={<ShoppingCartOutlined />} loading={buying} onClick={handleBuy}>
                Buy with Stripe
              </Button>
            )}
            {isOwner && (
              <Button type="link" onClick={() => navigate("/dashboard")}>
                Manage in dashboard
              </Button>
            )}
          </Space>
          <Descriptions bordered size="small" column={1}>
            <Descriptions.Item label="Listed">{new Date(book.createdAt).toLocaleString()}</Descriptions.Item>
            {book.pdfUrl && (
              <Descriptions.Item label="Sample / PDF path">
                <a href={assetUrl(book.pdfUrl)} target="_blank" rel="noreferrer">
                  Open PDF (preview)
                </a>
              </Descriptions.Item>
            )}
          </Descriptions>
        </Space>
      </div>
    </div>
  );
};

export default BookDetail;
