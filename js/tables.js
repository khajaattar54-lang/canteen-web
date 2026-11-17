import { db } from './firebase.js';
import { collection, addDoc, getDocs, query, orderBy, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

const bookingsList = document.getElementById('bookingsList');
const submitBtn = document.getElementById('submitBookingBtn');

// Load bookings from Firebase
async function loadBookings() {
  bookingsList.innerHTML = '<p style="color:var(--muted);">Loading reservations...</p>';
  
  try {
    const q = query(collection(db, 'table_bookings'), orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);

    if (snapshot.empty) {
      bookingsList.innerHTML = '<div class="empty-state" style="padding: 40px 0;"><div class="emoji" style="font-size: 40px;">🪑</div><p>No tables booked yet.</p></div>';
      return;
    }

    bookingsList.innerHTML = '';
    snapshot.forEach(doc => {
      const b = doc.data();
      const card = document.createElement('div');
      card.className = 'order-card';
      card.style.padding = '20px';
      card.style.borderLeftColor = '#8b5cf6'; // Purple border for bookings
      
      const dateObj = new Date(b.date);
      const dateStr = dateObj.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });

      card.innerHTML = `
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom: 12px;">
          <div style="font-weight: 600; font-size: 16px; color: white;">${b.name}</div>
          <div style="background: rgba(139,92,246,0.15); color: #a78bfa; padding: 4px 10px; border-radius: 8px; font-size: 12px; font-weight: 600;">${b.tableNum} • ${b.guests} Guests</div>
        </div>
        
        <div style="display: flex; gap: 16px; font-size: 14px; color: var(--muted);">
          <div>📅 ${dateStr}</div>
          <div>⏰ ${b.time}</div>
        </div>
      `;
      bookingsList.appendChild(card);
    });
  } catch (error) {
    console.error("Error loading bookings: ", error);
    bookingsList.innerHTML = '<p style="color:var(--danger);">Failed to load bookings.</p>';
  }
}

// Submit a new booking
submitBtn.addEventListener('click', async () => {
  const name = document.getElementById('bookName').value.trim();
  const date = document.getElementById('bookDate').value;
  const time = document.getElementById('bookTime').value;
  const tableNum = document.getElementById('bookTableNum').value;
  const guests = document.getElementById('bookGuests').value;

  if (!name || !date || !time) return alert('Please fill in all fields.');

  submitBtn.innerText = 'Booking...';
  submitBtn.disabled = true;

  try {
    await addDoc(collection(db, 'table_bookings'), {
      name,
      date,
      time,
      tableNum,
      guests,
      createdAt: serverTimestamp()
    });

    // Clear form
    document.getElementById('bookName').value = '';
    document.getElementById('bookDate').value = '';
    document.getElementById('bookTime').value = '';
    
    // Reload bookings
    loadBookings();
  } catch (error) {
    console.error("Error adding booking: ", error);
    alert("Failed to book table.");
  } finally {
    submitBtn.innerText = 'Confirm Reservation';
    submitBtn.disabled = false;
  }
});

// Load initial data
loadBookings();