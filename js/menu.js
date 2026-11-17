import { db } from './firebase.js';
import { collection, getDocs } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

let cart = JSON.parse(localStorage.getItem('cart')) || [];

async function loadMenu() {
  const grid = document.getElementById('menuGrid');
  const snapshot = await getDocs(collection(db, 'menu_items'));

  if (snapshot.empty) {
    grid.innerHTML = '<div class="empty-state"><div class="emoji">🍽️</div><p>No items yet.</p></div>';
    return;
  }

  grid.innerHTML = '';
  snapshot.forEach(doc => {
    const item = doc.data();
    const card = document.createElement('div');
    card.className = 'menu-card';
    card.innerHTML = `
      <img src="${item.image || 'https://via.placeholder.com/400x300/2a2a36/8a8a99?text=Food'}" alt="${item.name}">
      <div class="card-body">
        <h3>${item.name}</h3>
        <div class="price">₹${item.price}</div>
        <button class="add-btn" ${!item.available ? 'disabled' : ''}>
          ${item.available ? '+ Add to Cart' : 'Unavailable'}
        </button>
      </div>
    `;
    card.querySelector('.add-btn').addEventListener('click', () => addToCart(item));
    grid.appendChild(card);
  });
}

function addToCart(item) {
  const existing = cart.find(c => c.name === item.name);
  if (existing) existing.qty++;
  else cart.push({ name: item.name, price: item.price, qty: 1 });
  
  localStorage.setItem('cart', JSON.stringify(cart));
  
  // Show the toast notification instead of redirecting
  showToast(`${item.name} added to cart!`);
}

// Function to create the aesthetic toast notification
function showToast(message) {
  // Check if toast already exists, if so, remove it
  const existingToast = document.getElementById('custom-toast');
  if (existingToast) existingToast.remove();

  const toast = document.createElement('div');
  toast.id = 'custom-toast';
  toast.innerText = message;
  
  // Styling the toast
  toast.style.position = 'fixed';
  toast.style.bottom = '30px';
  toast.style.right = '30px';
  toast.style.background = 'linear-gradient(135deg, #f97316, #ea580c)';
  toast.style.color = 'white';
  toast.style.padding = '16px 24px';
  toast.style.borderRadius = '12px';
  toast.style.fontWeight = '600';
  toast.style.fontFamily = "'Inter', sans-serif";
  toast.style.boxShadow = '0 10px 30px rgba(249, 115, 22, 0.4)';
  toast.style.zIndex = '1000';
  toast.style.transition = 'opacity 0.3s ease';
  toast.style.opacity = '0';

  document.body.appendChild(toast);

  // Fade in
  setTimeout(() => { toast.style.opacity = '1'; }, 10);

  // Fade out and remove after 2 seconds
  setTimeout(() => {
    toast.style.opacity = '0';
    setTimeout(() => toast.remove(), 300);
  }, 2000);
}

loadMenu();