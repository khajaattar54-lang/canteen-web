document.addEventListener('DOMContentLoaded', () => {
  const role = sessionStorage.getItem('userRole');
  const user = sessionStorage.getItem('loggedInUser');
  
  if (!user) return; 

  const navContainer = document.querySelector('.nav-links');
  if (!navContainer) return; 

  let links = '';

  if (role === 'staff') {
    links = `
      <a href="admin.html" style="${window.location.pathname.includes('admin') ? 'color: var(--accent);' : ''}">Dashboard</a>
      <a href="kitchen.html" style="${window.location.pathname.includes('kitchen') ? 'color: var(--accent);' : ''}">Live Orders</a>
      <a href="forecast.html" style="${window.location.pathname.includes('forecast') ? 'color: var(--accent);' : ''}">Forecast</a>
      <a href="index.html" style="color: #22c55e; margin-left: 20px; border-left: 1px solid rgba(255,255,255,0.1); padding-left: 20px;">Student View</a>
      <a href="#" id="logoutBtn" style="color: var(--danger); margin-left: 24px; font-weight: 600;">Logout (${user})</a>
    `;
  } else {
    links = `
      <a href="index.html" style="${window.location.pathname.includes('index') ? 'color: var(--accent);' : ''}">Menu</a>
      <a href="checkout.html" style="${window.location.pathname.includes('checkout') ? 'color: var(--accent);' : ''}">Cart 🛒</a>
      <a href="tables.html" style="${window.location.pathname.includes('tables') ? 'color: var(--accent);' : ''}">Book Table</a>
      <a href="orders.html" style="${window.location.pathname.includes('orders') ? 'color: var(--accent);' : ''}">My Orders</a>
      <a href="reviews.html" style="${window.location.pathname.includes('reviews') ? 'color: var(--accent);' : ''}">Reviews</a>
      <a href="lostfound.html" style="${window.location.pathname.includes('lostfound') ? 'color: var(--accent);' : ''}">Lost & Found</a>
      <a href="#" id="logoutBtn" style="color: var(--danger); margin-left: 24px; font-weight: 600;">Logout (${user})</a>
    `;
  }

  navContainer.innerHTML = links;

  document.getElementById('logoutBtn')?.addEventListener('click', (e) => {
    e.preventDefault(); 
    sessionStorage.removeItem('loggedInUser'); 
    sessionStorage.removeItem('userRole');
    window.location.href = 'login.html';
  });
});