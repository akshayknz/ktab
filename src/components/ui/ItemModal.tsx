import {
  Ref,
  RefObject,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
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
  ActionIcon,
  useMantineColorScheme,
} from "@mantine/core";
import { Editor } from "@mantine/rte";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "../data/firebaseConfig";
import { AuthContext } from "../data/contexts/AuthContext";
import { FiCopy, FiMaximize2, FiMinimize2 } from "react-icons/fi";
import { BsCodeSquare, BsGear } from "react-icons/bs";
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
import { RichTextEditor, Link } from "@mantine/tiptap";
import { useEditor } from "@tiptap/react";
import Highlight from "@tiptap/extension-highlight";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import TextAlign from "@tiptap/extension-text-align";
import CodeBlockLowlight from "@tiptap/extension-code-block-lowlight";
import { lowlight } from "lowlight";
import tsLanguageSyntax from "highlight.js/lib/languages/typescript";
import jsLanguageSyntax from "highlight.js/lib/languages/javascript";
import xmlLanguageSyntax from "highlight.js/lib/languages/xml";
import phpLanguageSyntax from "highlight.js/lib/languages/php";
import Document from "@tiptap/extension-document";
import Dropcursor from "@tiptap/extension-dropcursor";
import Image from "@tiptap/extension-image";
import Paragraph from "@tiptap/extension-paragraph";
import { Text as Text2 } from "@tiptap/extension-text";
import {
  BiCheckboxChecked,
  BiCodeAlt,
  BiCodeCurly,
  BiImageAdd,
  BiImageAlt,
} from "react-icons/bi";
import CharacterCount from "@tiptap/extension-character-count";
import TaskItem from "@tiptap/extension-task-item";
import TaskList from "@tiptap/extension-task-list";
import { IoImagesOutline } from "react-icons/io5";
import { MdOutlineCheckBox } from "react-icons/md";
import { RiCheckboxLine } from "react-icons/ri";
import { AiOutlineEdit, AiFillEdit } from "react-icons/ai";
interface Props {
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  data: ItemProps;
}
lowlight.registerLanguage("js", jsLanguageSyntax);
lowlight.registerLanguage("html", xmlLanguageSyntax);
lowlight.registerLanguage("php", phpLanguageSyntax);
export default function ItemModal({ open, setOpen, data }: Props) {
  const dispatch = useDispatch();
  const user = useContext(AuthContext);
  const theme = useMantineTheme();
  const { colorScheme } = useMantineColorScheme();
  const vp = useViewport();
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [minimize, setMinimize] = useState(false);
  const [settings, setSettings] = useState(false);
  const [link, setLink] = useState("");
  const [debouncedLink] = useDebouncedValue(link, 500);
  const [content, onChange] = useState<any>(data?.content);
  const editorRef = useRef<Editor>();
  const { syncing } = useSelector((state: RootState) => state.actions);
  const [editableVar, setEditable] = useState(false);
  const [editTitle, setEditTitle] = useState(false);
  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      Link,
      Highlight,
      Document,
      Paragraph,
      Text2,
      Image,
      Dropcursor,
      CharacterCount,
      CodeBlockLowlight.configure({
        lowlight,
      }),
      TaskItem.configure({
        nested: true,
      }),
      TaskList.configure({
        HTMLAttributes: {
          class: "rte-checkboxes",
        },
      }),
      TextAlign.configure({ types: ["heading", "paragraph"] }),
    ],
    content,
    editable: editableVar,
  });
  useEffect(() => {
    if (!editor) {
      return undefined;
    }
    editor.setEditable(editableVar);
  }, [editor, editableVar]);
  const addImage = useCallback(async () => {
    let item_list = await navigator.clipboard.read();
    let image_type = "";
    const item = item_list.find((item) =>
      item.types.some((type) => {
        if (type.startsWith("image/")) {
          image_type = type;
          return true;
        }
      })
    );
    const file = item && (await item.getType(image_type));
    if (file) {
      var reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onloadend = function () {
        let base64data = reader.result;
        editor
          ?.chain()
          .focus()
          .setImage({ src: (base64data ? base64data : "") as string })
          .run();
      };
    }
  }, [editor]);
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
        content: editor?.getJSON(),
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
      fullScreen={vp.tab || minimize}
      opened={open}
      className={vp.tab ? "item-modal-tab" : ""}
      onClose={handleClose}
      withCloseButton={false}
    >
      <SimpleGrid verticalSpacing={20} pb={20} pt={minimize || vp.tab ? 30 : 0}>
        <Box p={vp.tab ? 20 : 0}>
          <Grid align="center">
            <Grid.Col span={vp.tab ? 12 : 8} order={vp.tab ? 2 : 1}>
              <TextInput
                readOnly={!editTitle}
                onClick={() => setEditTitle(true)}
                ref={inputRef}
                placeholder="Name"
                variant="unstyled"
                size="xl"
                defaultValue={data?.name}
              />
            </Grid.Col>
            <Grid.Col span={vp.tab ? 12 : 4} order={vp.tab ? 1 : 2}>
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
        </Box>
        {copyLink && (
          <Box p={20}>
            <Input value={copyLink} ref={copyRef} />
          </Box>
        )}
        {settings && (
          <form>
            <Grid align="center" p={20}>
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
          <>
            <RichTextEditor
              editor={editor}
              onChange={onChange}
              style={{
                minHeight: "40vh",
              }}
              className={vp.tab ? "rte-no-x-border" : ""}
            >
              <RichTextEditor.Toolbar
                sticky
                stickyOffset={minimize || vp.tab ? 32 : -14}
                style={{
                  background:
                    colorScheme === "light" ? "#ffffff10" : "#1a1b1e80",
                  backdropFilter: "blur(7px)",
                }}
              >
                <RichTextEditor.ControlsGroup>
                  <RichTextEditor.Control
                    onClick={() => setEditable((prev) => !prev)}
                  >
                    {editableVar ? (
                      <AiFillEdit size="14" opacity={0.8} />
                    ) : (
                      <AiOutlineEdit size="14" opacity={0.8} />
                    )}
                  </RichTextEditor.Control>
                </RichTextEditor.ControlsGroup>
                {editableVar && (
                  <>
                    <RichTextEditor.ControlsGroup>
                      {!vp.tab && (
                        <>
                          <RichTextEditor.Bold />
                          <RichTextEditor.Italic />
                          <RichTextEditor.Underline />
                          <RichTextEditor.Strikethrough />
                        </>
                      )}
                      <RichTextEditor.ClearFormatting />
                      {!vp.tab && <RichTextEditor.Highlight />}
                      {!vp.tab && (
                        <RichTextEditor.Code
                          icon={() => <BiCodeCurly size={13} />}
                        />
                      )}
                      <RichTextEditor.CodeBlock />
                      <RichTextEditor.Control
                        onClick={() =>
                          editor?.chain().focus().toggleTaskList().run()
                        }
                        className={
                          editor?.isActive("taskList") ? "is-active" : ""
                        }
                      >
                        <RiCheckboxLine size="14" opacity={0.8} />
                      </RichTextEditor.Control>
                      <RichTextEditor.Control
                        onClick={addImage}
                        aria-label="Paste image"
                        title="Paste image"
                      >
                        <BiImageAlt size="14" opacity={0.8} />
                      </RichTextEditor.Control>
                    </RichTextEditor.ControlsGroup>

                    <RichTextEditor.ControlsGroup>
                      <RichTextEditor.H1 />
                      <RichTextEditor.H2 />
                      {!vp.tab && (
                        <>
                          <RichTextEditor.H3 />
                          <RichTextEditor.H4 />
                        </>
                      )}
                    </RichTextEditor.ControlsGroup>

                    <RichTextEditor.ControlsGroup>
                      {!vp.tab && <RichTextEditor.Blockquote />}
                      {!vp.tab && <RichTextEditor.Hr />}
                      <RichTextEditor.BulletList />
                      {!vp.tab && <RichTextEditor.OrderedList />}
                      {!vp.tab && <RichTextEditor.Subscript />}
                      {!vp.tab && <RichTextEditor.Superscript />}
                    </RichTextEditor.ControlsGroup>
                    <RichTextEditor.ControlsGroup>
                      <RichTextEditor.Link />
                      <RichTextEditor.Unlink />
                    </RichTextEditor.ControlsGroup>
                    {!vp.tab && (
                      <RichTextEditor.ControlsGroup>
                        <RichTextEditor.AlignLeft />
                        <RichTextEditor.AlignCenter />
                        <RichTextEditor.AlignJustify />
                        <RichTextEditor.AlignRight />
                      </RichTextEditor.ControlsGroup>
                    )}
                  </>
                )}
              </RichTextEditor.Toolbar>
              <RichTextEditor.Content />
            </RichTextEditor>
            <Text color="grey" size={"xs"} px={20}>
              {editor?.storage.characterCount.words()} words,{" "}
              {editor?.storage.characterCount.characters()} characters
            </Text>
          </>
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
        <Box
          style={{ display: "flex", justifyContent: "flex-end" }}
          mt={20}
          px={vp.tab ? 20 : 0}
          pb={vp.tab ? 30 : 0}
        >
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
