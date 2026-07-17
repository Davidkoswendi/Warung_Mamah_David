// STORAGE
var IMAGES = {};
var MENU = {
  food: [
    { id: 'spaghetti', name: 'Spaghetti', price: 25000, variants: ['Bolognese', 'Carbonara', 'Aglio Olio', 'Pesto'] },
    { id: 'macaroni', name: 'Macaroni', price: 22000, variants: ['Panggang Keju', 'Saus Krim', 'Pedas Napoli'] },
    { id: 'katsu', name: 'Chicken Katsu', price: 28000, variants: ['Original', 'Teriyaki', 'Pedas Sambal'] }
  ],
  drinks: [
    { id: 'popice', name: 'Pop Ice', price: 7000, variants: ['Coklat','Stroberi','Vanilla','Taro','Mangga','Melon','Anggur','Blueberry','Leci'] },
    { id: 'nutrisari', name: 'Nutrisari', price: 5000, variants: ['Jeruk Manis','Jambu Merah','Mangga','Anggur'] },
    { id: 'tehsisri', name: 'Teh Sisri', price: 4000, variants: ['Original','Vanilla','Melati Wangi'] }
  ]
};
var cart = [];
var orders = [];
var sellerOn = false;
var payMethod = 'cash';
var buktiData = null;
var currentTab = 'orders';
var tempImg = null;

// LOAD
try { var i = JSON.parse(localStorage.getItem('imgs')); if(i) IMAGES = i; } catch(e) {}
try { var m = JSON.parse(localStorage.getItem('menu')); if(m) { if(m.food) MENU.food = m.food; if(m.drinks) MENU.drinks = m.drinks; } } catch(e) {}
try { var o = JSON.parse(localStorage.getItem('orders')); if(o) orders = o; } catch(e) {}

function save(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch(e) {} }
function getImg(id) { return IMAGES[id] || ''; }

// TOAST
function toast(msg, type, dur) {
  type = type || 'success'; dur = dur || 3000;
  var c = document.getElementById('toastContainer'); if (!c) return;
  var t = document.createElement('div'); t.className = 'toast ' + type; t.textContent = msg;
  c.appendChild(t);
  setTimeout(function() { t.classList.add('removing'); setTimeout(function() { if (t.parentNode) t.remove(); }, 300); }, dur);
}

// ==================== LOGIN ====================
function showLoginModal() {
  document.getElementById('loginModalOverlay').classList.add('active');
  document.getElementById('loginPassword').value = '';
  document.getElementById('loginError').classList.remove('show');
  document.getElementById('loginPassword').focus();
}

function closeLoginModal() {
  document.getElementById('loginModalOverlay').classList.remove('active');
}

function togglePassword() {
  var input = document.getElementById('loginPassword');
  var icon = document.getElementById('eyeIcon');
  if (input.type === 'password') {
    input.type = 'text';
    icon.innerHTML = '<path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/>';
  } else {
    input.type = 'password';
    icon.innerHTML = '<path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>';
  }
}

function verifyLogin() {
  var password = document.getElementById('loginPassword').value;
  var errorEl = document.getElementById('loginError');
  
  if (password === '12345') {
    closeLoginModal();
    goToSellerPage();
  } else {
    errorEl.textContent = 'Kata sandi salah. Silakan coba lagi.';
    errorEl.classList.add('show');
    document.getElementById('loginPassword').value = '';
    document.getElementById('loginPassword').focus();
    
    setTimeout(function() {
      errorEl.classList.remove('show');
    }, 3000);
  }
}

// RENDER MENU PEMBELI
function renderBuyerMenu() {
  var fg = document.getElementById('foodGrid'); var dg = document.getElementById('drinkGrid');
  if (fg) fg.innerHTML = MENU.food.map(card).join('');
  if (dg) dg.innerHTML = MENU.drinks.map(card).join('');
}
function card(item) {
  var img = getImg(item.id);
  var ih = img ? '<img src="' + img + '" class="card-image" alt="">' : '<div class="card-image" style="display:flex;align-items:center;justify-content:center;color:#ccc;font-size:2.5rem;font-weight:300;">' + item.name.charAt(0) + '</div>';
  return '<div class="menu-card">' + ih +
    '<div class="card-title">' + item.name + '</div><div class="card-price">Rp' + item.price.toLocaleString('id-ID') + '</div>' +
    '<label class="card-label">Varian</label><select class="card-select" id="v-' + item.id + '">' + item.variants.map(function(v) { return '<option>' + v + '</option>'; }).join('') + '</select>' +
    '<label class="card-label">Jumlah</label><input type="number" class="card-input" id="q-' + item.id + '" value="1" min="1" max="15">' +
    '<button class="add-btn" onclick="addCart(\'' + item.id + '\')">Tambah ke Keranjang</button></div>';
}

// KERANJANG
function addCart(id) {
  var all = MENU.food.concat(MENU.drinks);
  var p = all.find(function(x) { return x.id === id; });
  if (!p) return;
  var ve = document.getElementById('v-' + id); var qe = document.getElementById('q-' + id);
  if (!ve || !qe) return;
  cart.push({ id: id, name: p.name, price: p.price, variant: ve.value, qty: parseInt(qe.value) || 1 });
  updateCartBadge();
  toast(p.name + ' ditambahkan ke keranjang');
}
function updateCartBadge() {
  var c = cart.reduce(function(s, i) { return s + i.qty; }, 0);
  var t = cart.reduce(function(s, i) { return s + i.price * i.qty; }, 0);
  var ce = document.getElementById('floatingCartCount'); var te = document.getElementById('floatingCartTotal');
  if (ce) ce.textContent = c;
  if (te) te.textContent = 'Rp' + t.toLocaleString('id-ID');
}
function openCartModal() { document.getElementById('cartModalOverlay').classList.add('active'); renderCartItems(); updatePayUI(); }
function closeCartModal() {
  document.getElementById('cartModalOverlay').classList.remove('active');
  buktiData = null; var p = document.getElementById('previewBuktiImg'); if (p) p.style.display = 'none';
  var inp = document.getElementById('buktiBayarInput'); if (inp) inp.value = '';
  var fn = document.getElementById('buktiFileName'); if (fn) fn.textContent = 'Tidak ada file dipilih';
  payMethod = 'cash'; updatePayUI();
}
function closeBuktiModal() { document.getElementById('buktiModalOverlay').classList.remove('active'); }
function renderCartItems() {
  var c = document.getElementById('cartItemList'); if (!c) return;
  if (!cart.length) { c.innerHTML = '<p style="text-align:center;padding:40px;color:#999;">Keranjang masih kosong</p>'; document.getElementById('cartTotalDisplay').textContent = 'Total: Rp0'; document.getElementById('checkoutBtn').disabled = true; return; }
  document.getElementById('checkoutBtn').disabled = false;
  var h = '', total = 0;
  cart.forEach(function(item, i) { var sub = item.price * item.qty; total += sub;
    h += '<div class="cart-item-row"><div class="cart-item-info"><div class="cart-item-name">' + item.name + '</div><div class="cart-item-variant">' + item.variant + ' &times; ' + item.qty + '</div></div><div class="cart-item-price">Rp' + sub.toLocaleString('id-ID') + '</div><button class="remove-item-btn" onclick="removeCart(' + i + ')">&times;</button></div>'; });
  c.innerHTML = h;
  document.getElementById('cartTotalDisplay').textContent = 'Total: Rp' + total.toLocaleString('id-ID');
  var qt = document.getElementById('qrTotalAmount'); if (qt) qt.textContent = 'Rp' + total.toLocaleString('id-ID');
}
function removeCart(i) { cart.splice(i, 1); updateCartBadge(); renderCartItems(); }
function selectPayment(m) { payMethod = m; updatePayUI(); }
function updatePayUI() {
  var pc = document.getElementById('payCash'); var pq = document.getElementById('payQR');
  var qs = document.getElementById('qrSection'); var ua = document.getElementById('uploadBuktiArea'); var cb = document.getElementById('checkoutBtn');
  if (pc) pc.classList.toggle('selected', payMethod === 'cash');
  if (pq) pq.classList.toggle('selected', payMethod === 'qr');
  if (qs) qs.style.display = payMethod === 'qr' ? 'block' : 'none';
  if (ua) ua.style.display = payMethod === 'qr' ? 'block' : 'none';
  if (cb) cb.disabled = (payMethod === 'qr' && !buktiData) || cart.length === 0;
}
function previewBukti(event) {
  var f = event.target.files[0]; if (!f) return;
  var fn = document.getElementById('buktiFileName');
  if (fn && f) fn.textContent = f.name;
  var reader = new FileReader();
  reader.onload = function(e) { buktiData = e.target.result; var p = document.getElementById('previewBuktiImg'); if (p) { p.src = buktiData; p.style.display = 'block'; } document.getElementById('checkoutBtn').disabled = false; };
  reader.readAsDataURL(f);
}
function checkout() {
  var name = document.getElementById('customerNameInput').value.trim();
  if (!name) { toast('Silakan isi nama pemesan', 'warning'); return; }
  if (!cart.length) { toast('Keranjang masih kosong', 'warning'); return; }
  if (payMethod === 'qr' && !buktiData) { toast('Upload bukti pembayaran', 'warning'); return; }
  var order = { id: Date.now(), customer: name, items: cart.slice(), total: cart.reduce(function(s, i) { return s + i.price * i.qty; }, 0), time: new Date().toLocaleString('id-ID', { day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit' }), paymentMethod: payMethod, buktiBayar: payMethod === 'qr' ? buktiData : null };
  orders.push(order); save('orders', orders);
  cart = []; updateCartBadge();
  document.getElementById('customerNameInput').value = '';
  buktiData = null; var p = document.getElementById('previewBuktiImg'); if (p) p.style.display = 'none';
  var inp = document.getElementById('buktiBayarInput'); if (inp) inp.value = '';
  var fn = document.getElementById('buktiFileName'); if (fn) fn.textContent = 'Tidak ada file dipilih';
  payMethod = 'cash'; updatePayUI();
  closeCartModal();
  toast('Pesanan berhasil dikirim!', 'success', 4000);
  if (sellerOn) renderOrders();
}

// NAVIGASI
function goToSellerPage() {
  sellerOn = true;
  document.getElementById('buyerPage').style.display = 'none';
  document.getElementById('sellerPage').style.display = 'block';
  document.getElementById('floatingCartBtn').style.display = 'none';
  switchSellerTab('orders'); renderOrders();
}

function goToBuyerPage() {
  sellerOn = false;
  document.getElementById('buyerPage').style.display = 'block';
  document.getElementById('sellerPage').style.display = 'none';
  document.getElementById('floatingCartBtn').style.display = 'flex';
  renderBuyerMenu(); updateCartBadge();
}

function logoutSeller() { goToBuyerPage(); }

function switchSellerTab(t) {
  currentTab = t;
  document.getElementById('tabOrders').style.display = t === 'orders' ? 'block' : 'none';
  document.getElementById('tabMenus').style.display = t === 'menus' ? 'block' : 'none';
  document.getElementById('tabArchive').style.display = t === 'archive' ? 'block' : 'none';
  var tabs = document.querySelectorAll('.seller-tab');
  var tabIds = ['orders', 'menus', 'archive'];
  tabs.forEach(function(tb, i) { tb.classList.toggle('active', tabIds[i] === t); });
  if (t === 'orders') renderOrders();
  if (t === 'menus') renderMenuManager();
  if (t === 'archive') renderArchive();
}

// PESANAN
function renderOrders() {
  try { orders = JSON.parse(localStorage.getItem('orders')) || []; } catch(e) {}
  var cl = document.getElementById('orderCountLabel'); if (cl) cl.textContent = orders.length + ' pesanan';
  var c = document.getElementById('sellerOrderList'); if (!c) return;
  if (!orders.length) { c.innerHTML = '<div class="empty-state">Belum ada pesanan masuk</div>'; return; }
  c.innerHTML = orders.slice().reverse().map(function(o) { var ih = o.items.map(function(it) { return '<li><span>' + it.name + ' (' + it.variant + ') &times;' + it.qty + '</span><span>Rp' + (it.price*it.qty).toLocaleString('id-ID') + '</span></li>'; }).join(''); return '<div class="order-card"><div class="order-header"><span class="order-customer">' + o.customer + '</span><span class="order-time">' + o.time + '</span></div><span class="payment-badge ' + (o.paymentMethod==='qr'?'payment-qr':'payment-cash') + '">' + (o.paymentMethod==='qr'?'QR Code':'Cash') + '</span><ul class="order-items-list">' + ih + '</ul><div class="order-total">Total: Rp' + o.total.toLocaleString('id-ID') + '</div>' + (o.buktiBayar?'<img src="' + o.buktiBayar + '" class="bukti-img" onclick="showBukti(\'' + o.buktiBayar + '\')">':'') + '<button class="btn-full btn-outline-full" style="margin-top:12px;" onclick="archiveOrder(' + o.id + ')">Selesai & Arsipkan</button></div>'; }).join('');
}
function archiveOrder(oid) { if (!confirm('Arsipkan pesanan ini?')) return; try { orders = JSON.parse(localStorage.getItem('orders')) || []; } catch(e) {} var idx = orders.findIndex(function(o) { return o.id === oid; }); if (idx === -1) return; var rem = orders.splice(idx, 1)[0]; save('orders', orders); var arch = []; try { arch = JSON.parse(localStorage.getItem('archive')) || []; } catch(e) {} arch.push(Object.assign({}, rem, { archivedAt: new Date().toLocaleString('id-ID') })); save('archive', arch); renderOrders(); if (currentTab === 'archive') renderArchive(); toast('Pesanan diarsipkan', 'info'); }
function showBukti(src) { document.getElementById('buktiModalImg').src = src; document.getElementById('buktiModalOverlay').classList.add('active'); }

// ARSIP
function renderArchive() { var arch = []; try { arch = JSON.parse(localStorage.getItem('archive')) || []; } catch(e) {} var c = document.getElementById('archiveList'); if (!c) return; if (!arch.length) { c.innerHTML = '<div class="empty-state">Arsip kosong</div>'; return; } c.innerHTML = arch.slice().reverse().map(function(o) { return '<div class="order-card" style="border-left-color:#999;"><div class="order-header"><span class="order-customer">' + o.customer + '</span><span class="order-time">' + o.time + '</span></div><div class="order-total">Total: Rp' + o.total.toLocaleString('id-ID') + '</div></div>'; }).join(''); }
function clearArchive() { if (!confirm('Kosongkan semua arsip?')) return; localStorage.removeItem('archive'); renderArchive(); toast('Arsip dikosongkan', 'info'); }

// KELOLA MENU
function renderMenuManager() { var all = MENU.food.map(function(i) { return Object.assign({}, i, { cat: 'food' }); }).concat(MENU.drinks.map(function(i) { return Object.assign({}, i, { cat: 'drinks' }); })); var q = (document.getElementById('menuSearchInput') || {}).value || ''; q = q.toLowerCase(); var filt = all.filter(function(i) { return !q || i.name.toLowerCase().indexOf(q) !== -1; }); var c = document.getElementById('menuManagerList'); if (!c) return; if (!filt.length) { c.innerHTML = '<div class="empty-state">Tidak ada menu ditemukan</div>'; return; } c.innerHTML = filt.map(function(item) { var img = getImg(item.id); var ih = img ? '<img src="' + img + '" class="item-image" alt="">' : '<div class="item-image" style="display:flex;align-items:center;justify-content:center;color:#ccc;font-weight:300;">' + item.name.charAt(0) + '</div>'; return '<div class="menu-manager-item">' + ih + '<div class="item-details"><div class="item-header"><span class="item-name">' + item.name + '</span><span class="item-price">Rp' + item.price.toLocaleString('id-ID') + '</span></div><div class="item-meta">' + (item.cat==='food'?'Makanan':'Minuman') + ' &middot; ' + item.variants.length + ' varian</div><div class="item-actions"><button class="btn-sm" onclick="editMenu(\'' + item.id + '\',\'' + item.cat + '\')">Edit</button><button class="btn-sm danger" onclick="delMenu(\'' + item.id + '\',\'' + item.cat + '\')">Hapus</button></div></div></div>'; }).join(''); }

// FORM MENU
function openMenuForm(eid, ecat) {
  var overlay = document.getElementById('menuFormOverlay');
  var title = document.getElementById('menuFormTitle');
  if (!overlay || !title) return;
  tempImg = null;
  document.getElementById('mfImageFile').value = '';
  document.getElementById('mfPreview').style.display = 'none';
  document.getElementById('mfFileName').textContent = 'Tidak ada file dipilih';
  document.getElementById('btnRemoveImage').style.display = 'none';
  
  if (eid) {
    title.textContent = 'Edit Menu';
    document.getElementById('mfEdit').value = '1';
    document.getElementById('mfId').value = eid;
    var list = ecat === 'food' ? MENU.food : MENU.drinks;
    var item = list.find(function(i) { return i.id === eid; });
    if (item) {
      document.getElementById('mfCat').value = ecat;
      document.getElementById('mfName').value = item.name;
      document.getElementById('mfPrice').value = item.price;
      document.getElementById('mfVarian').value = item.variants.join(', ');
      if (IMAGES[eid]) {
        document.getElementById('mfPreview').src = IMAGES[eid];
        document.getElementById('mfPreview').style.display = 'block';
        document.getElementById('btnRemoveImage').style.display = 'inline-flex';
        document.getElementById('mfFileName').textContent = 'Gambar tersimpan';
      }
    }
  } else {
    title.textContent = 'Tambah Menu';
    document.getElementById('mfEdit').value = '0';
    document.getElementById('mfId').value = '';
    document.getElementById('mfCat').value = 'food';
    document.getElementById('mfName').value = '';
    document.getElementById('mfPrice').value = '';
    document.getElementById('mfVarian').value = '';
  }
  overlay.classList.add('active');
}

function closeMenuForm() { document.getElementById('menuFormOverlay').classList.remove('active'); tempImg = null; }

function previewImage(input) {
  var f = input.files[0];
  if (!f) return;
  var fn = document.getElementById('mfFileName');
  if (fn) fn.textContent = f.name;
  document.getElementById('btnRemoveImage').style.display = 'inline-flex';
  
  var reader = new FileReader();
  reader.onload = function(e) {
    tempImg = e.target.result;
    var prev = document.getElementById('mfPreview');
    prev.src = tempImg;
    prev.style.display = 'block';
  };
  reader.readAsDataURL(f);
}

function resetMenuImage() {
  tempImg = null;
  document.getElementById('mfImageFile').value = '';
  document.getElementById('mfPreview').style.display = 'none';
  document.getElementById('mfFileName').textContent = 'Tidak ada file dipilih';
  document.getElementById('btnRemoveImage').style.display = 'none';
}

function saveMenu() {
  var name = document.getElementById('mfName').value.trim();
  var price = parseInt(document.getElementById('mfPrice').value) || 0;
  var vraw = document.getElementById('mfVarian').value.trim();
  var variants = vraw ? vraw.split(',').map(function(v) { return v.trim(); }).filter(Boolean) : ['Original'];
  var cat = document.getElementById('mfCat').value;
  var edit = document.getElementById('mfEdit').value === '1';
  var eid = document.getElementById('mfId').value;
  
  if (!name) { toast('Nama menu wajib diisi', 'warning'); return; }
  if (!price || price < 100) { toast('Harga minimal Rp100', 'warning'); return; }
  if (!vraw) { toast('Varian wajib diisi', 'warning'); return; }
  
  if (edit) {
    var found = false;
    for (var i = 0; i < MENU.food.length; i++) {
      if (MENU.food[i].id === eid) {
        MENU.food[i].name = name; MENU.food[i].price = price; MENU.food[i].variants = variants;
        if (cat === 'drinks') { MENU.drinks.push(MENU.food.splice(i, 1)[0]); }
        found = true; break;
      }
    }
    if (!found) {
      for (var j = 0; j < MENU.drinks.length; j++) {
        if (MENU.drinks[j].id === eid) {
          MENU.drinks[j].name = name; MENU.drinks[j].price = price; MENU.drinks[j].variants = variants;
          if (cat === 'food') { MENU.food.push(MENU.drinks.splice(j, 1)[0]); }
          break;
        }
      }
    }
    if (tempImg) { IMAGES[eid] = tempImg; }
    toast('Menu berhasil diperbarui');
  } else {
    var id = 'item-' + Date.now();
    var newItem = { id: id, name: name, price: price, variants: variants };
    if (cat === 'food') MENU.food.push(newItem);
    else MENU.drinks.push(newItem);
    if (tempImg) { IMAGES[id] = tempImg; }
    toast('Menu baru berhasil ditambahkan');
  }
  
  save('imgs', IMAGES);
  save('menu', MENU);
  renderBuyerMenu();
  renderMenuManager();
  closeMenuForm();
}

function editMenu(id, cat) { openMenuForm(id, cat); }
function delMenu(id, cat) {
  if (!confirm('Hapus menu ini?')) return;
  var list = cat === 'food' ? MENU.food : MENU.drinks;
  var idx = list.findIndex(function(i) { return i.id === id; });
  if (idx === -1) return;
  list.splice(idx, 1);
  if (IMAGES[id]) { delete IMAGES[id]; save('imgs', IMAGES); }
  save('menu', MENU);
  renderBuyerMenu();
  renderMenuManager();
  toast('Menu dihapus', 'info');
}

// INIT
window.addEventListener('DOMContentLoaded', function() {
  renderBuyerMenu();
  updateCartBadge();
  
  document.getElementById('cartModalOverlay').addEventListener('click', function(e) { if (e.target === this) closeCartModal(); });
  document.getElementById('menuFormOverlay').addEventListener('click', function(e) { if (e.target === this) closeMenuForm(); });
  document.getElementById('buktiModalOverlay').addEventListener('click', function(e) { if (e.target === this) closeBuktiModal(); });
  document.getElementById('loginModalOverlay').addEventListener('click', function(e) { if (e.target === this) closeLoginModal(); });
});