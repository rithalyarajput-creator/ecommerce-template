import React from 'react';
import styles from './Table.module.css';

export default function Table({ columns, data, onRowClick, loading }) {
  if (loading) {
    return (
      <div className={styles.tableWrap}>
        <div className="loading-center"><div className="spinner spinner-lg" /></div>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className={styles.tableWrap}>
        <div className="empty-state">
          <div className="empty-icon">📭</div>
          <h3>No data found</h3>
          <p>There's nothing to display yet.</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.tableWrap}>
      <table className={styles.table}>
        <thead>
          <tr>
            {columns.map(col => (
              <th key={col.key} style={{ width: col.width }}>
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, i) => (
            <tr
              key={row._id || row.id || i}
              onClick={() => onRowClick && onRowClick(row)}
              className={onRowClick ? styles.clickable : ''}
            >
              {columns.map(col => (
                <td key={col.key}>
                  {col.render ? col.render(row[col.key], row) : (row[col.key] ?? '—')}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
