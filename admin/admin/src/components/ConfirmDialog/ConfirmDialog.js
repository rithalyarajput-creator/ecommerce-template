import React from 'react';
import Modal from '../Modal/Modal';
import styles from './ConfirmDialog.module.css';

export default function ConfirmDialog({ isOpen, onClose, onConfirm, title, message, loading }) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title || 'Confirm Action'}
      size="sm"
      footer={
        <>
          <button className="btn btn-ghost" onClick={onClose}>Cancel</button>
          <button className="btn btn-danger" onClick={onConfirm} disabled={loading}>
            {loading ? <span className="spinner" /> : 'Delete'}
          </button>
        </>
      }
    >
      <div className={styles.content}>
        <div className={styles.icon}>⚠️</div>
        <p className={styles.message}>{message || 'Are you sure? This action cannot be undone.'}</p>
      </div>
    </Modal>
  );
}
