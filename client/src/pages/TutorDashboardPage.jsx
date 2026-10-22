import React, { useState, useEffect, useMemo } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useSearchParams, Link } from 'react-router-dom';
import { updateTutorProfile, uploadTutorDocuments, removeTutorDocument } from '../store/slices/tutorsSlice';
import { updateInquiryStatus, fetchMyInquiries, respondToInquiry } from '../store/slices/inquiriesSlice';
import { updateUserAvatar } from '../store/slices/authSlice';
import ChangeAvatarModal from '../components/tutor/ChangeAvatarModal';
import { useLocationData } from '../hooks/useLocationData';
import { getLiveDistricts, lookupPincode } from '../services/locationService';
import { sanitizeErrorMessage } from '../utils/validation';
import { 
  SUBJECTS_LIST, 
  CLASSES_LIST, 
  BOARDS_LIST, 
  TEACHING_MODES,
  QUALIFICATIONS_CATEGORIES 
} from '../data/mockData';
import StarRating from '../components/common/StarRating';
import ModeBadge from '../components/common/ModeBadge';
import VerifiedBadge from '../components/common/VerifiedBadge';
import { 
  User, 
  Inbox, 
  MapPin, 
  Award, 
  BookOpen, 
  CheckCircle, 
  XCircle, 
  Phone, 
  Mail, 
  Save, 
  Clock, 
  IndianRupee, 
  ShieldCheck, 
  Layers,
  Upload,
  Calendar,
  Camera,
  Image,
  Sparkles,
  Loader2,
  Search,
  ExternalLink,
  Copy,
  Check,
  Home,
  X,
  Navigation,
  Compass,
  Bell,
  Ban,
  FileText,
  CheckCircle2,
  AlertCircle,
  FileCheck,
  Trash2,
  Eye,
  Info,
  Star,
  ChevronRight,
  ShieldAlert
} from 'lucide-react';

const SAMPLE_AVATARS = [
  "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1580894732444-8ecded7900cd?w=400&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&auto=format&fit=crop&q=80"
];

export default function TutorDashboardPage() {
  const dispatch = useDispatch();
  const [searchParams, setSearchParams] = useSearchParams();
  const urlTab = searchParams.get('tab');
  const isNewWelcome = searchParams.get('welcome') === 'true';

  const { tutors } = useSelector((state) => state.tutors);
  const { inquiries } = useSelector((state) => state.inquiries);
  const { currentUser } = useSelector((state) => state.auth);
  const { messages } = useSelector((state) => state.adminMessages || { messages: [] });
  const settings = useSelector((state) => state.settings?.settings) || {};

  const [realTutorProfile, setRealTutorProfile] = useState(null);

  // Match logged in tutor profile with MongoDB IDs and User reference
  const matchedTutor = tutors.find(t => 
    t.id === currentUser?.id || 
    t._id === currentUser?.id || 
    t._id === currentUser?._id || 
    t._id === currentUser?.tutorProfileId || 
    t.id === currentUser?.tutorProfileId ||
    t.user === currentUser?._id || 
    t.user === currentUser?.id ||
    t.email === currentUser?.email
  );

  const fallbackTutor = currentUser?.role === 'tutor' ? {
    id: currentUser.tutorProfileId || currentUser._id,
    _id: currentUser.tutorProfileId || currentUser._id,
    name: currentUser.name || 'Educator',
    email: currentUser.email,
    phone: currentUser.phone || '',
    avatar: currentUser.avatar || SAMPLE_AVATARS[0],
    tagline: 'Qualified Home & Online Educator',
    qualification: 'Certified Educator',
    experienceYears: 3,
    isVerified: false,
    verificationStatus: 'unverified',
    verificationDetails: { idProof: 'Pending Upload', degreeProof: 'Pending Upload', addressProof: 'Pending Upload' },
    verificationDocuments: [],
    location: { state: currentUser.state || 'Delhi NCR', city: currentUser.city || 'New Delhi', localities: [currentUser.locality || 'Main'], pincodes: [] },
    modes: ['home_visit', 'online'],
    subjects: ['Mathematics'],
    classes: ['Class 9 - 10 (Secondary)'],
    boards: ['CBSE'],
    rates: { hourly: 600, monthly: 7000 },
    bio: '',
    rating: 0,
    reviewCount: 0,
    reviews: []
  } : tutors[0];

  const myTutorProfile = realTutorProfile || matchedTutor || fallbackTutor;

  const fetchMyRealProfile = async () => {
    try {
      const token = localStorage.getItem('vidyanest_token');
      if (!token) return;
      const res = await fetch('/api/tutors/my-profile?t=' + Date.now(), {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        if (data.tutor) {
          setRealTutorProfile(data.tutor);
          setProfileForm(prev => ({
            ...prev,
            ...data.tutor
          }));
          if (data.tutor.avatar) {
            dispatch(updateUserAvatar({
              avatar: data.tutor.avatar,
              id: currentUser?._id || currentUser?.id
            }));
          }
          if (Array.isArray(data.tutor.verificationDocuments)) {
            const idDoc = data.tutor.verificationDocuments.find(d => d.docType === 'id_proof');
            const degDoc = data.tutor.verificationDocuments.find(d => d.docType === 'degree_certificate');
            const addrDoc = data.tutor.verificationDocuments.find(d => d.docType === 'address_proof');
            setDocsList({
              id_proof: idDoc ? { name: idDoc.docName, url: idDoc.fileUrl, type: idDoc.fileType, id: idDoc.id, status: idDoc.status } : null,
              degree_certificate: degDoc ? { name: degDoc.docName, url: degDoc.fileUrl, type: degDoc.fileType, id: degDoc.id, status: degDoc.status } : null,
              address_proof: addrDoc ? { name: addrDoc.docName, url: addrDoc.fileUrl, type: addrDoc.fileType, id: addrDoc.id, status: addrDoc.status } : null
            });
            if (data.tutor.verificationStatus === 'pending' && data.tutor.verificationDocuments.length > 0) {
              setIsDocsSubmitted(true);
            } else if (data.tutor.verificationStatus === 'unverified') {
              setIsDocsSubmitted(false);
            }
          }
        }
      }
    } catch {
      // quiet fallback
    }
  };

  useEffect(() => {
    fetchMyRealProfile();
  }, [currentUser?._id, currentUser?.id]);

  useEffect(() => {
    dispatch(fetchMyInquiries());
  }, [dispatch]);

  const [dismissedMsgIds, setDismissedMsgIds] = useState([]);
  const [serverNotices, setServerNotices] = useState([]);
  const [reminderInfo, setReminderInfo] = useState(null);

  const fetchTutorNotices = async () => {
    try {
      const token = localStorage.getItem('vidyanest_token');
      if (!token) return;
      const res = await fetch('/api/tutors/my-notices?t=' + Date.now(), {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setServerNotices(data.notices || []);
        setReminderInfo({
          reminderCount: data.reminderCount,
          lastReminderSentAt: data.lastReminderSentAt
        });
      }
    } catch {
      // quiet fallback
    }
  };

  useEffect(() => {
    fetchTutorNotices();
  }, [myTutorProfile?.id, myTutorProfile?._id]);

  const handleDismissNotice = async (msgId) => {
    // Clean memory: immediately remove notice from local state memory
    setDismissedMsgIds(prev => [...prev, msgId]);
    setServerNotices(prev => prev.filter(n => (n._id || n.id) !== msgId));
    try {
      const token = localStorage.getItem('vidyanest_token');
      if (token) {
        await fetch(`/api/tutors/my-notices/${msgId}/read`, {
          method: 'PUT',
          headers: { 'Authorization': `Bearer ${token}` }
        });
      }
    } catch (e) {
      // quiet fail
    }
  };

  // Active admin broadcast notices + automated 24-hour document reminders
  const activeNotices = useMemo(() => {
    const list = [];
    
    // 1. Add server notices (24h document submission reminders, admin notices)
    if (Array.isArray(serverNotices)) {
      serverNotices.forEach(n => {
        const id = n._id || n.id;
        if (!dismissedMsgIds.includes(id)) {
          list.push({
            id,
            title: n.title,
            message: n.message,
            type: n.type || 'warning',
            category: n.category || 'document_reminder',
            reminderNumber: n.reminderNumber || 1,
            sender: n.sender || 'VidyaNest Verification Desk',
            createdAt: n.createdAt ? new Date(n.createdAt).toLocaleDateString() : 'Today',
            actionUrl: n.actionUrl || '/tutor/dashboard?tab=verification',
            isServerNotice: true
          });
        }
      });
    }

    // 2. Add Redux broadcast messages
    if (messages) {
      messages.filter(m => 
        !dismissedMsgIds.includes(m.id) &&
        (m.target === 'all' || m.target === 'tutors' || m.targetId === myTutorProfile?.id)
      ).forEach(m => {
        // Prevent duplicate if already present
        if (!list.some(existing => existing.id === m.id)) {
          list.push(m);
        }
      });
    }

    return list;
  }, [messages, serverNotices, dismissedMsgIds, myTutorProfile?.id]);

  const [activeTab, setActiveTab] = useState(() => urlTab || 'inbox'); // 'inbox' | 'verification' | 'profile' | 'service_areas' | 'reviews'
  const [profileForm, setProfileForm] = useState({ ...myTutorProfile });
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [isAvatarModalOpen, setIsAvatarModalOpen] = useState(false);

  // Sync activeTab when URL param changes
  useEffect(() => {
    if (urlTab && ['inbox', 'verification', 'profile', 'service_areas', 'reviews'].includes(urlTab)) {
      setActiveTab(urlTab);
    }
  }, [urlTab]);

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setSearchParams(prev => {
      const next = new URLSearchParams(prev);
      next.set('tab', tab);
      return next;
    });
  };

  // -------------------------------------------------------------
  // VERIFICATION DOCUMENTS STATE & HANDLERS
  // -------------------------------------------------------------
  const [docsList, setDocsList] = useState({
    id_proof: null,
    degree_certificate: null,
    address_proof: null
  });
  const [isSubmittingDocs, setIsSubmittingDocs] = useState(false);
  const [isDocsSubmitted, setIsDocsSubmitted] = useState(false);
  const [docUploadFeedback, setDocUploadFeedback] = useState('');
  const [previewDocModal, setPreviewDocModal] = useState(null); // { title, url, type, fileType }

  const isPdfFile = (doc) => {
    if (!doc) return false;
    const url = (doc.url || doc.fileUrl || '').toLowerCase();
    const name = (doc.name || doc.docName || doc.title || '').toLowerCase();
    const type = (doc.fileType || doc.type || '').toLowerCase();
    return Boolean(
      type.includes('pdf') ||
      name.endsWith('.pdf') ||
      name.includes('.pdf') ||
      url.includes('.pdf') ||
      url.startsWith('data:application/pdf') ||
      url.includes('application/pdf')
    );
  };

  const displayDocUrl = useMemo(() => {
    if (!previewDocModal?.url) return '';
    const url = previewDocModal.url;
    if (url.startsWith('data:application/pdf')) {
      try {
        const base64Part = url.split(',')[1];
        const byteCharacters = atob(base64Part);
        const byteNumbers = new Uint8Array(byteCharacters.length);
        for (let i = 0; i < byteCharacters.length; i++) {
          byteNumbers[i] = byteCharacters.charCodeAt(i);
        }
        const blob = new Blob([byteNumbers], { type: 'application/pdf' });
        return URL.createObjectURL(blob);
      } catch {
        return url;
      }
    }
    return url;
  }, [previewDocModal?.url]);

  // Populate docsList from existing profile and check if already submitted
  useEffect(() => {
    if (myTutorProfile?.verificationDocuments && Array.isArray(myTutorProfile.verificationDocuments)) {
      const idDoc = myTutorProfile.verificationDocuments.find(d => d.docType === 'id_proof');
      const degDoc = myTutorProfile.verificationDocuments.find(d => d.docType === 'degree_certificate');
      const addrDoc = myTutorProfile.verificationDocuments.find(d => d.docType === 'address_proof');
      setDocsList({
        id_proof: idDoc || null,
        degree_certificate: degDoc || null,
        address_proof: addrDoc || null
      });

      // If tutor already has documents under pending admin audit, set button disabled (submitted)
      if (myTutorProfile.verificationStatus === 'pending' && myTutorProfile.verificationDocuments.length > 0) {
        setIsDocsSubmitted(true);
      } else {
        setIsDocsSubmitted(false);
      }
    }
  }, [myTutorProfile?.id, myTutorProfile?.verificationDocuments, myTutorProfile?.verificationStatus]);

  // Handle local file selection and convert to Base64 data URL for real preview
  const handleFileSelect = (docType, file) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      const newDoc = {
        docType,
        docName: file.name,
        fileUrl: e.target.result,
        fileType: file.type || 'image/jpeg',
        fileSize: `${(file.size / 1024).toFixed(0)} KB`,
        uploadedAt: new Date().toISOString().split('T')[0],
        status: 'pending'
      };
      setDocsList(prev => ({ ...prev, [docType]: newDoc }));
      // When a teacher selects a new document, re-enable the submit button
      setIsDocsSubmitted(false);
      setDocUploadFeedback(`Selected "${file.name}". Click "Submit Documents for Admin Verification" below.`);
    };
    reader.readAsDataURL(file);
  };



  // Remove a document - re-enables the submit button
  const handleRemoveDoc = async (docType) => {
    setDocsList(prev => ({ ...prev, [docType]: null }));
    // When teacher deletes a document, re-enable the submit button
    setIsDocsSubmitted(false);
    setDocUploadFeedback('Document removed. Submit button re-enabled for your updated submission.');

    dispatch(removeTutorDocument({
      tutorId: myTutorProfile?.id || myTutorProfile?._id,
      docType
    }));

    // If document was already uploaded to ImageKit on backend, delete it
    try {
      const token = localStorage.getItem('vidyanest_token');
      if (token) {
        await fetch(`/api/tutors/documents/${docType}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        fetchMyRealProfile();
      }
    } catch {
      // quiet fallback
    }
  };

  // Submit all documents to backend and Redux store - disables the submit button once submitted
  const handleSubmitDocs = async () => {
    const list = Object.values(docsList).filter(Boolean);
    if (!docsList.id_proof || !docsList.degree_certificate) {
      setDocUploadFeedback('⚠️ Please upload at least your Government Photo ID proof and Highest Academic Degree certificate before submitting.');
      return;
    }

    setIsSubmittingDocs(true);
    setDocUploadFeedback('');

    try {
      const token = localStorage.getItem('vidyanest_token');
      if (token) {
        await fetch('/api/tutors/upload-documents', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ documents: list })
        });
        fetchMyRealProfile();
        // Clean memory: immediately clear reminder notices from state memory
        setServerNotices(prev => prev.filter(n => n.category !== 'document_reminder'));
        fetchTutorNotices();
      }
    } catch {
      // quiet fallback
    }

    dispatch(uploadTutorDocuments({
      tutorId: myTutorProfile?.id || myTutorProfile?._id,
      documents: list
    }));

    setIsSubmittingDocs(false);
    // When teacher submits document, disable the submit button
    setIsDocsSubmitted(true);
    setDocUploadFeedback('✓ Documents submitted successfully! They are now visible on the Admin portal for verification.');
  };

  // Dynamic Location API for Tutor Service Area
  const serviceLoc = useLocationData(profileForm.location?.state, profileForm.location?.city);
  const [dashboardPincode, setDashboardPincode] = useState('');
  const [isLookingUpDashPin, setIsLookingUpDashPin] = useState(false);
  const [villageSearchTerm, setVillageSearchTerm] = useState('');

  const handleDashboardPinLookup = async (pin) => {
    setDashboardPincode(pin);
    if (/^\d{6}$/.test(pin.trim())) {
      setIsLookingUpDashPin(true);
      const res = await lookupPincode(pin.trim());
      setIsLookingUpDashPin(false);
      if (res && res.state) {
        setProfileForm(prev => ({
          ...prev,
          location: {
            ...prev.location,
            state: res.state,
            city: res.district
          }
        }));
      }
    }
  };

  useEffect(() => {
    if (myTutorProfile) {
      setProfileForm(prev => ({
        ...prev,
        avatar: myTutorProfile.avatar || prev.avatar
      }));
    }
  }, [myTutorProfile?.id, myTutorProfile?.avatar]);

  const [isAvatarSaving, setIsAvatarSaving] = useState(false);
  const [avatarSaveFeedback, setAvatarSaveFeedback] = useState('');

  // Save new avatar directly to server & ImageKit, and sync with Redux & localStorage
  const saveAvatar = async (newAvatarUrl) => {
    if (!newAvatarUrl) return;
    setIsAvatarSaving(true);
    setAvatarSaveFeedback('Saving profile photo...');

    // 1. Optimistic update in local state and Redux
    setProfileForm(prev => ({ ...prev, avatar: newAvatarUrl }));
    dispatch(updateUserAvatar({
      avatar: newAvatarUrl,
      id: currentUser?._id || currentUser?.id || myTutorProfile?.id || myTutorProfile?._id
    }));

    try {
      const token = localStorage.getItem('vidyanest_token');
      if (token) {
        const res = await fetch('/api/tutors/profile', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ avatar: newAvatarUrl })
        });
        if (res.ok) {
          const data = await res.json();
          if (data.tutor) {
            const finalAvatar = data.avatar || data.tutor.avatar || newAvatarUrl;
            setRealTutorProfile(data.tutor);
            setProfileForm(prev => ({ ...prev, avatar: finalAvatar }));
            dispatch(updateUserAvatar({
              avatar: finalAvatar,
              id: currentUser?._id || currentUser?.id
            }));
            dispatch(updateTutorProfile({
              id: data.tutor._id || data.tutor.id,
              updates: { avatar: finalAvatar, avatarFileId: data.tutor.avatarFileId }
            }));
            setAvatarSaveFeedback('✓ Profile photo updated successfully!');
            setSaveSuccess(true);
            setTimeout(() => {
              setSaveSuccess(false);
              setAvatarSaveFeedback('');
            }, 3500);
            return finalAvatar;
          }
        }
      }
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch {
      setAvatarSaveFeedback('Photo applied locally.');
      setTimeout(() => setAvatarSaveFeedback(''), 3000);
    } finally {
      setIsAvatarSaving(false);
    }
  };

  const handleSaveAvatarModal = async (newAvatarUrl) => {
    await saveAvatar(newAvatarUrl);
  };

  const handleAvatarUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        alert('Please select a valid image file (PNG, JPG, or WebP).');
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        alert('Image is too large. Maximum allowed size is 5MB.');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = async () => {
        const newAvatar = reader.result;
        await saveAvatar(newAvatar);
      };
      reader.readAsDataURL(file);
    }
  };

  // Response dialog state for accepting/rejecting
  const [selectedInquiry, setSelectedInquiry] = useState(null);
  const [responseStatus, setResponseStatus] = useState('accepted');
  const [responseNote, setResponseNote] = useState('');
  const [copiedInquiryId, setCopiedInquiryId] = useState(null);
  const [isUpdatingInquiry, setIsUpdatingInquiry] = useState(false);
  const [inquiryActionError, setInquiryActionError] = useState('');

  // Helper to format student's complete location
  const getInquiryFullAddress = (inq) => {
    if (inq?.fullAddress) return inq.fullAddress;
    const parts = [
      inq?.houseLocation || inq?.address,
      inq?.landmark ? `Landmark: ${inq.landmark}` : null,
      inq?.locality,
      inq?.city,
      inq?.state,
      inq?.pincode
    ].filter(Boolean);
    return parts.join(', ') || inq?.locality || 'Location not specified';
  };

  const handleCopyAddress = (inquiryId, addressText) => {
    navigator.clipboard?.writeText(addressText);
    setCopiedInquiryId(inquiryId);
    setTimeout(() => {
      setCopiedInquiryId(null);
    }, 2000);
  };

  // Tutor's specific inquiries: if logged in as tutor, inquiries in store come from /api/inquiries/my
  const tutorInquiries = currentUser?.role === 'tutor'
    ? inquiries
    : inquiries.filter(i => 
        i.tutorId === myTutorProfile?.id || 
        i.tutorId === myTutorProfile?._id || 
        i.tutor === myTutorProfile?._id || 
        i.tutor === myTutorProfile?.id ||
        (i.tutor && typeof i.tutor === 'object' && (i.tutor._id === myTutorProfile?._id || i.tutor.id === myTutorProfile?.id)) ||
        (i.tutorName && myTutorProfile?.name && i.tutorName.toLowerCase() === myTutorProfile.name.toLowerCase())
      );
  const pendingCount = tutorInquiries.filter(i => i.status === 'pending').length;

  const handleProfileSave = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const token = localStorage.getItem('vidyanest_token');
      if (token) {
        const res = await fetch('/api/tutors/profile', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(profileForm)
        });
        if (res.ok) {
          const data = await res.json();
          if (data.tutor) {
            setRealTutorProfile(data.tutor);
            setProfileForm(prev => ({ ...prev, ...data.tutor }));
            if (data.tutor.avatar) {
              dispatch(updateUserAvatar({
                avatar: data.tutor.avatar,
                id: currentUser?._id || currentUser?.id
              }));
            }
            dispatch(updateTutorProfile({
              id: data.tutor._id || data.tutor.id,
              updates: data.tutor
            }));
          }
        }
      }
      dispatch(updateTutorProfile({
        id: myTutorProfile?.id || myTutorProfile?._id,
        updates: profileForm
      }));
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 2500);
    } catch {
      // quiet fallback
    } finally {
      setIsSaving(false);
    }
  };

  const handleToggleSubject = (sub) => {
    const subjects = profileForm.subjects.includes(sub)
      ? profileForm.subjects.filter(s => s !== sub)
      : [...profileForm.subjects, sub];
    setProfileForm({ ...profileForm, subjects });
  };

  const handleToggleBoard = (board) => {
    const boards = profileForm.boards.includes(board)
      ? profileForm.boards.filter(b => b !== board)
      : [...profileForm.boards, board];
    setProfileForm({ ...profileForm, boards });
  };

  const handleToggleClass = (cls) => {
    const classes = profileForm.classes.includes(cls)
      ? profileForm.classes.filter(c => c !== cls)
      : [...profileForm.classes, cls];
    setProfileForm({ ...profileForm, classes });
  };

  const handleToggleMode = (modeId) => {
    const modes = profileForm.modes.includes(modeId)
      ? profileForm.modes.filter(m => m !== modeId)
      : [...profileForm.modes, modeId];
    setProfileForm({ ...profileForm, modes });
  };

  const handleOpenActionDialog = (inquiry, status) => {
    setSelectedInquiry(inquiry);
    setResponseStatus(status);
    setInquiryActionError('');
    setResponseNote(
      status === 'accepted'
        ? "Hello! I have reviewed your request and would be glad to tutor. I can accommodate the requested time slot. Let's arrange a 30-min intro call."
        : "Thank you for reaching out. Unfortunately, my current schedule is fully committed for this time slot."
    );
  };

  const handleConfirmInquiryAction = async () => {
    if (!selectedInquiry) return;
    const targetId = selectedInquiry._id || selectedInquiry.id;
    setIsUpdatingInquiry(true);
    setInquiryActionError('');

    try {
      // 1. Optimistic update in Redux store for instantaneous responsiveness
      dispatch(updateInquiryStatus({
        inquiryId: targetId,
        status: responseStatus,
        responseNote
      }));

      // 2. Real database update in MongoDB via backend API
      await dispatch(respondToInquiry({
        inquiryId: targetId,
        status: responseStatus,
        responseNote
      })).unwrap();

      // 3. Re-sync with backend to guarantee consistent state
      dispatch(fetchMyInquiries());
      setSelectedInquiry(null);
    } catch (err) {
      setInquiryActionError(sanitizeErrorMessage(err, 'Failed to update request. Please try again.'));
    } finally {
      setIsUpdatingInquiry(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">

      {/* Dynamic Console Branding & Educator Portal Header */}
      <div className="bg-gradient-to-r from-stone-950 via-brand-950 to-stone-900 rounded-3xl p-6 sm:p-7 text-white shadow-soft flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border border-brand-900/60">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-400/20 text-amber-300 text-xs font-bold border border-amber-400/30">
            <Sparkles className="w-3.5 h-3.5" />
            <span>{settings.tutorPortalTitle || "Educator Dashboard & Class Management"}</span>
          </div>
          <p className="text-xs sm:text-sm text-stone-300 max-w-2xl leading-relaxed mt-1">
            {settings.tutorPortalWelcome || "Receive direct student inquiries, manage your teaching calendar, and upload credentials for the green Verified Educator checkmark badge."}
          </p>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <div className="text-right hidden sm:block text-xs">
            <div className="text-stone-400">Tutor Support Helpline</div>
            <div className="font-bold text-amber-300">{settings.tutorSupportPhone || "+91 98711 54321"}</div>
          </div>
          <button
            type="button"
            onClick={() => handleTabChange('verification')}
            className="px-4 py-2.5 bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs rounded-xl shadow transition flex items-center gap-1.5 cursor-pointer"
          >
            <ShieldCheck className="w-4 h-4" />
            <span>ID Verification Desk</span>
          </button>
        </div>
      </div>

      {/* Newly Registered Welcome & Verification Prompt Banner */}
      {isNewWelcome && (
        <div className="p-5 bg-gradient-to-r from-emerald-900 via-brand-900 to-stone-900 text-white rounded-3xl shadow-xl border border-emerald-500/40 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 animate-in fade-in slide-in-from-top-4">
          <div className="flex items-start gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center justify-center shrink-0">
              <Sparkles className="w-6 h-6 text-emerald-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-serif text-lg font-bold">Welcome to {settings.siteName || 'VidyaNest'}, {myTutorProfile.name}!</h2>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-bold uppercase tracking-wider">
                  Step 2 of 2: Upload Documents
                </span>
              </div>
              <p className="text-xs text-stone-300 mt-1 max-w-2xl leading-relaxed">
                Your educator account is created. <strong>Please upload your Government ID and Degree documents</strong> below so our central administrative desk can audit your credentials and grant your official Verified Educator Badge.
              </p>
            </div>
          </div>
          <button
            onClick={() => handleTabChange('verification')}
            className="px-5 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-stone-950 text-xs font-extrabold rounded-xl shadow-md transition flex items-center gap-2 shrink-0 cursor-pointer"
          >
            <ShieldCheck className="w-4 h-4" />
            <span>Upload Documents Now</span>
          </button>
        </div>
      )}

      {/* Verification Status Banner (for non-welcome view) */}
      {!myTutorProfile.isVerified && !isNewWelcome && (
        <div className={`p-4 sm:p-5 rounded-3xl border shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 ${
          myTutorProfile.verificationStatus === 'pending'
            ? 'bg-amber-50/90 border-amber-300 text-amber-950'
            : myTutorProfile.verificationStatus === 'rejected'
            ? 'bg-red-50/90 border-red-300 text-red-950'
            : 'bg-emerald-50/90 border-emerald-300 text-emerald-950'
        }`}>
          <div className="flex items-start gap-3.5 flex-1">
            <div className={`p-2.5 rounded-2xl shrink-0 ${
              myTutorProfile.verificationStatus === 'pending'
                ? 'bg-amber-200 text-amber-900'
                : myTutorProfile.verificationStatus === 'rejected'
                ? 'bg-red-200 text-red-900'
                : 'bg-emerald-200 text-emerald-900'
            }`}>
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div className="text-xs space-y-0.5">
              <div className="font-bold text-sm">
                {myTutorProfile.verificationStatus === 'pending'
                  ? 'Verification Documents Under Administrative Review'
                  : myTutorProfile.verificationStatus === 'rejected'
                  ? 'Document Verification Needs Attention'
                  : 'Get Verified: Upload ID & Degree Documents to Earn the Verified Badge'}
              </div>
              <p className="opacity-90 leading-relaxed text-[11px]">
                {myTutorProfile.verificationStatus === 'pending'
                  ? 'Your credentials have been submitted and are currently queued for administrator audit. Turnaround time: within 24 hours.'
                  : myTutorProfile.verificationStatus === 'rejected'
                  ? 'Your documents require clearer scans or updated details. Please re-upload your valid government ID and degree.'
                  : 'Verified educators receive the green checkmark badge, rank at the top of search results, and get 4x more parent inquiries.'}
              </p>
            </div>
          </div>
          <button
            onClick={() => handleTabChange('verification')}
            className={`px-4 py-2 text-xs font-bold rounded-xl shadow-xs transition flex items-center gap-1.5 shrink-0 cursor-pointer ${
              myTutorProfile.verificationStatus === 'pending'
                ? 'bg-amber-700 hover:bg-amber-800 text-white'
                : 'bg-emerald-700 hover:bg-emerald-800 text-white'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>{myTutorProfile.verificationStatus === 'pending' ? 'View Submitted Docs' : 'Upload Documents →'}</span>
          </button>
        </div>
      )}

      {/* Account Blocked Alert Banner */}
      {myTutorProfile?.isBlocked && (
        <div className="p-4 sm:p-5 bg-red-50 border-2 border-red-300 text-red-900 rounded-3xl shadow-sm flex items-start gap-3.5">
          <Ban className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
          <div className="flex-1 text-xs">
            <div className="font-bold text-sm text-red-950">
              Administrative Notice: Educator Profile Suspended from Public Search
            </div>
            <p className="mt-1 leading-relaxed text-red-800">
              Your educator profile has been placed under administrative restriction by {settings.siteName || "VidyaNest"} Quality & Compliance.
              {myTutorProfile.blockedReason ? ` Reason: "${myTutorProfile.blockedReason}".` : ''} While suspended, your profile will not appear in parent search results and new inquiries cannot be initiated. Existing inquiries and profile updates remain accessible. To appeal or resolve this hold, contact our verification officer at <strong className="underline">{settings.verificationEmail || "verification@vidyanest.com"}</strong>.
            </p>
          </div>
        </div>
      )}

      {/* Admin Broadcast Notices */}
      {activeNotices.length > 0 && (
        <div className="space-y-3">
          {activeNotices.map((msg) => (
            <div
              key={msg.id}
              className={`p-4 sm:p-5 rounded-3xl border shadow-sm flex items-start justify-between gap-3.5 ${
                msg.type === 'alert'
                  ? 'bg-red-50 border-red-200 text-red-900'
                  : msg.type === 'warning'
                  ? 'bg-amber-50 border-amber-200 text-amber-900'
                  : msg.type === 'info'
                  ? 'bg-blue-50 border-blue-200 text-blue-900'
                  : 'bg-emerald-50 border-emerald-200 text-emerald-900'
              }`}
            >
              <div className="flex items-start gap-3 flex-1">
                <div className={`p-2 rounded-xl shrink-0 mt-0.5 ${
                  msg.type === 'alert' ? 'bg-red-200 text-red-800' :
                  msg.type === 'warning' ? 'bg-amber-200 text-amber-800' :
                  msg.type === 'info' ? 'bg-blue-200 text-blue-800' : 'bg-emerald-200 text-emerald-800'
                }`}>
                  <Bell className="w-4 h-4" />
                </div>
                <div className="space-y-1.5 text-xs flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-bold text-sm text-stone-900">{msg.title}</span>
                    {msg.category === 'document_reminder' && (
                      <span className="px-2 py-0.5 rounded-full bg-amber-400 text-stone-950 font-extrabold text-[10px] tracking-wider uppercase shadow-2xs">
                        24-Hour Notice #{msg.reminderNumber || 1}
                      </span>
                    )}
                    <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-white/70 text-stone-600">
                      {msg.sender || 'Admin Desk'}
                    </span>
                  </div>
                  <p className="leading-relaxed opacity-90">{msg.message}</p>
                  
                  {msg.category === 'document_reminder' && (
                    <div className="pt-2 flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleTabChange('verification')}
                        className="px-3.5 py-1.5 bg-amber-800 hover:bg-amber-900 text-white font-bold text-xs rounded-xl shadow-xs transition flex items-center gap-1.5 cursor-pointer"
                      >
                        <ShieldCheck className="w-3.5 h-3.5 text-amber-300" />
                        <span>Upload Documents to Clear Notice →</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>

              <button
                type="button"
                onClick={() => handleDismissNotice(msg.id)}
                className="p-1 text-stone-400 hover:text-stone-700 hover:bg-black/5 rounded-lg transition shrink-0"
                title="Dismiss Notice"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}
      
      {/* Tutor Top Banner */}
      <div className="bg-brand-900 text-white rounded-3xl p-4 sm:p-6 md:p-8 shadow-soft flex flex-col md:flex-row items-start md:items-center justify-between gap-4 sm:gap-6">
        <div className="flex items-center gap-3.5 sm:gap-5 min-w-0 w-full md:w-auto flex-1">
          <div className="flex flex-col items-center sm:items-start gap-2 shrink-0">
            <div className="relative group shrink-0">
              <img
                src={profileForm.avatar || myTutorProfile.avatar}
                alt={myTutorProfile.name}
                className="w-16 h-16 sm:w-24 sm:h-24 rounded-2xl object-cover border-2 border-brand-400 shadow-md cursor-pointer hover:brightness-95 transition"
                onClick={() => setIsAvatarModalOpen(true)}
              />
              {isAvatarSaving && (
                <div className="absolute inset-0 bg-brand-950/75 backdrop-blur-[2px] rounded-2xl flex flex-col items-center justify-center text-amber-300 z-10">
                  <Loader2 className="w-5 h-5 sm:w-6 sm:h-6 animate-spin" />
                  <span className="text-[9px] font-bold mt-1 text-white">Saving...</span>
                </div>
              )}
              <button
                type="button"
                onClick={() => setIsAvatarModalOpen(true)}
                disabled={isAvatarSaving}
                className="absolute -bottom-1 -right-1 bg-amber-500 hover:bg-amber-400 text-stone-900 p-1.5 rounded-xl shadow-lg border-2 border-brand-900 transition flex items-center justify-center cursor-pointer disabled:opacity-50"
                title="Change Profile Photo"
              >
                <Camera className="w-3.5 h-3.5" />
              </button>
            </div>
            <button
              type="button"
              onClick={() => setIsAvatarModalOpen(true)}
              disabled={isAvatarSaving}
              className="text-[11px] font-bold px-2.5 py-1 bg-white/10 hover:bg-white/20 text-stone-200 hover:text-white border border-white/20 rounded-lg transition flex items-center gap-1.5 shadow-sm cursor-pointer disabled:opacity-50"
            >
              {isAvatarSaving ? (
                <>
                  <Loader2 className="w-3 h-3 animate-spin text-amber-300" />
                  <span>Uploading...</span>
                </>
              ) : (
                <>
                  <Camera className="w-3 h-3 text-amber-300" />
                  <span>Change Photo</span>
                </>
              )}
            </button>
            {avatarSaveFeedback && (
              <span className="text-[10px] text-amber-300 font-bold bg-amber-950/60 px-2 py-0.5 rounded-md border border-amber-400/30">
                {avatarSaveFeedback}
              </span>
            )}
          </div>
          <div className="space-y-1 min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-amber-300">
                {settings.tutorPortalTitle || "Educator Dashboard"}
              </span>
              <VerifiedBadge isVerified={myTutorProfile.isVerified} />
            </div>
            <h1 className="font-serif text-2xl sm:text-3xl font-bold truncate">
              {myTutorProfile.name}
            </h1>
            <p className="text-xs sm:text-sm text-stone-300 truncate">
              {myTutorProfile.qualification} • {myTutorProfile.experienceYears} Years Exp. • {myTutorProfile.location?.city || 'Local'}
            </p>
            <div className="flex items-center gap-2 pt-1 text-xs">
              {myTutorProfile.reviewCount > 0 ? (
                <div className="flex items-center gap-1.5 text-amber-300 font-bold">
                  <StarRating rating={myTutorProfile.rating} size="sm" />
                  <span>{myTutorProfile.rating?.toFixed(1)}</span>
                  <span className="text-stone-300 font-normal">({myTutorProfile.reviewCount} student review{myTutorProfile.reviewCount > 1 ? 's' : ''})</span>
                </div>
              ) : (
                <span className="inline-flex items-center gap-1.5 text-stone-300">
                  <span className="text-amber-400 font-bold">★ New Educator</span>
                  <span>•</span>
                  <span>0 Reviews yet (reviews unlock after 1 month)</span>
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="flex sm:flex-col items-center sm:items-end justify-between w-full md:w-auto shrink-0 gap-2 bg-white/10 p-4 rounded-2xl border border-white/15">
          <div className="text-xs text-stone-300">Total Student Inquiries</div>
          <div className="font-serif text-2xl font-bold text-amber-300">
            {tutorInquiries.length} Requests
          </div>
          {pendingCount > 0 && (
            <span className="text-[11px] font-bold bg-amber-500 text-stone-900 px-2.5 py-0.5 rounded-full">
              {pendingCount} awaiting your reply
            </span>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-stone-200 space-x-6 text-sm font-semibold overflow-x-auto scrollbar-none pb-0.5">
        <button
          onClick={() => handleTabChange('inbox')}
          className={`pb-3 flex items-center gap-2 border-b-2 whitespace-nowrap transition cursor-pointer ${
            activeTab === 'inbox'
              ? 'border-brand-800 text-brand-900 font-bold'
              : 'border-transparent text-stone-500 hover:text-stone-800'
          }`}
        >
          <Inbox className="w-4 h-4" />
          <span>Student Inquiries</span>
          {pendingCount > 0 && (
            <span className="px-1.5 py-0.5 text-xs rounded-full bg-terracotta-100 text-terracotta-700 font-bold">
              {pendingCount}
            </span>
          )}
        </button>

        <button
          onClick={() => handleTabChange('verification')}
          className={`pb-3 flex items-center gap-2 border-b-2 whitespace-nowrap transition cursor-pointer ${
            activeTab === 'verification'
              ? 'border-brand-800 text-brand-900 font-bold'
              : 'border-transparent text-stone-500 hover:text-stone-800'
          }`}
        >
          <ShieldCheck className={`w-4 h-4 ${myTutorProfile.isVerified ? 'text-emerald-600' : 'text-amber-500'}`} />
          <span>Documents & Verification</span>
          {myTutorProfile.isVerified ? (
            <span className="px-2 py-0.5 text-[10px] rounded-full bg-emerald-100 text-emerald-800 font-extrabold flex items-center gap-1">
              <Check className="w-2.5 h-2.5 text-emerald-600" />
              Verified
            </span>
          ) : myTutorProfile.verificationStatus === 'pending' ? (
            <span className="px-2 py-0.5 text-[10px] rounded-full bg-amber-100 text-amber-800 font-extrabold animate-pulse">
              Under Review
            </span>
          ) : (
            <span className="px-2 py-0.5 text-[10px] rounded-full bg-terracotta-100 text-terracotta-800 font-extrabold">
              Upload Needed
            </span>
          )}
        </button>

        <button
          onClick={() => handleTabChange('profile')}
          className={`pb-3 flex items-center gap-2 border-b-2 whitespace-nowrap transition cursor-pointer ${
            activeTab === 'profile'
              ? 'border-brand-800 text-brand-900 font-bold'
              : 'border-transparent text-stone-500 hover:text-stone-800'
          }`}
        >
          <User className="w-4 h-4" />
          <span>Edit Profile & Rates</span>
        </button>

        <button
          onClick={() => handleTabChange('service_areas')}
          className={`pb-3 flex items-center gap-2 border-b-2 whitespace-nowrap transition cursor-pointer ${
            activeTab === 'service_areas'
              ? 'border-brand-800 text-brand-900 font-bold'
              : 'border-transparent text-stone-500 hover:text-stone-800'
          }`}
        >
          <MapPin className="w-4 h-4" />
          <span>Service Areas & Modes</span>
        </button>

        <button
          onClick={() => handleTabChange('reviews')}
          className={`pb-3 flex items-center gap-2 border-b-2 whitespace-nowrap transition cursor-pointer ${
            activeTab === 'reviews'
              ? 'border-brand-800 text-brand-900 font-bold'
              : 'border-transparent text-stone-500 hover:text-stone-800'
          }`}
        >
          <Award className="w-4 h-4" />
          <span>Reviews ({myTutorProfile.reviews?.length ?? myTutorProfile.reviewCount ?? 0})</span>
        </button>
      </div>

      {/* TAB 1: Inquiries Inbox */}
      {activeTab === 'inbox' && (
        <div className="space-y-4">
          {tutorInquiries.length === 0 ? (
            <div className="bg-white rounded-2xl border border-stone-200 p-12 text-center space-y-4">
              <Inbox className="w-10 h-10 text-stone-300 mx-auto" />
              <h3 className="font-serif text-lg font-bold text-stone-900">No Inquiries Received Yet</h3>
              <p className="text-xs text-stone-500 max-w-sm mx-auto">
                Students will contact you once your profile appears in search results for your localities.
              </p>
            </div>
          ) : (
            tutorInquiries.map((inq) => (
              <div
                key={inq.id}
                className="bg-white rounded-2xl p-6 border border-stone-200 shadow-soft space-y-4"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-stone-100">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-serif text-lg font-bold text-stone-900">
                        {inq.studentName}
                      </h3>
                      <span className="text-xs text-stone-500">
                        (Parent: <strong>{inq.parentName}</strong>)
                      </span>
                    </div>
                    <p className="text-xs text-stone-600 mt-0.5">
                      Subject: <strong>{inq.subject}</strong> • {inq.grade} • Board: {inq.board}
                    </p>
                  </div>

                  <div>
                    {inq.status === 'pending' && (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 text-amber-800 border border-amber-200 text-xs font-bold">
                        <Clock className="w-3.5 h-3.5 text-amber-600 animate-spin" />
                        <span>New Pending Request</span>
                      </span>
                    )}
                    {inq.status === 'accepted' && (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-bold">
                        <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Accepted</span>
                      </span>
                    )}
                    {inq.status === 'rejected' && (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-50 text-red-800 border border-red-200 text-xs font-bold">
                        <XCircle className="w-3.5 h-3.5 text-red-600" />
                        <span>Declined</span>
                      </span>
                    )}
                  </div>
                </div>

                {/* Student Full Location & Visit Information */}
                <div className="bg-gradient-to-r from-amber-50/80 via-warm-50/60 to-stone-50 rounded-2xl p-4 sm:p-5 border border-amber-200/90 shadow-2xs space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-3 border-b border-amber-200/60">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-900 flex items-center justify-center font-bold shrink-0">
                        {inq.mode === 'online' ? (
                          <Sparkles className="w-4 h-4 text-amber-700" />
                        ) : (
                          <Home className="w-4 h-4 text-amber-700" />
                        )}
                      </div>
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-xs font-bold text-stone-900 tracking-wide uppercase">
                            {inq.mode === 'home_visit'
                              ? "Student Doorstep Location (Home Visit)"
                              : inq.mode === 'online'
                              ? "Student Location (Online Class)"
                              : "Student Location (Tutor's Residence)"}
                          </span>
                          {inq.mode === 'home_visit' ? (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-terracotta-100 text-terracotta-800 border border-terracotta-200">
                              🏠 Teacher Travels to Student
                            </span>
                          ) : inq.mode === 'online' ? (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 border border-blue-200">
                              💻 Remote 1-on-1 Class
                            </span>
                          ) : (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-stone-100 text-stone-700 border border-stone-200">
                              🏫 Student Visits Tutor
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-stone-500 mt-0.5">
                          Student's exact address and landmark for route planning & commute evaluation
                        </p>
                      </div>
                    </div>

                    {/* Location Navigation & Copy Actions */}
                    <div className="flex items-center gap-2 shrink-0 pt-1 sm:pt-0">
                      <button
                        type="button"
                        onClick={() => handleCopyAddress(inq.id, getInquiryFullAddress(inq))}
                        className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-white hover:bg-stone-100 text-stone-700 border border-stone-200 shadow-2xs transition"
                        title="Copy student full address to clipboard"
                      >
                        {copiedInquiryId === inq.id ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-emerald-600" />
                            <span className="text-emerald-700 font-bold">Copied!</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5 text-stone-500" />
                            <span>Copy Address</span>
                          </>
                        )}
                      </button>

                      <a
                        href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(getInquiryFullAddress(inq))}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-brand-800 hover:bg-brand-900 text-white shadow-2xs transition"
                        title="Open this location in Google Maps"
                      >
                        <Navigation className="w-3.5 h-3.5" />
                        <span>Google Maps</span>
                        <ExternalLink className="w-3 h-3 text-brand-200" />
                      </a>
                    </div>
                  </div>

                  {/* Address Grid Breakdown */}
                  <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 text-xs">
                    {/* Doorstep / House Address */}
                    <div className="sm:col-span-12 md:col-span-6 lg:col-span-6 bg-white p-3 rounded-xl border border-stone-200/80 shadow-2xs space-y-1">
                      <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider block">
                        Exact Doorstep / House Address
                      </span>
                      <div className="font-bold text-stone-900 text-sm flex items-start gap-1.5">
                        <Home className="w-4 h-4 text-terracotta-600 shrink-0 mt-0.5" />
                        <span>{inq.houseLocation || inq.address || inq.locality}</span>
                      </div>
                      {inq.landmark && (
                        <div className="text-[11px] text-amber-900 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200/80 inline-flex items-center gap-1 mt-1 font-medium">
                          <span>📍 Landmark:</span>
                          <span>{inq.landmark}</span>
                        </div>
                      )}
                    </div>

                    {/* Locality & Sector */}
                    <div className="sm:col-span-6 md:col-span-3 lg:col-span-3 bg-white p-3 rounded-xl border border-stone-200/80 shadow-2xs space-y-1">
                      <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider block">
                        Locality / Area
                      </span>
                      <div className="font-bold text-stone-800 text-sm flex items-center gap-1.5">
                        <MapPin className="w-4 h-4 text-emerald-600 shrink-0" />
                        <span>{inq.locality}</span>
                      </div>
                      <span className="text-[11px] text-stone-500 block">
                        Primary neighborhood
                      </span>
                    </div>

                    {/* City, State & PIN */}
                    <div className="sm:col-span-6 md:col-span-3 lg:col-span-3 bg-white p-3 rounded-xl border border-stone-200/80 shadow-2xs space-y-1">
                      <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider block">
                        City & Pincode
                      </span>
                      <div className="font-bold text-stone-800 text-sm">
                        {inq.city || 'New Delhi'}{inq.state ? `, ${inq.state}` : ''}
                      </div>
                      <div className="text-[11px] font-bold text-brand-800">
                        PIN: {inq.pincode || '110048'}
                      </div>
                    </div>
                  </div>

                  {/* Complete Address String Callout */}
                  <div className="bg-amber-100/70 border border-amber-300/80 rounded-xl px-3.5 py-2 flex items-start gap-2 text-xs">
                    <Compass className="w-4 h-4 text-amber-800 shrink-0 mt-0.5" />
                    <div className="leading-relaxed">
                      <span className="font-bold text-amber-950">Full Address for Teacher Visit: </span>
                      <span className="text-stone-800 font-medium">{getInquiryFullAddress(inq)}</span>
                    </div>
                  </div>
                </div>

                {/* Schedule & Monthly Fee Details */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs bg-stone-50/80 p-3 rounded-xl border border-stone-200">
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-lg bg-stone-200/70 text-stone-700 flex items-center justify-center shrink-0">
                      <Clock className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <span className="text-stone-400 block font-medium text-[11px]">Requested Schedule</span>
                      <span className="font-bold text-stone-800">{inq.preferredDays} • {inq.preferredTime}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0">
                      <IndianRupee className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <span className="text-stone-400 block font-medium text-[11px]">Agreed Monthly Package</span>
                      <span className="font-serif font-bold text-sm text-stone-900">₹{inq.budgetPerMonth?.toLocaleString('en-IN') || inq.budgetPerMonth} <span className="text-[11px] font-medium text-stone-500">/ month</span></span>
                    </div>
                  </div>
                </div>

                {inq.studentNotes && (
                  <div className="text-xs text-stone-600 bg-stone-50 p-3 rounded-lg border border-stone-200/80">
                    <span className="font-bold text-stone-800">Student Requirements: </span>
                    {inq.studentNotes}
                  </div>
                )}

                {/* If accepted, show unlocked parent phone & email */}
                {inq.status === 'accepted' && (
                  <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs space-y-1.5">
                    <div className="font-bold text-emerald-900 flex items-center gap-1.5">
                      <CheckCircle className="w-4 h-4 text-emerald-600" />
                      <span>Parent Contact Details (Unlocked upon Accept)</span>
                    </div>
                    <div className="flex flex-wrap gap-4 text-stone-800 font-semibold pt-1">
                      <span className="flex items-center gap-1">
                        <Phone className="w-3.5 h-3.5 text-emerald-700" />
                        {inq.parentPhone}
                      </span>
                      <span className="flex items-center gap-1">
                        <Mail className="w-3.5 h-3.5 text-emerald-700" />
                        {inq.parentEmail}
                      </span>
                    </div>
                  </div>
                )}

                {/* Tutor response note display */}
                {inq.responseNote && (
                  <div className="text-xs text-stone-600 italic">
                    Your reply: "{inq.responseNote}"
                  </div>
                )}

                {/* Pending Actions */}
                {inq.status === 'pending' && (
                  <div className="flex items-center justify-end gap-3 pt-2 border-t border-stone-100">
                    <button
                      onClick={() => handleOpenActionDialog(inq, 'rejected')}
                      className="px-4 py-2 text-xs font-bold text-red-600 hover:bg-red-50 rounded-xl transition"
                    >
                      Decline Request
                    </button>
                    <button
                      onClick={() => handleOpenActionDialog(inq, 'accepted')}
                      className="px-5 py-2 text-xs font-bold text-white bg-brand-800 hover:bg-brand-900 rounded-xl shadow-sm transition flex items-center gap-1.5"
                    >
                      <CheckCircle className="w-3.5 h-3.5" />
                      Accept & Connect
                    </button>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      )}

      {/* TAB: Documents & Verification */}
      {activeTab === 'verification' && (
        <div className="space-y-6">
          {/* Header Card */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200 shadow-soft space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-stone-100">
              <div>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-bold mb-2">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Educator Verification & Trust Desk</span>
                </div>
                <h2 className="font-serif text-2xl font-bold text-stone-900">
                  Document Upload & Audit Center
                </h2>
                <p className="text-xs text-stone-500 mt-1 max-w-2xl leading-relaxed">
                  {settings.tutorVerificationDeskNotice || `${settings.siteName || 'VidyaNest'} requires verified physical degrees and government ID proofs. Once uploaded, our central administration verifies your credentials and awards the official Verified Badge.`}
                </p>
              </div>

              {/* Status Pill Badge */}
              <div className="flex flex-col items-start sm:items-end gap-1 shrink-0">
                <span className="text-[11px] font-semibold text-stone-400 uppercase tracking-wider">
                  Current Verification Status
                </span>
                {myTutorProfile.isVerified ? (
                  <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-emerald-100 text-emerald-900 border border-emerald-300 font-extrabold text-xs shadow-xs">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Verified Educator Active ✓</span>
                  </span>
                ) : myTutorProfile.verificationStatus === 'pending' ? (
                  <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-amber-100 text-amber-900 border border-amber-300 font-extrabold text-xs animate-pulse">
                    <Clock className="w-4 h-4 text-amber-600" />
                    <span>Documents Queued for Admin Audit</span>
                  </span>
                ) : myTutorProfile.verificationStatus === 'rejected' ? (
                  <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-red-100 text-red-900 border border-red-300 font-extrabold text-xs">
                    <AlertCircle className="w-4 h-4 text-red-600" />
                    <span>Action Required: Revision Requested</span>
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-stone-100 text-stone-800 border border-stone-300 font-extrabold text-xs">
                    <FileText className="w-4 h-4 text-stone-500" />
                    <span>Awaiting Document Upload</span>
                  </span>
                )}
              </div>
            </div>

            {/* Verification Step Flow Progress Bar */}
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 pt-2">
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-full bg-emerald-600 text-white font-bold text-xs flex items-center justify-center shrink-0">
                  ✓
                </div>
                <div>
                  <div className="text-[10px] uppercase font-bold text-emerald-800 tracking-wider">Step 1</div>
                  <div className="text-xs font-bold text-stone-900">Profile Created</div>
                </div>
              </div>

              <div className={`p-3 rounded-2xl border flex items-center gap-2.5 ${
                docsList.id_proof && docsList.degree_certificate
                  ? 'bg-emerald-50 border-emerald-200'
                  : 'bg-amber-50/80 border-amber-200'
              }`}>
                <div className={`w-7 h-7 rounded-full font-bold text-xs flex items-center justify-center shrink-0 ${
                  docsList.id_proof && docsList.degree_certificate
                    ? 'bg-emerald-600 text-white'
                    : 'bg-amber-400 text-stone-950 animate-pulse'
                }`}>
                  {docsList.id_proof && docsList.degree_certificate ? '✓' : '2'}
                </div>
                <div>
                  <div className="text-[10px] uppercase font-bold text-stone-500 tracking-wider">Step 2</div>
                  <div className="text-xs font-bold text-stone-900">Upload Credentials</div>
                </div>
              </div>

              <div className={`p-3 rounded-2xl border flex items-center gap-2.5 ${
                myTutorProfile.verificationStatus === 'pending'
                  ? 'bg-amber-50 border-amber-300 ring-2 ring-amber-300/40'
                  : myTutorProfile.isVerified
                  ? 'bg-emerald-50 border-emerald-200'
                  : 'bg-stone-50 border-stone-200 opacity-70'
              }`}>
                <div className={`w-7 h-7 rounded-full font-bold text-xs flex items-center justify-center shrink-0 ${
                  myTutorProfile.isVerified
                    ? 'bg-emerald-600 text-white'
                    : myTutorProfile.verificationStatus === 'pending'
                    ? 'bg-amber-500 text-white animate-spin'
                    : 'bg-stone-300 text-stone-700'
                }`}>
                  {myTutorProfile.isVerified ? '✓' : '3'}
                </div>
                <div>
                  <div className="text-[10px] uppercase font-bold text-stone-500 tracking-wider">Step 3</div>
                  <div className="text-xs font-bold text-stone-900">Admin Quality Audit</div>
                </div>
              </div>

              <div className={`p-3 rounded-2xl border flex items-center gap-2.5 ${
                myTutorProfile.isVerified
                  ? 'bg-emerald-50 border-emerald-300 ring-2 ring-emerald-400/40'
                  : 'bg-stone-50 border-stone-200 opacity-70'
              }`}>
                <div className={`w-7 h-7 rounded-full font-bold text-xs flex items-center justify-center shrink-0 ${
                  myTutorProfile.isVerified
                    ? 'bg-emerald-600 text-white'
                    : 'bg-stone-300 text-stone-700'
                }`}>
                  {myTutorProfile.isVerified ? '✓' : '4'}
                </div>
                <div>
                  <div className="text-[10px] uppercase font-bold text-stone-500 tracking-wider">Step 4</div>
                  <div className="text-xs font-bold text-stone-900">Verified Badge Active</div>
                </div>
              </div>
            </div>
          </div>

          {/* Feedback banner */}
          {docUploadFeedback && (
            <div className={`p-4 rounded-2xl border text-xs font-semibold flex items-center justify-between gap-3 ${
              docUploadFeedback.startsWith('✓')
                ? 'bg-emerald-50 border-emerald-300 text-emerald-900'
                : 'bg-amber-50 border-amber-300 text-amber-900'
            }`}>
              <div className="flex items-center gap-2">
                {docUploadFeedback.startsWith('✓') ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                )}
                <span>{docUploadFeedback}</span>
              </div>
              <button
                type="button"
                onClick={() => setDocUploadFeedback('')}
                className="text-stone-400 hover:text-stone-700 text-sm font-bold"
              >
                ✕
              </button>
            </div>
          )}

          {/* 3 DOCUMENT CARDS */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

            {/* CARD 1: Government Photo ID Proof */}
            <div className="bg-white rounded-3xl p-6 border border-stone-200 shadow-soft flex flex-col justify-between space-y-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between pb-3 border-b border-stone-100">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-brand-100 text-brand-900 flex items-center justify-center font-bold">
                      1
                    </div>
                    <div>
                      <h3 className="font-serif font-bold text-stone-900 text-sm">
                        Government Photo ID
                      </h3>
                      <span className="text-[10px] font-extrabold text-red-600 uppercase tracking-wider">
                        Mandatory
                      </span>
                    </div>
                  </div>
                  {docsList.id_proof ? (
                    <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-extrabold">
                      Uploaded ✓
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 rounded-full bg-stone-100 text-stone-600 text-[10px] font-bold">
                      Pending
                    </span>
                  )}
                </div>

                <p className="text-xs text-stone-500 leading-relaxed">
                  Aadhaar Card (front & back), PAN Card, Passport, or Voter ID to verify tutor legal identity.
                </p>

                {docsList.id_proof ? (
                  <div className="p-3.5 bg-stone-50 rounded-2xl border border-stone-200 space-y-2">
                    <div className="flex items-center gap-3">
                      <div 
                        onClick={() => setPreviewDocModal({
                          title: 'Government Photo ID Proof',
                          url: docsList.id_proof.fileUrl,
                          name: docsList.id_proof.docName,
                          fileType: docsList.id_proof.fileType || (isPdfFile(docsList.id_proof) ? 'application/pdf' : 'image/jpeg')
                        })}
                        className="w-14 h-14 rounded-xl overflow-hidden bg-stone-200 border border-stone-300 shrink-0 cursor-pointer group relative flex items-center justify-center shadow-xs"
                        title="Click to view full preview"
                      >
                        {isPdfFile(docsList.id_proof) ? (
                          <div className="w-full h-full bg-red-50 text-red-700 flex flex-col items-center justify-center p-1 group-hover:scale-105 transition">
                            <FileText className="w-6 h-6 text-red-600" />
                            <span className="text-[9px] font-extrabold uppercase mt-0.5 tracking-wider">PDF</span>
                          </div>
                        ) : (
                          <img src={docsList.id_proof.fileUrl} alt="ID Preview" className="w-full h-full object-cover group-hover:scale-110 transition" />
                        )}
                        <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition flex items-center justify-center text-white">
                          <Eye className="w-4 h-4" />
                        </div>
                      </div>
                      <div className="min-w-0 flex-1 text-xs">
                        <div className="font-bold text-stone-900 truncate" title={docsList.id_proof.docName}>
                          {docsList.id_proof.docName}
                        </div>
                        <div className="text-[11px] text-stone-400">
                          {docsList.id_proof.fileSize || 'Image'} • {docsList.id_proof.uploadedAt || 'Today'}
                        </div>
                        <div className="text-[10px] font-bold text-emerald-700 mt-0.5">
                          ✓ Ready for admin review
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-end gap-2 pt-1 border-t border-stone-200">
                      <button
                        type="button"
                        onClick={() => setPreviewDocModal({
                          title: 'Government Photo ID Proof',
                          url: docsList.id_proof.fileUrl,
                          name: docsList.id_proof.docName,
                          fileType: docsList.id_proof.fileType || (isPdfFile(docsList.id_proof) ? 'application/pdf' : 'image/jpeg')
                        })}
                        className="px-2.5 py-1 text-[11px] font-semibold text-stone-700 hover:bg-stone-200 rounded-lg transition flex items-center gap-1 cursor-pointer"
                      >
                        <Eye className="w-3 h-3 text-stone-500" />
                        <span>Preview</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleRemoveDoc('id_proof')}
                        className="px-2.5 py-1 text-[11px] font-semibold text-red-600 hover:bg-red-50 rounded-lg transition flex items-center gap-1 cursor-pointer"
                      >
                        <Trash2 className="w-3 h-3" />
                        <span>Remove</span>
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <label 
                      htmlFor="upload-id-proof"
                      className="border-2 border-dashed border-stone-300 hover:border-brand-600 hover:bg-brand-50/20 p-5 rounded-2xl flex flex-col items-center justify-center text-center cursor-pointer transition group"
                    >
                      <Upload className="w-6 h-6 text-stone-400 group-hover:text-brand-800 group-hover:scale-110 transition" />
                      <span className="text-xs font-bold text-stone-800 mt-2">
                        Upload ID Card (JPG, PNG, PDF)
                      </span>
                      <span className="text-[11px] text-stone-400 mt-0.5">
                        Drag file here or click to browse
                      </span>
                      <input
                        type="file"
                        id="upload-id-proof"
                        accept="image/*,application/pdf"
                        className="hidden"
                        onChange={(e) => handleFileSelect('id_proof', e.target.files[0])}
                      />
                    </label>
                  </div>
                )}
              </div>

              <div className="text-[11px] text-stone-400 pt-2 border-t border-stone-100 flex items-center gap-1">
                <Info className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                <span>Mask first 8 digits of Aadhaar if preferred</span>
              </div>
            </div>

            {/* CARD 2: Highest Academic Degree Certificate */}
            <div className="bg-white rounded-3xl p-6 border border-stone-200 shadow-soft flex flex-col justify-between space-y-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between pb-3 border-b border-stone-100">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-950 flex items-center justify-center font-bold">
                      2
                    </div>
                    <div>
                      <h3 className="font-serif font-bold text-stone-900 text-sm">
                        Degree / Qualification
                      </h3>
                      <span className="text-[10px] font-extrabold text-red-600 uppercase tracking-wider">
                        Mandatory
                      </span>
                    </div>
                  </div>
                  {docsList.degree_certificate ? (
                    <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-extrabold">
                      Uploaded ✓
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 rounded-full bg-stone-100 text-stone-600 text-[10px] font-bold">
                      Pending
                    </span>
                  )}
                </div>

                <p className="text-xs text-stone-500 leading-relaxed">
                  Official university degree, provisional diploma, B.Ed, marksheet, or college certificate matching "{myTutorProfile.qualification}".
                </p>

                {docsList.degree_certificate ? (
                  <div className="p-3.5 bg-stone-50 rounded-2xl border border-stone-200 space-y-2">
                    <div className="flex items-center gap-3">
                      <div 
                        onClick={() => setPreviewDocModal({
                          title: 'University Degree Certificate',
                          url: docsList.degree_certificate.fileUrl,
                          name: docsList.degree_certificate.docName,
                          fileType: docsList.degree_certificate.fileType || (isPdfFile(docsList.degree_certificate) ? 'application/pdf' : 'image/jpeg')
                        })}
                        className="w-14 h-14 rounded-xl overflow-hidden bg-stone-200 border border-stone-300 shrink-0 cursor-pointer group relative flex items-center justify-center shadow-xs"
                        title="Click to view full preview"
                      >
                        {isPdfFile(docsList.degree_certificate) ? (
                          <div className="w-full h-full bg-red-50 text-red-700 flex flex-col items-center justify-center p-1 group-hover:scale-105 transition">
                            <FileText className="w-6 h-6 text-red-600" />
                            <span className="text-[9px] font-extrabold uppercase mt-0.5 tracking-wider">PDF</span>
                          </div>
                        ) : (
                          <img src={docsList.degree_certificate.fileUrl} alt="Degree Preview" className="w-full h-full object-cover group-hover:scale-110 transition" />
                        )}
                        <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition flex items-center justify-center text-white">
                          <Eye className="w-4 h-4" />
                        </div>
                      </div>
                      <div className="min-w-0 flex-1 text-xs">
                        <div className="font-bold text-stone-900 truncate" title={docsList.degree_certificate.docName}>
                          {docsList.degree_certificate.docName}
                        </div>
                        <div className="text-[11px] text-stone-400">
                          {docsList.degree_certificate.fileSize || 'Document'} • {docsList.degree_certificate.uploadedAt || 'Today'}
                        </div>
                        <div className="text-[10px] font-bold text-emerald-700 mt-0.5">
                          ✓ Ready for admin review
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-end gap-2 pt-1 border-t border-stone-200">
                      <button
                        type="button"
                        onClick={() => setPreviewDocModal({
                          title: 'University Degree Certificate',
                          url: docsList.degree_certificate.fileUrl,
                          name: docsList.degree_certificate.docName,
                          fileType: docsList.degree_certificate.fileType || (isPdfFile(docsList.degree_certificate) ? 'application/pdf' : 'image/jpeg')
                        })}
                        className="px-2.5 py-1 text-[11px] font-semibold text-stone-700 hover:bg-stone-200 rounded-lg transition flex items-center gap-1 cursor-pointer"
                      >
                        <Eye className="w-3 h-3 text-stone-500" />
                        <span>Preview</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleRemoveDoc('degree_certificate')}
                        className="px-2.5 py-1 text-[11px] font-semibold text-red-600 hover:bg-red-50 rounded-lg transition flex items-center gap-1 cursor-pointer"
                      >
                        <Trash2 className="w-3 h-3" />
                        <span>Remove</span>
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <label 
                      htmlFor="upload-degree-cert"
                      className="border-2 border-dashed border-stone-300 hover:border-amber-600 hover:bg-amber-50/20 p-5 rounded-2xl flex flex-col items-center justify-center text-center cursor-pointer transition group"
                    >
                      <Upload className="w-6 h-6 text-stone-400 group-hover:text-amber-700 group-hover:scale-110 transition" />
                      <span className="text-xs font-bold text-stone-800 mt-2">
                        Upload Degree / Certificate
                      </span>
                      <span className="text-[11px] text-stone-400 mt-0.5">
                        PDF, JPG, or PNG (Max 10 MB)
                      </span>
                      <input
                        type="file"
                        id="upload-degree-cert"
                        accept="image/*,application/pdf"
                        className="hidden"
                        onChange={(e) => handleFileSelect('degree_certificate', e.target.files[0])}
                      />
                    </label>
                  </div>
                )}
              </div>

              <div className="text-[11px] text-stone-400 pt-2 border-t border-stone-100 flex items-center gap-1">
                <Info className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                <span>Shows college registrar seal or degree award</span>
              </div>
            </div>

            {/* CARD 3: Address Proof / Experience Certificate (Optional) */}
            <div className="bg-white rounded-3xl p-6 border border-stone-200 shadow-soft flex flex-col justify-between space-y-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between pb-3 border-b border-stone-100">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-stone-100 text-stone-800 flex items-center justify-center font-bold">
                      3
                    </div>
                    <div>
                      <h3 className="font-serif font-bold text-stone-900 text-sm">
                        Address / Experience
                      </h3>
                      <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider">
                        Optional
                      </span>
                    </div>
                  </div>
                  {docsList.address_proof ? (
                    <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-extrabold">
                      Uploaded ✓
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 rounded-full bg-stone-100 text-stone-500 text-[10px] font-semibold">
                      Optional
                    </span>
                  )}
                </div>

                <p className="text-xs text-stone-500 leading-relaxed">
                  Electricity/water bill, rent agreement, or school teaching experience letter to confirm doorstep radius in {myTutorProfile.location?.city}.
                </p>

                {docsList.address_proof ? (
                  <div className="p-3.5 bg-stone-50 rounded-2xl border border-stone-200 space-y-2">
                    <div className="flex items-center gap-3">
                      <div 
                        onClick={() => setPreviewDocModal({
                          title: 'Address / Experience Document',
                          url: docsList.address_proof.fileUrl,
                          name: docsList.address_proof.docName,
                          fileType: docsList.address_proof.fileType || (isPdfFile(docsList.address_proof) ? 'application/pdf' : 'image/jpeg')
                        })}
                        className="w-14 h-14 rounded-xl overflow-hidden bg-stone-200 border border-stone-300 shrink-0 cursor-pointer group relative flex items-center justify-center shadow-xs"
                        title="Click to view full preview"
                      >
                        {isPdfFile(docsList.address_proof) ? (
                          <div className="w-full h-full bg-red-50 text-red-700 flex flex-col items-center justify-center p-1 group-hover:scale-105 transition">
                            <FileText className="w-6 h-6 text-red-600" />
                            <span className="text-[9px] font-extrabold uppercase mt-0.5 tracking-wider">PDF</span>
                          </div>
                        ) : (
                          <img src={docsList.address_proof.fileUrl} alt="Address Preview" className="w-full h-full object-cover group-hover:scale-110 transition" />
                        )}
                        <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition flex items-center justify-center text-white">
                          <Eye className="w-4 h-4" />
                        </div>
                      </div>
                      <div className="min-w-0 flex-1 text-xs">
                        <div className="font-bold text-stone-900 truncate" title={docsList.address_proof.docName}>
                          {docsList.address_proof.docName}
                        </div>
                        <div className="text-[11px] text-stone-400">
                          {docsList.address_proof.fileSize || 'Document'} • {docsList.address_proof.uploadedAt || 'Today'}
                        </div>
                        <div className="text-[10px] font-bold text-emerald-700 mt-0.5">
                          ✓ Ready for admin review
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-end gap-2 pt-1 border-t border-stone-200">
                      <button
                        type="button"
                        onClick={() => setPreviewDocModal({
                          title: 'Address / Experience Document',
                          url: docsList.address_proof.fileUrl,
                          name: docsList.address_proof.docName,
                          fileType: docsList.address_proof.fileType || (isPdfFile(docsList.address_proof) ? 'application/pdf' : 'image/jpeg')
                        })}
                        className="px-2.5 py-1 text-[11px] font-semibold text-stone-700 hover:bg-stone-200 rounded-lg transition flex items-center gap-1 cursor-pointer"
                      >
                        <Eye className="w-3 h-3 text-stone-500" />
                        <span>Preview</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleRemoveDoc('address_proof')}
                        className="px-2.5 py-1 text-[11px] font-semibold text-red-600 hover:bg-red-50 rounded-lg transition flex items-center gap-1 cursor-pointer"
                      >
                        <Trash2 className="w-3 h-3" />
                        <span>Remove</span>
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <label 
                      htmlFor="upload-address-proof"
                      className="border-2 border-dashed border-stone-300 hover:border-stone-500 hover:bg-stone-50 p-5 rounded-2xl flex flex-col items-center justify-center text-center cursor-pointer transition group"
                    >
                      <Upload className="w-6 h-6 text-stone-400 group-hover:text-stone-700 group-hover:scale-110 transition" />
                      <span className="text-xs font-bold text-stone-800 mt-2">
                        Upload Address / School Letter
                      </span>
                      <span className="text-[11px] text-stone-400 mt-0.5">
                        PDF or image format
                      </span>
                      <input
                        type="file"
                        id="upload-address-proof"
                        accept="image/*,application/pdf"
                        className="hidden"
                        onChange={(e) => handleFileSelect('address_proof', e.target.files[0])}
                      />
                    </label>
                  </div>
                )}
              </div>

              <div className="text-[11px] text-stone-400 pt-2 border-t border-stone-100 flex items-center gap-1">
                <Info className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                <span>Helps confirm service radius for doorstep tuition</span>
              </div>
            </div>

          </div>

          {/* SUBMIT ACTION CARD */}
          <div className="bg-gradient-to-br from-stone-900 to-stone-950 text-white p-6 sm:p-8 rounded-3xl border border-stone-800 shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-400" />
                <h3 className="font-serif font-bold text-lg text-white">
                  Ready to Submit Credentials for Administrative Verification?
                </h3>
              </div>
              <p className="text-xs text-stone-400 max-w-2xl leading-relaxed">
                {settings.tutorVerificationDeskNotice || "By submitting, you certify that all uploaded certificates and identity credentials are true, valid, and unmodified. The VidyaNest Quality & Compliance administrator team will review them within 24 hours."}
              </p>
              {isDocsSubmitted && (
                <div className="text-[11px] text-emerald-400 flex items-center gap-1.5 pt-1 font-semibold">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>Documents submitted for verification. To update or re-upload, simply remove any document above to re-enable submission.</span>
                </div>
              )}
            </div>

            <button
              type="button"
              disabled={isSubmittingDocs || isDocsSubmitted}
              onClick={handleSubmitDocs}
              className={`px-7 py-3.5 font-extrabold text-xs rounded-xl shadow-lg transition flex items-center gap-2 shrink-0 ${
                isDocsSubmitted
                  ? 'bg-stone-800 text-stone-400 border border-stone-700 cursor-not-allowed opacity-75 shadow-none'
                  : 'bg-emerald-500 hover:bg-emerald-400 text-stone-950 cursor-pointer shadow-emerald-500/20'
              }`}
            >
              {isSubmittingDocs ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-emerald-400" />
                  <span>Uploading Documents...</span>
                </>
              ) : isDocsSubmitted ? (
                <>
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>Documents Submitted for Admin Verification</span>
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4" />
                  <span>Submit Documents for Admin Verification</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* TAB 2: Profile & Rates Editor */}
      {activeTab === 'profile' && (
        <form onSubmit={handleProfileSave} className="bg-white rounded-2xl p-4 sm:p-6 md:p-8 border border-stone-200 shadow-soft space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-stone-100">
            <div>
              <h2 className="font-serif text-xl sm:text-2xl font-bold text-stone-900">Profile & Fee Management</h2>
              <p className="text-xs text-stone-500">Update your public credentials and tutoring rates</p>
            </div>
            <button
              type="submit"
              className="w-full sm:w-auto justify-center px-5 py-2.5 bg-brand-800 hover:bg-brand-900 text-white font-bold text-xs rounded-xl shadow transition flex items-center gap-1.5 shrink-0 cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>Save Changes</span>
            </button>
          </div>

          {saveSuccess && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-bold flex items-center gap-2">
              <CheckCircle className="w-4 h-4" />
              <span>Profile updated successfully! Changes reflect across search results.</span>
            </div>
          )}

          {/* Profile Photo Editor Card */}
          <div className="p-4 sm:p-5 rounded-2xl bg-warm-50/80 border border-warm-200 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-stone-900 flex items-center gap-1.5">
                  <Camera className="w-4 h-4 text-brand-800" />
                  <span>Tutor Profile Picture</span>
                </h3>
                <p className="text-[11px] text-stone-500">
                  Upload a clear, professional photo from your device, choose from verified avatars, or paste a link.
                </p>
              </div>
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={() => setIsAvatarModalOpen(true)}
                  className="w-full sm:w-auto justify-center px-3.5 py-1.5 bg-amber-500 hover:bg-amber-400 text-stone-950 text-xs font-bold rounded-xl shadow-sm transition flex items-center gap-1.5 cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5 text-stone-950" />
                  <span>Change Photo Studio</span>
                </button>
                <span className="hidden sm:inline-block text-[10px] text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full font-bold border border-emerald-200 whitespace-nowrap">
                  Visible to Students & Parents
                </span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 sm:gap-5 text-center sm:text-left">
              {/* Photo Preview with camera badge */}
              <div className="relative shrink-0">
                <img
                  src={profileForm.avatar}
                  alt="Profile preview"
                  className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl object-cover border-2 border-brand-700 shadow-md cursor-pointer hover:brightness-95 transition"
                  onClick={() => setIsAvatarModalOpen(true)}
                />
                {isAvatarSaving && (
                  <div className="absolute inset-0 bg-brand-950/75 backdrop-blur-[2px] rounded-2xl flex flex-col items-center justify-center text-amber-300 z-10">
                    <Loader2 className="w-6 h-6 animate-spin" />
                    <span className="text-[9px] font-bold mt-1 text-white">Saving...</span>
                  </div>
                )}
                <button
                  type="button"
                  onClick={() => setIsAvatarModalOpen(true)}
                  disabled={isAvatarSaving}
                  className="absolute -bottom-1 -right-1 bg-amber-500 hover:bg-amber-400 text-stone-900 p-1.5 rounded-xl shadow cursor-pointer border border-white disabled:opacity-50"
                  title="Change Profile Photo"
                >
                  <Camera className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Upload Controls */}
              <div className="flex-1 space-y-3 w-full">
                <div className="flex flex-col sm:flex-row flex-wrap items-stretch sm:items-center gap-2 w-full">
                  <button
                    type="button"
                    onClick={() => setIsAvatarModalOpen(true)}
                    disabled={isAvatarSaving}
                    className="px-4 py-2 bg-brand-800 hover:bg-brand-900 text-white text-xs font-bold rounded-xl shadow transition flex items-center justify-center gap-1.5 disabled:opacity-50 cursor-pointer"
                  >
                    <Camera className="w-3.5 h-3.5 text-amber-300" />
                    <span>Change Profile Picture (Studio)</span>
                  </button>

                  <label className="cursor-pointer px-3.5 py-2 bg-white border border-stone-300 hover:bg-stone-50 text-stone-700 text-xs font-semibold rounded-xl shadow-sm transition flex items-center justify-center gap-1.5">
                    <Upload className="w-3.5 h-3.5 text-stone-600" />
                    <span>{isAvatarSaving ? 'Uploading...' : 'Quick Upload'}</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleAvatarUpload}
                      disabled={isAvatarSaving}
                      className="hidden"
                    />
                  </label>

                  <button
                    type="button"
                    onClick={() => setShowUrlInput(!showUrlInput)}
                    className="px-3 py-2 bg-white border border-stone-300 text-stone-700 text-xs font-semibold rounded-xl hover:bg-stone-50 transition cursor-pointer justify-center"
                  >
                    {showUrlInput ? 'Close Link Box' : 'Paste Image URL'}
                  </button>
                </div>

                {showUrlInput && (
                  <div className="flex flex-col sm:flex-row gap-2">
                    <input
                      type="url"
                      placeholder="Paste image link: https://example.com/photo.jpg"
                      value={profileForm.avatar}
                      onChange={(e) => {
                        setProfileForm({ ...profileForm, avatar: e.target.value });
                      }}
                      className="flex-1 px-3 py-2 text-xs rounded-xl border border-stone-300 outline-none focus:border-brand-800"
                    />
                    <button
                      type="button"
                      onClick={() => saveAvatar(profileForm.avatar)}
                      disabled={isAvatarSaving}
                      className="px-3.5 py-2 bg-brand-800 hover:bg-brand-900 text-white text-xs font-bold rounded-xl transition cursor-pointer disabled:opacity-50 justify-center"
                    >
                      Apply Link
                    </button>
                  </div>
                )}

                {/* Preset Avatars */}
                <div>
                  <span className="text-[11px] font-bold text-stone-500 block mb-1.5">
                    Or Choose from Pre-Verified Educator Avatars:
                  </span>
                  <div className="grid grid-cols-4 sm:flex sm:flex-wrap gap-2 justify-center sm:justify-start">
                    {SAMPLE_AVATARS.map((imgUrl, idx) => (
                      <button
                        type="button"
                        key={idx}
                        disabled={isAvatarSaving}
                        onClick={() => saveAvatar(imgUrl)}
                        className={`w-10 h-10 rounded-xl overflow-hidden border-2 transition cursor-pointer disabled:opacity-50 ${
                          profileForm.avatar === imgUrl 
                            ? 'border-brand-800 ring-2 ring-brand-800 scale-105' 
                            : 'border-stone-200 hover:border-stone-400 opacity-70 hover:opacity-100'
                        }`}
                        title={`Select Avatar ${idx + 1}`}
                      >
                        <img src={imgUrl} alt={`Avatar ${idx + 1}`} className="w-full h-full object-cover" />
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">Full Name</label>
              <input
                type="text"
                value={profileForm.name}
                onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                className="w-full text-xs p-2.5 rounded-xl border border-stone-300 outline-none focus:border-brand-800"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">Headline / Tagline</label>
              <input
                type="text"
                value={profileForm.tagline}
                onChange={(e) => setProfileForm({ ...profileForm, tagline: e.target.value })}
                className="w-full text-xs p-2.5 rounded-xl border border-stone-300 outline-none focus:border-brand-800"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-12 gap-4">
            <div className="sm:col-span-6">
              <label className="block text-xs font-bold text-stone-700 mb-1">
                Academic Qualifications (Inter / Bachelor / Master / Primary Cert)
              </label>
              <select
                value={profileForm.qualification}
                onChange={(e) => setProfileForm({ ...profileForm, qualification: e.target.value })}
                className="w-full text-xs p-2.5 rounded-xl border border-stone-300 outline-none bg-white font-medium text-stone-800 focus:border-brand-800"
              >
                {QUALIFICATIONS_CATEGORIES.map((cat) => (
                  <optgroup key={cat.category} label={`── ${cat.category} ──`} className="font-bold text-brand-900 bg-stone-100">
                    {cat.options.map((opt) => (
                      <option key={opt} value={opt} className="font-normal text-stone-800 bg-white">
                        {opt}
                      </option>
                    ))}
                  </optgroup>
                ))}
              </select>
            </div>
            <div className="sm:col-span-3">
              <label className="block text-xs font-bold text-stone-700 mb-1">Experience (Years)</label>
              <input
                type="number"
                min="0"
                max="40"
                value={profileForm.experienceYears}
                onChange={(e) => setProfileForm({ ...profileForm, experienceYears: Number(e.target.value) })}
                className="w-full text-xs p-2.5 rounded-xl border border-stone-300 outline-none focus:border-brand-800"
              />
            </div>
            <div className="sm:col-span-3">
              <label className="block text-xs font-bold text-stone-700 mb-1">Hourly Fee (₹)</label>
              <input
                type="number"
                min="250"
                step="50"
                value={profileForm.rates.hourly}
                onChange={(e) => setProfileForm({ 
                  ...profileForm, 
                  rates: { ...profileForm.rates, hourly: Number(e.target.value) } 
                })}
                className="w-full text-xs p-2.5 rounded-xl border border-stone-300 outline-none focus:border-brand-800"
              />
            </div>
          </div>

          {/* Classes Preferred to Teach */}
          <div className="p-4 rounded-2xl bg-warm-50/80 border border-warm-200 space-y-2">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <label className="block text-xs font-bold text-stone-900">
                Which Classes Do You Prefer to Teach? ({profileForm.classes?.length || 0} selected)
              </label>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setProfileForm({ ...profileForm, classes: CLASSES_LIST })}
                  className="text-[11px] font-bold text-brand-800 hover:underline"
                >
                  Select All
                </button>
                <span className="text-stone-300">•</span>
                <button
                  type="button"
                  onClick={() => setProfileForm({ ...profileForm, classes: ["Class 1 - 5 (Primary)"] })}
                  className="text-[11px] font-bold text-terracotta-600 hover:underline"
                >
                  Primary Only
                </button>
              </div>
            </div>

            <div className="flex flex-wrap gap-2 pt-1">
              {CLASSES_LIST.map((cls) => {
                const isSelected = profileForm.classes?.includes(cls);
                return (
                  <button
                    type="button"
                    key={cls}
                    onClick={() => handleToggleClass(cls)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-medium transition flex items-center gap-1.5 ${
                      isSelected
                        ? 'bg-brand-800 text-white font-bold shadow-sm'
                        : 'bg-white border border-stone-200 text-stone-700 hover:bg-stone-100'
                    }`}
                  >
                    <span>{cls}</span>
                    {isSelected && <span>✓</span>}
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1">Bio & Teaching Style</label>
            <textarea
              rows={4}
              value={profileForm.bio}
              onChange={(e) => setProfileForm({ ...profileForm, bio: e.target.value })}
              className="w-full text-xs p-3 rounded-xl border border-stone-300 outline-none focus:border-brand-800 resize-none"
            />
          </div>

          {/* Subject Checkboxes */}
          <div className="space-y-3 p-4 bg-stone-50/70 rounded-2xl border border-stone-200">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-bold text-stone-900">
                Subjects Taught ({profileForm.subjects.length} selected)
              </label>
              <span className="text-[11px] text-stone-500">Click to add/remove</span>
            </div>

            {/* Primary & General Subjects */}
            <div className="space-y-1">
              <span className="text-[11px] font-bold text-terracotta-700 uppercase tracking-wide block">
                ★ Primary & General Subjects (All-in-One)
              </span>
              <div className="flex flex-wrap gap-1.5">
                {SUBJECTS_LIST.slice(0, 6).map((sub) => {
                  const isChecked = profileForm.subjects.includes(sub);
                  return (
                    <button
                      type="button"
                      key={sub}
                      onClick={() => handleToggleSubject(sub)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-medium transition ${
                        isChecked
                          ? 'bg-terracotta-600 text-white font-bold shadow-sm'
                          : 'bg-white border border-stone-200 text-stone-700 hover:bg-stone-100'
                      }`}
                    >
                      {sub} {isChecked && '✓'}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Core Secondary & Senior Subjects */}
            <div className="space-y-1 pt-2 border-t border-stone-200/80">
              <span className="text-[11px] font-bold text-brand-800 uppercase tracking-wide block">
                ★ Core Secondary & Senior Subjects
              </span>
              <div className="flex flex-wrap gap-1.5">
                {SUBJECTS_LIST.slice(6).map((sub) => {
                  const isChecked = profileForm.subjects.includes(sub);
                  return (
                    <button
                      type="button"
                      key={sub}
                      onClick={() => handleToggleSubject(sub)}
                      className={`px-2.5 py-1 rounded-xl text-xs font-medium transition ${
                        isChecked
                          ? 'bg-brand-800 text-white font-bold shadow-sm'
                          : 'bg-white border border-stone-200 text-stone-700 hover:bg-stone-100'
                      }`}
                    >
                      {sub} {isChecked && '✓'}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Boards Checkboxes */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-stone-700">Boards Supported</label>
            <div className="flex flex-wrap gap-2">
              {BOARDS_LIST.map((board) => {
                const isChecked = profileForm.boards.includes(board);
                return (
                  <button
                    type="button"
                    key={board}
                    onClick={() => handleToggleBoard(board)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-medium transition ${
                      isChecked
                        ? 'bg-terracotta-600 text-white font-bold'
                        : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
                    }`}
                  >
                    {board} {isChecked && '✓'}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Real Identity Verification Status Section */}
          <div className="p-5 bg-white rounded-2xl border border-stone-200 shadow-sm space-y-4 text-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-stone-100">
              <div className="flex items-center gap-2.5">
                <div className={`p-2 rounded-xl ${
                  myTutorProfile.isVerified
                    ? 'bg-emerald-50 text-emerald-700'
                    : myTutorProfile.verificationStatus === 'pending'
                    ? 'bg-amber-50 text-amber-700'
                    : myTutorProfile.verificationStatus === 'rejected'
                    ? 'bg-rose-50 text-rose-700'
                    : 'bg-stone-100 text-stone-600'
                }`}>
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-serif text-sm font-bold text-stone-900">
                    Identity & Credential Verification Status
                  </h4>
                  <p className="text-[11px] text-stone-500">
                    {settings.siteName || 'VidyaNest'} central administrative desk audit for official Verified Educator status
                  </p>
                </div>
              </div>

              {/* Status Badge */}
              <div className="shrink-0">
                {myTutorProfile.isVerified ? (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-bold">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    Verified Educator Active
                  </span>
                ) : myTutorProfile.verificationStatus === 'pending' ? (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200 text-xs font-bold">
                    <Clock className="w-3.5 h-3.5 text-amber-600" />
                    Under Administrative Review
                  </span>
                ) : myTutorProfile.verificationStatus === 'rejected' ? (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200 text-xs font-bold">
                    <AlertCircle className="w-3.5 h-3.5 text-rose-600" />
                    Action Required / Re-upload Needed
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-stone-100 text-stone-700 border border-stone-200 text-xs font-bold">
                    <ShieldAlert className="w-3.5 h-3.5 text-stone-500" />
                    Unverified Educator
                  </span>
                )}
              </div>
            </div>

            {/* Real Document Verification Checkpoints */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* ID Proof Card */}
              {(() => {
                const doc = myTutorProfile.verificationDocuments?.find(d => d.docType === 'id_proof');
                const isUploaded = !!doc || (myTutorProfile.verificationDetails?.idProof && !myTutorProfile.verificationDetails.idProof.toLowerCase().includes('pending upload'));
                return (
                  <div className="p-3 rounded-xl bg-stone-50 border border-stone-200/80 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold text-stone-700">1. Government Photo ID</span>
                      <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                        myTutorProfile.isVerified
                          ? 'bg-emerald-100 text-emerald-800'
                          : isUploaded
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-stone-200 text-stone-600'
                      }`}>
                        {myTutorProfile.isVerified ? 'Approved' : isUploaded ? 'Under Review' : 'Missing'}
                      </span>
                    </div>
                    <p className="text-[11px] text-stone-600 truncate" title={doc?.docName || myTutorProfile.verificationDetails?.idProof || 'Aadhaar / Voter ID / Passport'}>
                      {doc?.docName || myTutorProfile.verificationDetails?.idProof || 'Not yet uploaded'}
                    </p>
                  </div>
                );
              })()}

              {/* Degree Card */}
              {(() => {
                const doc = myTutorProfile.verificationDocuments?.find(d => d.docType === 'degree_certificate');
                const isUploaded = !!doc || (myTutorProfile.verificationDetails?.degreeProof && !myTutorProfile.verificationDetails.degreeProof.toLowerCase().includes('pending upload'));
                return (
                  <div className="p-3 rounded-xl bg-stone-50 border border-stone-200/80 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold text-stone-700">2. Academic Degree</span>
                      <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                        myTutorProfile.isVerified
                          ? 'bg-emerald-100 text-emerald-800'
                          : isUploaded
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-stone-200 text-stone-600'
                      }`}>
                        {myTutorProfile.isVerified ? 'Approved' : isUploaded ? 'Under Review' : 'Missing'}
                      </span>
                    </div>
                    <p className="text-[11px] text-stone-600 truncate" title={doc?.docName || myTutorProfile.verificationDetails?.degreeProof || 'Highest Degree / Marksheet'}>
                      {doc?.docName || myTutorProfile.verificationDetails?.degreeProof || 'Not yet uploaded'}
                    </p>
                  </div>
                );
              })()}

              {/* Address Proof Card */}
              {(() => {
                const doc = myTutorProfile.verificationDocuments?.find(d => d.docType === 'address_proof');
                const isUploaded = !!doc || (myTutorProfile.verificationDetails?.addressProof && !myTutorProfile.verificationDetails.addressProof.toLowerCase().includes('pending upload'));
                return (
                  <div className="p-3 rounded-xl bg-stone-50 border border-stone-200/80 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold text-stone-700">3. Address Proof</span>
                      <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                        myTutorProfile.isVerified
                          ? 'bg-emerald-100 text-emerald-800'
                          : isUploaded
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-stone-200 text-stone-600'
                      }`}>
                        {myTutorProfile.isVerified ? 'Approved' : isUploaded ? 'Under Review' : 'Optional'}
                      </span>
                    </div>
                    <p className="text-[11px] text-stone-600 truncate" title={doc?.docName || myTutorProfile.verificationDetails?.addressProof || 'Electricity / Utility bill'}>
                      {doc?.docName || myTutorProfile.verificationDetails?.addressProof || 'Not uploaded (Optional)'}
                    </p>
                  </div>
                );
              })()}
            </div>

            {/* Explanation & Action link */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
              <p className="text-[11px] text-stone-500 leading-relaxed">
                {myTutorProfile.isVerified ? (
                  <span>Verified credentials boost parent trust and place your profile in verified search filters. Verified on: <strong>{myTutorProfile.verificationDetails?.verifiedAt ? new Date(myTutorProfile.verificationDetails.verifiedAt).toLocaleDateString() : 'Active'}</strong></span>
                ) : myTutorProfile.verificationStatus === 'pending' ? (
                  <span>Your documents have been submitted to our central admin desk. Audits typically complete within 24 business hours.</span>
                ) : (
                  <span>Submit your Government Photo ID and College Degree certificates to earn the green Verified Educator checkmark badge.</span>
                )}
              </p>
              <button
                type="button"
                onClick={() => handleTabChange('verification')}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-stone-900 hover:bg-black text-white font-bold text-[11px] rounded-xl transition shadow-sm shrink-0 cursor-pointer"
              >
                <span>Manage Verification Documents</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Bottom Save Action Bar for Mobile & Desktop */}
          <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-4 border-t border-stone-200">
            <button
              type="button"
              onClick={() => handleTabChange('inbox')}
              className="w-full sm:w-auto text-center px-5 py-2.5 text-xs font-semibold text-stone-600 hover:text-stone-900 bg-white border border-stone-300 rounded-xl hover:bg-stone-50 transition cursor-pointer"
            >
              Back to Inquiries
            </button>
            <button
              type="submit"
              className="w-full sm:w-auto justify-center px-7 py-3 bg-brand-800 hover:bg-brand-900 text-white font-bold text-xs rounded-xl shadow-md transition flex items-center gap-2 cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>Save Changes</span>
            </button>
          </div>
        </form>
      )}

      {/* TAB 3: Service Areas & Modes */}
      {activeTab === 'service_areas' && (
        <form onSubmit={handleProfileSave} className="bg-white rounded-2xl p-4 sm:p-6 md:p-8 border border-stone-200 shadow-soft space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-stone-100">
            <div>
              <h2 className="font-serif text-xl sm:text-2xl font-bold text-stone-900">Service Area & Teaching Modes</h2>
              <p className="text-xs text-stone-500">Define the locations you visit and preferred formats</p>
            </div>
            <button
              type="submit"
              className="w-full sm:w-auto justify-center px-5 py-2.5 bg-brand-800 hover:bg-brand-900 text-white font-bold text-xs rounded-xl shadow transition flex items-center gap-1.5 cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>Save Area Details</span>
            </button>
          </div>

          <div className="space-y-3">
            <label className="block text-xs font-bold text-stone-700">Accepted Teaching Modes</label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {TEACHING_MODES.map((mode) => {
                const isSelected = profileForm.modes.includes(mode.id);
                return (
                  <div
                    key={mode.id}
                    onClick={() => handleToggleMode(mode.id)}
                    className={`p-4 rounded-xl border-2 cursor-pointer transition ${
                      isSelected 
                        ? 'border-brand-800 bg-brand-50/50' 
                        : 'border-stone-200 hover:border-stone-300'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs text-stone-800">{mode.label}</span>
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => {}}
                        className="rounded accent-brand-800"
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Location Selection with Free PIN Code & India Post Live API */}
          <div className="p-4 rounded-2xl bg-stone-50/80 border border-stone-200/90 space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-stone-900 flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-brand-800" />
                Service Location & Visiting Coverage
              </label>
            </div>

            {/* Quick 6-digit PIN Code Lookup */}
            <div>
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-stone-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  maxLength={6}
                  value={dashboardPincode}
                  onChange={(e) => handleDashboardPinLookup(e.target.value)}
                  placeholder="Enter 6-digit PIN code to auto-set State & District (e.g. 560034, 110001)"
                  className="w-full pl-9 pr-8 py-2 text-xs rounded-xl border border-stone-300 bg-white outline-none focus:border-brand-800"
                />
                {isLookingUpDashPin && (
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-brand-800 absolute right-3 top-2.5" />
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">State / UT</label>
                <select
                  value={profileForm.location?.state}
                  onChange={async (e) => {
                    const newState = e.target.value;
                    setProfileForm(prev => ({
                      ...prev,
                      location: {
                        ...prev.location,
                        state: newState,
                        city: '',
                        localities: []
                      }
                    }));
                    const dists = await getLiveDistricts(newState);
                    if (dists && dists.length > 0) {
                      setProfileForm(prev => ({
                        ...prev,
                        location: {
                          ...prev.location,
                          city: dists[0]
                        }
                      }));
                    }
                  }}
                  className="w-full text-xs p-2.5 rounded-xl border border-stone-300 bg-white font-medium outline-none"
                >
                  <option value="">Select State ({serviceLoc.states.length})</option>
                  {serviceLoc.states.map(s => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-bold text-stone-700">District / City</label>
                  {serviceLoc.isLoadingDistricts && (
                    <Loader2 className="w-3.5 h-3.5 animate-spin text-brand-800" />
                  )}
                </div>
                <select
                  value={profileForm.location?.city}
                  onChange={(e) => setProfileForm(prev => ({
                    ...prev,
                    location: { ...prev.location, city: e.target.value, localities: [] }
                  }))}
                  disabled={serviceLoc.isLoadingDistricts}
                  className="w-full text-xs p-2.5 rounded-xl border border-stone-300 bg-white font-medium outline-none disabled:opacity-60"
                >
                  <option value="">
                    {serviceLoc.isLoadingDistricts 
                      ? 'Loading districts...' 
                      : `Select District (${serviceLoc.districts.length})`}
                  </option>
                  {serviceLoc.districts.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-bold text-stone-700">
                  Visiting Villages, Towns & Places (Comma separated or click below)
                </label>
                {serviceLoc.isLoadingPlaces && (
                  <div className="flex items-center gap-1 text-[10px] text-stone-600">
                    <Loader2 className="w-3 h-3 animate-spin text-brand-700" />
                    <span>Loading verified localities...</span>
                  </div>
                )}
              </div>
              <input
                type="text"
                value={profileForm.location?.localities?.join(', ') || ''}
                onChange={(e) => setProfileForm({
                  ...profileForm,
                  location: {
                    ...profileForm.location,
                    localities: e.target.value.split(',').map(s => s.trim()).filter(Boolean)
                  }
                })}
                className="w-full text-xs p-2.5 rounded-xl border border-stone-300 outline-none focus:border-brand-800 bg-white"
                placeholder="e.g. Type or click suggested places below"
              />
              {serviceLoc.places.length > 0 && (
                <div className="pt-2 space-y-2">
                  <div className="flex items-center justify-between text-[11px] font-semibold text-stone-500">
                    <span>Quick-add places/villages in {profileForm.location?.city}:</span>
                    <span className="text-emerald-700 font-semibold flex items-center gap-1">
                      <Sparkles className="w-2.5 h-2.5" />
                      {serviceLoc.places.length} official postal places / villages available
                    </span>
                  </div>

                  {/* Type to search villages input */}
                  <div className="relative">
                    <Search className="w-3.5 h-3.5 text-stone-400 absolute left-2.5 top-2.5" />
                    <input
                      type="text"
                      value={villageSearchTerm}
                      onChange={(e) => setVillageSearchTerm(e.target.value)}
                      placeholder={`Type to search in ${profileForm.location?.city || 'selected district'} (${serviceLoc.places.length} places)...`}
                      className="w-full pl-8 pr-7 py-1.5 text-xs rounded-xl border border-stone-200 bg-white outline-none focus:border-brand-800"
                    />
                    {villageSearchTerm && (
                      <button
                        type="button"
                        onClick={() => setVillageSearchTerm('')}
                        className="absolute right-2.5 top-2 text-stone-400 hover:text-stone-600"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    )}
                  </div>

                  <div className="flex flex-wrap gap-1.5 max-h-36 overflow-y-auto p-2 bg-white rounded-xl border border-stone-200/80">
                    {serviceLoc.places
                      .filter(place => !villageSearchTerm || place.toLowerCase().includes(villageSearchTerm.toLowerCase().trim()))
                      .slice(0, 100)
                      .map((place) => {
                        const isChecked = profileForm.location?.localities?.includes(place);
                        return (
                          <button
                            type="button"
                            key={place}
                            onClick={() => {
                              const current = profileForm.location?.localities || [];
                              let updated;
                              if (current.includes(place)) {
                                updated = current.filter(p => p !== place);
                              } else {
                                updated = [...current, place];
                              }
                              setProfileForm({
                                ...profileForm,
                                location: {
                                  ...profileForm.location,
                                  localities: updated
                                }
                              });
                            }}
                            className={`px-2.5 py-1 rounded-lg text-[11px] transition font-medium ${
                              isChecked
                                ? 'bg-brand-800 text-white font-bold shadow-xs'
                                : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
                            }`}
                          >
                            + {place} {isChecked && '✓'}
                          </button>
                        );
                      })}
                  </div>
                </div>
              )}
              <p className="text-[11px] text-stone-400 mt-1.5">
                Parents searching in these villages, places, and localities will find your profile for Home Visits.
              </p>
            </div>
          </div>

          {/* Bottom Save Action Bar for Service Areas */}
          <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-4 border-t border-stone-200">
            <button
              type="button"
              onClick={() => handleTabChange('inbox')}
              className="w-full sm:w-auto text-center px-5 py-2.5 text-xs font-semibold text-stone-600 hover:text-stone-900 bg-white border border-stone-300 rounded-xl hover:bg-stone-50 transition cursor-pointer"
            >
              Back to Inquiries
            </button>
            <button
              type="submit"
              className="w-full sm:w-auto justify-center px-7 py-3 bg-brand-800 hover:bg-brand-900 text-white font-bold text-xs rounded-xl shadow-md transition flex items-center gap-2 cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>Save Area Details</span>
            </button>
          </div>
        </form>
      )}

      {/* TAB 4: Reviews */}
      {activeTab === 'reviews' && (
        <div className="bg-white rounded-2xl p-6 sm:p-8 border border-stone-200 shadow-soft space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-stone-100">
            <div>
              <h2 className="font-serif text-xl font-bold text-stone-900">Student & Parent Feedback</h2>
              <p className="text-xs text-stone-500 mt-0.5">
                {myTutorProfile.reviewCount > 0 ? (
                  <>
                    Average Rating: <strong>{myTutorProfile.rating?.toFixed(1)} / 5</strong> ({myTutorProfile.reviewCount} verified review{myTutorProfile.reviewCount > 1 ? 's' : ''})
                  </>
                ) : (
                  <span>No student reviews yet (New Educator)</span>
                )}
              </p>
            </div>
            {myTutorProfile.reviewCount > 0 ? (
              <StarRating rating={myTutorProfile.rating} size="lg" />
            ) : (
              <span className="text-xs font-semibold px-3 py-1.5 rounded-full bg-stone-100 text-stone-600 border border-stone-200">
                Awaiting First Evaluation
              </span>
            )}
          </div>

          {(!myTutorProfile.reviews || myTutorProfile.reviews.length === 0) ? (
            <div className="bg-warm-50/60 rounded-2xl border border-warm-200/80 p-10 text-center space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-amber-100/80 text-amber-800 flex items-center justify-center mx-auto">
                <Award className="w-7 h-7 text-amber-700" />
              </div>
              <div className="space-y-1.5 max-w-md mx-auto">
                <h3 className="font-serif text-lg font-bold text-stone-900">No Student Reviews Yet</h3>
                <p className="text-xs text-stone-600 leading-relaxed">
                  {settings.siteName || 'VidyaNest'} follows a strict genuine-evaluation policy: <strong>Students can rate and review their teacher only after 1 month of accepting a tuition inquiry</strong>.
                </p>
              </div>
              <div className="p-3.5 bg-white rounded-xl border border-stone-200 max-w-md mx-auto text-left text-xs text-stone-600 space-y-1">
                <div className="font-bold text-stone-900 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-amber-600" />
                  <span>How ratings unlock:</span>
                </div>
                <p className="text-[11px] text-stone-500">
                  1. Accept incoming inquiries in your Inbox tab.<br />
                  2. Conduct home or online tuition sessions.<br />
                  3. After 30 days of tuition acceptance, your student's portal automatically unlocks the review and rating button.
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {myTutorProfile.reviews.map((rev) => (
                <div key={rev._id || rev.id} className="p-5 rounded-2xl bg-stone-50 border border-stone-200/80 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <StarRating rating={rev.rating} size="sm" />
                      <span className="text-xs font-bold text-stone-800">{rev.subject}</span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                        Verified Tuition
                      </span>
                    </div>
                    <span className="text-[11px] text-stone-400">
                      {rev.createdAt ? new Date(rev.createdAt).toLocaleDateString() : (rev.date || 'Recent')}
                    </span>
                  </div>
                  <p className="text-xs text-stone-700 leading-relaxed italic">"{rev.comment}"</p>
                  <div className="text-[11px] font-semibold text-stone-500 flex items-center gap-1">
                    <span>— {rev.studentName}</span>
                    {rev.parentName && <span className="text-stone-400">(Parent: {rev.parentName})</span>}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Accept / Reject Dialog Modal */}
      {selectedInquiry && (
        <div className="fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-stone-200 space-y-4 animate-in fade-in max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-stone-200">
              <h3 className="font-serif text-lg font-bold text-stone-900">
                {responseStatus === 'accepted' ? 'Accept Tuition Request' : 'Decline Request'}
              </h3>
              <button
                onClick={() => setSelectedInquiry(null)}
                className="text-stone-400 hover:text-stone-600 font-bold"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-stone-600">
              {responseStatus === 'accepted'
                ? `You are accepting ${selectedInquiry.studentName}'s tuition inquiry. Your contact details will be shared with the parent.`
                : `You are declining ${selectedInquiry.studentName}'s inquiry.`}
            </p>

            {/* Student Full Location Summary in Modal */}
            <div className="p-3 bg-amber-50/70 rounded-xl border border-amber-200/80 text-xs space-y-1.5">
              <div className="font-bold text-stone-800 flex items-center justify-between">
                <span>Student: {selectedInquiry.studentName} ({selectedInquiry.grade})</span>
                <span className="font-semibold text-terracotta-700 capitalize text-[11px]">
                  {selectedInquiry.mode === 'home_visit' ? '🏠 Home Visit' : selectedInquiry.mode?.replace('_', ' ')}
                </span>
              </div>
              <div className="text-stone-700 flex items-start gap-1.5 font-medium leading-relaxed">
                <MapPin className="w-3.5 h-3.5 text-amber-700 shrink-0 mt-0.5" />
                <span>{getInquiryFullAddress(selectedInquiry)}</span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                Message to Parent ({selectedInquiry.parentName})
              </label>
              <textarea
                rows={3}
                value={responseNote}
                onChange={(e) => setResponseNote(e.target.value)}
                className="w-full text-xs p-3 rounded-lg border border-stone-300 focus:border-brand-800 outline-none resize-none"
              />
            </div>

            {inquiryActionError && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-center gap-2 font-medium">
                <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                <span>{inquiryActionError}</span>
              </div>
            )}

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                disabled={isUpdatingInquiry}
                onClick={() => setSelectedInquiry(null)}
                className="px-4 py-2 text-xs font-semibold text-stone-600 hover:bg-stone-100 rounded-lg disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isUpdatingInquiry}
                onClick={handleConfirmInquiryAction}
                className={`px-5 py-2 text-xs font-bold text-white rounded-lg shadow disabled:opacity-60 disabled:cursor-not-allowed flex items-center gap-1.5 ${
                  responseStatus === 'accepted'
                    ? 'bg-brand-800 hover:bg-brand-900'
                    : 'bg-red-600 hover:bg-red-700'
                }`}
              >
                {isUpdatingInquiry ? (
                  <>
                    <Clock className="w-3.5 h-3.5 animate-spin" />
                    <span>Saving to Database...</span>
                  </>
                ) : (
                  <span>Confirm {responseStatus === 'accepted' ? 'Acceptance' : 'Decline'}</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Document Lightbox Preview Modal */}
      {previewDocModal && (
        <div className="fixed inset-0 z-50 bg-stone-950/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-3xl w-full p-6 shadow-2xl border border-stone-200 space-y-4 animate-in fade-in max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between pb-3 border-b border-stone-200 shrink-0">
              <div className="flex items-center gap-2.5">
                <FileCheck className="w-5 h-5 text-emerald-600" />
                <div>
                  <h3 className="font-serif font-bold text-stone-900 text-base">
                    {previewDocModal.title}
                  </h3>
                  <div className="text-xs text-stone-500">
                    {previewDocModal.name}
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setPreviewDocModal(null)}
                className="w-8 h-8 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-700 flex items-center justify-center font-bold text-sm cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="flex-1 overflow-auto rounded-2xl bg-stone-900/5 border border-stone-200 p-2 flex items-center justify-center min-h-[300px]">
              {isPdfFile(previewDocModal) ? (
                <div className="w-full h-[65vh] flex flex-col items-center justify-center bg-stone-100 rounded-xl overflow-hidden relative">
                  <object
                    data={displayDocUrl}
                    type="application/pdf"
                    className="w-full h-full rounded-xl"
                  >
                    <iframe
                      src={displayDocUrl}
                      title={previewDocModal.title}
                      className="w-full h-full border-0 bg-white"
                    />
                    <div className="p-8 text-center space-y-3">
                      <FileText className="w-14 h-14 text-red-500 mx-auto" />
                      <h4 className="font-bold text-stone-800 text-sm">{previewDocModal.name || 'PDF Document'}</h4>
                      <p className="text-xs text-stone-500">
                        Click below to view or download this PDF document in a new tab.
                      </p>
                      <a
                        href={displayDocUrl}
                        target="_blank"
                        rel="noreferrer"
                        download={previewDocModal.name || 'document.pdf'}
                        className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition shadow cursor-pointer"
                      >
                        <ExternalLink className="w-4 h-4" />
                        <span>Open PDF in New Window</span>
                      </a>
                    </div>
                  </object>
                </div>
              ) : (
                <img
                  src={previewDocModal.url}
                  alt={previewDocModal.title}
                  className="max-h-[65vh] w-auto max-w-full rounded-xl object-contain shadow-md"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = "https://images.unsplash.com/photo-1633265486064-086b219458ec?w=800&auto=format&fit=crop&q=80";
                  }}
                />
              )}
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-stone-100 shrink-0 text-xs">
              <span className="text-stone-500">Uploaded for VidyaNest Quality & Compliance Audit</span>
              <div className="flex items-center gap-2">
                {displayDocUrl && (
                  <a
                    href={displayDocUrl}
                    target="_blank"
                    rel="noreferrer"
                    download={previewDocModal.name || 'document.pdf'}
                    className="px-3.5 py-2 bg-stone-100 hover:bg-stone-200 text-stone-700 font-semibold rounded-xl flex items-center gap-1.5 transition cursor-pointer"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>{isPdfFile(previewDocModal) ? 'Open / Download PDF' : 'Open in New Tab'}</span>
                  </a>
                )}
                <button
                  type="button"
                  onClick={() => setPreviewDocModal(null)}
                  className="px-5 py-2 bg-stone-900 hover:bg-stone-800 text-white font-bold rounded-xl cursor-pointer"
                >
                  Close Preview
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Change Profile Picture Modal */}
      <ChangeAvatarModal
        isOpen={isAvatarModalOpen}
        onClose={() => setIsAvatarModalOpen(false)}
        currentAvatar={profileForm.avatar || myTutorProfile.avatar}
        tutorName={myTutorProfile.name}
        onSave={handleSaveAvatarModal}
      />

    </div>
  );
}
