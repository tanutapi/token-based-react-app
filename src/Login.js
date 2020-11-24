import { Form, Button, Col } from 'react-bootstrap';
import jwt from 'jsonwebtoken';
import { useState } from 'react';

function Login({ token, onLogout, onLogin, onLogoutAll }) {
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('password');

  const payload = jwt.decode(token);

  return token && payload ? (
    <div>
      <Button variant="light" onClick={() => onLogout()}>
        Welcome {payload.sub}!, Logout
      </Button>
      <Button variant="light" className="ml-2" onClick={() => onLogout(false)}>
        Logout but keep token
      </Button>
      <Button variant="warning" className="ml-2" onClick={() => onLogoutAll()}>
        Logout from all clients!
      </Button>
    </div>
  ) : (
    <div>
      <Form>
        <Form.Row>
          <Col>
            <Form.Control 
              type="text" 
              placeholder="Please enter your username"
              value={username}
              onChange={(event) => setUsername(event.target.value)}
            />
          </Col>
          <Col>
            <Form.Control 
              type="password" 
              placeholder="Please enter your password" 
              value={password}
              onChange={(event) => setPassword(event.target.value)}
            />
          </Col>
          <Col>
            <Button onClick={() => onLogin(username, password)}>Login</Button>
          </Col>
        </Form.Row>
      </Form>
    </div>
  );
}

export default Login;