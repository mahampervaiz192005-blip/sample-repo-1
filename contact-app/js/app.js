const STORAGE_KEY = 'contacts_v1';
let contacts = [];
const contactModalEl = document.getElementById('contactModal');
const contactModal = new bootstrap.Modal(contactModalEl);
const form = document.getElementById('contactForm');
const modalTitle = document.getElementById('modalTitle');
const contactIdEl = document.getElementById('contactId');
const nameEl = document.getElementById('name');
const emailEl = document.getElementById('email');
const phoneEl = document.getElementById('phone');
const tbody = document.getElementById('contactsTbody');
const searchInput = document.getElementById('searchInput');
const alertPlaceholder = document.getElementById('alertPlaceholder');

// Load
function loadContacts() {
  try {
    contacts = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
  } catch (e) {
    contacts = [];
  }
}

function saveContacts() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(contacts));
}

function renderContacts(filter = '') {
  const q = filter.trim().toLowerCase();
  tbody.innerHTML = '';
  const list = contacts.filter(c => {
    if (!q) return true;
    return (c.name + ' ' + (c.email || '') + ' ' + (c.phone || '')).toLowerCase().includes(q);
  });
  if (!list.length) {
    tbody.innerHTML = '<tr><td colspan="4" class="text-center text-muted">No contacts found.</td></tr>';
    return;
  }
  for (const c of list) {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${escapeHtml(c.name)}</td>
      <td>${escapeHtml(c.email)}</td>
      <td>${escapeHtml(c.phone || '')}</td>
      <td>
        <button class="btn btn-sm btn-outline-primary me-1" data-id="${c.id}" data-action="edit">Edit</button>
        <button class="btn btn-sm btn-outline-danger" data-id="${c.id}" data-action="delete">Delete</button>
      </td>
    `;
    tbody.appendChild(tr);
  }
}

function escapeHtml(s){
  return String(s || '').replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;');
}

function showAlert(message, type = 'success', timeout = 2400) {
  const wrapper = document.createElement('div');
  wrapper.innerHTML = `
    <div class="alert alert-${type} alert-fixed shadow-sm" role="alert">${message}</div>
  `;
  alertPlaceholder.appendChild(wrapper);
  setTimeout(() => wrapper.remove(), timeout);
}

function openAddModal() {
  contactIdEl.value = '';
  nameEl.value = '';
  emailEl.value = '';
  phoneEl.value = '';
  modalTitle.textContent = 'Add Contact';
  contactModal.show();
}

function openEditModal(id) {
  const c = contacts.find(x => x.id === id);
  if (!c) return showAlert('Contact not found', 'warning');
  contactIdEl.value = c.id;
  nameEl.value = c.name;
  emailEl.value = c.email;
  phoneEl.value = c.phone || '';
  modalTitle.textContent = 'Edit Contact';
  contactModal.show();
}

function addContact(data) {
  contacts.unshift({ id: Date.now().toString(), ...data });
  saveContacts();
  renderContacts(searchInput.value);
  showAlert('Contact added');
}

function updateContact(id, data) {
  const idx = contacts.findIndex(c => c.id === id);
  if (idx === -1) return showAlert('Contact not found', 'warning');
  contacts[idx] = { ...contacts[idx], ...data };
  saveContacts();
  renderContacts(searchInput.value);
  showAlert('Contact updated');
}

function deleteContact(id) {
  if (!confirm('Delete this contact?')) return;
  contacts = contacts.filter(c => c.id !== id);
  saveContacts();
  renderContacts(searchInput.value);
  showAlert('Contact deleted', 'danger');
}

// Events
document.getElementById('addContactBtn').addEventListener('click', openAddModal);
form.addEventListener('submit', e => {
  e.preventDefault();
  if (!form.checkValidity()) return form.reportValidity();
  const id = contactIdEl.value;
  const data = { name: nameEl.value.trim(), email: emailEl.value.trim(), phone: phoneEl.value.trim() };
  if (!id) addContact(data); else updateContact(id, data);
  contactModal.hide();
});

tbody.addEventListener('click', e => {
  const btn = e.target.closest('button');
  if (!btn) return;
  const id = btn.getAttribute('data-id');
  const action = btn.getAttribute('data-action');
  if (action === 'edit') openEditModal(id);
  if (action === 'delete') deleteContact(id);
});

searchInput.addEventListener('input', () => renderContacts(searchInput.value));

// Init
loadContacts();
renderContacts();
