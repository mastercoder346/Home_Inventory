// State Management
let items = JSON.parse(localStorage.getItem('home-vault-items')) || [];
let config = JSON.parse(localStorage.getItem('home-vault-config')) || {
  locations: ['Garage', 'Living Room', 'Kitchen', 'Master Bedroom', 'Basement'],
  shelves: ['Shelf A', 'Shelf B', 'Top Shelf', 'Bottom Shelf', 'N/A'],
  bins: ['Bin 1', 'Bin 2', 'Clear Box', 'Cardboard Box', 'N/A'],
  categories: ['Electronics', 'Furniture', 'Tools', 'Kitchen', 'Books', 'Decor', 'Other']
};

const saveItems = () => localStorage.setItem('home-vault-items', JSON.stringify(items));
const saveConfig = () => localStorage.setItem('home-vault-config', JSON.stringify(config));

// Initial mock data if empty
if (items.length === 0) {
  items = [
    { id: 1, name: 'Samsung 65" TV', category: 'Electronics', location: 'Living Room', shelf: 'N/A', bin: 'N/A', condition: 'Excellent', status: 'available', notes: 'Bought in 2023. Warranty active.' },
    { id: 2, name: 'Dewalt Drill', category: 'Tools', location: 'Garage', shelf: 'Shelf A', bin: 'Bin 1', condition: 'Good', status: 'borrowed', borrower: 'John', returnDate: '2024-05-01', notes: 'Includes 2 batteries and charger.' }
  ];
  saveItems();
}

let currentView = 'inventory'; // 'inventory' or 'settings'
let searchQuery = '';

window.handleSearch = (e) => {
  searchQuery = e.target.value;
  renderApp();
};

// --- View Rendering ---

const renderApp = () => {
  const container = document.getElementById('view-container');
  const title = document.getElementById('page-title');
  const actions = document.getElementById('topbar-actions');
  const searchContainer = document.getElementById('search-container');

  if (currentView === 'inventory') {
    title.innerText = 'Inventory';
    searchContainer.style.display = 'block';
    actions.innerHTML = `<button class="btn btn-primary shadow-glow" onclick="openAddItemModal()">+ Add Item</button>`;
    container.innerHTML = renderInventoryView();
  } else if (currentView === 'settings') {
    title.innerText = 'Settings';
    searchContainer.style.display = 'none';
    actions.innerHTML = ``;
    container.innerHTML = renderSettingsView();
  }
};

const renderInventoryView = () => {
  const query = searchQuery.trim().toLowerCase();
  const filteredItems = items.filter(i => {
    if (!query) return true;
    return (
      i.name.toLowerCase().includes(query) ||
      i.category.toLowerCase().includes(query) ||
      i.location.toLowerCase().includes(query) ||
      i.shelf.toLowerCase().includes(query) ||
      i.bin.toLowerCase().includes(query) ||
      (i.notes && i.notes.toLowerCase().includes(query))
    );
  });

  const total = items.length;
  const borrowed = items.filter(i => i.status === 'borrowed').length;
  
  const statsHTML = `
    <div class="stats-grid">
      <div class="stat-card">
        <span class="stat-title">Total Items</span>
        <span class="stat-value">${total}</span>
      </div>
      <div class="stat-card">
        <span class="stat-title">Borrowed Out</span>
        <span class="stat-value">${borrowed}</span>
      </div>
    </div>
  `;

  const itemsHTML = filteredItems.length === 0 ? `<p style="color: var(--text-muted);">No items found. Try a different search query or add a new item!</p>` : `
    <div class="items-grid">
      ${filteredItems.map(i => `
        <div class="item-card">
          ${i.image ? `
            <div class="item-image">
              <img src="${i.image}" alt="${i.name}">
            </div>
          ` : ''}
          <div class="item-header">
            <span class="item-title">${i.name}</span>
            <span class="badge ${i.status}">${i.status}</span>
          </div>
          <div class="item-meta">
            <span>${i.category}</span>
            <span>📍 ${i.location}</span>
            <span>🗄️ ${i.shelf}</span>
            <span>📦 ${i.bin}</span>
          </div>
          ${i.notes ? `<div class="item-notes">${i.notes}</div>` : ''}
          ${i.status === 'borrowed' ? `<p style="font-size: 0.85rem; color: #fcd34d; margin-top: 4px;">Lent to ${i.borrower} (Return: ${i.returnDate})</p>` : ''}
          <div class="item-actions">
            <button class="btn btn-secondary" style="padding: 6px 12px; font-size: 0.85rem;" onclick="editItem(${i.id})">Edit</button>
            <button class="btn btn-danger" style="padding: 6px 12px; font-size: 0.85rem;" onclick="deleteItem(${i.id})">Delete</button>
            ${i.status === 'available' 
              ? `<button class="btn btn-primary" style="padding: 6px 12px; font-size: 0.85rem; margin-left: auto;" onclick="lendItem(${i.id})">Lend</button>`
              : `<button class="btn btn-primary" style="padding: 6px 12px; font-size: 0.85rem; margin-left: auto;" onclick="returnItem(${i.id})">Return</button>`}
          </div>
        </div>
      `).join('')}
    </div>
  `;

  return statsHTML + itemsHTML;
};

const renderSettingsView = () => {
  return `
    <div style="max-width: 800px;">
      <p style="color: var(--text-muted); margin-bottom: 24px;">Manage the dropdown options available when adding or editing items.</p>
      
      ${renderConfigSection('Locations', 'locations')}
      ${renderConfigSection('Shelves', 'shelves')}
      ${renderConfigSection('Bins', 'bins')}
      ${renderConfigSection('Categories', 'categories')}
    </div>
  `;
};

const renderConfigSection = (title, key) => {
  return `
    <div class="settings-section">
      <h3>
        ${title}
        <button class="btn btn-primary" style="padding: 6px 12px; font-size: 0.85rem;" onclick="addConfigItem('${key}')">+ Add</button>
      </h3>
      <div class="config-list">
        ${config[key].map((val, index) => `
          <div class="config-item">
            <span class="config-item-name">${val}</span>
            <div>
              <button class="btn btn-secondary" style="padding: 4px 8px; font-size: 0.8rem;" onclick="editConfigItem('${key}', ${index})">Edit</button>
              <button class="btn btn-danger" style="padding: 4px 8px; font-size: 0.8rem;" onclick="deleteConfigItem('${key}', ${index})">Remove</button>
            </div>
          </div>
        `).join('')}
        ${config[key].length === 0 ? `<p style="color: var(--text-muted); font-size: 0.9rem;">No ${title.toLowerCase()} added.</p>` : ''}
      </div>
    </div>
  `;
};

// --- Navigation ---
document.querySelectorAll('.nav-link').forEach(link => {
  link.addEventListener('click', (e) => {
    document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
    e.currentTarget.classList.add('active');
    currentView = e.currentTarget.dataset.view;
    renderApp();
  });
});

// --- Settings Actions ---
window.addConfigItem = (key) => {
  const val = prompt(`Enter new ${key.slice(0, -1)}:`);
  if (val && val.trim()) {
    config[key].push(val.trim());
    saveConfig();
    renderApp();
  }
};

window.editConfigItem = (key, index) => {
  const oldVal = config[key][index];
  const val = prompt(`Edit ${key.slice(0, -1)}:`, oldVal);
  if (val && val.trim()) {
    config[key][index] = val.trim();
    saveConfig();
    // Optional: Also update items that had the old value
    items = items.map(i => {
      let field = key.slice(0, -1); // 'locations' -> 'location'
      if (key === 'categories') field = 'category';
      if (i[field] === oldVal) {
        return { ...i, [field]: val.trim() };
      }
      return i;
    });
    saveItems();
    renderApp();
  }
};

window.deleteConfigItem = (key, index) => {
  if (confirm('Are you sure? Items using this value will not be modified automatically.')) {
    config[key].splice(index, 1);
    saveConfig();
    renderApp();
  }
};

// --- Item Modals & Actions ---
let editingId = null;

const buildOptions = (list, selectedVal) => {
  return list.map(opt => `<option value="${opt}" ${opt === selectedVal ? 'selected' : ''}>${opt}</option>`).join('');
};

window.openAddItemModal = () => {
  editingId = null;
  document.body.insertAdjacentHTML('beforeend', getModalHTML('Add New Item'));
};

window.editItem = (id) => {
  editingId = id;
  const item = items.find(i => i.id === id);
  document.body.insertAdjacentHTML('beforeend', getModalHTML('Edit Item', item));
};

window.closeModal = () => {
  const modal = document.querySelector('.modal-backdrop');
  if (modal) modal.remove();
};

window.saveItemForm = (e) => {
  e.preventDefault();
  const form = e.target;
  const newItem = {
    id: editingId || Date.now(),
    name: form.name.value,
    category: form.category.value,
    location: form.location.value,
    shelf: form.shelf.value,
    bin: form.bin.value,
    condition: form.condition.value,
    notes: form.notes.value,
    image: form.image.value || '',
    status: editingId ? items.find(i => i.id === editingId).status : 'available'
  };

  if (editingId) {
    items = items.map(i => i.id === editingId ? {...i, ...newItem} : i);
  } else {
    items.push(newItem);
  }
  
  saveItems();
  closeModal();
  renderApp();
};

window.deleteItem = (id) => {
  if(confirm('Are you sure you want to delete this item?')) {
    items = items.filter(i => i.id !== id);
    saveItems();
    renderApp();
  }
};

window.lendItem = (id) => {
  const borrower = prompt('Borrower Name:');
  const date = prompt('Expected Return Date (YYYY-MM-DD):', new Date().toISOString().split('T')[0]);
  if(borrower && date) {
    items = items.map(i => i.id === id ? {...i, status: 'borrowed', borrower, returnDate: date} : i);
    saveItems();
    renderApp();
  }
};

window.returnItem = (id) => {
  items = items.map(i => i.id === id ? {...i, status: 'available', borrower: null, returnDate: null} : i);
  saveItems();
  renderApp();
};

window.handleImageUpload = (e) => {
  const file = e.target.files[0];
  if (!file) return;
  
  const previewDiv = document.querySelector('.image-preview');
  previewDiv.innerHTML = `<span>Processing & compressing image...</span>`;
  
  const reader = new FileReader();
  reader.onload = (event) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const MAX_WIDTH = 600;
      const MAX_HEIGHT = 600;
      let width = img.width;
      let height = img.height;
      
      if (width > height) {
        if (width > MAX_WIDTH) {
          height *= MAX_WIDTH / width;
          width = MAX_WIDTH;
        }
      } else {
        if (height > MAX_HEIGHT) {
          width *= MAX_HEIGHT / height;
          height = MAX_HEIGHT;
        }
      }
      
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0, width, height);
      
      // Convert to compressed jpeg text format
      const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.65);
      
      document.getElementById('item-image-value').value = compressedDataUrl;
      previewDiv.innerHTML = `
        <img src="${compressedDataUrl}" id="preview-img">
        <input type="file" id="image-upload" accept="image/*" style="display: none;" onchange="handleImageUpload(event)">
        <input type="hidden" name="image" id="item-image-value" value="${compressedDataUrl}">
      `;
    };
    img.src = event.target.result;
  };
  reader.readAsDataURL(file);
};

const getModalHTML = (title, item = {}) => `
  <div class="modal-backdrop" onclick="if(event.target===this) closeModal()">
    <div class="modal">
      <h2>${title}</h2>
      <form onsubmit="saveItemForm(event)">
        <div class="form-group">
          <label>Item Name</label>
          <input type="text" name="name" class="form-control" required value="${item.name || ''}">
        </div>

        <div class="form-group">
          <label>Item Photo (Converts to space-saving text)</label>
          <div class="image-preview" onclick="document.getElementById('image-upload').click()">
            ${item.image ? `<img src="${item.image}" id="preview-img">` : `
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline></svg>
              <span>Click to upload / take picture</span>
            `}
          </div>
          <input type="file" id="image-upload" accept="image/*" style="display: none;" onchange="handleImageUpload(event)">
          <input type="hidden" name="image" id="item-image-value" value="${item.image || ''}">
        </div>
        
        <div class="form-row">
          <div class="form-group">
            <label>Category</label>
            <select name="category" class="form-control" required>
              ${buildOptions(config.categories, item.category)}
            </select>
          </div>
          <div class="form-group">
            <label>Condition</label>
            <select name="condition" class="form-control">
              ${buildOptions(['New', 'Excellent', 'Good', 'Fair', 'Poor'], item.condition || 'Excellent')}
            </select>
          </div>
        </div>

        <div class="form-row">
          <div class="form-group">
            <label>Location</label>
            <select name="location" class="form-control" required>
              ${buildOptions(config.locations, item.location)}
            </select>
          </div>
          <div class="form-group">
            <label>Shelf</label>
            <select name="shelf" class="form-control">
              ${buildOptions(config.shelves, item.shelf)}
            </select>
          </div>
          <div class="form-group">
            <label>Bin</label>
            <select name="bin" class="form-control">
              ${buildOptions(config.bins, item.bin)}
            </select>
          </div>
        </div>

        <div class="form-group">
          <label>Notes</label>
          <textarea name="notes" class="form-control" placeholder="Optional details...">${item.notes || ''}</textarea>
        </div>

        <div class="form-actions">
          <button type="button" class="btn btn-secondary" onclick="closeModal()">Cancel</button>
          <button type="submit" class="btn btn-primary">Save Item</button>
        </div>
      </form>
    </div>
  </div>
`;

// Initialize
renderApp();
