import { useState, useRef, useEffect } from 'react';
import { toast } from 'react-toastify';
import './BannerEditor.css';

const BannerEditor = ({ currentBanner, onSave, onCancel }) => {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [imageSize, setImageSize] = useState({ width: 0, height: 0 });
  const containerRef = useRef(null);
  const imageRef = useRef(null);

  useEffect(() => {
    // Load the image to get its dimensions
    const img = new Image();
    img.onload = () => {
      setImageSize({ width: img.width, height: img.height });
      // Center the image initially if it's larger than the container
      if (containerRef.current) {
        const containerHeight = 300; // Banner height
        const containerWidth = containerRef.current.offsetWidth;

        // Calculate initial position to center the image
        const scale = Math.max(
          containerWidth / img.width,
          containerHeight / img.height
        );

        const scaledWidth = img.width * scale;
        const scaledHeight = img.height * scale;

        setPosition({
          x: Math.min(0, (containerWidth - scaledWidth) / 2),
          y: Math.min(0, (containerHeight - scaledHeight) / 2)
        });
      }
    };
    img.src = currentBanner;
  }, [currentBanner]);

  const handleMouseDown = (e) => {
    setIsDragging(true);
    setDragStart({
      x: e.clientX - position.x,
      y: e.clientY - position.y
    });
  };

  const handleMouseMove = (e) => {
    if (!isDragging || !containerRef.current || !imageRef.current) return;

    const containerRect = containerRef.current.getBoundingClientRect();
    const imageRect = imageRef.current.getBoundingClientRect();

    let newX = e.clientX - dragStart.x;
    let newY = e.clientY - dragStart.y;

    // Constrain movement so image doesn't go out of bounds
    const minX = containerRect.width - imageRect.width;
    const minY = containerRect.height - imageRect.height;

    newX = Math.min(0, Math.max(minX, newX));
    newY = Math.min(0, Math.max(minY, newY));

    setPosition({ x: newX, y: newY });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleTouchStart = (e) => {
    const touch = e.touches[0];
    setIsDragging(true);
    setDragStart({
      x: touch.clientX - position.x,
      y: touch.clientY - position.y
    });
  };

  const handleTouchMove = (e) => {
    if (!isDragging || !containerRef.current || !imageRef.current) return;

    const touch = e.touches[0];
    const containerRect = containerRef.current.getBoundingClientRect();
    const imageRect = imageRef.current.getBoundingClientRect();

    let newX = touch.clientX - dragStart.x;
    let newY = touch.clientY - dragStart.y;

    const minX = containerRect.width - imageRect.width;
    const minY = containerRect.height - imageRect.height;

    newX = Math.min(0, Math.max(minX, newX));
    newY = Math.min(0, Math.max(minY, newY));

    setPosition({ x: newX, y: newY });
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
  };

  const handleSave = () => {
    // Return the position data to parent component
    onSave({
      url: currentBanner,
      position: {
        x: position.x,
        y: position.y
      }
    });
  };

  useEffect(() => {
    // Add global mouse/touch event listeners
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      document.addEventListener('touchmove', handleTouchMove);
      document.addEventListener('touchend', handleTouchEnd);

      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
        document.removeEventListener('touchmove', handleTouchMove);
        document.removeEventListener('touchend', handleTouchEnd);
      };
    }
  }, [isDragging, position, dragStart]);

  return (
    <div className="banner-editor-overlay">
      <div className="banner-editor-modal">
        <div className="banner-editor-header">
          <h3>Adjust Banner Position</h3>
          <button className="close-btn" onClick={onCancel} type="button">×</button>
        </div>

        <div className="banner-editor-instructions">
          <p>🖱️ Drag the image to reposition it</p>
        </div>

        <div
          ref={containerRef}
          className="banner-preview-container"
        >
          <img
            ref={imageRef}
            src={currentBanner}
            alt="Banner preview"
            className={`banner-preview-image ${isDragging ? 'dragging' : ''}`}
            style={{
              transform: `translate(${position.x}px, ${position.y}px)`,
              cursor: isDragging ? 'grabbing' : 'grab'
            }}
            onMouseDown={handleMouseDown}
            onTouchStart={handleTouchStart}
            draggable={false}
          />
          <div className="banner-overlay-grid"></div>
        </div>

        <div className="banner-editor-actions">
          <button
            className="btn-secondary"
            onClick={onCancel}
            type="button"
          >
            Cancel
          </button>
          <button
            className="btn-primary"
            onClick={handleSave}
            type="button"
          >
            Save Position
          </button>
        </div>
      </div>
    </div>
  );
};

export default BannerEditor;
