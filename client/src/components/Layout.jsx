import { Link, Outlet, useNavigate } from "react-router-dom";
import { Layout as AntLayout, Button, Dropdown, Space, Typography } from "antd";
import {
  BookOutlined,
  HomeOutlined,
  LoginOutlined,
  LogoutOutlined,
  PlusCircleOutlined,
  UserOutlined,
  DashboardOutlined
} from "@ant-design/icons";
import { useAuth } from "../context/AuthContext";

const { Header, Content, Footer } = AntLayout;
const { Text } = Typography;

const AppLayout = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const userMenu = {
    items: [
      {
        key: "dash",
        icon: <DashboardOutlined />,
        label: "Dashboard",
        onClick: () => navigate("/dashboard")
      },
      {
        key: "out",
        icon: <LogoutOutlined />,
        label: "Logout",
        onClick: () => {
          logout();
          navigate("/");
        }
      }
    ]
  };

  return (
    <AntLayout className="min-h-screen">
      <Header className="sticky top-0 z-50 flex items-center border-b border-slate-200/80 bg-white/90 px-4 shadow-sm backdrop-blur md:px-8">
        <Link to="/" className="mr-6 flex items-center gap-2 text-lg font-semibold text-brand-700">
          <BookOutlined className="text-xl" />
          <span className="hidden sm:inline">E-Book Store</span>
        </Link>
        <div className="flex flex-1 items-center justify-end gap-2">
          <Button type="text" icon={<HomeOutlined />} onClick={() => navigate("/")}>
            Home
          </Button>
          {isAuthenticated && (
            <>
              <Button type="text" icon={<PlusCircleOutlined />} onClick={() => navigate("/upload")}>
                Upload
              </Button>
            </>
          )}
          {isAuthenticated ? (
            <Dropdown menu={userMenu} placement="bottomRight">
              <Button type="primary" ghost icon={<UserOutlined />}>
                {user?.name || "Account"}
              </Button>
            </Dropdown>
          ) : (
            <Space>
              <Button icon={<LoginOutlined />} onClick={() => navigate("/login")}>
                Login
              </Button>
              <Button type="primary" onClick={() => navigate("/register")}>
                Register
              </Button>
            </Space>
          )}
        </div>
      </Header>
      <Content className="px-4 py-8 md:px-8">
        <div className="mx-auto max-w-6xl">
          <Outlet />
        </div>
      </Content>
      <Footer className="text-center text-slate-500">
        <Text type="secondary">E-Book Store — MERN · Vite · Stripe · Tailwind · Ant Design</Text>
      </Footer>
    </AntLayout>
  );
};

export default AppLayout;
