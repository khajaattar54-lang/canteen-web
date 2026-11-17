import { db } from './firebase.js';
import { collection, query, orderBy, onSnapshot, doc, updateDoc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

const list = document.getElementById('kitchenList');
const q = query(collection(db, 'orders'), orderBy('createdAt', 'asc'));

const NEXT_STATUS = {
  pending: 'preparing',
  preparing: 'ready',
  ready: 'collected'
};

onSnapshot(q, (snapshot) => {
  if (snapshot.empty) {
    list.innerHTML = '<div class="empty-state"><div class="emoji">🍳</div><p>No orders yet</p></div>';
    return;
  }
  list.innerHTML = '';
  snapshot.forEach(d => {
    const o = d.data();
    if (o.status === 'collected') return;
    const card = document.createElement('div');
    card.className = 'order-card';
    const next = NEXT_STATUS[o.status];
    
    // Added payment method display here
    card.innerHTML = `
      <div class="order-header">
        <div class="token">${o.token}</div>
        <span class="status-pill status-${o.status}">${o.status}</span>
      </div>
      <div style="font-size:14px;color:var(--muted);margin-bottom:8px;">
        ${o.studentName} · ${o.slot} · <span style="color:var(--accent); font-weight:600;">${o.paymentMethod || 'Cash'}</span>
      </div>
      <div style="font-size:14px;margin-bottom:12px;">
        ${o.items.map(i => `${i.name} × ${i.qty}`).join(', ')}
      </div>
      <button class="btn btn-primary">Mark ${next}</button>
    `;
    card.querySelector('button').addEventListener('click', async () => {
      await updateDoc(doc(db, 'orders', d.id), { status: next });
    });
    list.appendChild(card);
  });
});