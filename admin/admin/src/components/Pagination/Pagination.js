import React from 'react';
import styles from './Pagination.module.css';

export default function Pagination({ page, totalPages, onChange }) {
  if (totalPages <= 1) return null;

  const pages = [];
  for (let i = 1; i <= totalPages; i++) pages.push(i);

  return (
    <div className={styles.wrap}>
      <button
        className={styles.btn}
        disabled={page === 1}
        onClick={() => onChange(page - 1)}
      >← Prev</button>

      <div className={styles.pages}>
        {pages.map(p => (
          <button
            key={p}
            className={`${styles.page} ${p === page ? styles.active : ''}`}
            onClick={() => onChange(p)}
          >{p}</button>
        ))}
      </div>

      <button
        className={styles.btn}
        disabled={page === totalPages}
        onClick={() => onChange(page + 1)}
      >Next →</button>
    </div>
  );
}
