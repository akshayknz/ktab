import { createSlice } from "@reduxjs/toolkit";
import { deleteDoc, doc, updateDoc } from "firebase/firestore";
import { db } from "../../firebaseConfig";

export const actionSlice = createSlice({
  name: "actions",
  initialState: {
    userId: "guest",
  },
  reducers: {
    setUserId: (state, action) => {
      state.userId = action.payload;
    },
    softDeleteDocument: (state, action) => {
      updateDoc(
        doc(
          db,
          "ktab-manager",
          state.userId,
          action.payload.type,
          action.payload.docId
        ),
        {
          isDeleted: 1,
        }
      );
    },
    deleteDocument: (state, action) => {
      deleteDoc(
        doc(
          db,
          "ktab-manager",
          state.userId,
          action.payload.type,
          action.payload.docId
        )
      );
    },
    updateColor: (state, action) => {
      updateDoc(
        doc(
          db,
          "ktab-manager",
          state.userId,
          action.payload.type,
          action.payload.docId
        ),
        {
          color: action.payload.color,
        }
      );
    },
  },
});

export const { setUserId, softDeleteDocument, deleteDocument, updateColor } =
  actionSlice.actions;

export default actionSlice.reducer;
