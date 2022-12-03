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
          name: action.payload.name || "New Item",
          color: "rgba(255,255,255,1)",
          type: action.payload.type || ItemType.TEXT,
          link: action.payload.link || "",
          icon: "",
          order: 0,
          archive: 0,
          isDeleted: 0,
          updatedAt: +new Date(),
          createdAt: +new Date(),
        }
      );
    },
    runKeyDown: (state, action) => {
      let stateUserId = state.userId
      const isValidHttpUrl = async (string: string) => {
        let url;
        try {
          url = new URL(string);
        } catch (_) {
          return false;
        }
        return url.protocol === "http:" || url.protocol === "https:";
      };
      const runKeyDownFun = async () => {
        const clipboardText = await navigator.clipboard.readText();
        const isUrl = await isValidHttpUrl(clipboardText);
        const response = await fetch(
          `https://textance.herokuapp.com/title/${clipboardText}`,
          {
            mode: "cors",
            headers: {
              "Access-Control-Allow-Origin": "*",
              "Access-Control-Allow-Headers": "Content-Type",
              "Access-Control-Allow-Methods": "GET,PATCH,POST,PUT,DELETE",
            },
          }
        )
          .then((r) => r.text())
          .catch(() => {});
        console.log("Creating new document from clipboard", clipboardText);
        const upload = async () => {
          addDoc(
            collection(
              db,
              "ktab-manager",
              stateUserId,
              "items"
            ),
            {
              orgparent: action.payload.orgparent,
              parent: action.payload.parent,
              name: response ? response : clipboardText,
              type: ItemType.LINK,
              link: clipboardText,
              color: "rgba(255,255,255,1)",
              icon: "",
              order: 0,
              archive: 0,
              isDeleted: 0,
              updatedAt: +new Date(),
              createdAt: +new Date(),
            }
          );
        };
        if (isUrl) upload();
      };
      runKeyDownFun()
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
  addNewItem,
  runKeyDown
} = actionSlice.actions;

export default actionSlice.reducer;
