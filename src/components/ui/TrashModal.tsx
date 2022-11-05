import { useContext, useRef, useState } from "react";
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
interface Props {
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
}
const elements = [
  { uid: "asdfhKJHALKiuh", name: "Organization One", type: "Organization" },
  { uid: "asdfhKJHALKiuh", name: "yo yo", type: "Organization" },
  { uid: "asdfhKJHALKiuh", name: "collections suck", type: "Organization" },
  { uid: "asdfhKJHALKiuh", name: "whats up baby", type: "Organization" },
  { uid: "asdfhKJHALKiuh", name: "two plyud too", type: "Organization" },
];
export default function TrashModal({ open, setOpen }: Props) {
  const [search, setSearch] = useState("");
  const rows = elements
    .filter(
      (element) =>
        element.name.toLowerCase().indexOf(search.toLowerCase()) > -1 ||
        element.uid.toLowerCase().indexOf(search.toLowerCase()) > -1 ||
        element.type.toLowerCase().indexOf(search.toLowerCase()) > -1
    )
    .map((element) => (
      <tr key={element.uid}>
        <td>{element.uid}</td>
        <td>{element.name}</td>
        <td>{element.type}</td>
      </tr>
    ));
  return (
    <Modal opened={open} onClose={() => setOpen(false)} title={<Title weight={300} order={2}>Trash</Title>} size="xl">
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
      <Table highlightOnHover striped>
        <thead>
          <tr>
            <th>UID</th>
            <th>Name</th>
            <th>Type</th>
          </tr>
        </thead>
        <tbody>{rows}</tbody>
      </Table>
    </Modal>
  );
}
