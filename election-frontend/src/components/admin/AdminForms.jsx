import React, { useState, useEffect } from 'react';
import api from '../../services/api';

const schemaConfig = {
  glossary: [
    { name: 'term', label: 'Term', type: 'text', required: true },
    { name: 'def', label: 'Definition', type: 'textarea', required: true }
  ],
  timeline: [
    { name: 'image', label: 'Upload Image', type: 'file', required: false },
    { name: 'order', label: 'Order Number', type: 'number', required: true },
    { name: 'phase', label: 'Phase Name (e.g. Phase 1)', type: 'text', required: true },
    { name: 'title', label: 'Title', type: 'text', required: true },
    { name: 'desc', label: 'Description', type: 'textarea', required: true },
    { name: 'status', label: 'Status (done, active, upcoming)', type: 'text', required: true },
    { name: 'label', label: 'Label (e.g. Completed)', type: 'text', required: true },
    { name: 'details', label: 'Details (comma separated)', type: 'text', required: true }
  ],
  steps: [
    { name: 'image', label: 'Upload Image', type: 'file', required: false },
    { name: 'stepNumber', label: 'Step Number', type: 'number', required: true },
    { name: 'phase', label: 'Phase Label', type: 'text', required: true },
    { name: 'title', label: 'Title', type: 'text', required: true },
    { name: 'body', label: 'Body Content', type: 'textarea', required: true },
    { name: 'fact', label: 'Key Fact', type: 'text', required: true }
  ],
  quiz: [
    { name: 'image', label: 'Upload Image', type: 'file', required: false },
    { name: 'order', label: 'Order Number', type: 'number', required: true },
    { name: 'q', label: 'Question', type: 'text', required: true },
    { name: 'opts', label: 'Options (comma separated)', type: 'text', required: true },
    { name: 'ans', label: 'Correct Answer', type: 'text', required: true },
    { name: 'exp', label: 'Explanation', type: 'textarea', required: true }
  ]
};

const AdminForms = ({ model }) => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/content/${model}`);
      setItems(res.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [model]);

  const openModal = (item = null) => {
    setEditingItem(item);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingItem(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    
    schemaConfig[model].forEach(f => {
      let val = formData.get(f.name);
      if (f.type === 'file' && val && val.size === 0) {
        formData.delete(f.name);
      } else if ((f.name === 'details' || f.name === 'opts') && val) {
        formData.delete(f.name);
        val.split(',').forEach(s => formData.append(f.name, s.trim()));
      }
    });

    try {
      if (editingItem) {
        await api.put(`/admin/${model}/${editingItem._id}`, formData);
      } else {
        await api.post(`/admin/${model}`, formData);
      }
      closeModal();
      loadData();
    } catch (err) {
      console.error(err);
      alert('Error saving item');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this item?')) return;
    try {
      await api.delete(`/admin/${model}/${id}`);
      loadData();
    } catch (err) {
      console.error(err);
    }
  };

  const capitalize = (s) => s.charAt(0).toUpperCase() + s.slice(1);

  return (
    <div>
      <div className="header-actions">
        <h2>{capitalize(model)} Management</h2>
        <button className="btn btn-primary" onClick={() => openModal()}>+ Add {capitalize(model)}</button>
      </div>

      {loading ? (<div>Loading...</div>) : (
        <div className="item-list">
          {items.map(item => {
            const title = item.term || item.title || item.q;
            const subtitle = item.def || item.desc || item.body || item.exp;
            return (
              <div className="item-row" key={item._id}>
                <div className="item-content" style={{display: 'flex', gap: '1rem', alignItems: 'center'}}>
                  {item.imageUrl && <img src={item.imageUrl} alt="" style={{width: '60px', height: '60px', objectFit: 'cover', borderRadius: '4px'}} />}
                  <div>
                    <h4>{title}</h4>
                    <p>{subtitle?.substring(0, 80)}...</p>
                  </div>
                </div>
                <div className="item-actions">
                  <button className="btn" onClick={() => openModal(item)}>Edit</button>
                  <button className="btn btn-danger" onClick={() => handleDelete(item._id)}>Delete</button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {isModalOpen && (
        <div className="modal" style={{display: 'flex'}}>
          <div className="modal-content">
            <span className="close-btn" onClick={closeModal}>&times;</span>
            <h3 style={{marginBottom: '1.5rem'}}>{editingItem ? 'Edit' : 'Add'} {capitalize(model)}</h3>
            <form onSubmit={handleSubmit}>
              {schemaConfig[model].map(f => {
                let defaultVal = editingItem ? editingItem[f.name] : '';
                if (Array.isArray(defaultVal)) defaultVal = defaultVal.join(', ');

                if (f.type === 'textarea') {
                  return (
                    <div className="form-group" key={f.name}>
                      <label>{f.label}</label>
                      <textarea name={f.name} className="form-control" rows="3" defaultValue={defaultVal} required={f.required}></textarea>
                    </div>
                  );
                } else if (f.type === 'file') {
                  return (
                    <div className="form-group" key={f.name}>
                      <label>{f.label}</label>
                      <input type="file" name={f.name} accept="image/*" className="form-control" />
                      {editingItem?.imageUrl && (
                        <img src={editingItem.imageUrl} alt="Preview" style={{width: '100px', height: '100px', objectFit: 'cover', borderRadius: '4px', marginTop: '0.5rem'}} />
                      )}
                    </div>
                  );
                } else {
                  return (
                    <div className="form-group" key={f.name}>
                      <label>{f.label}</label>
                      <input type={f.type} name={f.name} className="form-control" defaultValue={defaultVal} required={f.required} />
                    </div>
                  );
                }
              })}
              <div style={{textAlign: 'right', marginTop: '2rem'}}>
                <button type="button" className="btn" onClick={closeModal} style={{marginRight: '0.5rem'}}>Cancel</button>
                <button type="submit" className="btn btn-primary">Save Changes</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminForms;
