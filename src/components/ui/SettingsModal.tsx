import { useContext, useRef, useState } from "react";
import {
  Modal,
  Text,
  Image,
  Button,
  Group,
  SimpleGrid,
  Accordion,
  createStyles,
  Input,
  PasswordInput,
  Avatar,
  Blockquote,
  Tabs,
  Box,
  FileInput,
  AlphaSlider,
  Slider,
} from "@mantine/core";
import { MdOutlineMarkEmailUnread } from "react-icons/md";
interface Props {
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  personalize?: boolean;
}
export default function LoginModal({ open, setOpen, personalize }: Props) {
  return (
    <>
      <Modal opened={open} onClose={() => setOpen(false)} title="Settings">
        <Tabs defaultValue={personalize ? "personalize" : "profile"}>
          <Tabs.List grow>
            <Tabs.Tab value="profile">Profile</Tabs.Tab>
            <Tabs.Tab value="personalize">Personalize</Tabs.Tab>
          </Tabs.List>

          <Tabs.Panel value="profile" pt="xs">
            <Box px={20} pt={10} mb={20} mx="auto"></Box>
          </Tabs.Panel>

          <Tabs.Panel value="personalize" pt="xs">
            <Box px={20} pt={10} pb={20} mx="auto">
              <FileInput placeholder="Pick file" label="Your resume" mb={20}/>
              <Image
                width={'100%'}
                height={120}
                src={undefined}
                alt="With default placeholder"
                withPlaceholder mb={20}
              />
              <Text  weight={500} sx={{fontSize:14}} pb={7}>Opacity </Text>
              <AlphaSlider
                color="#1c7ed6"
                onChange={() => {}}
                onChangeEnd={() => {}}
                value={0} mb={20}
              />
              <Text  weight={500} sx={{fontSize:14}} pb={7}>Blur </Text>
              <Slider
                size="lg"
                radius="xl"
                showLabelOnHover={false} mb={20}
                marks={[
                  { value: 0, label: "0%" },
                  { value: 100, label: "100%" },
                ]}
              />
            </Box>
          </Tabs.Panel>
        </Tabs>
      </Modal>
    </>
  );
}
