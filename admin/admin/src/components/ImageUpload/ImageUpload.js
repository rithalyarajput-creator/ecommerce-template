import React, { useRef, useState } from 'react';
import styles from './ImageUpload.module.css';

export default function ImageUpload({ images = [], onChange, multiple = true }) {
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef();

  const handleFiles = (files) => {
    const fileArr = Array.from(files);
    const previews = fileArr.map(f => ({
      file: f,
      preview: URL.createObjectURL(f),
    }));
    if (multiple) onChange([...images, ...previews]);
    else onChange(previews.slice(0, 1));
  };

  const handleDrop = (e) => {
    e.preventDefault(); setDragging(false);
    handleFiles(e.dataTransfer.files);
  };

  const removeImage = (idx) => {
    const updated = images.filter((_, i) => i !== idx);
    onChange(updated);
  };

  return (
    <div className={styles.wrap}>
      <div
        className={`${styles.dropzone} ${dragging ? styles.dragging : ''}`}
        onDragOver={e => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        onClick={() => inputRef.current.click()}
      >
        <div className={styles.dropIcon}>🖼️</div>
        <div className={styles.dropText}>
          <strong>Click to upload</strong> or drag & drop
        </div>
        <div className={styles.dropSub}>PNG, JPG, WEBP up to 10MB</div>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          multiple={multiple}
          style={{ display: 'none' }}
          onChange={e => handleFiles(e.target.files)}
        />
      </div>

      {images.length > 0 && (
        <div className={styles.previewGrid}>
          {images.map((img, i) => (
            <div key={i} className={styles.previewItem}>
              <img src={img.preview || img.url || img} alt="" className={styles.previewImg} />
              <button className={styles.removeBtn} onClick={() => removeImage(i)}>✕</button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
