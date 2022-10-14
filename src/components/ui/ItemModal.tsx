import { useContext, useRef, useState } from "react";
import {
  Modal,
  SimpleGrid,
  TextInput,
} from "@mantine/core";
import { RichTextEditor } from "@mantine/rte";
interface Props {
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
}
const initialValue = "";
export default function ItemModal({ open, setOpen }: Props) {
  const [value, onChange] = useState(initialValue);
  return (
    <>
      <Modal
        size={"70%"}
        opened={open}
        onClose={() => setOpen(false)}
        withCloseButton={false}
      >
        <SimpleGrid verticalSpacing={20} pb={20}>
          <TextInput
            placeholder="Name"
            variant="unstyled"
            size="xl"
          />
          <RichTextEditor stickyOffset={"-45px"} value={value} onChange={onChange} id="rte" />
        </SimpleGrid>
      </Modal>
    </>
  );
}
