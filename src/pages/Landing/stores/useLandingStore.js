import { create } from 'zustand';

const useLandingStore = create((set) => ({
  // State
  heroData: null,
  features: [],
  
  // Actions
  setHeroData: (data) => set({ heroData: data }),
  setFeatures: (features) => set({ features }),
}));

export default useLandingStore;
