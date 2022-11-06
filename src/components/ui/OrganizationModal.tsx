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
import { useForm } from "@mantine/form";
import { addDoc, collection, getDocs, query, where } from "firebase/firestore";
import { useContext, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AuthContext } from "../data/contexts/AuthContext";
import { RootState } from "../data/contexts/redux/configureStore";
import { toggleOrganizationModal } from "../data/contexts/redux/states";
import { db } from "../data/firebaseConfig";

interface OrganizationModalProps {
  open: boolean;
}

interface OrganizationProps {
  id?: string;
  name: string;
  icon: string;
  color: string;
  accent: string;
}

interface CollectionProps {
  id?: string;
  parent: string;
  name: string;
  color: string;
}

interface ItemProps {
  id?: string;
  orgparent: string;
  parent: string;
  name: string;
  color: string;
}

export default function OrganizationModal({ open }: OrganizationModalProps) {
  const user = useContext(AuthContext);
  const [organizations, setOrganizations] = useState<OrganizationProps[]>([]);
  const [collections, setCollections] = useState<CollectionProps[]>([]);
  const { organizationOrCollection } = useSelector(
    (state: RootState) => state.states
  );
  const dispatch = useDispatch();
  const [loading, setLoading] = useState<string>("");
  const organizationForm = useForm({
    initialValues: {
      name: "aaaa",
      icon: "",
      color: "",
      accent: "",
    },

    validate: {
      name: (value) => (value ? null : "Please enter a name"),
      icon: (value) => (value.length < 3 ? null : "Please enter an icon/emoji"),
    },
  });

  const collectionForm = useForm({
    initialValues: {
      parent: "",
      name: "",
      color: "",
    },

    validate: {
      parent: (value) => (value ? null : "Please pick a parent Organization"),
      name: (value) => (value ? null : "Please enter a name"),
    },
  });

  const itemForm = useForm({
    initialValues: {
      orgparent: "",
      parent: "",
      name: "",
      color: "",
    },

    validate: {
      parent: (value) => (value ? null : "Please pick a parent Organization"),
      name: (value) => (value ? null : "Please enter a name"),
    },
  });

  function handleSubmitOrganization(values: OrganizationProps) {
    setLoading("organization");
    const upload = async () => {
      await addDoc(
        collection(
          db,
          "ktab-manager",
          user?.uid ? user.uid : "guest",
          "organizations"
        ),
        {
          name: values.name,
          icon: values.icon,
          color: values.color,
          accent: values.accent,
          order: 0,
          archive: false,
          isDeleted: 0,
          updatedAt: +new Date(),
          createdAt: +new Date(),
        }
      );
    };
    upload().then(() => {
      setLoading("");
      organizationForm.reset();
      // showNotification({
      //   title: 'Entry added',
      //   message: 'Recalculating and updating the counters',
      //   loading: true
      // })
    });
  }

  function handleSubmitCollection(values: CollectionProps) {
    setLoading("collection");
    const upload = async () => {
      await addDoc(
        collection(
          db,
          "ktab-manager",
          user?.uid ? user.uid : "guest",
          "collections"
        ),
        {
          parent: values.parent,
          name: values.name,
          color: values.color,
          order: 0,
          archive: false,
          isDeleted: 0,
          updatedAt: +new Date(),
          createdAt: +new Date(),
        }
      );
    };
    upload().then(() => {
      setLoading("");
      collectionForm.reset();
    });
  }

  function handleSubmitItem(values: ItemProps) {
    setLoading("item");
    const upload = async () => {
      await addDoc(
        collection(db, "ktab-manager", user?.uid ? user.uid : "guest", "items"),
        {
          orgparent: values.orgparent,
          parent: values.parent,
          name: values.name,
          color: values.color,
          type: "text",
          link: "",
          icon: "",
          order: 0,
          archive: false,
          isDeleted: 0,
          updatedAt: +new Date(),
          createdAt: +new Date(),
        }
      );
    };
    upload().then(() => {
      setLoading("");
      itemForm.reset();
    });
  }

  useEffect(() => {
    const runOrganizationQuery = async () => {
      const q = query(
        collection(
          db,
          "ktab-manager",
          user?.uid ? user.uid : "guest",
          "organizations"
        ),
        where("isDeleted", "==", 0)
      );
      getDocs(q)
        .then((r) => {
          const re: OrganizationProps[] = r.docs.map((doc) => ({
            id: doc.id,
            name: doc.data().name,
            icon: doc.data().icon,
            color: doc.data().color,
            accent: doc.data().accent,
            //...doc.data(),
          }));
          console.log("load organizaiton parents");
          setOrganizations(re);
        })
        .catch((err) => console.log(err));
    };
    runOrganizationQuery();
  }, [open]);

  useEffect(() => {
    const runCollectionQuery = async () => {
      const q = query(
        collection(
          db,
          "ktab-manager",
          user?.uid ? user.uid : "guest",
          "collections"
        ),
        where("parent", "==", itemForm.values.orgparent),
        where("isDeleted", "==", 0)
      );
      getDocs(q)
        .then((r) => {
          const re: CollectionProps[] = r.docs.map((doc) => ({
            id: doc.id,
            name: doc.data().name,
            color: doc.data().color,
            parent: doc.data().parent,
          }));
          setCollections(re);
        })
        .catch((err) => console.log(err));
    };
    runCollectionQuery();
  }, [itemForm.values.orgparent]);

  return (
    <Modal
      opened={open}
      onClose={() => dispatch(toggleOrganizationModal("organization"))}
      title={
        <Title weight={300} order={2}>
          {`Manage ${
            organizationOrCollection.charAt(0).toUpperCase() +
            organizationOrCollection.slice(1)
          }`}
        </Title>
      }
    >
      <Tabs defaultValue={organizationOrCollection}>
        <Tabs.List grow>
          <Tabs.Tab value="organization">Organization</Tabs.Tab>
          <Tabs.Tab value="collection">Collection</Tabs.Tab>
          <Tabs.Tab value="item">Item</Tabs.Tab>
        </Tabs.List>

        <Tabs.Panel value="organization" pt="xs">
          <Box px={20} pt={10} pb={20} mx="auto">
            <form
              onSubmit={organizationForm.onSubmit((values) =>
                handleSubmitOrganization(values)
              )}
            >
              <TextInput
                label="Name"
                placeholder="Name"
                {...organizationForm.getInputProps("name")}
                pb={20}
              />
              <TextInput
                label="Icon"
                placeholder="Icon"
                {...organizationForm.getInputProps("icon")}
                pb={20}
              />
              <Text weight={500} sx={{ fontSize: 14 }} pb={5}>
                Organization Color
              </Text>
              <ColorInput
                defaultValue="rgba(69, 122, 255, 1)"
                format="rgba"
                pb={20}
                {...organizationForm.getInputProps("color")}
                autocomplete="new-password"
              />
              <Text weight={500} sx={{ fontSize: 14 }} pb={5}>
                Accent Color
              </Text>
              <ColorInput
                defaultValue="rgba(69, 122, 255, 1)"
                format="rgba"
                pb={20}
                {...organizationForm.getInputProps("accent")}
                autocomplete="new-password"
              />

              <Group position="right" mt="md">
                <Button
                  type="submit"
                  loading={loading == "organization" && true}
                >
                  Add Organization
                </Button>
              </Group>
            </form>
          </Box>
        </Tabs.Panel>

        <Tabs.Panel value="collection" pt="xs">
          <Box px={20} pt={10} pb={20} mx="auto">
            <form
              onSubmit={collectionForm.onSubmit((values) =>
                handleSubmitCollection(values)
              )}
            >
              <Select
                label="Parent Organization"
                placeholder="Pick one"
                pb={20}
                {...collectionForm.getInputProps("parent")}
                data={organizations.map((org) => ({
                  value: org.id,
                  label: org.name,
                }))}
              />
              <TextInput
                label="Name"
                placeholder="Name"
                {...collectionForm.getInputProps("name")}
                pb={20}
              />
              <Text weight={500} sx={{ fontSize: 14 }} pb={5}>
                Organization Color
              </Text>
              <ColorInput
                defaultValue="rgba(69, 122, 255, 1)"
                format="rgba"
                pb={20}
                {...collectionForm.getInputProps("color")}
                autocomplete="new-password"
              />

              <Group position="right" mt="md">
                <Button type="submit" loading={loading == "collection" && true}>
                  Add Collection
                </Button>
              </Group>
            </form>
          </Box>
        </Tabs.Panel>

        <Tabs.Panel value="item" pt="xs">
          <Box px={20} pt={10} pb={20} mx="auto">
            <form
              onSubmit={itemForm.onSubmit((values) => handleSubmitItem(values))}
            >
              <Select
                label="Parent Organization"
                placeholder="Pick one"
                pb={20}
                {...itemForm.getInputProps("orgparent")}
                data={organizations.map((org) => ({
                  value: org.id,
                  label: org.name,
                }))}
              />
              <Select
                label="Parent Collection"
                placeholder="Pick one"
                pb={20}
                {...itemForm.getInputProps("parent")}
                data={collections.map((org) => ({
                  value: org.id,
                  label: org.name,
                }))}
              />
              <TextInput
                label="Name"
                placeholder="Name"
                {...itemForm.getInputProps("name")}
                pb={20}
              />
              <Text weight={500} sx={{ fontSize: 14 }} pb={5}>
                Item Color
              </Text>
              <ColorInput
                defaultValue="rgba(69, 122, 255, 1)"
                format="rgba"
                pb={20}
                {...itemForm.getInputProps("color")}
                autocomplete="new-password"
              />

              <Group position="right" mt="md">
                <Button type="submit" loading={loading == "item" && true}>
                  Add Item
                </Button>
              </Group>
            </form>
          </Box>
        </Tabs.Panel>
      </Tabs>
    </Modal>
  );
}
