
import React, { useEffect, useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import "../styles/profile.css";

const Profile = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    const fetchMyOrders = async () => {
      try {
        const res = await fetch('/api/orders/myorders', {
          headers: {
            Authorization: `Bearer ${user.token}`,
          },
        });

        const data = await res.json();

        if (res.ok) {
          setOrders(Array.isArray(data) ? data : []);
        } else {
          if (res.status === 401) {
            logout();
            navigate('/login');
          }

          setOrders([]);
        }
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchMyOrders();
  }, [user, navigate, logout]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (!user) return null;

  return (
    <div className="profile-container">
      <div className="profile-header">
        <div className="profile-info">
          <h2 className="profile-title">My Profile</h2>

          <p className="profile-detail">
            <strong>Name:</strong> {user.name}
          </p>

          <p className="profile-detail profile-email">
            <strong>Email:</strong> {user.email}
          </p>

          <span className="account-badge">
            Account Type: {user.role.toUpperCase()}
          </span>
        </div>

        <button
          onClick={handleLogout}
          className="btn logout-btn"
        >
          Logout
        </button>
      </div>

      <h3 className="orders-title">Order History</h3>

      {loading ? (
        <p className="loading-message">Fetching your orders...</p>
      ) : orders.length === 0 ? (
        <div className="empty-orders">
          <p className="empty-orders-text">
            You haven't placed any orders yet.
          </p>

          <Link to="/shop" className="btn">
            Start Shopping
          </Link>
        </div>
      ) : (
        <div className="orders-list">
          {orders.map((order) => (
            <div className="order-card" key={order._id}>
              <div className="order-details">
                <p className="order-text">
                  Order ID: <span>{order._id}</span>
                </p>

                <p className="order-text">
                  Placed On:{' '}
                  <span>
                    {new Date(order.createdAt).toLocaleDateString()}
                  </span>
                </p>

                <p className="order-text">
                  Total:{' '}
                  <strong className="order-total">
                    ₹{Number(order.totalAmount).toFixed(2)}
                  </strong>
                </p>
              </div>

              <div className="order-status-container">
                <span
                  className={`order-status ${
                    order.status === 'Delivered'
                      ? 'status-delivered'
                      : order.status === 'Shipped'
                      ? 'status-shipped'
                      : 'status-pending'
                  }`}
                >
                  {order.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Profile;
