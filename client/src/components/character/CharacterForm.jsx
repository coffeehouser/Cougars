import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import characterService from '../../services/characterService';
import { useDragAndDrop } from '../../hooks/useDragAndDrop';
import { validateCharacterForm, validateImageFile } from '../../utils/validation';
import './CharacterForm.css';

const ALIGNMENTS = [
  'Lawful Good', 'Neutral Good', 'Chaotic Good',
  'Lawful Neutral', 'True Neutral', 'Chaotic Neutral',
  'Lawful Evil', 'Neutral Evil', 'Chaotic Evil'
];

const CharacterForm = ({ character, isEdit = false }) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [profilePreview, setProfilePreview] = useState(character?.profileImage || null);
  const [bannerPreview, setBannerPreview] = useState(character?.bannerImage || null);
  const [profileFile, setProfileFile] = useState(null);
  const [bannerFile, setBannerFile] = useState(null);

  const [formData, setFormData] = useState({
    name: character?.name || '',
    race: character?.race || '',
    class: character?.class || '',
    level: character?.level || 1,
    background: character?.background || '',
    alignment: character?.alignment || 'True Neutral',
    bio: character?.bio || '',
    stats: {
      strength: character?.stats?.strength || 10,
      dexterity: character?.stats?.dexterity || 10,
      constitution: character?.stats?.constitution || 10,
      intelligence: character?.stats?.intelligence || 10,
      wisdom: character?.stats?.wisdom || 10,
      charisma: character?.stats?.charisma || 10
    }
  });

  // Drag and drop for profile image
  const handleProfileFiles = (files) => {
    const file = files[0];
    const validation = validateImageFile(file);

    if (!validation.isValid) {
      validation.errors.forEach(error => toast.error(error));
      return;
    }

    setProfileFile(file);
    setProfilePreview(URL.createObjectURL(file));
  };

  const { dragActive: profileDragActive, handleDrag: handleProfileDrag, handleDrop: handleProfileDrop } =
    useDragAndDrop(handleProfileFiles);

  // Drag and drop for banner image
  const handleBannerFiles = (files) => {
    const file = files[0];
    const validation = validateImageFile(file);

    if (!validation.isValid) {
      validation.errors.forEach(error => toast.error(error));
      return;
    }

    setBannerFile(file);
    setBannerPreview(URL.createObjectURL(file));
  };

  const { dragActive: bannerDragActive, handleDrag: handleBannerDrag, handleDrop: handleBannerDrop } =
    useDragAndDrop(handleBannerFiles);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name.startsWith('stat-')) {
      const statName = name.replace('stat-', '');
      setFormData({
        ...formData,
        stats: {
          ...formData.stats,
          [statName]: parseInt(value) || 10
        }
      });
    } else {
      setFormData({
        ...formData,
        [name]: value
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate form data
    const validation = validateCharacterForm(formData);
    if (!validation.isValid) {
      setErrors(validation.errors);
      // Show first error as toast
      const firstError = Object.values(validation.errors)[0];
      toast.error(firstError);
      return;
    }

    setErrors({});
    setLoading(true);

    try {
      let savedCharacter;

      if (isEdit) {
        const result = await characterService.updateCharacter(character._id, formData);
        savedCharacter = result.character;
        toast.success('Character updated successfully!');
      } else {
        const result = await characterService.createCharacter(formData);
        savedCharacter = result.character;
        toast.success('Character created successfully!');
      }

      // Upload profile image if selected
      if (profileFile) {
        try {
          await characterService.uploadImage(savedCharacter._id, profileFile, 'profile');
          toast.success('Profile image uploaded!');
        } catch (imgError) {

          toast.error('Character saved but profile image failed to upload');
        }
      }

      // Upload banner image if selected
      if (bannerFile) {
        try {
          await characterService.uploadImage(savedCharacter._id, bannerFile, 'banner');
          toast.success('Banner image uploaded!');
        } catch (imgError) {

          toast.error('Character saved but banner image failed to upload');
        }
      }

      // Navigate after all uploads complete
      setTimeout(() => {
        navigate(`/character/${savedCharacter._id}`);
      }, 1000);
    } catch (error) {

      toast.error(error.response?.data?.message || 'Failed to save character');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="character-form-container">
      <h1>{isEdit ? 'Edit Character' : 'Create New Character'}</h1>

      <form onSubmit={handleSubmit} className="character-form">
        {/* Banner Image Upload */}
        <div className="form-section">
          <h2>Banner Image</h2>
          <div
            className={`image-drop-zone banner-drop ${bannerDragActive ? 'drag-active' : ''}`}
            onDragEnter={handleBannerDrag}
            onDragLeave={handleBannerDrag}
            onDragOver={handleBannerDrag}
            onDrop={handleBannerDrop}
            onClick={() => document.getElementById('banner-input').click()}
          >
            {bannerPreview ? (
              <img src={bannerPreview} alt="Banner preview" className="image-preview banner-preview" />
            ) : (
              <div className="drop-zone-content">
                <p>Drag banner image here or click to browse</p>
                <span className="file-hint">Recommended: 800x200px</span>
              </div>
            )}
            <input
              id="banner-input"
              type="file"
              accept="image/*"
              onChange={(e) => handleBannerFiles(e.target.files)}
              style={{ display: 'none' }}
            />
          </div>
        </div>

        {/* Profile Image Upload */}
        <div className="form-section">
          <h2>Profile Image</h2>
          <div
            className={`image-drop-zone profile-drop ${profileDragActive ? 'drag-active' : ''}`}
            onDragEnter={handleProfileDrag}
            onDragLeave={handleProfileDrag}
            onDragOver={handleProfileDrag}
            onDrop={handleProfileDrop}
            onClick={() => document.getElementById('profile-input').click()}
          >
            {profilePreview ? (
              <img src={profilePreview} alt="Profile preview" className="image-preview profile-preview" />
            ) : (
              <div className="drop-zone-content">
                <p>Drag profile image here or click to browse</p>
                <span className="file-hint">Recommended: Square image</span>
              </div>
            )}
            <input
              id="profile-input"
              type="file"
              accept="image/*"
              onChange={(e) => handleProfileFiles(e.target.files)}
              style={{ display: 'none' }}
            />
          </div>
        </div>

        {/* Basic Information */}
        <div className="form-section">
          <h2>Basic Information</h2>
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="name">Character Name *</label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                disabled={loading}
              />
            </div>

            <div className="form-group">
              <label htmlFor="level">Level *</label>
              <input
                type="number"
                id="level"
                name="level"
                value={formData.level}
                onChange={handleChange}
                min="1"
                max="20"
                required
                disabled={loading}
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="race">Race *</label>
              <input
                type="text"
                id="race"
                name="race"
                value={formData.race}
                onChange={handleChange}
                placeholder="e.g., Human, Elf, Dwarf"
                required
                disabled={loading}
              />
            </div>

            <div className="form-group">
              <label htmlFor="class">Class *</label>
              <input
                type="text"
                id="class"
                name="class"
                value={formData.class}
                onChange={handleChange}
                placeholder="e.g., Fighter, Wizard, Rogue"
                required
                disabled={loading}
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="background">Background</label>
              <input
                type="text"
                id="background"
                name="background"
                value={formData.background}
                onChange={handleChange}
                placeholder="e.g., Soldier, Noble, Criminal"
                disabled={loading}
              />
            </div>

            <div className="form-group">
              <label htmlFor="alignment">Alignment</label>
              <select
                id="alignment"
                name="alignment"
                value={formData.alignment}
                onChange={handleChange}
                disabled={loading}
              >
                {ALIGNMENTS.map(align => (
                  <option key={align} value={align}>{align}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* D&D Stats */}
        <div className="form-section">
          <h2>Ability Scores</h2>
          <div className="stats-grid">
            {Object.entries(formData.stats).map(([stat, value]) => (
              <div key={stat} className="stat-input">
                <label htmlFor={`stat-${stat}`}>
                  {stat.charAt(0).toUpperCase() + stat.slice(1)}
                </label>
                <input
                  type="number"
                  id={`stat-${stat}`}
                  name={`stat-${stat}`}
                  value={value}
                  onChange={handleChange}
                  min="1"
                  max="30"
                  required
                  disabled={loading}
                />
              </div>
            ))}
          </div>
        </div>

        {/* Biography */}
        <div className="form-section">
          <h2>Biography</h2>
          <div className="form-group">
            <label htmlFor="bio">Character Bio</label>
            <textarea
              id="bio"
              name="bio"
              value={formData.bio}
              onChange={handleChange}
              rows="6"
              maxLength="2000"
              placeholder="Tell us about your character..."
              disabled={loading}
            />
            <span className="char-count">{formData.bio.length}/2000</span>
          </div>
        </div>

        <div className="form-actions">
          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? 'Saving...' : (isEdit ? 'Update Character' : 'Create Character')}
          </button>
          <button
            type="button"
            className="btn-secondary"
            onClick={() => navigate(-1)}
            disabled={loading}
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default CharacterForm;
