import { TextInput, Text, Checkbox, Button, Group, Box, Modal, ColorPicker, ColorInput, Tabs, Select } from '@mantine/core';
import { useForm } from '@mantine/form';
import { addDoc, collection, getDocs, query, where } from 'firebase/firestore';
import { useContext, useEffect, useState } from 'react';
import { AuthContext } from '../data/contexts/AuthContext';
import { db } from '../data/firebaseConfig';

interface OrganizationModalProps {
    open: boolean;
    setOpen: React.Dispatch<React.SetStateAction<boolean>>;
    organizationOrCollection: string;
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
export default function OrganizationModal({open, setOpen, organizationOrCollection}:OrganizationModalProps) {
  const user = useContext(AuthContext);
  const [organizations, setOrganizations] = useState<OrganizationProps[]>([]);
  const organizationForm = useForm({
    initialValues: {
      name: '',
      icon: '',
      color: '',
      accent: '',
    },

    validate: {
      name: (value) => (value ? null : 'Please enter a name'),
      icon: (value) => (value.length < 3 ? null : 'Please enter an icon/emoji'),
    },
  });

  const collectionForm = useForm({
    initialValues: {
      parent: '',
      name: '',
      color: '',
    },

    validate: {
      parent: (value) => (value ? null : 'Please pick a parent Organization'),
      name: (value) => (value ? null : 'Please enter a name'),
    },
  });

  function handleSubmitOrganization(values: OrganizationProps){
    const upload = async() => {
      await addDoc(collection(db, 'ktab-manager', user?.uid? user.uid:"guest", "organizations"), {
        name: values.name,
        icon: values.icon,
        color: values.color,
        accent: values.accent,
      })
    }
    upload().then(()=>{
      // showNotification({
      //   title: 'Entry added',
      //   message: 'Recalculating and updating the counters',
      //   loading: true
      // })
    })
  }

  function handleSubmitCollection(values: CollectionProps){
    console.log(values);
    
    const upload = async() => {
      await addDoc(collection(db, 'ktab-manager', user?.uid? user.uid:"guest", "organizations", values.parent, 'collections'), {
        parent: values.parent,
        name: values.name,
        color: values.color,
      })
    }
    upload().then(()=>{
      // showNotification({
      //   title: 'Entry added',
      //   message: 'Recalculating and updating the counters',
      //   loading: true
      // })
    })
  }

  useEffect(()=>{
    const runQuery = async () => {
      const q = query(collection(db, 'ktab-manager', user?.uid? user.uid:"guest", "organizations"));
      getDocs(q).then( r => {
        const re : OrganizationProps[] = r.docs.map(doc=>({
          id: doc.id, 
          name: doc.data().name,
          icon: doc.data().icon,
          color: doc.data().color,
          accent: doc.data().accent,
          //...doc.data(),
        }))
        console.log('load organizaiton parents');
        setOrganizations(re);
      }).catch(err=>console.log(err))
    }
    runQuery();
  },[open])

  return (
    <Modal opened={open} onClose={() => setOpen(false)} title={`Manage ${organizationOrCollection.charAt(0).toUpperCase()+organizationOrCollection.slice(1)}`}>
        <Tabs defaultValue={organizationOrCollection}>
            <Tabs.List grow>
                <Tabs.Tab value="organization" >Organization</Tabs.Tab>
                <Tabs.Tab value="collection" >Collection</Tabs.Tab>
            </Tabs.List>

            <Tabs.Panel value="organization" pt="xs">
            <Box px={20} pt={10} pb={20} mx="auto">
                <form onSubmit={organizationForm.onSubmit((values) => handleSubmitOrganization(values))}>
                    <TextInput label="Name" placeholder='Name' {...organizationForm.getInputProps('name')} pb={20}/>
                    <TextInput label="Icon" placeholder='Icon' {...organizationForm.getInputProps('icon')} pb={20}/>
                    <Text weight={500} sx={{fontSize:14}} pb={5}>Organization Color</Text>
                    <ColorInput defaultValue="rgba(69, 122, 255, 1)" format="rgba" pb={20} {...organizationForm.getInputProps('color')}/>
                    <Text weight={500} sx={{fontSize:14}} pb={5}>Accent Color</Text>
                    <ColorInput defaultValue="rgba(69, 122, 255, 1)" format="rgba" pb={20} {...organizationForm.getInputProps('accent')}/>
                    
                    <Group position="right" mt="md">
                    <Button type="submit">Add Organization</Button>
                    </Group>
                </form>
            </Box>
            </Tabs.Panel>

            <Tabs.Panel value="collection" pt="xs">
                <Box px={20} pt={10} pb={20} mx="auto">
                    <form onSubmit={collectionForm.onSubmit((values) => handleSubmitCollection(values))}>
                        <Select
                            label="Parent Organization"
                            placeholder="Pick one" pb={20}
                            {...collectionForm.getInputProps('parent')}
                            data={organizations.map(org=>({value:org.id,label:org.name}))}
                        />
                        <TextInput label="Name" placeholder='Name' {...collectionForm.getInputProps('name')} pb={20}/>
                        <Text weight={500} sx={{fontSize:14}} pb={5}>Organization Color</Text>
                        <ColorInput defaultValue="rgba(69, 122, 255, 1)" format="rgba" pb={20} {...collectionForm.getInputProps('color')}/>

                        <Group position="right" mt="md">
                        <Button type="submit">Add Collection</Button>
                        </Group>
                    </form>
                </Box>
            </Tabs.Panel>
        </Tabs>
    
    </Modal>
  );
}