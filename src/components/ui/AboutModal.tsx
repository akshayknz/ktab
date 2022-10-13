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
} from "@mantine/core";
import { MdOutlineMarkEmailUnread } from "react-icons/md";
interface Props {
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
}
export default function LoginModal({ open, setOpen }: Props) {
  return (
    <>
      <Modal opened={open} onClose={() => setOpen(false)} title="About Me">
        <SimpleGrid verticalSpacing="xs" py={20}>
          <Avatar
            variant="outline"
            size="xl"
            color="green"
            src="https://akshaykn.vercel.app/_next/image?url=%2F_next%2Fstatic%2Fmedia%2Fakshay_k_nair.0f82586e.webp&w=384&q=75"
          />
          <Text pt={10}>Hi, there!</Text>
          <Text>
            My name is Akshay and I created this application as a hobby project
            and to use this as a private todo and notes app.
          </Text>
        </SimpleGrid>
        <SimpleGrid>
          <Button
            component="a"
            target="_blank"
            rel="noopener noreferrer"
            href={"https://akshaykn.vercel.app/"}
          >
            Visit my portfolio
          </Button>
          <Button
            component="a"
            target="_blank"
            rel="noopener noreferrer"
            href={"https://akshaykn.vercel.app/work"}
          >
            Check out my other works
          </Button>
          <Button
            component="a"
            target="_blank"
            rel="noopener noreferrer"
            href={"https://akshaykn.vercel.app/contact"}
          >
            Contact me
          </Button>
        </SimpleGrid>
      </Modal>
    </>
  );
}
