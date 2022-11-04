import { createSlice } from "@reduxjs/toolkit";

export const stateSlice = createSlice({
    name: "states",
    initialState: {
        showOrganizationModal: false, //Add Organization modal state
        organizationOrCollection: "organization", //Show "organization" tab or "collection" tab
    },
    reducers: {
        toggleOrganizationModal: (state, action) => {
            state.showOrganizationModal = !state.showOrganizationModal
            state.organizationOrCollection = action.payload
        }
    }
})

export const {toggleOrganizationModal} = stateSlice.actions

export default stateSlice.reducer