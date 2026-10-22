import { useState, useEffect } from 'react';
import { 
  getLiveStates, 
  getLiveDistricts, 
  getLivePlaces, 
  getInitialStates, 
  getInitialDistricts, 
  getInitialPlaces,
  lookupPincode
} from '../services/locationService';

/**
 * Custom React hook for dynamic India location data (States, Districts, Villages & Places)
 * Powered by Free India Post API and Open Indian Administrative Data
 */
export function useLocationData(selectedState = '', selectedDistrict = '') {
  const [states, setStates] = useState(() => getInitialStates());
  const [districts, setDistricts] = useState(() => getInitialDistricts(selectedState));
  const [places, setPlaces] = useState(() => getInitialPlaces(selectedDistrict, selectedState));
  
  const [isLoadingStates, setIsLoadingStates] = useState(false);
  const [isLoadingDistricts, setIsLoadingDistricts] = useState(false);
  const [isLoadingPlaces, setIsLoadingPlaces] = useState(false);
  const [isLiveApi, setIsLiveApi] = useState(false);

  // Load states on initial mount
  useEffect(() => {
    let mounted = true;
    setIsLoadingStates(true);
    getLiveStates().then(data => {
      if (mounted && data?.length) {
        setStates(data);
      }
      if (mounted) setIsLoadingStates(false);
    });
    return () => { mounted = false; };
  }, []);

  // Update districts whenever selectedState changes
  useEffect(() => {
    if (!selectedState) {
      setDistricts([]);
      return;
    }
    let mounted = true;
    setIsLoadingDistricts(true);
    getLiveDistricts(selectedState).then(data => {
      if (mounted) {
        setDistricts(data || []);
        setIsLoadingDistricts(false);
      }
    });
    return () => { mounted = false; };
  }, [selectedState]);

  // Update places whenever selectedDistrict or selectedState changes
  useEffect(() => {
    if (!selectedDistrict) {
      setPlaces([]);
      setIsLiveApi(false);
      return;
    }
    let mounted = true;
    setIsLoadingPlaces(true);
    getLivePlaces(selectedDistrict, selectedState).then(data => {
      if (mounted) {
        setPlaces(data || []);
        setIsLiveApi(true);
        setIsLoadingPlaces(false);
      }
    });
    return () => { mounted = false; };
  }, [selectedDistrict, selectedState]);

  return {
    states,
    districts,
    places,
    isLoadingStates,
    isLoadingDistricts,
    isLoadingPlaces,
    isLiveApi,
    lookupPincode
  };
}
