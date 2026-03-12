import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import memberService from '../services/memberService';
import MemberForm from '../components/member/MemberForm';
import LoadingSpinner from '../components/common/LoadingSpinner';

function EditProfile() {
  const navigate = useNavigate();
  const [member, setMember] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    memberService.getMyProfile()
      .then(data => {
        if (data.member) {
          setMember(data.member);
        } else {
          navigate('/profile/create', { replace: true });
        }
      })
      .catch(() => navigate('/profile/create', { replace: true }))
      .finally(() => setLoading(false));
  }, [navigate]);

  if (loading) return <LoadingSpinner />;
  if (!member) return null;

  return <MemberForm mode="edit" existingMember={member} />;
}

export default EditProfile;
