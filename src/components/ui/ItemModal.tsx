import { useContext, useRef, useState } from "react";
import {
  Box,
  Button,
  CloseButton,
  Grid,
  Modal,
  SimpleGrid,
  TextInput,
} from "@mantine/core";
import { RichTextEditor } from "@mantine/rte";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "../data/firebaseConfig";
import { AuthContext } from "../data/contexts/AuthContext";
interface Props {
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  data: any;
}
export default function ItemModal({ open, setOpen, data }: Props) {
  const user = useContext(AuthContext);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [value, onChange] = useState(data?.content);
  async function handleSubmit() {
    await updateDoc(
      doc(
        db,
        "ktab-manager",
        user?.uid ? user.uid : "guest",
        "items",
        data?.id
      ),
      {
        content: value ? value : "",
        name: inputRef.current?.value,
      }
    );
    setOpen(false);
  }
  async function handleDelete() {
    await updateDoc(
      doc(
        db,
        "ktab-manager",
        user?.uid ? user.uid : "guest",
        "items",
        data?.id
      ),
      {
        isDeleted: 1,
      }
    );
    setOpen(false);
  }
  function handleClose() {
    setOpen(false);
  }
  return (
    <>
      <Modal
        size={"70%"}
        opened={open}
        onClose={handleClose}
        withCloseButton={false}
      >
        <SimpleGrid verticalSpacing={20} pb={20}>
          <Grid align="center">
            <Grid.Col span={11}>
              <TextInput
                ref={inputRef}
                placeholder="Name"
                variant="unstyled"
                size="xl"
                defaultValue={data?.name}
              />
            </Grid.Col>
            <Grid.Col span={1}>
              <CloseButton title="Close popover" onClick={handleClose} />
            </Grid.Col>
          </Grid>
          <RichTextEditor
            stickyOffset={"-45px"}
            value={value}
            onChange={onChange}
            id={data?.id}
          />
          <Box style={{ display: "flex", justifyContent: "flex-end" }}>
            <SimpleGrid cols={3}>
              <Button variant="outline" color="red" onClick={handleDelete}>
                Delete
              </Button>
              <Button variant="outline" onClick={handleClose}>
                Close
              </Button>
              <Button onClick={handleSubmit}>Save</Button>
            </SimpleGrid>
          </Box>
        </SimpleGrid>
      </Modal>
    </>
  );
}
