import { db } from './firebase.js';
import { collection, query, orderBy, onSnapshot, doc, updateDoc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

const list = document.getElementById('ordersList');
const q = query(collection(db, 'orders'), orderBy('createdAt', 'desc'));

// Helper function to generate the timeline HTML
function getTimelineHTML(status) {
  if (status === 'cancelled') {
    return `<div style="color: #ef4444; font-weight: 600; text-align: center; padding: 16px; background: rgba(239,68,68,0.1); border-radius: 12px; margin-top: 16px;">Order Cancelled</div>`;
  }

  const steps = [
    { id: 'pending', label: 'Placed' },
    { id: 'preparing', label: 'Preparing' },
    { id: 'ready', label: 'Ready' },
    { id: 'collected', label: 'Collected' }
  ];

  const currentIndex = steps.findIndex(s => s.id === status);

  // We use CSS Grid to perfectly space the timeline steps
  let html = `<div style="display: grid; grid-template-columns: repeat(4, 1fr); margin-top: 24px; padding: 16px 0; position: relative;">`;

  // Draw the background line
  html += `<div style="position: absolute; top: 32px; left: 12.5%; right: 12.5%; height: 2px; background: rgba(255,255,255,0.1); z-index: 1;"></div>`;
  
  // Draw the active orange progress line
  if (currentIndex > 0) {
    // Calculate width based on how many steps are completed (out of 3 gaps)
    const progressWidth = (currentIndex / (steps.length - 1)) * 75; // 75% is the distance between first and last circle
    html += `<div style="position: absolute; top: 32px; left: 12.5%; width: ${progressWidth}%; height: 2px; background: var(--accent); z-index: 2; transition: width 0.5s ease;"></div>`;
  }

  // Draw the circles and text
  steps.forEach((step, index) => {
    const isActive = index <= currentIndex;
    const isCurrent = index === currentIndex;
    
    const bgColor = isActive ? 'var(--accent)' : 'var(--card)';
    const textColor = isActive ? '#fff' : 'var(--muted)';
    const borderColor = isCurrent ? '#fff' : (isActive ? 'var(--accent)' : 'rgba(255,255,255,0.2)');
    const boxShadow = isCurrent ? '0 0 15px var(--accent-glow)' : 'none';

    html += `
      <div style="display: flex; flex-direction: column; align-items: center; z-index: 3;">
        <!-- The Circle -->
        <div style="width: 32px; height: 32px; border-radius: 50%; background: ${bgColor}; border: 2px solid ${borderColor}; display: flex; justify-content: center; align-items: center; font-size: 14px; font-weight: 700; color: white; box-shadow: ${boxShadow}; transition: all 0.3s ease;">
          ${index + 1}
        </div>
        <!-- The Label -->
        <div style="font-size: 12px; margin-top: 12px; color: ${textColor}; font-weight: ${isCurrent ? '700' : '500'}; text-align: center; font-family: 'Inter';">
          ${step.label}
        </div>
      </div>
    `;
  });

  html += `</div>`;
  return html;
}

onSnapshot(q, (snapshot) => {
  if (snapshot.empty) {
    list.innerHTML = '<div class="empty-state"><div class="emoji">📋</div><p>No orders yet. Go to the Menu to order!</p></div>';
    return;
  }
  
  list.innerHTML = '';
  snapshot.forEach(d => {
    const o = d.data();
    const card = document.createElement('div');
    card.className = 'order-card';
    
    const itemsList = o.items.map(i => `${i.name} × ${i.qty}`).join(', ');
    const payment = o.paymentMethod || 'Cash';

    // Show the cancel button ONLY if the order is still pending
    const cancelBtnHtml = o.status === 'pending' 
      ? `<button class="cancel-btn" data-id="${d.id}" style="margin-top: 16px; width: 100%; padding: 10px; border-radius: 8px; border: 1px solid rgba(239,68,68,0.3); background: rgba(239,68,68,0.1); color: #ef4444; font-weight: 600; cursor: pointer; transition: 0.3s;">Cancel Order</button>` 
      : '';

    card.innerHTML = `
      <div class="order-header">
        <div class="token">${o.token}</div>
        <span style="font-size: 12px; color: var(--muted);">${new Date(o.createdAt?.toDate() || Date.now()).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</span>
      </div>
      
      <div style="font-size:14px; color:var(--muted); margin-bottom:8px;">
        ${o.studentName} · ${o.slot} · <span style="color:var(--accent); font-weight:600;">${payment}</span>
      </div>
      
      <div style="font-size:14px; margin-bottom: 12px;">
        ${itemsList}
      </div>
      
      <div style="display: flex; justify-content: space-between; align-items: center; border-top: 1px solid rgba(255,255,255,0.1); padding-top: 12px;">
        <span style="font-size: 12px; color: var(--muted);">Total Paid</span>
        <span style="font-weight:700; color:var(--accent); font-size: 18px;">₹${o.total}</span>
      </div>

      <!-- The Tracking Timeline -->
      ${getTimelineHTML(o.status)}
      
      ${cancelBtnHtml}
    `;
    list.appendChild(card);
  });

  // Add event listeners to all Cancel buttons
  document.querySelectorAll('.cancel-btn').forEach(btn => {
    btn.addEventListener('click', async (e) => {
      const orderId = e.target.getAttribute('data-id');
      const confirmCancel = confirm("Are you sure you want to cancel this order?");
      
      if (confirmCancel) {
        try {
          await updateDoc(doc(db, 'orders', orderId), { status: 'cancelled' });
        } catch (error) {
          console.error("Error cancelling order: ", error);
          alert("Failed to cancel order.");
        }
      }
    });
  });
});