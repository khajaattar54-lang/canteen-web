import { db } from './firebase.js';
import { collection, addDoc, getDocs, query, where, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

let cart = JSON.parse(localStorage.getItem('cart')) || [];
let selectedSlot = null;

const SLOTS = [
  { label: '12:00 – 12:15', capacity: 20 },
  { label: '12:15 – 12:30', capacity: 20 },
  { label: '12:30 – 12:45', capacity: 20 },
  { label: '12:45 – 1:00', capacity: 20 },
  { label: '1:00 – 1:15', capacity: 20 }
];

function renderCart() {
  const box = document.getElementById('cartItems');
  if (cart.length === 0) {
    box.innerHTML = '<div class="empty-state"><div class="emoji">🛒</div><p>Cart is empty</p></div>';
    return;
  }
  
  let total = 0;
  let html = cart.map((item, index) => {
    total += item.price * item.qty;
    return `
      <div style="display:flex; justify-content:space-between; align-items:center; padding:16px 0; border-bottom:1px solid rgba(255,255,255,0.06);">
        <div>
          <div style="font-weight:600; font-size:16px; margin-bottom:4px;">${item.name}</div>
          <div style="color:var(--accent); font-weight:600;">₹${item.price}</div>
        </div>
        <div style="display:flex; align-items:center; gap:12px;">
          <button onclick="updateQty(${index}, -1)" style="width:32px; height:32px; border-radius:8px; border:1px solid rgba(255,255,255,0.1); background:rgba(255,255,255,0.05); color:white; cursor:pointer; font-size:18px;">−</button>
          <span style="font-weight:600; width:20px; text-align:center;">${item.qty}</span>
          <button onclick="updateQty(${index}, 1)" style="width:32px; height:32px; border-radius:8px; border:1px solid rgba(255,255,255,0.1); background:rgba(255,255,255,0.05); color:white; cursor:pointer; font-size:18px;">+</button>
          <button onclick="removeItem(${index})" style="margin-left:8px; padding:8px 12px; border-radius:8px; border:none; background:rgba(239,68,68,0.15); color:#ef4444; cursor:pointer; font-weight:600; font-size:12px;">Remove</button>
        </div>
      </div>
    `;
  }).join('');

  html += `
    <div style="display:flex; justify-content:space-between; padding:24px 0; font-size:20px; font-weight:700; font-family:'Outfit'; border-bottom: 1px solid rgba(255,255,255,0.1);">
      <span>Total</span>
      <span style="color:var(--accent);">₹${total}</span>
    </div>
  `;

  box.innerHTML = html;
}

window.updateQty = function(index, change) {
  cart[index].qty += change;
  if (cart[index].qty <= 0) cart.splice(index, 1);
  localStorage.setItem('cart', JSON.stringify(cart));
  renderCart(); 
};

window.removeItem = function(index) {
  cart.splice(index, 1);
  localStorage.setItem('cart', JSON.stringify(cart));
  renderCart(); 
};

async function renderSlots() {
  const grid = document.getElementById('slotsGrid');
  grid.innerHTML = '';
  const today = new Date().toISOString().split('T')[0];
  const q = query(collection(db, 'orders'), where('date', '==', today));
  const snapshot = await getDocs(q);

  const counts = {};
  snapshot.forEach(doc => {
    const slot = doc.data().slot;
    counts[slot] = (counts[slot] || 0) + 1;
  });

  SLOTS.forEach(slot => {
    const used = counts[slot.label] || 0;
    const remaining = slot.capacity - used;
    const isFull = remaining <= 0;
    
    const card = document.createElement('div');
    card.className = `slot-card ${isFull ? 'full' : ''}`;
    card.innerHTML = `
      <div class="slot-label">${slot.label}</div>
      <div class="slot-capacity">${isFull ? 'Full' : remaining + ' left'}</div>
    `;
    
    if (!isFull) {
      card.addEventListener('click', () => {
        document.querySelectorAll('.slot-card').forEach(c => c.classList.remove('selected'));
        card.classList.add('selected');
        selectedSlot = slot.label;
      });
    }
    grid.appendChild(card);
  });
}

document.getElementById('confirmBtn').addEventListener('click', async () => {
  const name = document.getElementById('studentName').value.trim();
  if (!name) return alert('Please enter your name');
  if (!selectedSlot) return alert('Please pick a pickup slot');
  if (cart.length === 0) return alert('Your cart is empty!');

  const total = cart.reduce((s, i) => s + i.price * i.qty, 0);
  const token = '#' + Math.random().toString(36).substring(2, 6).toUpperCase();
  
  const paymentMethod = window.currentPayment || 'UPI';

  try {
    await addDoc(collection(db, 'orders'), {
      studentName: name,
      items: cart,
      total,
      slot: selectedSlot,
      token,
      status: 'pending',
      paymentMethod: paymentMethod,
      date: new Date().toISOString().split('T')[0],
      createdAt: serverTimestamp()
    });

    localStorage.removeItem('cart');
    cart = [];
    
    alert(`Order placed successfully!\nPayment: ${paymentMethod}\nYour token: ${token}`);
    window.location.href = 'orders.html';
    
  } catch (error) {
    console.error("Error adding document: ", error);
    alert("There was an error placing your order.");
  }
});

renderCart();
renderSlots();