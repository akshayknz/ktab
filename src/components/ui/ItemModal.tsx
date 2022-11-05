import { useContext, useEffect, useRef, useState } from "react";
import {
  Box,
  Button,
  CloseButton,
  ColorInput,
  Grid,
  Text,
  Modal,
  Select,
  SimpleGrid,
  TextInput,
  Tooltip,
  Transition,
  Input,
} from "@mantine/core";
import { RichTextEditor } from "@mantine/rte";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "../data/firebaseConfig";
import { AuthContext } from "../data/contexts/AuthContext";
import { FiMaximize2, FiMinimize2 } from "react-icons/fi";
import { BsGear } from "react-icons/bs";
import { ItemType } from "../data/constants";
interface Props {
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  data: any;
}
export default function ItemModal({ open, setOpen, data }: Props) {
  const user = useContext(AuthContext);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [minimize, setMinimize] = useState(false);
  const [settings, setSettings] = useState(false);
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
  const scaleY = {
    in: { opacity: 1, transform: "scaleY(1)" },
    out: { opacity: 0, transform: "scaleY(0)" },
    common: { transformOrigin: "top" },
    transitionProperty: "transform, opacity",
  };
  return (
    <>
      <Modal
        size={minimize ? "100%" : "70%"}
        opened={open}
        onClose={handleClose}
        withCloseButton={false}
      >
        <SimpleGrid verticalSpacing={20} pb={20}>
          <Grid align="center">
            <Grid.Col span={10}>
              <TextInput
                ref={inputRef}
                placeholder="Name"
                variant="unstyled"
                size="xl"
                defaultValue={data?.name}
              />
            </Grid.Col>
            <Grid.Col span={2}>
              <Box style={{ display: "flex", justifyContent: "flex-end" }}>
                <Tooltip label="Settings">
                  <Button
                    p={0}
                    sx={{ width: "30px" }}
                    mr={7}
                    variant={settings ? "outline" : "default"}
                    radius="md"
                    size="xs"
                    onClick={() => setSettings((prev) => !prev)}
                  >
                    <BsGear size={10} />
                  </Button>
                </Tooltip>
                <Tooltip label="Minimize this collection">
                  <Button
                    p={0}
                    sx={{ width: "30px" }}
                    mr={7}
                    variant="default"
                    radius="md"
                    size="xs"
                    onClick={() => setMinimize((prev) => !prev)}
                  >
                    {minimize ? (
                      <FiMinimize2 size={10} />
                    ) : (
                      <FiMaximize2 size={10} />
                    )}
                  </Button>
                </Tooltip>
                <Button
                  p={0}
                  sx={{ width: "30px" }}
                  mr={7}
                  variant="default"
                  radius="md"
                  size="xs"
                  onClick={handleClose}
                >
                  <CloseButton title="Close popover" />
                </Button>
              </Box>
            </Grid.Col>
          </Grid>
          {settings && (
            <Grid align="center">
              <Grid.Col span={4}>
                <Select
                  label="Item type"
                  placeholder="Pick one"
                  defaultValue={ItemType.TEXT}
                  data={[
                    { value: ItemType.TEXT, label: "Text" },
                    { value: ItemType.LINK, label: "Link" },
                    { value: ItemType.TODO, label: "Todo" },
                    { value: ItemType.REMINDER, label: "Reminder" },
                  ]}
                />
              </Grid.Col>
              <Grid.Col span={4}>
                <Text weight={500} sx={{ fontSize: 14 }} pb={3}>
                  Accent Color
                </Text>
                <ColorInput
                  defaultValue="rgba(69, 122, 255, 1)"
                  format="rgba"
                />
              </Grid.Col>
              <Grid.Col span={4}>
                <Text weight={500} sx={{ fontSize: 14 }} pb={3}>
                  UID
                </Text>
                <Input placeholder="UID" value={data?.id} disabled/>
              </Grid.Col>
              <Grid.Col span={4}>
                <Select
                  label="Deleted"
                  placeholder="Pick one"
                  defaultValue={"0"}
                  data={[
                    { value: "0", label: "False" },
                    { value: "1", label: "True" },
                  ]}
                />
              </Grid.Col>
              <Grid.Col span={4}>
                <Text weight={500} sx={{ fontSize: 14 }} pb={3}>
                  Order
                </Text>
                <Input placeholder="Order" value={data?.order} />
              </Grid.Col>
              <Grid.Col span={4}>
                <Select
                  label="Archived"
                  placeholder="Pick one"
                  defaultValue={"0"}
                  data={[
                    { value: "0", label: "False" },
                    { value: "1", label: "True" },
                  ]}
                />
              </Grid.Col>
            </Grid>
          )}
          <RichTextEditor
            stickyOffset={"-48px"}
            value={value}
            onChange={onChange}
            style={{ minHeight: "40vh" }}
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
