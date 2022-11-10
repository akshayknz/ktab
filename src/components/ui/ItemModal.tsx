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
  Avatar,
  useMantineTheme,
  Skeleton,
  Loader,
} from "@mantine/core";
import { RichTextEditor } from "@mantine/rte";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "../data/firebaseConfig";
import { AuthContext } from "../data/contexts/AuthContext";
import { FiMaximize2, FiMinimize2 } from "react-icons/fi";
import { BsGear } from "react-icons/bs";
import { VscChromeClose } from "react-icons/vsc";
import { ItemType } from "../data/constants";
import { useTheme } from "@emotion/react";
import { useDispatch } from "react-redux";
import {
  deleteDocument,
  softDeleteDocument,
} from "../data/contexts/redux/actions";
import { useForm } from "@mantine/form";
import { useDebouncedValue } from "@mantine/hooks";
interface Props {
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  data: ItemProps;
}
export default function ItemModal({ open, setOpen, data }: Props) {
  const dispatch = useDispatch();
  const user = useContext(AuthContext);
  const theme = useMantineTheme();
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [minimize, setMinimize] = useState(false);
  const [settings, setSettings] = useState(false);
  const [link, setLink] = useState("");
  const [debouncedLink] = useDebouncedValue(link, 500);
  const [value, onChange] = useState(data?.content);
  const settingsForm = useForm({
    initialValues: {
      type: "" as ItemType,
      color: "",
      isDeleted: "0",
      archive: "false",
      order: "",
    },
    validate: {
      type: (value: ItemType) => (value ? null : "Please select a item type"),
      order: (value) => (value ? null : "Please enter an order"),
    },
  });
  useEffect(() => {
    console.log(settingsForm.values);
    settingsForm.setFieldValue("type", data.type as ItemType);
    settingsForm.setFieldValue("color", data.color);
    settingsForm.setFieldValue("order", data.order);
    setLink(data.link || "");
  }, [open]);
  useEffect(() => {
    console.log(settingsForm.values);
  }, [settingsForm.values.type]);
  function handleLinkChange(event: React.ChangeEvent<HTMLInputElement>) {
    setLink(event.currentTarget.value);
  }
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
        order: settingsForm.values.order,
        type: settingsForm.values.type,
        archive: settingsForm.values.archive,
        isDeleted: +settingsForm.values.isDeleted,
        color: settingsForm.values.color,
        link: link,
      }
    );
    setOpen(false);
  }
  async function handleDelete() {
    dispatch(softDeleteDocument({ type: "items", docId: data?.id }));
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
                <VscChromeClose size={13} />
              </Button>
            </Box>
          </Grid.Col>
        </Grid>
        {settings && (
          <form>
            <Grid align="center">
              <Grid.Col span={4}>
                <Select
                  label="Item type"
                  placeholder="Pick one"
                  {...settingsForm.getInputProps("type")}
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
                  {...settingsForm.getInputProps("color")}
                  defaultValue="rgba(69, 122, 255, 1)"
                  format="rgba"
                />
              </Grid.Col>
              <Grid.Col span={4}>
                <Text weight={500} sx={{ fontSize: 14 }} pb={3}>
                  UID
                </Text>
                <Input placeholder="UID" value={data?.id} disabled />
              </Grid.Col>
              <Grid.Col span={4}>
                <Select
                  {...settingsForm.getInputProps("isDeleted")}
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
                <Input
                  placeholder="Order"
                  value={data?.order}
                  {...settingsForm.getInputProps("order")}
                />
              </Grid.Col>
              <Grid.Col span={4}>
                <Select
                  {...settingsForm.getInputProps("archive")}
                  label="Archived"
                  placeholder="Pick one"
                  defaultValue={"0"}
                  data={[
                    { value: "false", label: "False" },
                    { value: "true", label: "True" },
                  ]}
                />
              </Grid.Col>
            </Grid>
          </form>
        )}
        {/* {settingsForm.values.type == ("" as ItemType) && (
          <Box style={{ textAlign: "center" }}>
            <Loader size="xl" />
          </Box>
        )} */} 
        {settingsForm.values.type == ItemType.TEXT && (
          <RichTextEditor
            stickyOffset={"-48px"}
            value={value}
            onChange={onChange}
            style={{ minHeight: "40vh" }}
          />
        )}
        {settingsForm.values.type == ItemType.LINK && (
          <Grid align="center" grow>
            <Grid.Col
              span={1}
              style={{ display: "flex", justifyContent: "flex-end" }}
            >
              <Avatar
                src={`https://s2.googleusercontent.com/s2/favicons?domain=${debouncedLink}`}
                alt="it's me"
              />
            </Grid.Col>
            <Grid.Col span={11}>
              <Input
                placeholder="URL"
                value={link}
                onChange={handleLinkChange}
              />
            </Grid.Col>
          </Grid>
        )}
        {settingsForm.values.type == ItemType.TODO && (
          <code>under construction</code>
        )}
        {settingsForm.values.type == ItemType.REMINDER && (
          <code>under construction</code>
        )}
        <Box style={{ display: "flex", justifyContent: "flex-end" }} mt={20}>
          <SimpleGrid cols={3}>
            <Button
              variant="subtle"
              size="xs"
              color="red"
              onClick={handleDelete}
            >
              Delete
            </Button>
            <Button variant="subtle" size="xs" onClick={handleClose}>
              Close
            </Button>
            <Button onClick={handleSubmit} size="xs">
              Save
            </Button>
          </SimpleGrid>
        </Box>
      </SimpleGrid>
    </Modal>
  );
}
