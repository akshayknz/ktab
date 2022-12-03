import { Ref, RefObject, useContext, useEffect, useRef, useState } from "react";
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
  Badge,
} from "@mantine/core";
import { Editor, RichTextEditor } from "@mantine/rte";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "../data/firebaseConfig";
import { AuthContext } from "../data/contexts/AuthContext";
import { FiCopy, FiMaximize2, FiMinimize2 } from "react-icons/fi";
import { BsGear } from "react-icons/bs";
import { VscChromeClose } from "react-icons/vsc";
import { ItemType } from "../data/constants";
import { useTheme } from "@emotion/react";
import { useDispatch, useSelector } from "react-redux";
import {
  deleteDocument,
  setSyncing,
  softDeleteDocument,
} from "../data/contexts/redux/actions";
import { useForm } from "@mantine/form";
import { useDebouncedValue } from "@mantine/hooks";
import useViewport from "../data/useViewport";
import { RootState } from "../data/contexts/redux/configureStore";
interface Props {
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  data: ItemProps;
}
export default function ItemModal({ open, setOpen, data }: Props) {
  const dispatch = useDispatch();
  const user = useContext(AuthContext);
  const theme = useMantineTheme();
  const vp = useViewport();
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [minimize, setMinimize] = useState(false);
  const [settings, setSettings] = useState(false);
  const [link, setLink] = useState("");
  const [debouncedLink] = useDebouncedValue(link, 500);
  const [value, onChange] = useState(data?.content);
  const editorRef = useRef<Editor>();
  const { syncing } = useSelector((state: RootState) => state.actions);

  useEffect(() => {
    editorRef.current?.focus();
  }, [editorRef.current]);
  useEffect(() => {
    if (link) {
      fetch(`https://textance.herokuapp.com/title/${link}`, {
        mode: "cors",
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Headers": "Content-Type",
          "Access-Control-Allow-Methods": "GET,PATCH,POST,PUT,DELETE",
        },
      })
        .then((r) => r.text())
        .then((r) => {
          if (inputRef.current) {
            inputRef.current.value = r;
          }
        })
        .catch((error) => {
          console.log(error);
        });
    }
  }, [link]);
  const settingsForm = useForm({
    initialValues: {
      type: "" as ItemType,
      color: "",
      isDeleted: "0",
      archive: "0",
      order: "",
    },
    validate: {
      type: (value: ItemType) => (value ? null : "Please select a item type"),
      order: (value) => (value ? null : "Please enter an order"),
    },
  });
  useEffect(() => {
    settingsForm.setFieldValue("type", data.type as ItemType);
    settingsForm.setFieldValue("color", data.color);
    settingsForm.setFieldValue("order", data.order);
    settingsForm.setFieldValue("archive", JSON.stringify(data.archive));
    setLink(data.link || "");
  }, [open]);
  function handleLinkChange(event: React.ChangeEvent<HTMLInputElement>) {
    setLink(event.currentTarget.value);
  }
  async function handleSubmit() {
    dispatch(setSyncing({ state: true }));
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
        archive: +settingsForm.values.archive,
        isDeleted: +settingsForm.values.isDeleted,
        color: settingsForm.values.color,
        link: link,
      }
    );
    setOpen(false);
    dispatch(setSyncing({ state: false }));
  }
  async function handleDelete() {
    dispatch(softDeleteDocument({ type: "items", docId: data?.id }));
    setOpen(false);
  }
  function handleClose() {
    setTimeout(() => setOpen(false), 100);
    handleSubmit();
  }
  function handleCloseWithoutSave() {
    setOpen(false);
  }
  const [copyLink, setCopyLink] = useState("");
  const copyRef = useRef<HTMLInputElement>(null);
  async function copyShareLink() {
    setCopyLink(
      `https://${window.location.hostname}/${user?.uid ? user.uid : "guest"}/${
        data.id
      }`
    );
    copyRef?.current?.select();
    navigator.clipboard.writeText(
      `https://${window.location.hostname}/${user?.uid ? user.uid : "guest"}/${
        data.id
      }`
    );
    await updateDoc(
      doc(
        db,
        "ktab-manager",
        user?.uid ? user.uid : "guest",
        "items",
        data?.id
      ),
      {
        isShared: true,
      }
    );
  }
  return (
    <Modal
      size={minimize ? "100%" : "70%"}
      fullScreen={vp.tab}
      opened={open}
      onClose={handleClose}
      withCloseButton={false}
    >
      <SimpleGrid verticalSpacing={20} pb={20}>
        <Grid align="center">
          <Grid.Col sm={7} md={8}>
            <TextInput
              ref={inputRef}
              placeholder="Name"
              variant="unstyled"
              size="xl"
              defaultValue={data?.name}
            />
          </Grid.Col>
          <Grid.Col sm={5} md={4}>
            <Box
              style={{
                display: "flex",
                justifyContent: "flex-end",
                alignItems: "center",
              }}
            >
              {data.isShared && (
                <Tooltip label="Shared item">
                  <Badge radius="sm" mr={7}>
                    Shared item
                  </Badge>
                </Tooltip>
              )}
              <Tooltip label="Share link">
                <Button
                  p={0}
                  sx={{ width: "30px" }}
                  mr={7}
                  variant={"default"}
                  radius="md"
                  size="xs"
                  onClick={copyShareLink}
                >
                  <FiCopy size={10} />
                </Button>
              </Tooltip>
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
              {!vp.tab && (
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
              )}

              <Button
                p={0}
                sx={{ width: "30px" }}
                mr={7}
                variant="default"
                radius="md"
                size="xs"
                onClick={handleCloseWithoutSave}
              >
                <VscChromeClose size={13} />
              </Button>
            </Box>
          </Grid.Col>
        </Grid>
        {copyLink && (
          <>
            <Input value={copyLink} ref={copyRef} />
          </>
        )}
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
                    { value: "0", label: "False" },
                    { value: "1", label: "True" },
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
            ref={editorRef as Ref<Editor>}
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
            <Button variant="subtle" size="xs" onClick={handleCloseWithoutSave}>
              Close
            </Button>
            <Button onClick={handleSubmit} size="xs" loading={syncing}>
              Save
            </Button>
          </SimpleGrid>
        </Box>
      </SimpleGrid>
    </Modal>
  );
}
