import { db } from './firebase.js';
import { collection, addDoc, getDocs, query, orderBy, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

const reviewsList = document.getElementById('reviewsList');
const submitBtn = document.getElementById('submitReviewBtn');
const reviewFoodSelect = document.getElementById('reviewFood');

// ==========================================
// 1. LOAD MENU ITEMS INTO THE DROPDOWN
// ==========================================
async function loadMenuItemsForDropdown() {
  try {
    const snapshot = await getDocs(collection(db, 'menu_items'));
    snapshot.forEach(doc => {
      const item = doc.data();
      // Create a new <option> for each food item
      const option = document.createElement('option');
      option.value = item.name;
      option.textContent = item.name;
      reviewFoodSelect.appendChild(option);
    });
  } catch (error) {
    console.error("Error loading menu items for dropdown: ", error);
  }
}

// ==========================================
// 2. LOAD EXISTING REVIEWS
// ==========================================
async function loadReviews() {
  reviewsList.innerHTML = '<p style="color:var(--muted);">Loading reviews...</p>';
  
  try {
    const q = query(collection(db, 'reviews'), orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);

    if (snapshot.empty) {
      reviewsList.innerHTML = '<div class="empty-state" style="padding: 40px 0;"><div class="emoji" style="font-size: 40px;">⭐</div><p>No reviews yet. Be the first!</p></div>';
      return;
    }

    reviewsList.innerHTML = '';
    snapshot.forEach(doc => {
      const r = doc.data();
      const card = document.createElement('div');
      card.className = 'order-card';
      card.style.padding = '20px';
      card.style.borderLeftColor = '#f97316'; // Orange border for reviews
      
      card.innerHTML = `
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom: 12px;">
          <div style="font-weight: 600; font-size: 16px; color: white;">${r.name} <span style="font-size: 12px; color: var(--muted); font-weight: 400;">reviewed ${r.item}</span></div>
          <div style="font-size: 12px; color: var(--muted);">${new Date(r.createdAt?.toDate() || Date.now()).toLocaleDateString()}</div>
        </div>
        
        <div style="display: flex; gap: 16px; margin-bottom: 12px;">
          <div style="background: rgba(34,197,94,0.1); color: #22c55e; padding: 4px 10px; border-radius: 8px; font-size: 12px; font-weight: 600;">Hygiene: ${r.hygiene}★</div>
          <div style="background: rgba(249,115,22,0.1); color: #f97316; padding: 4px 10px; border-radius: 8px; font-size: 12px; font-weight: 600;">Food: ${r.food}★</div>
        </div>

        <p style="font-size: 14px; color: #d4d4d8; line-height: 1.5;">"${r.text}"</p>
      `;
      reviewsList.appendChild(card);
    });
  } catch (error) {
    console.error("Error loading reviews: ", error);
    reviewsList.innerHTML = '<p style="color:var(--danger);">Failed to load reviews.</p>';
  }
}

// ==========================================
// 3. SUBMIT A NEW REVIEW
// ==========================================
submitBtn.addEventListener('click', async () => {
  const name = document.getElementById('reviewName').value.trim();
  const item = reviewFoodSelect.value;
  const foodRating = document.getElementById('foodRating').value;
  const hygieneRating = document.getElementById('hygieneRating').value;
  const text = document.getElementById('reviewText').value.trim();

  if (!name || !text) return alert('Please fill in your name and review text.');

  submitBtn.innerText = 'Submitting...';
  submitBtn.disabled = true;

  try {
    await addDoc(collection(db, 'reviews'), {
      name,
      item,
      food: Number(foodRating),
      hygiene: Number(hygieneRating),
      text,
      createdAt: serverTimestamp()
    });

    // Clear form
    document.getElementById('reviewName').value = '';
    document.getElementById('reviewText').value = '';
    
    // Reload reviews
    loadReviews();
  } catch (error) {
    console.error("Error adding review: ", error);
    alert("Failed to submit review.");
  } finally {
    submitBtn.innerText = 'Submit Review';
    submitBtn.disabled = false;
  }
});

// Initialize both functions when page loads
loadMenuItemsForDropdown();
loadReviews();