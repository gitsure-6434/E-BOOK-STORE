import { Link } from "react-router-dom";
import { Button, Result } from "antd";

const NotFound = () => (
  <Result
    status="404"
    title="404"
    subTitle="Sorry, the page you visited does not exist."
    extra={
      <Link to="/">
        <Button type="primary">Back home</Button>
      </Link>
    }
  />
);

export default NotFound;
