import React from 'react';
import styles from './StatsCard.module.css';

export default function StatsCard({ title, value, icon, change, changeType, color }) {
  const isPositive = changeType === 'up';
  return (
    <div className={styles.card}>
      <div className={styles.top}>
        <div className={styles.iconWrap} style={{ background: color + '18', color }}>
          <span>{icon}</span>
        </div>
        <div className={`${styles.change} ${isPositive ? styles.up : styles.down}`}>
          <span>{isPositive ? '↑' : '↓'}</span>
          <span>{change}</span>
        </div>
      </div>
      <div className={styles.value}>{value}</div>
      <div className={styles.title}>{title}</div>
      <div className={styles.sub}>vs last month</div>
    </div>
  );
}
