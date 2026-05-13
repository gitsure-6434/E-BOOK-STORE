import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Card, Table, Tabs, Tag, Typography, Empty, Button } from "antd";
import { EditOutlined } from "@ant-design/icons";
import { toast } from "react-toastify";
import api from "../services/api";
import { assetUrl } from "../utils/url";

const { Title, Paragraph } = Typography;

const Dashboard = () => {
  const [myBooks, setMyBooks] = useState([]);
  const [purchases, setPurchases] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const [bRes, pRes] = await Promise.all([api.get("/api/books/my"), api.get("/api/transactions/my")]);
      setMyBooks(bRes.data || []);
      setPurchases(pRes.data || []);
    } catch (e) {
      toast.error(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const bookColumns = [
    { title: "Title", dataIndex: "title", key: "title" },
    {
      title: "Price",
      dataIndex: "price",
      key: "price",
      render: (p) => `$${Number(p).toFixed(2)}`
    },
    {
      title: "Status",
      dataIndex: "isPublished",
      key: "isPublished",
      render: (pub) => (pub ? <Tag color="green">Live</Tag> : <Tag color="orange">Draft</Tag>)
    },
    {
      title: "Actions",
      key: "actions",
      render: (_, record) => (
        <Link to={`/books/${record._id}/edit`}>
          <Button type="link" icon={<EditOutlined />} size="small">
            Edit
          </Button>
        </Link>
      )
    }
  ];

  const purchaseColumns = [
    {
      title: "Book",
      key: "book",
      render: (_, row) => row.book?.title || "—"
    },
    {
      title: "Amount",
      key: "amount",
      render: (_, row) => `$${Number(row.amount).toFixed(2)}`
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (s) => <Tag color={s === "completed" ? "green" : s === "pending" ? "gold" : "default"}>{s}</Tag>
    },
    {
      title: "PDF",
      key: "pdf",
      render: (_, row) =>
        row.book?.pdfUrl ? (
          <a href={assetUrl(row.book.pdfUrl)} target="_blank" rel="noreferrer">
            Download
          </a>
        ) : (
          "—"
        )
    }
  ];

  return (
    <div>
      <Title level={2}>Dashboard</Title>
      <Paragraph type="secondary">Manage your listings and view purchase receipts.</Paragraph>

      <Tabs
        defaultActiveKey="books"
        items={[
          {
            key: "books",
            label: "My books",
            children: myBooks.length ? (
              <Card>
                <Table rowKey="_id" loading={loading} dataSource={myBooks} columns={bookColumns} pagination={false} />
              </Card>
            ) : (
              <Empty description="No books yet">
                <Link to="/upload">
                  <Button type="primary">Upload a book</Button>
                </Link>
              </Empty>
            )
          },
          {
            key: "purchases",
            label: "Purchase history",
            children: purchases.length ? (
              <Card>
                <Table
                  rowKey="_id"
                  loading={loading}
                  dataSource={purchases}
                  columns={purchaseColumns}
                  pagination={{ pageSize: 8 }}
                />
              </Card>
            ) : (
              <Empty description="No purchases yet" />
            )
          }
        ]}
      />
    </div>
  );
};

export default Dashboard;
