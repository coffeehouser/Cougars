import { useState, useEffect } from 'react';
import './PhotoGallery.css';

function PhotoGallery() {
  const [photos, setPhotos] = useState([]);
  const [title, setTitle] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [lightbox, setLightbox] = useState(null); // index of open photo

  useEffect(() => {
    fetch('/images/gallery/manifest.json')
      .then(r => r.json())
      .then(data => {
        setTitle(data.title || '');
        setSubtitle(data.subtitle || '');
        setPhotos(data.photos || []);
      })
      .catch(() => setPhotos([]));
  }, []);

  const openLightbox = (index) => setLightbox(index);
  const closeLightbox = () => setLightbox(null);
  const prev = () => setLightbox(i => (i - 1 + photos.length) % photos.length);
  const next = () => setLightbox(i => (i + 1) % photos.length);

  const handleKeyDown = (e) => {
    if (e.key === 'Escape') closeLightbox();
    if (e.key === 'ArrowLeft') prev();
    if (e.key === 'ArrowRight') next();
  };

  if (photos.length === 0) return null;

  return (
    <div className="photo-gallery">

      <div className="photo-gallery__grid">
        {photos.map((photo, i) => (
          <button
            key={photo.file}
            className="photo-gallery__item"
            onClick={() => openLightbox(i)}
            aria-label={photo.caption || `Photo ${i + 1}`}
          >
            <img
              src={`/images/gallery/${photo.file}`}
              alt={photo.caption || ''}
              className="photo-gallery__img"
              loading="lazy"
            />
            {photo.caption && (
              <div className="photo-gallery__caption">{photo.caption}</div>
            )}
          </button>
        ))}
      </div>

      {/* Lightbox */}
      {lightbox !== null && (
        <div
          className="photo-gallery__lightbox"
          onClick={closeLightbox}
          onKeyDown={handleKeyDown}
          role="dialog"
          aria-modal="true"
          aria-label="Photo viewer"
          tabIndex={-1}
        >
          <button
            className="photo-gallery__lb-close"
            onClick={closeLightbox}
            aria-label="Close"
          >✕</button>

          {photos.length > 1 && (
            <button
              className="photo-gallery__lb-prev"
              onClick={e => { e.stopPropagation(); prev(); }}
              aria-label="Previous photo"
            >‹</button>
          )}

          <div
            className="photo-gallery__lb-content"
            onClick={e => e.stopPropagation()}
          >
            <img
              src={`/images/gallery/${photos[lightbox].file}`}
              alt={photos[lightbox].caption || ''}
              className="photo-gallery__lb-img"
            />
            {photos[lightbox].caption && (
              <p className="photo-gallery__lb-caption">{photos[lightbox].caption}</p>
            )}
            {photos.length > 1 && (
              <p className="photo-gallery__lb-counter">
                {lightbox + 1} / {photos.length}
              </p>
            )}
          </div>

          {photos.length > 1 && (
            <button
              className="photo-gallery__lb-next"
              onClick={e => { e.stopPropagation(); next(); }}
              aria-label="Next photo"
            >›</button>
          )}
        </div>
      )}
    </div>
  );
}

export default PhotoGallery;
