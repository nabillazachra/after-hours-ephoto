import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { AppStep, Template, Session } from './types';

// --- State Definition ---

interface AppState {
  step: AppStep;
  sessionCount: number;
  selectedTemplate: Template | null;
  capturedPhotos: string[];
  slotAssignments: Record<string, number>; // Maps slot.id -> photo index (0, 1, 2)
  isAdminAuthenticated: boolean;
  isProcessingPayment: boolean;
  isDarkMode: boolean;
}

type Action =
  | { type: 'SET_STEP'; payload: AppStep }
  | { type: 'INCREMENT_SESSION_COUNT' }
  | { type: 'SET_TEMPLATE'; payload: Template }
  | { type: 'ADD_PHOTO'; payload: string }
  | { type: 'ASSIGN_SLOT'; payload: { slotId: string; photoIndex: number } }
  | { type: 'AUTO_ASSIGN_SLOTS' }
  | { type: 'RESET_SESSION' }
  | { type: 'SET_ADMIN_AUTH'; payload: boolean }
  | { type: 'SET_PROCESSING_PAYMENT'; payload: boolean }
  | { type: 'INIT_SESSION_COUNT'; payload: number }
  | { type: 'TOGGLE_THEME' }
  | { type: 'REORDER_PHOTOS'; payload: { fromIndex: number; toIndex: number } };

const initialState: AppState = {
  step: AppStep.LANDING,
  sessionCount: 0,
  selectedTemplate: null,
  capturedPhotos: [],
  slotAssignments: {}, 
  isAdminAuthenticated: false,
  isProcessingPayment: false,
  isDarkMode: true, // Default to Dark Mode
};

// --- Reducer ---

const reducer = (state: AppState, action: Action): AppState => {
  switch (action.type) {
    case 'SET_STEP':
      return { ...state, step: action.payload };
    case 'INCREMENT_SESSION_COUNT':
      const newCount = state.sessionCount + 1;
      localStorage.setItem('ah_session_count', newCount.toString());
      return { ...state, sessionCount: newCount };
    case 'INIT_SESSION_COUNT':
      return { ...state, sessionCount: action.payload };
    case 'SET_TEMPLATE':
      return { ...state, selectedTemplate: action.payload };
    case 'ADD_PHOTO':
      return { ...state, capturedPhotos: [...state.capturedPhotos, action.payload] };
    case 'ASSIGN_SLOT':
      return { 
        ...state, 
        slotAssignments: { 
          ...state.slotAssignments, 
          [action.payload.slotId]: action.payload.photoIndex 
        } 
      };
    case 'AUTO_ASSIGN_SLOTS': {
        // Pre-fill slots based on default logic (Slot 1 -> Photo 1, etc.)
        if (!state.selectedTemplate) return state;
        
        const newAssignments: Record<string, number> = {};
        const maxPhotoIndex = Math.max(0, state.capturedPhotos.length - 1);

        state.selectedTemplate.layout.slots.forEach((slot, index) => {
            // Default to the targetTakeIndex defined in JSON, or fallback to the slot index
            const targetIndex = slot.targetTakeIndex !== undefined ? slot.targetTakeIndex : index;
            // Ensure we don't assign an index that doesn't exist (clamp to max available photo)
            newAssignments[slot.id] = Math.min(targetIndex, maxPhotoIndex); 
        });
        return { ...state, slotAssignments: newAssignments };
    }
    case 'REORDER_PHOTOS': {
        const { fromIndex, toIndex } = action.payload;
        if (fromIndex === toIndex) return state;

        const newPhotos = [...state.capturedPhotos];
        const [movedPhoto] = newPhotos.splice(fromIndex, 1);
        newPhotos.splice(toIndex, 0, movedPhoto);

        // Smart re-mapping of slot assignments so slots still point to the correct visual photo
        const newAssignments = { ...state.slotAssignments };
        
        Object.keys(newAssignments).forEach(slotId => {
            const currentIdx = newAssignments[slotId];
            
            if (currentIdx === fromIndex) {
                // If this slot pointed to the moved photo, point to its new index
                newAssignments[slotId] = toIndex;
            } else if (fromIndex < toIndex) {
                // Photo moved down: Indices between from and to shift up (-1)
                if (currentIdx > fromIndex && currentIdx <= toIndex) {
                    newAssignments[slotId] = currentIdx - 1;
                }
            } else {
                // Photo moved up: Indices between to and from shift down (+1)
                if (currentIdx >= toIndex && currentIdx < fromIndex) {
                    newAssignments[slotId] = currentIdx + 1;
                }
            }
        });

        return { ...state, capturedPhotos: newPhotos, slotAssignments: newAssignments };
    }
    case 'RESET_SESSION':
      return { ...state, capturedPhotos: [], slotAssignments: {}, selectedTemplate: null, step: AppStep.LANDING };
    case 'SET_ADMIN_AUTH':
      return { ...state, isAdminAuthenticated: action.payload };
    case 'SET_PROCESSING_PAYMENT':
      return { ...state, isProcessingPayment: action.payload };
    case 'TOGGLE_THEME':
      return { ...state, isDarkMode: !state.isDarkMode };
    default:
      return state;
  }
};

// --- Context & Hook ---

const StoreContext = createContext<{
  state: AppState;
  dispatch: React.Dispatch<Action>;
}>({ state: initialState, dispatch: () => null });

export const StoreProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(reducer, initialState);

  useEffect(() => {
    const stored = localStorage.getItem('ah_session_count');
    if (stored) {
      dispatch({ type: 'INIT_SESSION_COUNT', payload: parseInt(stored, 10) });
    }
  }, []);

  return (
    <StoreContext.Provider value={{ state, dispatch }}>
      {children}
    </StoreContext.Provider>
  );
};

export const useStore = () => {
  const context = useContext(StoreContext);
  if (!context) throw new Error("useStore must be used within StoreProvider");
  return context;
};