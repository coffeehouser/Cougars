import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useAuth } from '../../context/AuthContext';
import characterService from '../../services/characterService';
import CharacterForm from './CharacterForm';
import LoadingSpinner from '../common/LoadingSpinner';

const EditCharacter = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [character, setCharacter] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCharacter();
  }, [id]);

  const loadCharacter = async () => {
    try {
      const data = await characterService.getCharacterById(id);

      // Check if user owns this character
      if (!user || data.character.owner._id !== user.id) {
        toast.error('You do not have permission to edit this character');
        navigate(`/character/${id}`);
        return;
      }

      setCharacter(data.character);
    } catch (error) {
      toast.error('Failed to load character');

      navigate('/my-characters');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <LoadingSpinner message="Loading character..." />;
  }

  if (!character) {
    return null;
  }

  return <CharacterForm character={character} isEdit={true} />;
};

export default EditCharacter;
