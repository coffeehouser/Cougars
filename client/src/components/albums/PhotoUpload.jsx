import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { useDragAndDrop } from '../../hooks/useDragAndDrop';
import photoService from '../../services/photoService';
import characterService from '../../services/characterService';
import './PhotoUpload.css';

// Compress image to reduce file size for upload
const compressImage = (file, maxSizeMB = 2, maxWidth = 1920) => {
  return new Promise((resolve) => {
    // If file is already small enough, return as-is
    if (file.size <= maxSizeMB * 1024 * 1024) {
      resolve(file);
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let { width, height } = img;

        // Scale down if too wide
        if (width > maxWidth) {
          height = (height * maxWidth) / width;
          width = maxWidth;
        }

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);

        // Start with high quality and reduce until file is small enough
        let quality = 0.8;
        const tryCompress = () => {
          canvas.toBlob(
            (blob) => {
              if (blob.size > maxSizeMB * 1024 * 1024 && quality > 0.3) {
                quality -= 0.1;
                tryCompress();
              } else {
                const compressedFile = new File([blob], file.name, {
                  type: 'image/jpeg',
                  lastModified: Date.now()
                });
                resolve(compressedFile);
              }
            },
            'image/jpeg',
            quality
          );
        };
        tryCompress();
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  });
};

const PhotoUpload = ({ albumId, onUploadComplete }) => {
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [previews, setPreviews] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState({});
  const [allCharacters, setAllCharacters] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showCharacterSearch, setShowCharacterSearch] = useState(null);

  useEffect(() => {
    loadAllCharacters();
  }, []);

  const loadAllCharacters = async () => {
    try {
      const data = await characterService.getAllCharacters();
      setAllCharacters(data.characters || []);
    } catch (error) {

    }
  };

  const handleFilesSelected = (files) => {
    const imageFiles = files.filter(file => file.type.startsWith('image/'));

    if (imageFiles.length !== files.length) {
      toast.warning('Some files were skipped (only image files are allowed)');
    }

    if (imageFiles.length === 0) {
      toast.error('Please select valid image files');
      return;
    }

    // Check file sizes (20MB limit - will be compressed to 2MB)
    const oversizedFiles = imageFiles.filter(file => file.size > 20 * 1024 * 1024);
    if (oversizedFiles.length > 0) {
      toast.error(`${oversizedFiles.length} file(s) exceed the 20MB size limit`);
      return;
    }

    setSelectedFiles(imageFiles);

    // Create previews
    const newPreviews = imageFiles.map(file => ({
      file,
      url: URL.createObjectURL(file),
      caption: '',
      taggedCharacters: []
    }));
    setPreviews(newPreviews);
  };

  const { dragActive, handleDrag, handleDrop } = useDragAndDrop(handleFilesSelected);

  const handleFileInput = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFilesSelected(Array.from(e.target.files));
    }
  };

  const handleCaptionChange = (index, caption) => {
    const newPreviews = [...previews];
    newPreviews[index].caption = caption;
    setPreviews(newPreviews);
  };

  const handleTagCharacter = (photoIndex, character) => {
    const newPreviews = [...previews];
    if (!newPreviews[photoIndex].taggedCharacters.find(c => c._id === character._id)) {
      newPreviews[photoIndex].taggedCharacters.push(character);
      setPreviews(newPreviews);
    }
    setShowCharacterSearch(null);
    setSearchTerm('');
  };

  const handleRemoveTag = (photoIndex, characterId) => {
    const newPreviews = [...previews];
    newPreviews[photoIndex].taggedCharacters = newPreviews[photoIndex].taggedCharacters.filter(
      c => c._id !== characterId
    );
    setPreviews(newPreviews);
  };

  const getFilteredCharacters = () => {
    if (!searchTerm) return allCharacters;
    const term = searchTerm.toLowerCase();
    return allCharacters.filter(char =>
      char.name.toLowerCase().includes(term)
    );
  };

  const removeFile = (index) => {
    const newFiles = selectedFiles.filter((_, i) => i !== index);
    const newPreviews = previews.filter((_, i) => i !== index);
    setSelectedFiles(newFiles);
    setPreviews(newPreviews);
  };

  const handleUpload = async () => {
    if (selectedFiles.length === 0) {
      toast.error('Please select at least one photo');
      return;
    }

    setUploading(true);
    setUploadProgress({});

    try {
      // Compress images before uploading (max 2MB each for Vercel limits)
      toast.info('Compressing images...');
      const compressedFiles = await Promise.all(
        selectedFiles.map(file => compressImage(file, 2, 1920))
      );

      const captions = previews.map(p => p.caption);
      const taggedCharacters = previews.map(p => p.taggedCharacters.map(c => c._id));

      // Upload one at a time to stay under Vercel's 4.5MB limit
      for (let i = 0; i < compressedFiles.length; i++) {
        setUploadProgress(prev => ({ ...prev, [i]: 50 }));
        await photoService.uploadPhotos(albumId, [compressedFiles[i]], [captions[i]], [taggedCharacters[i]]);
        setUploadProgress(prev => ({ ...prev, [i]: 100 }));
      }

      toast.success(`${selectedFiles.length} photo(s) uploaded successfully!`);

      // Clear the form
      setSelectedFiles([]);
      setPreviews([]);

      // Notify parent component
      if (onUploadComplete) {
        onUploadComplete();
      }
    } catch (error) {

      toast.error(error.response?.data?.message || 'Failed to upload photos');
    } finally {
      setUploading(false);
      setUploadProgress({});
    }
  };

  return (
    <div className="photo-upload">
      <div
        className={`upload-dropzone ${dragActive ? 'drag-active' : ''}`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={() => !uploading && document.getElementById('file-input').click()}
        style={{ cursor: uploading ? 'not-allowed' : 'pointer' }}
      >
        <div className="dropzone-content">
          <span className="dropzone-icon">📷</span>
          <p className="dropzone-text">
            Drag and drop photos here, or click to browse
          </p>
          <p className="dropzone-subtext">
            Supports: JPG, PNG, GIF, WebP (auto-compressed, up to 20 photos)
          </p>
          <input
            id="file-input"
            type="file"
            accept="image/*"
            multiple
            onChange={handleFileInput}
            style={{ display: 'none' }}
            disabled={uploading}
          />
        </div>
      </div>

      {previews.length > 0 && (
        <div className="preview-section">
          <h3>Selected Photos ({previews.length})</h3>
          <div className="previews-grid">
            {previews.map((preview, index) => (
              <div key={index} className="preview-item">
                <div className="preview-image-wrapper">
                  <img src={preview.url} alt={`Preview ${index + 1}`} />
                  <button
                    onClick={() => removeFile(index)}
                    className="remove-preview-btn"
                    disabled={uploading}
                    type="button"
                  >
                    ×
                  </button>
                </div>
                <input
                  type="text"
                  placeholder="Add caption (optional)"
                  value={preview.caption}
                  onChange={(e) => handleCaptionChange(index, e.target.value)}
                  className="caption-input"
                  maxLength={500}
                  disabled={uploading}
                />

                <div className="tag-characters-section">
                  <div className="tagged-characters">
                    {preview.taggedCharacters.map(char => (
                      <span key={char._id} className="character-tag">
                        {char.name}
                        <button
                          type="button"
                          onClick={() => handleRemoveTag(index, char._id)}
                          className="remove-tag-btn"
                          disabled={uploading}
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowCharacterSearch(showCharacterSearch === index ? null : index)}
                    className="btn-tag-character"
                    disabled={uploading}
                  >
                    + Tag Character
                  </button>

                  {showCharacterSearch === index && (
                    <div className="character-search-dropdown">
                      <input
                        type="text"
                        placeholder="Search characters..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="character-search-input"
                        autoFocus
                      />
                      <div className="character-search-results">
                        {getFilteredCharacters().slice(0, 10).map(char => (
                          <div
                            key={char._id}
                            onClick={() => handleTagCharacter(index, char)}
                            className="character-search-item"
                          >
                            <img src={char.profileImage} alt={char.name} />
                            <span>{char.name}</span>
                          </div>
                        ))}
                        {getFilteredCharacters().length === 0 && (
                          <div className="no-results">No characters found</div>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {uploadProgress[index] !== undefined && (
                  <div className="upload-progress-bar">
                    <div
                      className="upload-progress-fill"
                      style={{ width: `${uploadProgress[index]}%` }}
                    />
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="upload-actions">
            <button
              onClick={() => {
                setSelectedFiles([]);
                setPreviews([]);
              }}
              className="btn-secondary"
              disabled={uploading}
              type="button"
            >
              Clear All
            </button>
            <button
              onClick={handleUpload}
              className="btn-primary"
              disabled={uploading}
              type="button"
            >
              {uploading ? 'Uploading...' : `Upload ${selectedFiles.length} Photo${selectedFiles.length > 1 ? 's' : ''}`}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default PhotoUpload;
