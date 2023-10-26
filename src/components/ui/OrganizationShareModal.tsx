import {
  TextInput,
  Text,
  Checkbox,
  Button,
  Group,
  Box,
  Modal,
  ColorPicker,
  ColorInput,
  Tabs,
  Select,
  Title,
} from "@mantine/core";
import { Table } from '@mantine/core';
import { useForm } from "@mantine/form";
import {
  addDoc,
  collection,
  collectionGroup,
  doc,
  getDocs,
  query,
  updateDoc,
  where,
} from "firebase/firestore";
import { useContext, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AuthContext } from "../data/contexts/AuthContext";
import { ItemType } from "../data/constants";
import { RootState } from "../data/contexts/redux/configureStore";
import {
  toggleOrganizationShareModal,
} from "../data/contexts/redux/states";
import { db } from "../data/firebaseConfig";
import React from "react";
import { showNotification } from "@mantine/notifications";

interface OrganizationModalProps {
  open: boolean;
}

interface OrganizationShareProps {
  email: string;
}

export default function OrganizationModal({ open }: OrganizationModalProps) {
  const user = useContext(AuthContext);
  const [organizations, setOrganizations] = useState<OrganizationShareProps[]>([]);
  const [shareList, setShareList] = useState<string[]>([]);
  const {
    activeOrganization
  } = useSelector((state: RootState) => state.states);
  const dispatch = useDispatch();
  const [loading, setLoading] = useState<string>("");
  const organizationForm = useForm({
    initialValues: {
      email: ""
    },

    validate: {
      email: (value) => (/^\S+@\S+$/.test(value) ? null : 'Invalid email'),
    },
  });

  function handleSubmitOrganization(values: OrganizationShareProps) {
    setLoading("organization");
    shareList.push(values.email)
    const upload = async () => {
      await updateDoc(
        doc(
          db,
          "ktab-manager",
          user?.uid ? user.uid : "guest",
          "organizations",
          activeOrganization ? activeOrganization : ""
        ),
        {
          shareList: shareList,
        }
      );
    };
    upload().then(() => {
      setLoading("");
      organizationForm.reset();
    });
  }
  useEffect(() => {
    const unsub = async () => {
      const q = query(
        collectionGroup(db, "organizations"),
        where("shareList", "array-contains", user?.email || "guest"),
        where("isDeleted", "==", 0)
      )
      getDocs(q).then((r) => {
        const docss = r.docs.filter((doc) => doc.id === activeOrganization, "fgsdgagadadfadf").map((doc) => ({
          id: doc.id,
          shareList: doc.data().shareList
        }))
        docss[0] && setShareList(docss[0].shareList);
      })
    }
    unsub()
  }, [open]);
  function handleRemoveEmail(email: string) {
    let temp = shareList.filter(el => !el.includes(email))
    const upload = async () => {
      await updateDoc(
        doc(
          db,
          "ktab-manager",
          user?.uid ? user.uid : "guest",
          "organizations",
          activeOrganization ? activeOrganization : ""
        ),
        {
          shareList: temp,
        }
      );
    };
    upload().then(() => {
      setShareList(temp)
      setLoading("");
      organizationForm.reset();
    });
  }
  return (
    <Modal
      opened={open}
      onClose={() => {
        dispatch(toggleOrganizationShareModal());
      }}
      title={
        <Title order={2}>
          Share Organization
        </Title>
      }
      size="lg"
    >
      <Box px={20} pt={10} pb={20} mx="auto">
        <form
          onSubmit={organizationForm.onSubmit((values) => {
            handleSubmitOrganization(values);
          })}
        >
          <TextInput
            label="Email"
            placeholder="Email"
            {...organizationForm.getInputProps("email")}
          />
          <Group position="right" mt="xs">
            <Button
              type="submit"
              loading={loading == "organization" && true}
            >
              Add to this Organization
            </Button>
          </Group>
        </form>
        <Title order={3} mt={"xl"}>People on board</Title>
        <Table highlightOnHover striped mt={"xl"}>
          <thead>
            <tr>
              <th>Email</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {shareList && shareList.map((email: string) => (
              <tr>
                <td>{email}</td>
                <td><Button.Group>
                  <Button variant="outline" size="xs">Ping to join</Button>
                  <Button variant="outline" size="xs" onClick={() => handleRemoveEmail(email)} >Remove</Button>
                </Button.Group></td>
              </tr>
            ))}
          </tbody>
        </Table>
      </Box>
    </Modal>
  );
}
