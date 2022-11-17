import { createSlice } from "@reduxjs/toolkit";
import { deleteDoc, doc, updateDoc, writeBatch } from "firebase/firestore";
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
          updatedAt: +new Date(),
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
          updatedAt: +new Date(),
        }
      );
    },
    minimizeCollections: (state, action) => {
      const arr = action.payload.ids;
      const run = async () => {
        const batch = writeBatch(db); //writeBranch for multiple updates through loops
        arr.forEach((docId: string) => {
          batch.update(
            doc(db, "ktab-manager", state.userId, "collections", docId),
            { minimized: action.payload.state }
          );
        });
        await batch.commit();
        console.log("commited");
      };
      run();
    },
    updateOrder: (state, action) => {
      /**
       * Update order
       * ============
       * ITEM
       * ====
       * Get active item, over item, active container, over container
       * active item index = order of over item
       * over item index = order of active item
       * over container = active item's parent
       */
      updateDoc(
        doc(
          db,
          "ktab-manager",
          state.userId,
          action.payload.type,
          action.payload.docId
        ),
        {
          parent: action.payload.parent,
          order: action.payload.order,
          updatedAt: +new Date(),
        }
      ).then(()=>{
        console.log('commited')
      });
    },
  },
});

export const {
  setUserId,
  softDeleteDocument,
  deleteDocument,
  updateColor,
  minimizeCollections,
  updateOrder,
} = actionSlice.actions;

export default actionSlice.reducer;
