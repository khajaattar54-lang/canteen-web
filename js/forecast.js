import { db } from './firebase.js';
import { collection, getDocs } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

const SLOTS = ['12:00 – 12:15', '12:15 – 12:30', '12:30 – 12:45', '12:45 – 1:00', '1:00 – 1:15'];
const CAPACITY = 20;

async function buildForecast() {
  const snapshot = await getDocs(collection(db, 'orders'));
  
  const today = new Date().toISOString().split('T')[0];
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  const pastOrders = [];
  const todaysOrders = [];
  let revenue = 0;
  const itemCounts = {};

  snapshot.forEach(doc => {
    const o = doc.data();
    if (o.status === 'cancelled') return; // Don't count cancelled orders

    if (o.date) {
      const orderDate = new Date(o.date);
      if (orderDate >= sevenDaysAgo) pastOrders.push(o);
      
      // If the order is from today, count revenue and items
      if (o.date === today) {
        todaysOrders.push(o);
        revenue += o.total;
        
        // Count items for "Most Popular"
        o.items.forEach(item => {
          itemCounts[item.name] = (itemCounts[item.name] || 0) + item.qty;
        });
      }
    }
  });

  // 1. Update Stats Cards
  document.getElementById('totalRevenue').innerText = `₹${revenue}`;
  document.getElementById('totalOrders').innerText = todaysOrders.length;
  
  // Find most popular item
  let topItem = "-";
  let maxCount = 0;
  for (const [name, count] of Object.entries(itemCounts)) {
    if (count > maxCount) {
      maxCount = count;
      topItem = name;
    }
  }
  document.getElementById('topItem').innerText = topItem;

  // 2. Render Chart
  const averages = SLOTS.map(slot => {
    const count = pastOrders.filter(o => o.slot === slot).length;
    return Math.round(count / 7);
  });

  const todayCounts = SLOTS.map(slot =>
    pastOrders.filter(o => o.slot === slot && o.date === today).length
  );

  renderSummary(averages);
  renderChart(averages, todayCounts);
}

function renderSummary(averages) {
  const summary = document.getElementById('summary');
  if (!summary) return;
  
  const maxAvg = Math.max(...averages);
  const maxIndex = averages.indexOf(maxAvg);
  const totalForecast = averages.reduce((a, b) => a + b, 0);

  summary.innerHTML = `
    <div class="stat-card">
      <div class="stat-value">${totalForecast}</div>
      <div class="stat-label">Predicted total orders</div>
    </div>
    <div class="stat-card">
      <div class="stat-value">${SLOTS[maxIndex]}</div>
      <div class="stat-label">Busiest slot</div>
    </div>
    <div class="stat-card">
      <div class="stat-value">${maxAvg}</div>
      <div class="stat-label">Peak orders expected</div>
    </div>
  `;
}

function renderChart(averages, todayCounts) {
  const ctx = document.getElementById('forecastChart');
  const colors = averages.map(v => {
    const pct = v / CAPACITY;
    if (pct > 0.75) return '#ef4444';
    if (pct > 0.4) return '#f59e0b';
    return '#22c55e';
  });

  new Chart(ctx, {
    type: 'bar',
    data: {
      labels: SLOTS,
      datasets: [
        {
          label: 'Predicted orders',
          data: averages,
          backgroundColor: colors,
          borderRadius: 8,
        },
        {
          label: 'Today actual',
          data: todayCounts,
          backgroundColor: 'rgba(255,255,255,0.15)',
          borderRadius: 8,
        }
      ]
    },
    options: {
      responsive: true,
      plugins: {
        legend: { labels: { color: '#f5f5f7', font: { family: 'Poppins' } } }
      },
      scales: {
        x: { ticks: { color: '#8a8a99' }, grid: { display: false } },
        y: { ticks: { color: '#8a8a99' }, grid: { color: 'rgba(255,255,255,0.05)' } }
      }
    }
  });
}

buildForecast();