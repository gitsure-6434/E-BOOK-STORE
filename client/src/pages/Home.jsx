import { useEffect } from "react";
import { Link } from "react-router-dom";
import { Card, Col, Empty, Row, Spin, Tag, Typography } from "antd";
import { BookOutlined } from "@ant-design/icons";
import { useBooks } from "../context/BookContext";
import { assetUrl } from "../utils/url";

const { Title, Paragraph, Text } = Typography;

const Home = () => {
  const { books, loading, refreshBooks } = useBooks();

  useEffect(() => {
    refreshBooks();
  }, [refreshBooks]);

  if (loading && books.length === 0) {
    return (
      <div className="flex justify-center py-24">
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div>
      <div className="mb-10 text-center">
        <Title level={2} className="!mb-2 !text-brand-900">
          Discover e-books
        </Title>
        <Paragraph className="mx-auto max-w-2xl text-slate-600">
          Browse PDF books from independent sellers. Create an account to upload your own or purchase with secure
          Stripe Checkout.
        </Paragraph>
      </div>

      {!books.length ? (
        <Empty description="No books listed yet. Be the first to upload!" />
      ) : (
        <Row gutter={[20, 20]}>
          {books.map((book) => (
            <Col xs={24} sm={12} lg={8} key={book._id}>
              <Link to={`/books/${book._id}`}>
                <Card
                  hoverable
                  className="h-full overflow-hidden border-slate-200/80 shadow-md transition-shadow hover:shadow-lg"
                  cover={
                    book.coverImageUrl ? (
                      <div className="h-44 overflow-hidden bg-slate-100">
                        <img
                          alt={book.title}
                          src={assetUrl(book.coverImageUrl)}
                          className="h-full w-full object-cover"
                        />
                      </div>
                    ) : (
                      <div className="flex h-44 items-center justify-center bg-gradient-to-br from-brand-100 to-slate-100">
                        <BookOutlined className="text-5xl text-brand-600/80" />
                      </div>
                    )
                  }
                >
                  <Card.Meta
                    title={<span className="line-clamp-1 text-brand-900">{book.title}</span>}
                    description={
                      <div>
                        <Paragraph ellipsis={{ rows: 2 }} className="!mb-2 !text-slate-600">
                          {book.description || "No description"}
                        </Paragraph>
                        <div className="flex items-center justify-between">
                          <Text strong className="text-lg text-brand-700">
                            ${Number(book.price).toFixed(2)}
                          </Text>
                          <Tag color="blue">{book.seller?.name || "Seller"}</Tag>
                        </div>
                      </div>
                    }
                  />
                </Card>
              </Link>
            </Col>
          ))}
        </Row>
      )}
    </div>
  );
};

export default Home;
