import { useCallback, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDropzone } from "react-dropzone";
import { Button, Card, Form, Input, InputNumber, Switch, Typography } from "antd";
import { InboxOutlined } from "@ant-design/icons";
import { toast } from "react-toastify";
import api from "../services/api";

const { Title, Paragraph } = Typography;

const UploadBook = () => {
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);

  const onDrop = useCallback((accepted) => {
    if (accepted?.[0]) {
      setFile(accepted[0]);
      toast.success(`Selected: ${accepted[0].name}`);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "application/pdf": [".pdf"] },
    maxFiles: 1,
    multiple: false
  });

  const onFinish = async (values) => {
    if (!file) {
      toast.error("Please drop a PDF file");
      return;
    }
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("pdf", file);
      const uploadRes = await api.post("/api/books/upload", fd);
      const pdfUrl = uploadRes.data.pdfUrl;
      await api.post("/api/books", {
        title: values.title,
        description: values.description || "",
        price: values.price,
        pdfUrl,
        coverImageUrl: values.coverImageUrl || "",
        isPublished: values.isPublished !== false
      });
      toast.success("Book listed successfully!");
      navigate("/dashboard");
    } catch (e) {
      toast.error(e.message);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="mx-auto max-w-2xl">
      <Title level={3}>Upload a book</Title>
      <Paragraph type="secondary">PDF is required. Optional cover image URL for the storefront card.</Paragraph>

      <Card className="mb-6 border-dashed border-2 border-brand-200 bg-brand-50/50">
        <div
          {...getRootProps()}
          className={`cursor-pointer rounded-lg border-2 border-dashed p-10 text-center transition-colors ${
            isDragActive ? "border-brand-500 bg-white" : "border-slate-300"
          }`}
        >
          <input {...getInputProps()} />
          <InboxOutlined className="mb-2 text-4xl text-brand-500" />
          <p className="text-slate-700">{isDragActive ? "Drop the PDF here" : "Drag & drop your PDF, or click to select"}</p>
          {file && <p className="mt-2 font-medium text-brand-800">{file.name}</p>}
        </div>
      </Card>

      <Card>
        <Form form={form} layout="vertical" onFinish={onFinish} initialValues={{ isPublished: true, price: 9.99 }}>
          <Form.Item name="title" label="Title" rules={[{ required: true }]}>
            <Input placeholder="Book title" size="large" />
          </Form.Item>
          <Form.Item name="description" label="Description">
            <Input.TextArea rows={4} placeholder="What is this book about?" />
          </Form.Item>
          <Form.Item name="price" label="Price (USD)" rules={[{ required: true }]}>
            <InputNumber min={0.5} step={0.01} className="w-full" size="large" />
          </Form.Item>
          <Form.Item name="coverImageUrl" label="Cover image URL (optional)">
            <Input placeholder="https://...  (shown on listing cards)" />
          </Form.Item>
          <Form.Item name="isPublished" label="Published" valuePropName="checked">
            <Switch checkedChildren="Live" unCheckedChildren="Draft" />
          </Form.Item>
          <Button type="primary" htmlType="submit" size="large" block loading={uploading}>
            Upload PDF & publish listing
          </Button>
        </Form>
      </Card>
    </div>
  );
};

export default UploadBook;
