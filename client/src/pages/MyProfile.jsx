import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import memberService from '../services/memberService';
import LoadingSpinner from '../components/common/LoadingSpinner';

function MyProfile() {
  const navigate = useNavigate();

  useEffect(() => {
    memberService.getMyProfile()
      .then(data => {
        if (data.member) {
          navigate(`/member/${data.member._id}`, { replace: true });
        } else {
          navigate('/profile/create', { replace: true });
        }
      })
      .catch(() => navigate('/profile/create', { replace: true }));
  }, [navigate]);

  return <LoadingSpinner />;
}

export default MyProfile;
