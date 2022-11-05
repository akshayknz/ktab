import { SetStateAction, useContext, useEffect, useRef, useState } from "react";
import {
  Modal,
  Text,
  Button,
  Group,
  SimpleGrid,
  Accordion,
  createStyles,
  Input,
  PasswordInput,
  Avatar,
  Blockquote,
  Table,
  Box,
  Title,
} from "@mantine/core";
import { MdOutlineMarkEmailUnread } from "react-icons/md";
import { BiSearch } from "react-icons/bi";
import {
  collection,
  deleteDoc,
  doc,
  DocumentData,
  getDocs,
  onSnapshot,
  query,
  updateDoc,
  where,
} from "firebase/firestore";
import { db } from "../data/firebaseConfig";
import { AuthContext } from "../data/contexts/AuthContext";
interface Props {
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
}
let elements = [{ id: "", name: "", type: "" }];
export default function TrashModal({ open, setOpen }: Props) {
  const user = useContext(AuthContext);
  const [search, setSearch] = useState("");
  const [items, setItems] = useState<any[]>();
  const [organizations, setOrganizations] = useState<any[]>();
  const [collections, setCollections] = useState<any[]>();
  useEffect(() => {
    const unsub1 = onSnapshot(
      query(
        collection(db, "ktab-manager", user?.uid ? user.uid : "guest", "items"),
        where("isDeleted", "==", 1)
      ),
      (itemSnapshot) => {
        const re2 = itemSnapshot.docs.map((doc) => {
          return docsToItems(doc, "items");
        });
        setItems(re2);
      }
    );
    const unsub2 = onSnapshot(
      query(
        collection(
          db,
          "ktab-manager",
          user?.uid ? user.uid : "guest",
          "collections"
        ),
        where("isDeleted", "==", 1)
      ),
      (itemSnapshot) => {
        const re2 = itemSnapshot.docs.map((doc) => {
          return docsToItems(doc, "collections");
        });
        setCollections(re2);
      }
    );
    const unsub3 = onSnapshot(
      query(
        collection(
          db,
          "ktab-manager",
          user?.uid ? user.uid : "guest",
          "organizations"
        ),
        where("isDeleted", "==", 1)
      ),
      (itemSnapshot) => {
        const re2 = itemSnapshot.docs.map((doc) => {
          return docsToItems(doc, "organizations");
        });
        setOrganizations(re2);
      }
    );
  }, []);
  const docsToItems = (doc: DocumentData, type: string) => {
    return {
      id: doc.id as string,
      name: doc.data().name as string,
      content: doc.data().content as string,
      type: type as string,
    };
  };
  const restoreDoc = async (type: string, id: string) => {
    await updateDoc(
      doc(db, "ktab-manager", user?.uid ? user.uid : "guest", type, id),
      {
        isDeleted: 0,
      }
    );
  };
  const deleteDocFun = async (type: string, id: string) => {
    await deleteDoc(
      doc(db, "ktab-manager", user?.uid ? user.uid : "guest", type, id)
    );
  };
  const rows = [
    ...(items || []),
    ...(collections || []),
    ...(organizations || []),
  ]
    ?.filter(
      (element: { name: string; id: string; type: string }) =>
        element.name.toLowerCase().indexOf(search.toLowerCase()) > -1 ||
        element.id.toLowerCase().indexOf(search.toLowerCase()) > -1 ||
        element.type.toLowerCase().indexOf(search.toLowerCase()) > -1 ||
        search.length == 0
    )
    .map((element: { name: string; id: string; type: string }) => (
      <tr key={element.id}>
        <td>{element.id}</td>
        <td>{element.name}</td>
        <td>{element.type}</td>
        <td>
          <Button
            compact
            variant="default"
            mr={8}
            onClick={() => restoreDoc(element.type, element.id)}
          >
            Restore
          </Button>
          <Button
            compact
            variant="default"
            color="red"
            mr={8}
            onClick={() => deleteDocFun(element.type, element.id)}
          >
            Delete
          </Button>
        </td>
      </tr>
    ));
  return (
    <Modal
      opened={open}
      onClose={() => setOpen(false)}
      title={
        <Title weight={300} order={2}>
          Trash
        </Title>
      }
      size="xl"
    >
      <Box style={{ display: "flex", justifyContent: "flex-end" }}>
        <Input
          icon={<BiSearch />}
          mb={10}
          placeholder="Search"
          value={search}
          onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
            setSearch(event.currentTarget.value)
          }
          style={{ maxWidth: "100%", minWidth: "280px" }}
        />
      </Box>
      {items?.length != 0 && (
        <Table highlightOnHover striped>
          <thead>
            <tr>
              <th>UID</th>
              <th>Name</th>
              <th>Type</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>{rows}</tbody>
        </Table>
      )}
      {items?.length == 0 && (
        <>
          <Text style={{ textAlign: "center" }} my={40}>
            Nothing here!
          </Text>
        </>
      )}
    </Modal>
  );
}
