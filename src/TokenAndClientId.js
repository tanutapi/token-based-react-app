import { Button, Form, Table } from "react-bootstrap";
import jwt from 'jsonwebtoken';
import { useEffect, useState } from "react";

function TokenAndClientId({clientId, token, refreshToken, onChangeClientId, onChangeToken, onChangeRefreshToken, onRefreshNewToken}) {

  const [jwtPayload, setJwtPayload] = useState('');
  const [expiredInSeconds, setExpiredInSeconds] = useState(0);

  function changeClientId() {
    const newClientId = prompt('Please enter a new Client ID');
    if (newClientId && onChangeClientId) {
      onChangeClientId(newClientId);
    }
  }

  function changeToken() {
    const newToken = prompt('Please enter a new JWT token');
    if (newToken && onChangeToken) {
      onChangeToken(newToken);
    }
  }

  function changeRefreshToken() {
    const newToken = prompt('Please enter a new JWT token');
    if (newToken && onChangeRefreshToken) {
      onChangeRefreshToken(newToken);
    }
  }

  useEffect(() => {
    setJwtPayload(jwt.decode(token) ?? null);
  }, [token]);

  useEffect(() => {
    const interval = setInterval(() => {
      if (jwtPayload) {
        setExpiredInSeconds(jwtPayload.exp - parseInt(Date.now() / 1000));
      } else {
        setExpiredInSeconds(0);
      }
    }, 1000);
    return function cleanup() {
      clearInterval(interval);
    }
  }, [jwtPayload]);

  return (
    <Table>
      <thead>
        <tr>
          <th></th>
          <th>Type</th>
          <th>Value</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>
            <Button block size="sm" onClick={changeClientId}>Override Client ID</Button>
          </td>
          <th>Client ID</th>
          <td>
            <label style={{color: 'darkorange'}}>{clientId}</label>
          </td>
        </tr>
        <tr>
          <td>
            <Button block size="sm" onClick={changeToken}>Override JWT Token</Button>
          </td>
          <th>JWT</th>
          <td>
            <Form.Control as="textarea" rows={4} value={token} onChange={() => {}} disabled />
            {JSON.stringify(jwtPayload)}
            <div className={ expiredInSeconds <= 0 ? 'text-danger' : '' }>
              Expired in: { expiredInSeconds } seconds.
            </div>
          </td>
        </tr>
        <tr>
          <td>
            <Button block size="sm" onClick={changeRefreshToken}>Override Refresh Token</Button>
          </td>
          <th>Refresh Token</th>
          <td>
            <label style={{color: 'darkblue'}}>{refreshToken}</label>
            {' '}
            <Button onClick={onRefreshNewToken}>Refresh a new token</Button>
          </td>
        </tr>
      </tbody>
    </Table>
  );
}

export default TokenAndClientId;