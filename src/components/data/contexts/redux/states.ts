import { createSlice } from "@reduxjs/toolkit";
import { ViewMarginsType, ViewWidthType } from "../../constants";

export const stateSlice = createSlice({
  name: "states",
  initialState: {
    showOrganizationModal: false, //Add Organization modal state
    showLoginModal: false, //Add Login modal state
    organizationOrCollection: "organization", //Show "organization" tab or "collection" tab
    activeOrganization: localStorage.getItem("activeOrganization"),
    organizationColor: "",
    editOrganizationData: {} as OrganizationProps,
    editCollectionData: {} as CollectionProps,
    editItemData: {} as ItemProps,
    viewWidth: localStorage.getItem("viewWidth") || ViewWidthType.DEFAULT,
    viewMargins: localStorage.getItem("viewMargins") || ViewMarginsType.DEFAULT,
    filterText: "",
    filterType: "all",
  },
  reducers: {
    toggleOrganizationModal: (state, action) => {
      state.showOrganizationModal = !state.showOrganizationModal;
      state.organizationOrCollection = action.payload;
    },
    toggleLoginModal: (state) => {
      state.showLoginModal = !state.showLoginModal;
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
    setViewWidth: (state, action) => {
      state.viewWidth = action.payload;
      localStorage.setItem("viewWidth", action.payload);
    },
    setViewMargins: (state, action) => {
      state.viewMargins = action.payload;
      localStorage.setItem("viewMargins", action.payload);
    },
    setFilterText: (state, action) => {
      state.filterText = action.payload;
    },
    setFilterType: (state, action) => {
      state.filterType = action.payload;
    },
  },
});

export const {
  setOrganizationColor,
  toggleLoginModal,
  toggleEditOrganizationModal,
  resetEditOrganizationData,
  toggleOrganizationModal,
  setOrganizationOrCollection,
  setActiveOrganization,
  setViewWidth,
  setViewMargins,
  setFilterText,
  setFilterType,
} = stateSlice.actions;

export default stateSlice.reducer;
