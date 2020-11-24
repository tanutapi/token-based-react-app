import 'bootstrap/dist/css/bootstrap.min.css';
import { Button, Col, Container, Row, Spinner } from 'react-bootstrap';
import './App.css';
import AppTitle from './AppTitle';
import { v4 as uuidv4 } from 'uuid';
import { useEffect, useState } from 'react';
import TokenAndClientId from './TokenAndClientId';
import Login from './Login';

function App() {

  const [clientId, setClientId] = useState(localStorage.getItem('clientId'));
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [refreshToken, setRefreshToken] = useState(localStorage.getItem('refreshToken'));
  const [profile, setProfile] = useState({});
  const [fetchingProfileStatusCode, setFetchingProfileStatusCode] = useState(0);
  const [isFetchingProfile, setIsFachingProfile] = useState(false);

  function handleLogin(username, password) {
    const data = JSON.stringify({
      username,
      password,
      clientId,
    });
    console.log('Try to login with', data);
    fetch('/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: data,
    }).then((res) => res.json()).then((json) => {
      if (json && json.jwt && json.refresh) {
        setToken(json.jwt);
        setRefreshToken(json.refresh);
      } else if (json.err) {
        alert(json.err);
      }
    }).catch((err) => {
      console.error(err);
    });
  }

  function handleLogout(clearToken = true) {
    fetch('/auth/logout', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        'client-id': clientId,
      },
    }).then(res => {
      if (clearToken) {
        setToken('');
        setRefreshToken('');
      }
      alert('Done logging out from this client');
    }).catch(err => console.error);
  }

  function handleLogoutAll() {
    fetch('/auth/logout/all', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        'client-id': clientId,
      },
    }).then(res => {
      setToken('');
      setRefreshToken('');
      alert('Done logging out from all client');
    }).catch(err => console.error);
  }

  function handleFetchProfile() {
    setIsFachingProfile(true);
    setFetchingProfileStatusCode(0);
    setProfile({});
    fetch('/profile', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        'client-id': clientId,
      },
    }).then(res => {
      setFetchingProfileStatusCode(res.status);
      if (res.status === 200) {
        return res.json();
      } else {
        return res.text();
      }
    }).then(data => {
      setTimeout(() => {
        setIsFachingProfile(false);
        setProfile(data);
      }, 500);
    }).catch(err => {
      // console.error(err);
      setIsFachingProfile(false);
    });
  }

  function refreshNewToken() {
    console.log('Refreshing a new access token...');
    setFetchingProfileStatusCode(0);
    setProfile({});
    fetch('/auth/refresh', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        refreshToken: refreshToken,
      }),
    }).then(res => {
      if (res.status === 200) {
        return res.json();
      } else {
        return res.text();
      }
    }).then((json) => {
      console.log('Get new access token', json.jwt);
      if (json && json.jwt) {
        setToken(json.jwt);
      }
    }).catch(err => {
      console.log(err);
      setIsFachingProfile(false);
    });
  }

  if (!clientId) {
    console.log('Client ID was not set. Generating a new client ID and save its value into local storage.');
    const newClientId = uuidv4();
    localStorage.setItem('clientId', newClientId);
    setClientId(newClientId);
  }

  useEffect(() => {
    localStorage.setItem('clientId', clientId);
    localStorage.setItem('token', token ?? '');
    localStorage.setItem('refreshToken', refreshToken ?? '');
  });

  return (
    <div className="App">
      <Container>
        <AppTitle/>
        <TokenAndClientId 
          clientId={clientId} 
          onChangeClientId={newClientId => setClientId(newClientId)}
          token={token}
          onChangeToken={newToken => setToken(newToken)}
          refreshToken={refreshToken}
          onChangeRefreshToken={newToken => setRefreshToken(newToken)}
          onRefreshNewToken={() => refreshNewToken()}
        />
        <Login 
          token={token} 
          onLogin={handleLogin} 
          onLogout={handleLogout} 
          onLogoutAll={handleLogoutAll}
        />
        <Row className="mt-2">
          <Col>
            <Button variant="dark" onClick={() => {
              handleFetchProfile();
            }}>
              {isFetchingProfile ? (
                <Spinner animation="border" size="sm" />
              ) : (<></>)}
              Fetch user profile
            </Button>
          </Col>
          <Col>
            {
              isFetchingProfile ? (<div>Fetching...</div>) : (
                <>
                  {fetchingProfileStatusCode}
                  {' '}
                  {JSON.stringify(profile)}
                </>
              )
            }
          </Col>
        </Row>
      </Container>
    </div>
  );
}

export default App;
