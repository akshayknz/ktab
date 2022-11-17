import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { addDoc, collection, deleteDoc, doc, updateDoc, writeBatch } from "firebase/firestore";
import { ItemType } from "../../constants";
import { db } from "../../firebaseConfig";

const fetchUserById = createAsyncThunk(
  "users/fetchByIdStatus",
  async (userId: number, thunkAPI) => {
    const response = await 3;
    return response;
  }
);

export const actionSlice = createSlice({
  name: "actions",
  initialState: {
    userId: "guest",
    syncing: false,
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
    setSyncing: (state, action) => {
      state.syncing = action.payload.state;
    },
    updateOrder: (state, action) => {
      const run = () => {
        const batch = writeBatch(db); //writeBranch for multiple updates through loops
        action.payload.containers.forEach(
          (containerId: string, cindex: number) => {
            //update orders of containers
            batch.update(
              doc(db, "ktab-manager", state.userId, "collections", containerId),
              { order: cindex }
            );
            action.payload.items[containerId].forEach(
              (itemId: string, iindex: number) => {
                //update orders of items
                batch.update(
                  doc(db, "ktab-manager", state.userId, "items", itemId),
                  { order: iindex, parent: containerId }
                );
              }
            );
          }
        );
        batch.commit().then(() => {
          console.log("commited");
          const event = new Event("commit");
          document.dispatchEvent(event);
        });
      };
      run();
    },
    updateContainerName: (state, action) => {
      updateDoc(
        doc(
          db,
          "ktab-manager",
          state.userId,
          "collections",
          action.payload.docId
        ),
        {
          name: action.payload.name,
          updatedAt: +new Date(),
        }
      );
    },
    addNewItem: (state, action) => {
      addDoc(
        collection(
          db,
          "ktab-manager",
          state.userId,
          "items"
        ),
        {
          orgparent: action.payload.orgparent,
          parent: action.payload.parent,
          name: "New Item",
          color: "rgba(255,255,255,1)",
          type: ItemType.TEXT,
          link: "",
          icon: "",
          order: 0,
          archive: false,
          isDeleted: 0,
          updatedAt: +new Date(),
          createdAt: +new Date(),
        }
      );
    }
  },
});

export const {
  setUserId,
  softDeleteDocument,
  deleteDocument,
  updateColor,
  minimizeCollections,
  updateOrder,
  setSyncing,
  updateContainerName,
  addNewItem
} = actionSlice.actions;

export default actionSlice.reducer;
