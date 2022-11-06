import { createSlice } from "@reduxjs/toolkit";

export const stateSlice = createSlice({
  name: "states",
  initialState: {
    showOrganizationModal: false, //Add Organization modal state
    organizationOrCollection: "organization", //Show "organization" tab or "collection" tab
    activeOrganization: localStorage.getItem("activeOrganization"),
    organizationColor: "",
    editOrganizationData: {} as OrganizationProps,
    editCollectionData: {} as CollectionProps,
    editItemData: {} as ItemProps,
  },
  reducers: {
    toggleOrganizationModal: (state, action) => {
      state.showOrganizationModal = !state.showOrganizationModal;
      state.organizationOrCollection = action.payload;
    },
    toggleEditOrganizationModal: (state, action) => {
      state.showOrganizationModal = !state.showOrganizationModal;
      state.organizationOrCollection = action.payload.type;
      switch (action.payload.type) {
        case "organization":
          state.editOrganizationData = action.payload.data;
          break;
        case "collection":
          state.editCollectionData = action.payload.data;
          break;
        case "item":
          state.editItemData = action.payload.data;
          break;
        default:
          break;
      }
    },
    resetEditOrganizationData: (state) => {
      state.editOrganizationData = {} as OrganizationProps;
      state.editCollectionData = {} as CollectionProps;
      state.editItemData = {} as ItemProps;
    },
    setOrganizationOrCollection: (state, action) => {
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
  toggleEditOrganizationModal,
  resetEditOrganizationData,
  toggleOrganizationModal,
  setOrganizationOrCollection,
  setActiveOrganization,
} = stateSlice.actions;

export default stateSlice.reducer;
