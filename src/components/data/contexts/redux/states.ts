import { createSlice } from "@reduxjs/toolkit";

export const stateSlice = createSlice({
  name: "states",
  initialState: {
    showOrganizationModal: false, //Add Organization modal state
    organizationOrCollection: "organization", //Show "organization" tab or "collection" tab
    organizationData: "" as string,
    organizationColor: "",
    activeOrganization: localStorage.getItem("activeOrganization"),
  },
  reducers: {
    toggleOrganizationModal: (state, action) => {
      state.showOrganizationModal = !state.showOrganizationModal;
      state.organizationOrCollection = action.payload;
    },
    setOrganizationColor: (state, action) => {
      state.organizationColor = action.payload;
    },
    setActiveOrganization: (state, action) => {
      state.activeOrganization = action.payload;
      localStorage.setItem("activeOrganization", action.payload);
    },
  },
});

export const {
  setOrganizationColor,
  toggleOrganizationModal,
  setActiveOrganization,
} = stateSlice.actions;

export default stateSlice.reducer;
