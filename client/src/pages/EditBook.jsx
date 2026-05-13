import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button, Card, Form, Input, InputNumber, Modal, Spin, Switch, Typography } from "antd";
import { DeleteOutlined } from "@ant-design/icons";
import { toast } from "react-toastify";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";

const { Title, Paragraph } = Typography;

const EditBook = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const { data } = await api.get(`/api/books/${id}`);
        if (cancelled) return;
        const sellerId = data.seller?._id || data.seller;
        const uid = user?._id || user?.id;
        if (String(sellerId) !== String(uid)) {
          toast.error("You can only edit your own books");
          navigate(`/books/${id}`);
          return;
        }
        form.setFieldsValue({
          title: data.title,
          description: data.description,
          price: data.price,
          coverImageUrl: data.coverImageUrl,
          isPublished: data.isPublished
        });
      } catch (e) {
        toast.error(e.message);
        navigate("/dashboard");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [id, form, navigate, user]);

  const onFinish = async (values) => {
    setSaving(true);
    try {
      await api.put(`/api/books/${id}`, values);
      toast.success("Book updated");
      navigate(`/books/${id}`);
    } catch (e) {
      toast.error(e.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = () => {
    Modal.confirm({
      title: "Delete this book?",
      content: "This cannot be undone.",
      okText: "Delete",
      okButtonProps: { danger: true },
      onOk: async () => {
        try {
          await api.delete(`/api/books/${id}`);
          toast.success("Book deleted");
          navigate("/dashboard");
        } catch (e) {
          toast.error(e.message);
        }
      }
    });
  };

  if (loading) {
    return (
      <div className="flex justify-center py-24">
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl">
      <Title level={3}>Edit book</Title>
      <Paragraph type="secondary">Update listing details. To replace the PDF, upload a new listing or contact support.</Paragraph>
      <Card>
        <Form form={form} layout="vertical" onFinish={onFinish}>
          <Form.Item name="title" label="Title" rules={[{ required: true }]}>
            <Input size="large" />
          </Form.Item>
          <Form.Item name="description" label="Description">
            <Input.TextArea rows={4} />
          </Form.Item>
          <Form.Item name="price" label="Price (USD)" rules={[{ required: true }]}>
            <InputNumber min={0.5} step={0.01} className="w-full" size="large" />
          </Form.Item>
          <Form.Item name="coverImageUrl" label="Cover image URL">
            <Input placeholder="https://..." />
          </Form.Item>
          <Form.Item name="isPublished" label="Published" valuePropName="checked">
            <Switch checkedChildren="Live" unCheckedChildren="Draft" />
          </Form.Item>
          <div className="flex flex-wrap gap-3">
            <Button type="primary" htmlType="submit" loading={saving}>
              Save changes
            </Button>
            <Button danger icon={<DeleteOutlined />} onClick={handleDelete}>
              Delete book
            </Button>
          </div>
        </Form>
      </Card>
    </div>
  );
};

export default EditBook;
